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

// Database file path inside project data/ directory
const DATA_DIR = path.resolve(__dirname, '../data');
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

  // Apply migrations for columns in case of existing database
  ensureColumn('tables', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('categories', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('menu_items', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('menu_items', 'video_url', "TEXT DEFAULT ''");
  ensureColumn('orders', 'restaurant_id', "TEXT DEFAULT 'rest_losteria'");
  ensureColumn('restaurants', 'razorpay_key_id', "TEXT DEFAULT ''");
  ensureColumn('restaurants', 'razorpay_key_secret', "TEXT DEFAULT ''");

  // Seed default restaurants
  for (const r of defaultRestaurants) {
    const existing = queryOne(`SELECT id FROM restaurants WHERE id = ? OR slug = ?`, [r.id, r.slug]);
    if (!existing) {
      execute(
        `INSERT INTO restaurants (
          id, name, slug, tagline, address, phone, email, gstin, fssai, currency,
          cgst_pct, sgst_pct, service_charge_pct, razorpay_key_id, razorpay_key_secret, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.id,
          r.name,
          r.slug,
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
          r.is_active,
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
          id, restaurant_id, category_id, name, description, price, image_url,
          is_veg, is_available, spice_level, prep_time_mins, calories, tags
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.restaurant_id,
          item.category_id,
          item.name,
          item.description,
          item.price,
          item.image_url,
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

  console.log('✅ SQLite Database successfully initialized and synced at:', DB_PATH);
}
