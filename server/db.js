// server/db.js - Multi-tenant SQLite database manager using node:sqlite
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  defaultRestaurants,
  defaultTables,
  defaultCategories,
  defaultMenuItems
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path: on Vercel use writable /tmp/data, otherwise use project data/ directory
const DATA_DIR = process.env.VERCEL ? '/tmp/data' : path.resolve(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'restaurant.db');
export const db = new DatabaseSync(DB_PATH);

// Helper wrapper functions with automatic undefined->null sanitization
function sanitize(params = []) {
  return params.map((p) => (p === undefined ? null : p));
}

export function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...sanitize(params));
}

export function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...sanitize(params));
  return rows.length > 0 ? rows[0] : null;
}

export function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...sanitize(params));
}

// Safely add column if not exists
function ensureColumn(table, column, definition) {
  try {
    const cols = queryAll(`PRAGMA table_info(${table})`);
    const exists = cols.some((c) => c.name === column);
    if (!exists) {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition};`);
    }
  } catch (e) {
    // ignore
  }
}

// Initialize tables and run migrations
export function initDb() {
  // 1. Restaurants Table (Multi-Tenant Master)
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      business_type TEXT DEFAULT 'restaurant',
      station_type TEXT DEFAULT 'table',
      tagline TEXT,
      address TEXT,
      phone TEXT,
      email TEXT,
      gstin TEXT,
      fssai TEXT,
      currency TEXT DEFAULT '₹',
      cgst_pct REAL DEFAULT 2.5,
      sgst_pct REAL DEFAULT 2.5,
      service_charge_pct REAL DEFAULT 0.0,
      razorpay_key_id TEXT DEFAULT '',
      razorpay_key_secret TEXT DEFAULT '',
      upi_id TEXT DEFAULT '',
      bank_account TEXT DEFAULT '',
      bank_ifsc TEXT DEFAULT '',
      commission_pct REAL DEFAULT 2.0,
      settlement_type TEXT DEFAULT 'direct',
      onboarding_status TEXT DEFAULT 'approved',
      admin_pin TEXT DEFAULT '1234',
      admin_password TEXT DEFAULT 'admin123',
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Dining Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT DEFAULT 'rest_losteria',
      table_number TEXT NOT NULL,
      name TEXT NOT NULL,
      section TEXT DEFAULT 'Main Dining',
      capacity INTEGER DEFAULT 4,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(restaurant_id, table_number)
    );
  `);

  // 3. Menu Categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT DEFAULT 'rest_losteria',
      name TEXT NOT NULL,
      icon TEXT DEFAULT 'Utensils',
      display_order INTEGER DEFAULT 0,
      description TEXT
    );
  `);

  // 4. Menu Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT DEFAULT 'rest_losteria',
      category_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      video_url TEXT,
      is_veg INTEGER DEFAULT 1,
      is_available INTEGER DEFAULT 1,
      spice_level TEXT DEFAULT 'None',
      prep_time_mins INTEGER DEFAULT 15,
      calories INTEGER DEFAULT 0,
      tags TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    );
  `);

  // 5. Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT DEFAULT 'rest_losteria',
      order_code TEXT UNIQUE NOT NULL,
      table_id TEXT,
      table_number TEXT NOT NULL,
      customer_name TEXT,
      customer_phone TEXT,
      status TEXT DEFAULT 'RECEIVED',
      payment_status TEXT DEFAULT 'PENDING',
      payment_method TEXT DEFAULT 'RAZORPAY',
      razorpay_order_id TEXT,
      razorpay_payment_id TEXT,
      subtotal REAL NOT NULL,
      cgst REAL NOT NULL,
      sgst REAL NOT NULL,
      service_charge REAL DEFAULT 0,
      grand_total REAL NOT NULL,
      special_instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 6. Order Items
  db.exec(`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      menu_item_id TEXT,
      name TEXT NOT NULL,
      unit_price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      subtotal REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `);

  // 7. Merchant Wallets (Balances, Commission & Profits)
  db.exec(`
    CREATE TABLE IF NOT EXISTS wallets (
      restaurant_id TEXT PRIMARY KEY,
      balance REAL DEFAULT 0,
      total_earned REAL DEFAULT 0,
      total_commission REAL DEFAULT 0,
      total_withdrawn REAL DEFAULT 0,
      min_withdrawal REAL DEFAULT 500,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // 8. Bank Withdrawals & Payouts
  db.exec(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      amount REAL NOT NULL,
      fee REAL DEFAULT 0,
      net_amount REAL NOT NULL,
      bank_account TEXT NOT NULL,
      bank_ifsc TEXT NOT NULL,
      status TEXT DEFAULT 'SETTLED',
      utr_number TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // 9. Table Bookings & Guest Reservations (Odoo Fine Dining Parity)
  db.exec(`
    CREATE TABLE IF NOT EXISTS reservations (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_id TEXT,
      guest_name TEXT NOT NULL,
      guest_phone TEXT NOT NULL,
      guest_email TEXT,
      party_size INTEGER DEFAULT 2,
      reservation_date TEXT NOT NULL,
      reservation_time TEXT NOT NULL,
      special_requests TEXT,
      status TEXT DEFAULT 'CONFIRMED', -- CONFIRMED, SEATED, COMPLETED, CANCELLED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // 10. Staff Planning & Shift Schedules (Odoo Staff Planning Parity)
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_shifts (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      employee_name TEXT NOT NULL,
      role TEXT NOT NULL, -- Head Chef, Sous Chef, Floor Captain, Waiter, Bartender, Receptionist
      shift_date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      color TEXT DEFAULT '#f59e0b',
      status TEXT DEFAULT 'SCHEDULED', -- SCHEDULED, CLOCKED_IN, COMPLETED, UNAVAILABLE
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // 11. Real-Time Inventory & Stock Management (Odoo Inventory Parity)
  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT UNIQUE,
      category TEXT DEFAULT 'Raw Ingredients',
      current_stock REAL NOT NULL DEFAULT 0,
      min_reorder_level REAL NOT NULL DEFAULT 10,
      unit TEXT NOT NULL DEFAULT 'kg', -- kg, litres, units, packets, boxes
      unit_cost REAL NOT NULL DEFAULT 0,
      expiration_date TEXT,
      supplier_name TEXT,
      status TEXT DEFAULT 'IN_STOCK', -- IN_STOCK, LOW_STOCK, EXPIRED, OUT_OF_STOCK
      last_restocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // 12. Vendor Purchases, Bills & 3-Way Matching RfQs (Odoo Purchases Parity)
  db.exec(`
    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      rfq_number TEXT NOT NULL,
      vendor_name TEXT NOT NULL,
      vendor_email TEXT,
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      tax_amount REAL NOT NULL,
      total_amount REAL NOT NULL,
      status TEXT DEFAULT 'RECEIVED', -- DRAFT, RFQ_SENT, RECEIVED, BILL_VERIFIED, PAID
      payment_terms TEXT DEFAULT 'Net 15',
      received_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );
  `);

  // 13. Interactive Visual Floor Plan Coordinates (Odoo Floor Plan Parity)
  db.exec(`
    CREATE TABLE IF NOT EXISTS floor_plan_tables (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      table_id TEXT NOT NULL,
      pos_x REAL NOT NULL DEFAULT 100,
      pos_y REAL NOT NULL DEFAULT 100,
      shape TEXT NOT NULL DEFAULT 'circle', -- circle, square, rect
      width REAL NOT NULL DEFAULT 90,
      height REAL NOT NULL DEFAULT 90,
      rotation REAL NOT NULL DEFAULT 0,
      zone TEXT NOT NULL DEFAULT 'Main Dining',
      FOREIGN KEY(table_id) REFERENCES tables(id) ON DELETE CASCADE
    );
  `);

  // Apply migrations for columns in case of existing database
  ensureColumn('tables', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('categories', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('menu_items', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('menu_items', 'video_url', "TEXT DEFAULT ''");
  ensureColumn('orders', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('orders', 'payment_method', "TEXT DEFAULT 'Razorpay / UPI'");
  ensureColumn('orders', 'is_counter_order', "INTEGER DEFAULT 0");
  ensureColumn('orders', 'token_number', "INTEGER DEFAULT 0");
  ensureColumn('orders', 'printed_at', "DATETIME");
  ensureColumn('orders', 'print_count', "INTEGER DEFAULT 0");
  ensureColumn('restaurants', 'printer_type', "TEXT DEFAULT 'browser'");
  ensureColumn('restaurants', 'printer_ip', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'printer_port', "INTEGER DEFAULT 9100");
  ensureColumn('restaurants', 'paper_width', "TEXT DEFAULT '80mm'");
  ensureColumn('restaurants', 'auto_print_bills', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'cash_drawer_kick', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'zomato_res_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'zomato_api_key', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'zomato_auto_accept', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'swiggy_outlet_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'swiggy_api_key', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'swiggy_auto_accept', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'magicpin_merchant_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'ondc_provider_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'aggregator_webhook_secret', "TEXT DEFAULT ''");
  ensureColumn('orders', 'order_source', "TEXT DEFAULT 'DIRECT'");
  ensureColumn('orders', 'aggregator_order_id', "TEXT DEFAULT ''");
  ensureColumn('orders', 'aggregator_rider_name', "TEXT DEFAULT ''");
  ensureColumn('orders', 'aggregator_rider_phone', "TEXT DEFAULT ''");
  ensureColumn('orders', 'split_type', "TEXT DEFAULT 'SINGLE'");
  ensureColumn('orders', 'split_shares', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'razorpay_key_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'razorpay_key_secret', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'business_type', "TEXT DEFAULT 'restaurant'");
  ensureColumn('restaurants', 'station_type', "TEXT DEFAULT 'table'");
  ensureColumn('restaurants', 'admin_pin', "TEXT DEFAULT '1234'");
  ensureColumn('restaurants', 'admin_password', "TEXT DEFAULT 'admin123'");
  ensureColumn('restaurants', 'upi_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'bank_account', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'bank_ifsc', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'commission_pct', "REAL DEFAULT 2.0");
  ensureColumn('restaurants', 'settlement_type', "TEXT DEFAULT 'direct'");
  ensureColumn('restaurants', 'onboarding_status', "TEXT DEFAULT 'approved'");
  ensureColumn('restaurants', 'cloud_domain', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'merchant_user_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'subscription_plan', "TEXT DEFAULT 'Pro ₹1,000/mo'");
  ensureColumn('restaurants', 'subscription_status', "TEXT DEFAULT 'active'");
  ensureColumn('orders', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('restaurants', 'razorpay_key_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'razorpay_key_secret', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'business_type', "TEXT DEFAULT 'restaurant'");
  ensureColumn('restaurants', 'station_type', "TEXT DEFAULT 'table'");
  ensureColumn('restaurants', 'admin_pin', "TEXT DEFAULT '1234'");
  ensureColumn('restaurants', 'admin_password', "TEXT DEFAULT 'admin123'");
  ensureColumn('restaurants', 'upi_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'bank_account', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'bank_ifsc', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'commission_pct', "REAL DEFAULT 2.0");
  ensureColumn('restaurants', 'settlement_type', "TEXT DEFAULT 'direct'");
  ensureColumn('restaurants', 'onboarding_status', "TEXT DEFAULT 'approved'");
  ensureColumn('restaurants', 'cloud_domain', "TEXT DEFAULT ''");
  ensureColumn('orders', 'payment_method', "TEXT DEFAULT 'Razorpay / UPI'");
  ensureColumn('orders', 'is_counter_order', "INTEGER DEFAULT 0");
  ensureColumn('orders', 'token_number', "INTEGER DEFAULT 0");
  ensureColumn('orders', 'printed_at', "DATETIME");
  ensureColumn('orders', 'print_count', "INTEGER DEFAULT 0");
  ensureColumn('restaurants', 'printer_type', "TEXT DEFAULT 'browser'");
  ensureColumn('restaurants', 'printer_ip', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'printer_port', "INTEGER DEFAULT 9100");
  ensureColumn('restaurants', 'paper_width', "TEXT DEFAULT '80mm'");
  ensureColumn('restaurants', 'auto_print_bills', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'cash_drawer_kick', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'zomato_res_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'zomato_api_key', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'zomato_auto_accept', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'swiggy_outlet_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'swiggy_api_key', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'swiggy_auto_accept', "INTEGER DEFAULT 1");
  ensureColumn('restaurants', 'magicpin_merchant_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'ondc_provider_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'aggregator_webhook_secret', "TEXT DEFAULT ''");
  ensureColumn('orders', 'order_source', "TEXT DEFAULT 'DIRECT'");
  ensureColumn('orders', 'aggregator_order_id', "TEXT DEFAULT ''");
  ensureColumn('orders', 'aggregator_rider_name', "TEXT DEFAULT ''");
  ensureColumn('orders', 'aggregator_rider_phone', "TEXT DEFAULT ''");

  // Seed default restaurants
  for (const r of defaultRestaurants) {
    const existing = queryOne(`SELECT id FROM restaurants WHERE id = ? OR slug = ?`, [r.id, r.slug]);
    if (!existing) {
      execute(
        `INSERT INTO restaurants (
          id, name, slug, business_type, station_type, tagline, address, phone, email, gstin, fssai, currency,
          cgst_pct, sgst_pct, service_charge_pct, razorpay_key_id, razorpay_key_secret, upi_id, bank_account, bank_ifsc,
          commission_pct, settlement_type, onboarding_status, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.name,
          r.slug,
          r.business_type || 'restaurant',
          r.station_type || 'table',
          r.tagline,
          r.address,
          r.phone,
          r.email,
          r.gstin,
          r.fssai,
          r.currency,
          r.cgst_pct,
          r.sgst_pct,
          r.service_charge_pct,
          r.razorpay_key_id,
          r.razorpay_key_secret,
          r.upi_id || '',
          r.bank_account || '',
          r.bank_ifsc || '',
          r.commission_pct || 2.0,
          r.settlement_type || 'direct',
          r.onboarding_status || 'approved',
          r.is_active,
        ]
      );
    } else {
      execute(
        `UPDATE restaurants SET
          business_type = COALESCE(business_type, ?),
          station_type = COALESCE(station_type, ?),
          razorpay_key_id = CASE WHEN razorpay_key_id = '' OR razorpay_key_id IS NULL THEN ? ELSE razorpay_key_id END,
          razorpay_key_secret = CASE WHEN razorpay_key_secret = '' OR razorpay_key_secret IS NULL THEN ? ELSE razorpay_key_secret END,
          upi_id = CASE WHEN upi_id = '' OR upi_id IS NULL THEN ? ELSE upi_id END,
          bank_account = CASE WHEN bank_account = '' OR bank_account IS NULL THEN ? ELSE bank_account END,
          bank_ifsc = CASE WHEN bank_ifsc = '' OR bank_ifsc IS NULL THEN ? ELSE bank_ifsc END,
          onboarding_status = 'approved'
         WHERE id = ?`,
        [
          r.business_type || 'restaurant',
          r.station_type || 'table',
          r.razorpay_key_id || '',
          r.razorpay_key_secret || '',
          r.upi_id || '',
          r.bank_account || '',
          r.bank_ifsc || '',
          existing.id,
        ]
      );
    }
  }

  // Seed tables if missing for restaurants
  for (const t of defaultTables) {
    const exists = queryOne(`SELECT id FROM tables WHERE id = ?`, [t.id]);
    if (!exists) {
      execute(
        `INSERT INTO tables (id, restaurant_id, table_number, name, section, capacity) VALUES (?, ?, ?, ?, ?, ?)`,
        [t.id, t.restaurant_id, t.table_number, t.name, t.section, t.capacity]
      );
    }
  }

  // Seed categories if missing
  for (const c of defaultCategories) {
    const exists = queryOne(`SELECT id FROM categories WHERE id = ?`, [c.id]);
    if (!exists) {
      execute(
        `INSERT INTO categories (id, restaurant_id, name, icon, display_order, description) VALUES (?, ?, ?, ?, ?, ?)`,
        [c.id, c.restaurant_id, c.name, c.icon, c.display_order, c.description]
      );
    }
  }

  // Seed menu items if missing
  for (const item of defaultMenuItems) {
    const exists = queryOne(`SELECT id FROM menu_items WHERE id = ?`, [item.id]);
    if (!exists) {
      execute(
        `INSERT INTO menu_items (
          id, restaurant_id, category_id, name, description, price, image_url, video_url,
          is_veg, is_available, spice_level, prep_time_mins, calories, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.restaurant_id,
          item.category_id,
          item.name,
          item.description,
          item.price,
          item.image_url,
          item.video_url || '',
          item.is_veg,
          item.is_available,
          item.spice_level,
          item.prep_time_mins,
          item.calories,
          item.tags,
        ]
      );
    }
  }

  // Ensure wallet exists for all restaurants and sync balances
  const allRestaurants = queryAll(`SELECT id, commission_pct FROM restaurants`);
  for (const r of allRestaurants) {
    const w = queryOne(`SELECT * FROM wallets WHERE restaurant_id = ?`, [r.id]);
    if (!w) {
      const stats = queryOne(
        `SELECT COALESCE(SUM(grand_total), 0) as paid_total FROM orders WHERE restaurant_id = ? AND payment_status = 'PAID'`,
        [r.id]
      );
      const gmv = stats ? stats.paid_total : 0;
      const commissionPct = r.commission_pct || 2.0;
      const commission = (gmv * commissionPct) / 100;
      const netEarned = gmv - commission;
      execute(
        `INSERT INTO wallets (restaurant_id, balance, total_earned, total_commission, total_withdrawn, min_withdrawal)
         VALUES (?, ?, ?, ?, 0, 500)`,
        [r.id, netEarned, netEarned, commission]
      );
    }
  }

  // Seed sample floor plan tables if empty
  const fpCount = queryOne(`SELECT COUNT(*) as c FROM floor_plan_tables`)?.c || 0;
  if (fpCount === 0) {
    const tables = queryAll(`SELECT id, restaurant_id, table_number FROM tables WHERE restaurant_id = 'rest_losteria'`);
    let px = 80;
    let py = 80;
    tables.forEach((t, idx) => {
      const shape = idx % 2 === 0 ? 'circle' : 'rect';
      execute(
        `INSERT INTO floor_plan_tables (id, restaurant_id, table_id, pos_x, pos_y, shape, width, height, rotation, zone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [`fp_${t.id}`, t.restaurant_id, t.id, px, py, shape, shape === 'circle' ? 90 : 110, shape === 'circle' ? 90 : 80, 'Main Dining']
      );
      px += 140;
      if (px > 500) {
        px = 80;
        py += 130;
      }
    });
  }

  // Seed sample reservations if empty
  const resCount = queryOne(`SELECT COUNT(*) as c FROM reservations`)?.c || 0;
  if (resCount === 0) {
    const sampleReservations = [
      { id: 'res_1', restaurant_id: 'rest_losteria', table_id: 'tbl_1', guest_name: 'Ananya Sharma', guest_phone: '+91 98765 43210', party_size: 4, reservation_date: '2026-10-31', reservation_time: '20:00', status: 'CONFIRMED', special_requests: 'Anniversary celebration. Window seating preferred.' },
      { id: 'res_2', restaurant_id: 'rest_losteria', table_id: 'tbl_2', guest_name: 'Vikram Malhotra', guest_phone: '+91 98111 22334', party_size: 2, reservation_date: '2026-10-31', reservation_time: '20:30', status: 'SEATED', special_requests: 'Quiet table for business dinner.' },
      { id: 'res_3', restaurant_id: 'rest_losteria', table_id: 'tbl_5', guest_name: 'Priya Iyer', guest_phone: '+91 97234 56789', party_size: 6, reservation_date: '2026-11-01', reservation_time: '19:45', status: 'CONFIRMED', special_requests: 'Family dinner, high-chair needed.' },
      { id: 'res_4', restaurant_id: 'rest_apex_clinic', table_id: 'tbl_c1', guest_name: 'Rajesh Verma', guest_phone: '+91 99887 76655', party_size: 1, reservation_date: '2026-10-31', reservation_time: '18:15', status: 'CONFIRMED', special_requests: 'Cardiology follow-up OPD.' }
    ];
    for (const r of sampleReservations) {
      execute(
        `INSERT INTO reservations (id, restaurant_id, table_id, guest_name, guest_phone, party_size, reservation_date, reservation_time, special_requests, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.restaurant_id, r.table_id, r.guest_name, r.guest_phone, r.party_size, r.reservation_date, r.reservation_time, r.special_requests, r.status]
      );
    }
  }

  // Seed sample staff shifts if empty
  const shiftCount = queryOne(`SELECT COUNT(*) as c FROM staff_shifts`)?.c || 0;
  if (shiftCount === 0) {
    const sampleShifts = [
      { id: 'shift_1', restaurant_id: 'rest_losteria', employee_name: 'Marco Rossi', role: 'Head Chef', shift_date: '2026-10-31', start_time: '12:00', end_time: '22:00', color: '#ef4444', status: 'CLOCKED_IN', notes: 'Dinner rush supervision' },
      { id: 'shift_2', restaurant_id: 'rest_losteria', employee_name: 'Sunil Rao', role: 'Sous Chef', shift_date: '2026-10-31', start_time: '14:00', end_time: '23:00', color: '#f97316', status: 'SCHEDULED', notes: 'Pasta and Wood-fire station' },
      { id: 'shift_3', restaurant_id: 'rest_losteria', employee_name: 'Kavita Menon', role: 'Floor Captain', shift_date: '2026-10-31', start_time: '16:00', end_time: '00:00', color: '#10b981', status: 'SCHEDULED', notes: 'Main dining floor VIP service' },
      { id: 'shift_4', restaurant_id: 'rest_losteria', employee_name: 'Aakash Verma', role: 'Bartender', shift_date: '2026-10-31', start_time: '17:00', end_time: '01:00', color: '#06b6d4', status: 'SCHEDULED', notes: 'Cocktail & Craft Beer Bar' }
    ];
    for (const s of sampleShifts) {
      execute(
        `INSERT INTO staff_shifts (id, restaurant_id, employee_name, role, shift_date, start_time, end_time, color, status, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.id, s.restaurant_id, s.employee_name, s.role, s.shift_date, s.start_time, s.end_time, s.color, s.status, s.notes]
      );
    }
  }

  // Seed sample inventory if empty
  const invCount = queryOne(`SELECT COUNT(*) as c FROM inventory_items`)?.c || 0;
  if (invCount === 0) {
    const sampleInventory = [
      { id: 'inv_1', restaurant_id: 'rest_losteria', name: 'San Marzano Tomato Sauce', sku: 'ING-TOM-01', category: 'Raw Ingredients', current_stock: 45.5, min_reorder_level: 20, unit: 'litres', unit_cost: 240, expiration_date: '2026-12-15', supplier_name: 'Napoli Imports India', status: 'IN_STOCK' },
      { id: 'inv_2', restaurant_id: 'rest_losteria', name: 'Buffalo Mozzarella DOP', sku: 'ING-MOZ-02', category: 'Dairy & Cheese', current_stock: 8.2, min_reorder_level: 15, unit: 'kg', unit_cost: 680, expiration_date: '2026-11-05', supplier_name: 'Artisan Dairy Farm', status: 'LOW_STOCK' },
      { id: 'inv_3', restaurant_id: 'rest_losteria', name: 'Italian Tipo 00 Flour', sku: 'ING-FLR-03', category: 'Grains & Flour', current_stock: 120.0, min_reorder_level: 40, unit: 'kg', unit_cost: 110, expiration_date: '2027-04-20', supplier_name: 'Caputo Grains Ltd', status: 'IN_STOCK' },
      { id: 'inv_4', restaurant_id: 'rest_losteria', name: 'White Truffle Infused Oil', sku: 'ING-TRF-04', category: 'Oils & Condiments', current_stock: 1.5, min_reorder_level: 4, unit: 'litres', unit_cost: 2200, expiration_date: '2027-02-10', supplier_name: 'Gourmet World Dist', status: 'LOW_STOCK' },
      { id: 'inv_5', restaurant_id: 'rest_losteria', name: 'Organic Colombian Coffee Beans', sku: 'ING-COF-05', category: 'Beverages', current_stock: 28.0, min_reorder_level: 10, unit: 'kg', unit_cost: 850, expiration_date: '2026-11-30', supplier_name: 'Blue Tokai Roasters', status: 'IN_STOCK' }
    ];
    for (const item of sampleInventory) {
      execute(
        `INSERT INTO inventory_items (id, restaurant_id, name, sku, category, current_stock, min_reorder_level, unit, unit_cost, expiration_date, supplier_name, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [item.id, item.restaurant_id, item.name, item.sku, item.category, item.current_stock, item.min_reorder_level, item.unit, item.unit_cost, item.expiration_date, item.supplier_name, item.status]
      );
    }
  }

  // Seed sample purchase orders & RfQs if empty
  const poCount = queryOne(`SELECT COUNT(*) as c FROM purchase_orders`)?.c || 0;
  if (poCount === 0) {
    const samplePOs = [
      { id: 'po_1', restaurant_id: 'rest_losteria', rfq_number: 'PO-2026-089', vendor_name: 'Napoli Imports India', vendor_email: 'supply@napoli-imports.in', items_json: JSON.stringify([{ item: 'San Marzano Tomato Sauce (20L drum)', qty: 2, price: 4800 }, { item: 'Tipo 00 Flour (25kg sack)', qty: 4, price: 4400 }]), subtotal: 9200, tax_amount: 460, total_amount: 9660, status: 'BILL_VERIFIED', payment_terms: 'Net 15', received_date: '2026-10-28' },
      { id: 'po_2', restaurant_id: 'rest_losteria', rfq_number: 'PO-2026-090', vendor_name: 'Artisan Dairy Farm', vendor_email: 'orders@artisandairy.co.in', items_json: JSON.stringify([{ item: 'Fresh Buffalo Mozzarella (10kg)', qty: 2, price: 13600 }]), subtotal: 13600, tax_amount: 680, total_amount: 14280, status: 'RECEIVED', payment_terms: 'Immediate UPI', received_date: '2026-10-30' },
      { id: 'po_3', restaurant_id: 'rest_losteria', rfq_number: 'RFQ-2026-091', vendor_name: 'Gourmet World Dist', vendor_email: 'sales@gourmetworld.in', items_json: JSON.stringify([{ item: 'White Truffle Oil (500ml glass bottle)', qty: 6, price: 6600 }]), subtotal: 6600, tax_amount: 330, total_amount: 6930, status: 'RFQ_SENT', payment_terms: 'Net 30', received_date: null }
    ];
    for (const po of samplePOs) {
      execute(
        `INSERT INTO purchase_orders (id, restaurant_id, rfq_number, vendor_name, vendor_email, items_json, subtotal, tax_amount, total_amount, status, payment_terms, received_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [po.id, po.restaurant_id, po.rfq_number, po.vendor_name, po.vendor_email, po.items_json, po.subtotal, po.tax_amount, po.total_amount, po.status, po.payment_terms, po.received_date]
      );
    }
  }

  console.log('✅ SQLite Database successfully initialized and synced at:', DB_PATH);
}
