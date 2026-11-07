// server/localFileSystem.js - Multi-Folder Local System Storage (DineQR-Data)
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base directory for all user on-premise local files: DineQR-Data
export const DINEQR_DATA_ROOT = process.env.DINEQR_DATA_PATH || path.resolve(__dirname, '../DineQR-Data');

// Distinct subfolders as requested by the user
export const FOLDERS = {
  root: DINEQR_DATA_ROOT,
  database: path.join(DINEQR_DATA_ROOT, 'database'),
  bills: path.join(DINEQR_DATA_ROOT, 'bills'),
  inventory: path.join(DINEQR_DATA_ROOT, 'inventory'),
  staff: path.join(DINEQR_DATA_ROOT, 'staff'),
  exports: path.join(DINEQR_DATA_ROOT, 'exports'),
};

// Ensure all distinct folders exist on startup
export function initLocalFileSystem() {
  Object.values(FOLDERS).forEach((dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Write a README explaining the local data structure to the restaurant owner
  const readmePath = path.join(DINEQR_DATA_ROOT, 'README.txt');
  if (!fs.existsSync(readmePath)) {
    const readmeContent = `=====================================================
DineQR Enterprise - Local On-Premise Data Directory
=====================================================
This folder stores your restaurant's local data directly on your computer:

1. database/  -> Contains restaurant.db (SQLite database storing all tables, items, orders)
2. bills/     -> Contains all generated customer bills, GST invoices, and thermal receipts (.html & .json)
3. inventory/ -> Contains your inventory audits, stock logs, and low-stock alerts
4. staff/     -> Contains staff duty rosters, arrival times, and departure clock-out logs
5. exports/   -> Contains daily sales reports and financial summaries

Your data is 100% owned by you and never locked in a proprietary cloud.
=====================================================`;
    fs.writeFileSync(readmePath, readmeContent, 'utf8');
  }

  return FOLDERS;
}

// Save a generated customer bill / invoice into DineQR-Data/bills/
export function saveBillReceipt(order, items = [], restaurant = {}) {
  try {
    initLocalFileSystem();
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filenameBase = `BILL_${order.order_code || order.id}_${dateStr}`;
    const jsonPath = path.join(FOLDERS.bills, `${filenameBase}.json`);
    const htmlPath = path.join(FOLDERS.bills, `${filenameBase}.html`);

    const billPayload = {
      order_id: order.id,
      order_code: order.order_code,
      restaurant_id: order.restaurant_id || restaurant.id,
      restaurant_name: restaurant.name || "L'Osteria Gourmet Bistro",
      gstin: restaurant.gstin || '29ABCDE1234F1Z5',
      fssai: restaurant.fssai || '11223344556677',
      address: restaurant.address || 'Bengaluru, India',
      table_number: order.table_number || 'Table 01',
      customer_name: order.customer_name || 'Walk-in Guest',
      payment_method: order.payment_method || 'CASH_AT_COUNTER',
      payment_status: order.payment_status || 'COMPLETED',
      subtotal: order.subtotal,
      cgst: order.cgst,
      sgst: order.sgst,
      grand_total: order.grand_total,
      created_at: order.created_at || new Date().toISOString(),
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      })),
    };

    // Save JSON data
    fs.writeFileSync(jsonPath, JSON.stringify(billPayload, null, 2), 'utf8');

    // Generate Clean Printable 80mm Thermal Receipt HTML
    const htmlReceipt = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${order.order_code}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Courier New", monospace; width: 300px; margin: 0 auto; padding: 16px; color: #111; font-size: 13px; line-height: 1.4; }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
    .border-top { border-top: 1px dashed #444; margin-top: 8px; padding-top: 8px; }
    .border-bottom { border-bottom: 1px dashed #444; margin-bottom: 8px; padding-bottom: 8px; }
    .row { display: flex; justify-content: space-between; margin-bottom: 4px; }
    .large { font-size: 16px; }
  </style>
</head>
<body>
  <div class="text-center">
    <div class="bold large">${restaurant.name || 'DineQR Restaurant'}</div>
    <div>${restaurant.address || 'Bengaluru, India'}</div>
    <div>GSTIN: ${restaurant.gstin || 'N/A'} · FSSAI: ${restaurant.fssai || 'N/A'}</div>
  </div>

  <div class="border-top border-bottom">
    <div class="row"><span>Bill No: ${order.order_code}</span><span>${new Date().toLocaleDateString('en-IN')}</span></div>
    <div class="row"><span>Table: ${order.table_number}</span><span>Pay: ${order.payment_method}</span></div>
  </div>

  <div class="bold row border-bottom">
    <span>Item</span><span>Qty x Rate</span><span>Amt</span>
  </div>

  ${items
    .map(
      (it) => `
  <div class="row">
    <span>${it.name}</span>
    <span>${it.quantity} x ₹${it.unit_price}</span>
    <span>₹${it.subtotal}</span>
  </div>`
    )
    .join('')}

  <div class="border-top">
    <div class="row"><span>Subtotal:</span><span>₹${order.subtotal}</span></div>
    <div class="row"><span>CGST (2.5%):</span><span>₹${order.cgst}</span></div>
    <div class="row"><span>SGST (2.5%):</span><span>₹${order.sgst}</span></div>
    <div class="row bold large" style="margin-top: 6px;"><span>Grand Total:</span><span>₹${order.grand_total}</span></div>
  </div>

  <div class="text-center border-top" style="margin-top: 14px;">
    <div>Thank you for dining with us!</div>
    <div style="font-size: 10px; color: #666; margin-top: 4px;">Saved locally in DineQR-Data/bills/</div>
  </div>
</body>
</html>`;

    fs.writeFileSync(htmlPath, htmlReceipt, 'utf8');

    return { jsonPath, htmlPath, filename: filenameBase };
  } catch (err) {
    console.error('Failed to save bill receipt:', err);
    return null;
  }
}

// Save an inventory audit snapshot into DineQR-Data/inventory/
export function saveInventorySnapshot(items = []) {
  try {
    initLocalFileSystem();
    const dateStr = new Date().toISOString().split('T')[0];
    const filePath = path.join(FOLDERS.inventory, `inventory_snapshot_${dateStr}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ timestamp: new Date().toISOString(), items }, null, 2), 'utf8');
    return filePath;
  } catch (err) {
    console.error('Failed to save inventory snapshot:', err);
    return null;
  }
}

