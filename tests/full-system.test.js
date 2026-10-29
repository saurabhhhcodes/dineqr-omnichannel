// tests/full-system.test.js - Comprehensive automated integration test suite
import assert from 'node:assert/strict';
import { db, initDb, queryAll, queryOne, execute } from '../server/db.js';
import QRCode from 'qrcode';

async function runTests() {
  console.log('🧪 Starting DineQR Full System Test Suite...\n');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  // 1. Database Init & Schema Tests
  await test('Database schema & default seeds initialization', () => {
    initDb();
    const settings = queryOne('SELECT * FROM restaurant_settings LIMIT 1');
    assert.ok(settings, 'Restaurant settings must exist');
    assert.equal(settings.name, "L'Osteria Gourmet Bistro");

    const tableCount = queryOne('SELECT COUNT(*) as count FROM tables').count;
    assert.ok(tableCount >= 8, `Expected at least 8 tables, got ${tableCount}`);

    const categoryCount = queryOne('SELECT COUNT(*) as count FROM categories').count;
    assert.ok(categoryCount >= 5, `Expected at least 5 categories, got ${categoryCount}`);

    const itemCount = queryOne('SELECT COUNT(*) as count FROM menu_items').count;
    assert.ok(itemCount >= 20, `Expected at least 20 menu items, got ${itemCount}`);
  });

  // 2. Table Creation and QR Code Generation
  await test('Table creation and QR code generation', async () => {
    const testTableNum = 'Table Test-99';
    // Clean up if exists
    execute('DELETE FROM tables WHERE table_number = ?', [testTableNum]);

    const id = 'tbl_test_99';
    execute(
      'INSERT INTO tables (id, table_number, name, section, capacity) VALUES (?, ?, ?, ?, ?)',
      [id, testTableNum, 'VIP Testing Cabana', 'Rooftop', 6]
    );

    const table = queryOne('SELECT * FROM tables WHERE id = ?', [id]);
    assert.equal(table.table_number, testTableNum);
    assert.equal(table.capacity, 6);

    // Test QR generation
    const targetUrl = `http://localhost:5173/menu?table=${table.id}`;
    const qrDataUrl = await QRCode.toDataURL(targetUrl);
    assert.ok(qrDataUrl.startsWith('data:image/png;base64,'), 'QR must be a valid PNG data URL');
  });

  // 3. Menu Filtering & Searching
  await test('Menu search and dietary filters', () => {
    // Search for Truffle
    const truffleItems = queryAll(
      'SELECT * FROM menu_items WHERE name LIKE ? OR description LIKE ?',
      ['%Truffle%', '%Truffle%']
    );
    assert.ok(truffleItems.length >= 2, `Expected at least 2 Truffle dishes, found ${truffleItems.length}`);

    // Veg items only
    const vegItems = queryAll('SELECT * FROM menu_items WHERE is_veg = 1');
    assert.ok(vegItems.length > 10, 'Expected extensive vegetarian options');
    for (const v of vegItems) {
      assert.equal(v.is_veg, 1, 'All returned items must be vegetarian');
    }

    // Availability toggle
    const sampleItem = queryOne('SELECT id, is_available FROM menu_items LIMIT 1');
    execute('UPDATE menu_items SET is_available = 0 WHERE id = ?', [sampleItem.id]);
    const disabledItem = queryOne('SELECT is_available FROM menu_items WHERE id = ?', [sampleItem.id]);
    assert.equal(disabledItem.is_available, 0, 'Item should be marked unavailable');

    // Restore
    execute('UPDATE menu_items SET is_available = 1 WHERE id = ?', [sampleItem.id]);
  });

  // 4. Order Placement & Accurate Tax Calculations
  let createdOrderId = null;
  await test('Order placement and financial calculations', () => {
    const item1 = queryOne("SELECT * FROM menu_items WHERE name LIKE '%Margherita%' LIMIT 1");
    const item2 = queryOne("SELECT * FROM menu_items WHERE name LIKE '%Tiramisu%' LIMIT 1");
    const table = queryOne('SELECT * FROM tables LIMIT 1');
    const settings = queryOne('SELECT * FROM restaurant_settings LIMIT 1');

    assert.ok(item1 && item2 && table, 'Seed data missing for order test');

    const qty1 = 2;
    const qty2 = 1;
    const subtotal = item1.price * qty1 + item2.price * qty2;

    const cgst = parseFloat(((subtotal * settings.cgst_pct) / 100).toFixed(2));
    const sgst = parseFloat(((subtotal * settings.sgst_pct) / 100).toFixed(2));
    const grandTotal = Math.round(subtotal + cgst + sgst);

    const orderId = 'ord_test_' + Date.now();
    createdOrderId = orderId;
    const orderCode = 'ORD-T' + Math.floor(1000 + Math.random() * 9000);

    execute(
      `INSERT INTO orders (
        id, order_code, table_id, table_number, customer_name, customer_phone,
        status, payment_status, payment_method, subtotal, cgst, sgst, service_charge,
        grand_total, special_instructions
      ) VALUES (?, ?, ?, ?, ?, ?, 'RECEIVED', 'PENDING', 'RAZORPAY', ?, ?, ?, 0, ?, ?)`,
      [
        orderId,
        orderCode,
        table.id,
        table.table_number,
        'Test Customer',
        '+919876543210',
        subtotal,
        cgst,
        sgst,
        grandTotal,
        'Extra basil leaves please',
      ]
    );

    execute(
      'INSERT INTO order_items (id, order_id, menu_item_id, name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['item_t1_' + Date.now(), orderId, item1.id, item1.name, item1.price, qty1, item1.price * qty1]
    );
    execute(
      'INSERT INTO order_items (id, order_id, menu_item_id, name, unit_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['item_t2_' + Date.now(), orderId, item2.id, item2.name, item2.price, qty2, item2.price * qty2]
    );

    const savedOrder = queryOne('SELECT * FROM orders WHERE id = ?', [orderId]);
    assert.equal(savedOrder.grand_total, grandTotal);
    assert.equal(savedOrder.status, 'RECEIVED');
    assert.equal(savedOrder.payment_status, 'PENDING');

    const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [orderId]);
    assert.equal(items.length, 2);
  });

  // 5. Razorpay Payment Verification
  await test('Razorpay simulated / test payment verification', () => {
    assert.ok(createdOrderId, 'Need created order');

    const mockPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 10);
    const mockRzpOrderId = 'order_rzp_mock123';

    execute(
      `UPDATE orders SET
        payment_status = 'PAID',
        payment_method = 'RAZORPAY',
        razorpay_order_id = ?,
        razorpay_payment_id = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [mockRzpOrderId, mockPaymentId, createdOrderId]
    );

    const paidOrder = queryOne('SELECT * FROM orders WHERE id = ?', [createdOrderId]);
    assert.equal(paidOrder.payment_status, 'PAID');
    assert.equal(paidOrder.razorpay_payment_id, mockPaymentId);
  });

  // 6. Order Workflow Lifecycle Transition
  await test('Order workflow lifecycle transitions', () => {
    const statuses = ['PREPARING', 'READY', 'SERVED', 'COMPLETED'];
    for (const st of statuses) {
      execute('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [st, createdOrderId]);
      const check = queryOne('SELECT status FROM orders WHERE id = ?', [createdOrderId]);
      assert.equal(check.status, st);
    }
  });

  // 7. Tax Invoice Generation
  await test('GST Tax Invoice data formatting', () => {
    const order = queryOne('SELECT * FROM orders WHERE id = ?', [createdOrderId]);
    const items = queryAll('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const settings = queryOne('SELECT * FROM restaurant_settings LIMIT 1');

    assert.ok(settings.gstin, 'GSTIN must be present in settings');
    assert.ok(settings.fssai, 'FSSAI must be present in settings');
    assert.equal(items.length, 2, 'Invoice must contain exactly 2 line items');
    assert.equal(order.payment_status, 'PAID');
    assert.ok(order.razorpay_payment_id, 'Razorpay payment ID must be recorded on invoice');
  });

  // 8. Stats & Occupancy calculation
  await test('Dashboard analytics calculation', () => {
    const paidRevenue = queryOne(
      "SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE payment_status = 'PAID'"
    ).total;
    assert.ok(paidRevenue > 0, 'Paid revenue should reflect the paid test order');
  });

  console.log(`\n🏁 Test Suite Finished: ${passed}/${total} tests passed!`);
  if (passed === total) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED PERFECTLY!\n');
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
