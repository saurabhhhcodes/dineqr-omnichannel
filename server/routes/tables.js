// server/routes/tables.js - Table management & QR code generation (Multi-Tenant)
import express from 'express';
import QRCode from 'qrcode';
import os from 'node:os';
import { queryAll, queryOne, execute } from '../db.js';

const router = express.Router();

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

function getBaseUrl(req) {
  if (req.query.baseUrl) {
    return req.query.baseUrl.replace(/\/$/, '');
  }
  if (req.query.useLan === 'true') {
    const port = req.socket.localPort || 3001;
    return `http://${getLocalIp()}:${port}`;
  }
  const forwardedProto = req.get('x-forwarded-proto');
  const forwardedHost = req.get('x-forwarded-host');
  const host = forwardedHost || req.get('host');
  // Detect protocol: prioritize x-forwarded-proto, then req.protocol, or auto-detect https for cloudflare/production domains
  let protocol = forwardedProto || req.protocol || 'http';
  if (host && (host.includes('trycloudflare.com') || host.includes('vercel.app') || host.includes('render.com') || host.includes('axonflow.in'))) {
    protocol = 'https';
  }
  return `${protocol}://${host}`;
}

// GET /api/tables - List tables for a restaurant
router.get('/', (req, res) => {
  try {
    const { restaurant_id } = req.query;

    let sql = `
      SELECT t.*,
        r.name as restaurant_name,
        r.slug as restaurant_slug,
        (SELECT COUNT(*) FROM orders o WHERE o.table_id = t.id AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as active_orders_count,
        (SELECT MAX(o.created_at) FROM orders o WHERE o.table_id = t.id AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as latest_order_time
      FROM tables t
      LEFT JOIN restaurants r ON r.id = t.restaurant_id
      WHERE 1=1
    `;
    const params = [];

    let restId = restaurant_id ? String(restaurant_id).toLowerCase().trim() : '';
    if (restId === 'spicecraft' || restId === 'rest_spicecraft' || restId === 'losteria' || restId === 'l-osteria') {
      restId = 'rest_losteria';
    } else if (restId === 'roastery' || restId === 'roastery-cafe' || restId === 'cafe') {
      restId = 'rest_roastery';
    } else if (restId === 'clinic' || restId === 'apex' || restId === 'apex-clinic') {
      restId = 'rest_apex_clinic';
    } else if (restId === 'gym' || restId === 'ironpulse' || restId === 'ironpulse-gym') {
      restId = 'rest_ironpulse_gym';
    } else if (restId === 'salon' || restId === 'glamour' || restId === 'glamour-salon') {
      restId = 'rest_glamour_salon';
    }

    if (restId) {
      sql += ` AND (t.restaurant_id = ? OR r.slug = ?)`;
      params.push(restId, restId);
    }

    sql += ` ORDER BY t.table_number ASC`;

    const tables = queryAll(sql, params);
    const baseUrl = getBaseUrl(req);

    const enriched = tables.map((tbl) => ({
      ...tbl,
      menu_url: `${baseUrl}/menu?restaurant=${encodeURIComponent(tbl.restaurant_id || 'rest_losteria')}&table=${encodeURIComponent(tbl.id)}`,
    }));

    res.json({
      success: true,
      tables: enriched,
      local_ip: getLocalIp(),
      port: req.socket.localPort || 3001,
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tables/:id - Single table info
router.get('/:id', (req, res) => {
  try {
    const table = queryOne(
      `SELECT t.*, r.name as restaurant_name, r.slug as restaurant_slug
       FROM tables t
       LEFT JOIN restaurants r ON r.id = t.restaurant_id
       WHERE t.id = ? OR t.table_number = ?`,
      [req.params.id, req.params.id]
    );

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    const baseUrl = getBaseUrl(req);
    table.menu_url = `${baseUrl}/menu?restaurant=${encodeURIComponent(table.restaurant_id || 'rest_losteria')}&table=${encodeURIComponent(table.id)}`;

    res.json({ success: true, table });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/tables/:id/qr - Generate QR code for table
router.get('/:id/qr', async (req, res) => {
  try {
    const table = queryOne(
      `SELECT t.*, r.name as restaurant_name, r.slug as restaurant_slug
       FROM tables t
       LEFT JOIN restaurants r ON r.id = t.restaurant_id
       WHERE t.id = ? OR t.table_number = ?`,
      [req.params.id, req.params.id]
    );

    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    const baseUrl = getBaseUrl(req);
    const targetUrl = `${baseUrl}/menu?restaurant=${encodeURIComponent(table.restaurant_id || 'rest_losteria')}&table=${encodeURIComponent(table.id)}`;

    const qrOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 3,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      width: parseInt(req.query.size || '450', 10),
    };

    const format = req.query.format || 'json';

    if (format === 'svg') {
      const svg = await QRCode.toString(targetUrl, { type: 'svg', margin: 2 });
      res.setHeader('Content-Type', 'image/svg+xml');
      return res.send(svg);
    }

    if (format === 'image') {
      const buffer = await QRCode.toBuffer(targetUrl, qrOptions);
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `inline; filename="qr-${table.table_number.replace(/\s+/g, '-').toLowerCase()}.png"`);
      return res.send(buffer);
    }

    const dataUrl = await QRCode.toDataURL(targetUrl, qrOptions);
    res.json({
      success: true,
      table,
      target_url: targetUrl,
      qr_data_url: dataUrl,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/tables - Add a new table for a restaurant
router.post('/', (req, res) => {
  try {
    const { table_number, name, section, capacity, restaurant_id } = req.body;
    if (!table_number) {
      return res.status(400).json({ success: false, error: 'Table number is required' });
    }

    const restId = restaurant_id || 'rest_losteria';

    // Check duplicate in same restaurant
    const existing = queryOne(
      `SELECT id FROM tables WHERE table_number = ? AND restaurant_id = ?`,
      [table_number, restId]
    );
    if (existing) {
      return res.status(400).json({ success: false, error: `Table "${table_number}" already exists in this restaurant` });
    }

    const id = 'tbl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    execute(
      `INSERT INTO tables (id, restaurant_id, table_number, name, section, capacity, active) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [id, restId, table_number, name || table_number, section || 'Main Dining', parseInt(capacity || '4', 10)]
    );

    const created = queryOne(`SELECT * FROM tables WHERE id = ?`, [id]);
    const baseUrl = getBaseUrl(req);
    created.menu_url = `${baseUrl}/menu?restaurant=${encodeURIComponent(restId)}&table=${encodeURIComponent(created.id)}`;

    res.status(201).json({ success: true, table: created });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/tables/:id - Delete a table
router.delete('/:id', (req, res) => {
  try {
    const table = queryOne(`SELECT * FROM tables WHERE id = ?`, [req.params.id]);
    if (!table) {
      return res.status(404).json({ success: false, error: 'Table not found' });
    }

    execute(`DELETE FROM tables WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: `Table ${table.table_number} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
