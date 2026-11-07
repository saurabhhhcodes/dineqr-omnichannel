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
    CREATE TABLE IF NOT EXISTS staff_members (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT NOT NULL,
      user_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Waiter / Server',
      pin TEXT NOT NULL DEFAULT '1234',
      password TEXT NOT NULL DEFAULT 'staff123',
      phone TEXT,
      status TEXT DEFAULT 'ACTIVE',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(restaurant_id) REFERENCES restaurants(id)
    );

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

  // 14. Staff Live Attendance, Clock-in & Activity Ledger
  db.exec(`
    CREATE TABLE IF NOT EXISTS staff_attendance (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT DEFAULT 'rest_losteria',
      employee_name TEXT NOT NULL,
      staff_pin TEXT,
      role TEXT DEFAULT 'Server',
      clock_in_time DATETIME DEFAULT CURRENT_TIMESTAMP,
      clock_out_time DATETIME,
      current_activity TEXT DEFAULT 'Arrived at Restaurant / Floor Briefing',
      notes TEXT,
      status TEXT DEFAULT 'ON_DUTY', -- ON_DUTY, ON_BREAK, CLOCKED_OUT
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 15. On-Demand Services Marketplace (Apronto Competitor)
  db.exec(`
    CREATE TABLE IF NOT EXISTS services_marketplace (
      id TEXT PRIMARY KEY,
      provider_name TEXT NOT NULL,
      provider_phone TEXT,
      category TEXT NOT NULL, -- chef, carpenter, electrician, plumber, materials, etc.
      headline TEXT,
      description TEXT,
      hourly_rate REAL DEFAULT 0,
      fixed_price REAL DEFAULT 0,
      pricing_unit TEXT DEFAULT 'visit',
      rating REAL DEFAULT 4.9,
      reviews_count INTEGER DEFAULT 24,
      distance_km REAL DEFAULT 1.2,
      availability_status TEXT DEFAULT 'AVAILABLE',
      skills_json TEXT DEFAULT '[]',
      location_area TEXT DEFAULT 'Koramangala, Bengaluru',
      porter_eligible INTEGER DEFAULT 1,
      image_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 16. Service Bookings & Job Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_bookings (
      id TEXT PRIMARY KEY,
      booking_code TEXT NOT NULL,
      service_id TEXT NOT NULL,
      provider_name TEXT,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT NOT NULL,
      category TEXT,
      scheduled_at TEXT,
      instructions TEXT,
      status TEXT DEFAULT 'CONFIRMED', -- REQUESTED, CONFIRMED, EN_ROUTE, IN_PROGRESS, COMPLETED
      total_amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'PAID',
      payment_method TEXT DEFAULT 'UPI / Razorpay',
      porter_shipment_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 17. Porter Cargo & Tempo Dispatch Shipments
  db.exec(`
    CREATE TABLE IF NOT EXISTS porter_shipments (
      id TEXT PRIMARY KEY,
      tracking_code TEXT NOT NULL,
      booking_id TEXT,
      item_description TEXT,
      cargo_weight_kg REAL DEFAULT 50,
      vehicle_type TEXT DEFAULT 'tata_ace', -- two_wheeler, three_wheeler, tata_ace, pickup_8ft
      pickup_address TEXT NOT NULL,
      drop_address TEXT NOT NULL,
      distance_km REAL DEFAULT 4.5,
      estimated_cost REAL NOT NULL,
      driver_name TEXT DEFAULT 'Ramesh Yadav',
      driver_phone TEXT DEFAULT '+91 98451 22334',
      vehicle_number TEXT DEFAULT 'KA 01 AB 4590',
      eta_minutes INTEGER DEFAULT 25,
      status TEXT DEFAULT 'ASSIGNED', -- BOOKED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 18. Local SQLite Sync & Webhook Verifications
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_webhooks (
      id TEXT PRIMARY KEY,
      restaurant_id TEXT DEFAULT 'rest_losteria',
      webhook_url TEXT NOT NULL,
      secret_token TEXT NOT NULL,
      event_types TEXT DEFAULT 'order.created,order.paid,inventory.low,attendance.clock_in',
      last_ping_at DATETIME,
      last_status_code INTEGER DEFAULT 200,
      db_hash TEXT,
      record_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Apply migrations for columns in case of existing database
  ensureColumn('tables', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('categories', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('menu_items', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('menu_items', 'video_url', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'subscription_expires_at', "DATETIME");
  ensureColumn('restaurants', 'staff_pin', "TEXT DEFAULT '1234'");
  ensureColumn('restaurants', 'owner_name', "TEXT DEFAULT 'Restaurant Owner'");
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

  // Seed sample staff members if empty
  const staffMemberCount = queryOne(`SELECT COUNT(*) as c FROM staff_members`)?.c || 0;
  if (staffMemberCount === 0) {
    const sampleStaff = [
      { id: 'stf_1', restaurant_id: 'rest_losteria', user_id: 'STF_MARCO', name: 'Marco Rossi', role: 'Head Chef', pin: '1234', password: 'chef123', phone: '+91 98765 11111' },
      { id: 'stf_2', restaurant_id: 'rest_losteria', user_id: 'STF_SUNIL', name: 'Sunil Rao', role: 'Sous Chef', pin: '1234', password: 'staff123', phone: '+91 98765 22222' },
      { id: 'stf_3', restaurant_id: 'rest_losteria', user_id: 'STF_KAVITA', name: 'Kavita Menon', role: 'Floor Captain', pin: '1234', password: 'staff123', phone: '+91 98765 33333' },
      { id: 'stf_4', restaurant_id: 'rest_losteria', user_id: 'STF_AAKASH', name: 'Aakash Verma', role: 'Bartender', pin: '1234', password: 'staff123', phone: '+91 98765 44444' },
      { id: 'stf_r1', restaurant_id: 'rest_roastery', user_id: 'STF_ANANYA', name: 'Ananya Sharma', role: 'Head Barista', pin: '1234', password: 'coffee123', phone: '+91 98450 12345' },
    ];
    for (const sm of sampleStaff) {
      execute(
        `INSERT INTO staff_members (id, restaurant_id, user_id, name, role, pin, password, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [sm.id, sm.restaurant_id, sm.user_id, sm.name, sm.role, sm.pin, sm.password, sm.phone]
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

  // Seed sample on-demand services (Apronto Competitor) if empty
  const srvCount = queryOne(`SELECT COUNT(*) as c FROM services_marketplace`)?.c || 0;
  if (srvCount === 0) {
    const sampleServices = [
      {
        id: 'srv_chef_1',
        provider_name: 'Chef Vikramaditya Roy',
        provider_phone: '+91 98450 11223',
        category: 'chef',
        headline: 'Executive Private Chef · Live Barbecue & Gourmet North/South Indian Feast',
        description: '12 years luxury hotel experience. Custom multi-course meals prepared fresh in your kitchen with full hygiene & ingredient preparation.',
        hourly_rate: 450,
        fixed_price: 1499,
        pricing_unit: '3-course feast (up to 6 guests)',
        rating: 4.96,
        reviews_count: 84,
        distance_km: 1.4,
        availability_status: 'AVAILABLE',
        skills_json: JSON.stringify(['Live Barbecue Grill', 'North Indian Awadhi', 'Italian Pastas & Woodfire', 'Keto & Vegan Diets']),
        location_area: 'Indiranagar / Koramangala, Bengaluru',
        porter_eligible: 1,
        image_url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&q=80',
      },
      {
        id: 'srv_carpenter_1',
        provider_name: 'Rajesh Sharma Wooden Crafts',
        provider_phone: '+91 97412 33445',
        category: 'carpenter',
        headline: 'Master Carpenter · Furniture Assembly, Door Lock Fitting & Modular Kitchens',
        description: 'Specialist in custom plywood wardrobes, hinge replacements, laminate repairs, bed frame assembly, and precision wood cutting.',
        hourly_rate: 300,
        fixed_price: 299,
        pricing_unit: 'service visit & inspection',
        rating: 4.92,
        reviews_count: 112,
        distance_km: 2.1,
        availability_status: 'AVAILABLE',
        skills_json: JSON.stringify(['Modular Wardrobes', 'Door & Lock Repairs', 'Bed Frame Assembly', 'Laminate & Hinge Fixing']),
        location_area: 'HSR Layout, Bengaluru',
        porter_eligible: 1,
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
      },
      {
        id: 'srv_electrician_1',
        provider_name: 'Anand Verma (Licensed Wireman)',
        provider_phone: '+91 98110 55667',
        category: 'electrician',
        headline: 'Govt Certified Electrician · Short Circuit Repair, Inverters & MCB Wiring',
        description: 'High-voltage safety certified. Emergency power outage troubleshooting, ceiling fan installations, modular switchboards, and heavy appliance earthing.',
        hourly_rate: 250,
        fixed_price: 199,
        pricing_unit: 'inspection & minor fix',
        rating: 4.95,
        reviews_count: 146,
        distance_km: 0.9,
        availability_status: 'AVAILABLE',
        skills_json: JSON.stringify(['MCB & Short Circuit Repair', 'Ceiling Fan Installation', 'Home Inverter Setup', 'Appliance Earthing']),
        location_area: 'BTM Layout / Koramangala, Bengaluru',
        porter_eligible: 0,
        image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80',
      },
      {
        id: 'srv_plumber_1',
        provider_name: 'Tariq HydroTech Plumbers',
        provider_phone: '+91 99012 77889',
        category: 'plumber',
        headline: 'Plumbing Specialist · Water Leakage, Submersible Pump & RO Filter Service',
        description: 'Concealed pipe leak detection, bathroom sanitary fittings, overhead water tank float valve, submersible pump motor servicing, and RO membrane replacement.',
        hourly_rate: 280,
        fixed_price: 249,
        pricing_unit: 'visit & leak detection',
        rating: 4.89,
        reviews_count: 98,
        distance_km: 1.8,
        availability_status: 'AVAILABLE',
        skills_json: JSON.stringify(['Leakage Detection', 'Submersible Pump Motor', 'RO Purifier Servicing', 'Sanitary Tap Fitting']),
        location_area: 'Jayanagar, Bengaluru',
        porter_eligible: 1,
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
      },
      {
        id: 'srv_materials_1',
        provider_name: 'Gupta Building Materials Depot',
        provider_phone: '+91 98220 99001',
        category: 'materials',
        headline: 'UltraTech Cement, River Sand, Red Bricks & Hardware · Same-Hour Porter Delivery',
        description: 'Wholesale & retail supplier of UltraTech Super Cement (50kg bags), washed river sand, gravel aggregate, AAC blocks, and construction binding wire. Instant loading onto Porter Tata Ace mini-trucks.',
        hourly_rate: 0,
        fixed_price: 385,
        pricing_unit: 'per 50kg UltraTech bag',
        rating: 4.94,
        reviews_count: 230,
        distance_km: 3.2,
        availability_status: 'AVAILABLE',
        skills_json: JSON.stringify(['UltraTech Cement (50kg)', 'Washed River Sand', 'Red Clay Bricks', 'Binding Wire & Nails']),
        location_area: 'Outer Ring Road / Bellandur, Bengaluru',
        porter_eligible: 1,
        image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&q=80',
      },
    ];

    for (const s of sampleServices) {
      execute(
        `INSERT INTO services_marketplace (
          id, provider_name, provider_phone, category, headline, description,
          hourly_rate, fixed_price, pricing_unit, rating, reviews_count, distance_km,
          availability_status, skills_json, location_area, porter_eligible, image_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          s.id, s.provider_name, s.provider_phone, s.category, s.headline, s.description,
          s.hourly_rate, s.fixed_price, s.pricing_unit, s.rating, s.reviews_count, s.distance_km,
          s.availability_status, s.skills_json, s.location_area, s.porter_eligible, s.image_url
        ]
      );
    }
  }

  // Seed sample Porter shipment if empty
  const portCount = queryOne(`SELECT COUNT(*) as c FROM porter_shipments`)?.c || 0;
  if (portCount === 0) {
    execute(
      `INSERT INTO porter_shipments (
        id, tracking_code, booking_id, item_description, cargo_weight_kg, vehicle_type,
        pickup_address, drop_address, distance_km, estimated_cost, driver_name,
        driver_phone, vehicle_number, eta_minutes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'port_ship_1',
        'PRTR-BLR-8921',
        'bkg_sample_1',
        '10 Bags UltraTech Super Cement (500kg total)',
        500,
        'tata_ace',
        'Gupta Building Materials Depot, Outer Ring Road, Bengaluru',
        'Plot 42, Galleria Boulevard, Indiranagar, Bengaluru',
        4.8,
        420,
        'Ramesh Yadav',
        '+91 98451 22334',
        'KA 01 AB 4590',
        22,
        'IN_TRANSIT',
      ]
    );
  }

  // Seed default webhook record if empty
  const whCount = queryOne(`SELECT COUNT(*) as c FROM sync_webhooks`)?.c || 0;
  if (whCount === 0) {
    execute(
      `INSERT INTO sync_webhooks (
        id, restaurant_id, webhook_url, secret_token, event_types, last_ping_at,
        last_status_code, db_hash, record_count, is_active
      ) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 200, 'sha256_verified_local_engine', 55, 1)`,
      [
        'wh_default',
        'rest_losteria',
        'https://api.dineqr.local/webhook/sqlite-sync',
        'sec_live_token_2026',
        'order.created,order.paid,inventory.low,attendance.clock_in',
      ]
    );
  }

  console.log('[SQLite DB] Successfully initialized and synced at:', DB_PATH);
}