// Save staff attendance log into DineQR-Data/staff/
export function saveStaffAttendanceLog(logs = []) {
  try {
    initLocalFileSystem();
    const dateStr = new Date().toISOString().split('T')[0];
    const filePath = path.join(FOLDERS.staff, `attendance_log_${dateStr}.json`);
    fs.writeFileSync(filePath, JSON.stringify({ timestamp: new Date().toISOString(), logs }, null, 2), 'utf8');
    return filePath;
  } catch (err) {
    console.error('Failed to save staff attendance log:', err);
    return null;
  }
}

// Get directory overview and file listings for admin inspection
export function getFolderOverview() {
  initLocalFileSystem();
  const overview = {};

  Object.entries(FOLDERS).forEach(([name, dirPath]) => {
    try {
      const files = fs.readdirSync(dirPath);
      const fileStats = files
        .filter((f) => !f.startsWith('.'))
        .map((f) => {
          const fullPath = path.join(dirPath, f);
          const st = fs.statSync(fullPath);
          return {
            filename: f,
            path: fullPath,
            size_bytes: st.size,
            size_kb: (st.size / 1024).toFixed(1),
            modified_at: st.mtime.toISOString(),
            is_directory: st.isDirectory(),
          };
        })
        .sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));

      overview[name] = {
        path: dirPath,
        file_count: fileStats.length,
        files: fileStats.slice(0, 50),
      };
    } catch {
      overview[name] = { path: dirPath, file_count: 0, files: [] };
    }
  });

  return overview;
}
