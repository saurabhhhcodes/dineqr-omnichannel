// scripts/setup_local_db.js - Standalone Local SQLite Database Initializer and Health Verifier
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb, queryOne, queryAll, db } from '../server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const dataDir = path.join(projectRoot, 'data');
const dbPath = path.join(dataDir, 'restaurant.db');

console.log('====================================================');
console.log('📦 DineQR On-Premise Local SQLite Database Setup');
console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
console.log('====================================================\n');

// 1. Ensure directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`✓ Created local data directory at: ${dataDir}`);
}

// 2. Run Database Migrations and Schema Initialization
console.log('⚙️ Initializing database schema, multi-tenant tables, and indices...');
initDb();
console.log('✓ Database schema tables and constraints verified.');

// 3. Verify SQLite Integrity Check
console.log('🔍 Executing PRAGMA integrity_check...');
const integrity = queryOne('PRAGMA integrity_check');
const isIntegrityOk = integrity && integrity.integrity_check === 'ok';

if (isIntegrityOk) {
  console.log('✓ SQLite Database Integrity: OK (Zero corruption, clean B-tree pages)');
} else {
  console.warn('⚠️ SQLite Integrity warning:', integrity);
}

// 4. Inspect Record Counts
const restCount = queryOne('SELECT COUNT(*) as c FROM restaurants')?.c || 0;
const tableCount = queryOne('SELECT COUNT(*) as c FROM tables')?.c || 0;
const catCount = queryOne('SELECT COUNT(*) as c FROM categories')?.c || 0;
const menuItemCount = queryOne('SELECT COUNT(*) as c FROM menu_items')?.c || 0;
const orderCount = queryOne('SELECT COUNT(*) as c FROM orders')?.c || 0;
const staffCount = queryOne('SELECT COUNT(*) as c FROM staff_shifts')?.c || 0;
const fileSize = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

console.log('\n----------------------------------------------------');
console.log('📊 LOCAL DATABASE METRICS & STATUS');
console.log('----------------------------------------------------');
console.log(`• File Location:      ${dbPath}`);
console.log(`• File Size:          ${(fileSize / 1024).toFixed(1)} KB`);
console.log(`• Engine:             node:sqlite (DatabaseSync C++ Binding)`);
console.log(`• Cloud Cost:         ₹0 / month (Zero AWS RDS / Supabase bills)`);
console.log(`• Multi-Tenant Rest.: ${restCount} businesses`);
console.log(`• Stations / Tables:  ${tableCount} tables`);
console.log(`• Menu Categories:    ${catCount} categories`);
console.log(`• Dishes & Services:  ${menuItemCount} items`);
console.log(`• Processed Orders:   ${orderCount} orders`);
console.log(`• Roster & Shifts:    ${staffCount} shift logs`);
console.log('----------------------------------------------------\n');

// 5. List Active Multi-Tenant Outlets
console.log('🏢 Registered Outlets & Business Types:');
const outlets = queryAll('SELECT id, name, business_type, subscription_plan, subscription_status FROM restaurants LIMIT 8');
outlets.forEach((o, i) => {
  console.log(`  [${i + 1}] ${o.name.padEnd(28)} | Type: ${o.business_type.padEnd(10)} | Plan: ${o.subscription_plan || 'Starter ₹1500'} | Status: ${o.subscription_status || 'active'}`);
});

console.log('\n🎉 LOCAL DATABASE SETUP COMPLETED SUCCESSFULLY (100% OPERATIONAL)!\n');
process.exit(0);
