// server/index.js - Express server entry point
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { initDb, execute, queryAll, queryOne } from './db.js';
import { registerSSE } from './sse.js';

import tablesRouter from './routes/tables.js';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import paymentRouter from './routes/payment.js';
import invoiceRouter from './routes/invoice.js';
import statsRouter from './routes/stats.js';
import restaurantsRouter from './routes/restaurants.js';
import walletRouter from './routes/wallet.js';
import backupRouter from './routes/backup.js';
import erpRouter from './routes/erp.js';
import downloadsRouter from './routes/downloads.js';
import integrationsRouter from './routes/integrations.js';
import subscriptionRouter from './routes/subscription.js';
import marketplaceRouter from './routes/marketplace.js';
import porterRouter from './routes/porter.js';
import webhookRouter from './routes/webhook.js';
import razorpayStandardRouter from './routes/razorpayStandard.js';
import cloudRouter from './routes/cloud.js';
import { initMongo } from './cloudMongo.js';
import { getFolderOverview, initLocalFileSystem } from './localFileSystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3005;

// Trust reverse proxies (Cloudflare, Vercel, Nginx) for accurate HTTPS detection
app.set('trust proxy', true);

// Initialize database & tables
initDb();
initLocalFileSystem();
initMongo().catch((err) => console.warn('Mongo init deferred:', err.message));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-Sent Events endpoint for real-time kitchen display updates
app.get('/api/events', registerSSE);

// API Routes
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment/razorpay', paymentRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/stats', statsRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/backup', backupRouter);
app.use('/api/erp', erpRouter);
app.use('/api/downloads', downloadsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/subscription', subscriptionRouter);
app.use('/api/marketplace', marketplaceRouter);
app.use('/api/porter', porterRouter);
app.use('/api/erp/webhook', webhookRouter);
app.use('/api/cloud', cloudRouter);

// Razorpay Standard Web Checkout routes: /api/create-order & /api/verify-payment
app.use('/api', razorpayStandardRouter);

// Token Display API (Food Court & QSR Display)
app.get('/api/tokens/active', (req, res) => {
  try {
    const { restaurant_id } = req.query;
    let sql = `SELECT * FROM orders WHERE status IN ('RECEIVED', 'PREPARING', 'READY', 'SERVED')`;
    const params = [];

    if (restaurant_id) {
      sql += ` AND restaurant_id = ?`;
      params.push(restaurant_id);
    }
    sql += ` ORDER BY updated_at DESC, created_at DESC LIMIT 50`;

    const allOrders = queryAll(sql, params);
    const preparing = [];
    const ready = [];
    const served = [];

    allOrders.forEach((o) => {
      const token = {
        id: o.id,
        order_code: o.order_code,
        token_number: o.order_code ? o.order_code.replace(/^[A-Za-z]+-/, '') : o.id.slice(-4),
        table_number: o.table_number,
        customer_name: o.customer_name || 'Guest',
        status: o.status,
        created_at: o.created_at,
        updated_at: o.updated_at,
      };

      if (o.status === 'READY') {
        ready.push(token);
      } else if (o.status === 'RECEIVED' || o.status === 'PREPARING') {
        preparing.push(token);
      } else if (o.status === 'SERVED') {
        if (served.length < 5) served.push(token);
      }
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      preparing,
      ready,
      served,
      counts: { preparing: preparing.length, ready: ready.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Book a 10-Minute Demo (Petpooja Parity)
app.post('/api/demo/book', (req, res) => {
  try {
    const { name, email, phone, outlet_name, outlet_type, city, preferred_time } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and Phone number are required' });
    }

    const demoId = `DEMO-${Date.now().toString().slice(-6)}`;
    execute(
      `INSERT INTO demo_requests (id, name, email, phone, outlet_name, outlet_type, city, preferred_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [demoId, name, email || '', phone, outlet_name || '', outlet_type || 'restaurant', city || 'India', preferred_time || 'ASAP']
    );

    res.status(201).json({
      success: true,
      message: 'Demo request registered! Our restaurant specialist will connect with you in 10 minutes.',
      demo_id: demoId,
      sandbox_url: '/walkthrough',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Local System Folders & On-Premise Data Directory API
app.get('/api/system/folders', (req, res) => {
  try {
    const overview = getFolderOverview();
    res.json({ success: true, folders: overview });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'DineQR Restaurant Platform API',
  });
});

// Serve public directory assets (e.g. food videos) and production frontend
const publicPath = path.resolve(__dirname, '../public');
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(publicPath));
app.use(express.static(distPath));

// Fallback to index.html for client-side React routing (Express 5 syntax)
app.get('{*path}', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.status(200).sendFile('index.html', { root: distPath });
  } else {
    res.status(200).send(`DineQR Server running on port ${PORT}. In dev mode, visit Vite dev server at http://localhost:5173.`);
  }
});

// Start listening if not running in a serverless environment (e.g. Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] DineQR Platform Server running on http://localhost:${PORT}`);
    console.log(`[SSE] Real-time Kitchen SSE ready at http://localhost:${PORT}/api/events`);
  });
}

export default app;
