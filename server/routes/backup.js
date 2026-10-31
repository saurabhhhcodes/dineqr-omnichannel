// server/routes/backup.js - Local database compliance archive & monthly 31st download system
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { queryOne, queryAll } from '../db.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/restaurant.db');

// GET /api/backup/schedule-status - Check next 31st monthly download and records count
router.get('/schedule-status', (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 'rest_losteria';
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurantId]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const orderStats = queryOne(
      `SELECT COUNT(*) as total_orders, COALESCE(SUM(grand_total), 0) as total_volume FROM orders WHERE restaurant_id = ?`,
      [restaurantId]
    );

    const today = new Date();
    const currentDay = today.getDate();
    // Check if month end (30th/31st/28th)
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const isMonthEnd = currentDay === lastDayOfMonth;

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentMonthName = monthNames[today.getMonth()];
    const currentYear = today.getFullYear();

    res.json({
      success: true,
      schedule: {
        restaurant_id: restaurantId,
        restaurant_name: restaurant.name,
        current_period: `${currentMonthName} ${currentYear}`,
        next_download_date: `${lastDayOfMonth}st of ${currentMonthName} ${currentYear}`,
        is_month_end_ready: isMonthEnd || true, // Ready on demand anytime as well
        total_monthly_records: orderStats?.total_orders || 0,
        total_volume: orderStats?.total_volume || 0,
        storage_architecture: '100% Zero-Cloud Cost Local SQLite',
        super_admin_sync: 'Free MongoDB Cluster Aggregate Sync Active',
        file_formats: ['.json (Universal Compliance Ledger)', '.sqlite (Raw Database Binary)'],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/backup/download - Download complete structured monthly compliance JSON
router.get('/download', (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 'rest_losteria';
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurantId]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const tables = queryAll(`SELECT * FROM tables WHERE restaurant_id = ?`, [restaurantId]);
    const categories = queryAll(`SELECT * FROM categories WHERE restaurant_id = ?`, [restaurantId]);
    const items = queryAll(`SELECT * FROM menu_items WHERE restaurant_id = ?`, [restaurantId]);
    const orders = queryAll(`SELECT * FROM orders WHERE restaurant_id = ?`, [restaurantId]);
    const orderItems = queryAll(`
      SELECT oi.* FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.restaurant_id = ?
    `, [restaurantId]);
    const wallet = queryOne(`SELECT * FROM wallets WHERE restaurant_id = ?`, [restaurantId]);
    const withdrawals = queryAll(`SELECT * FROM withdrawals WHERE restaurant_id = ?`, [restaurantId]);

    const backupPayload = {
      archive_metadata: {
        system: 'DineQR Universal POS & QR Platform',
        version: '1.0.0',
        exported_at: new Date().toISOString(),
        archive_type: 'End-of-Month Local Compliance Snapshot',
        client_organization: restaurant.name,
        client_slug: restaurant.slug,
        business_type: restaurant.business_type,
        gstin: restaurant.gstin || 'N/A',
      },
      organization_profile: {
        ...restaurant,
        razorpay_key_secret: undefined, // Never export secret keys
      },
      stations_and_tables: tables,
      catalog_categories: categories,
      catalog_items: items,
      order_ledger: orders,
      order_item_details: orderItems,
      settlement_wallet: wallet,
      bank_withdrawals: withdrawals,
    };

    const jsonString = JSON.stringify(backupPayload, null, 2);
    const hash = crypto.createHash('sha256').update(jsonString).digest('hex');
    backupPayload.archive_metadata.sha256_integrity_hash = hash;

    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const filename = `DineQR_Compliance_Archive_${restaurant.slug}_${dateStr}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(jsonString);
  } catch (error) {
    console.error('Backup download error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/backup/sqlite - Direct raw SQLite database download
router.get('/sqlite', (req, res) => {
  try {
    if (!fs.existsSync(DB_PATH)) {
      return res.status(404).json({ success: false, error: 'Database file not found on disk' });
    }
    const today = new Date().toISOString().split('T')[0];
    res.download(DB_PATH, `DineQR_Local_Database_${today}.db`);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
