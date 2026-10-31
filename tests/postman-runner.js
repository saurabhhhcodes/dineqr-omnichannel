// tests/postman-runner.js - Automated test runner for Postman API Collection
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3001';

async function runPostmanTestSuite() {
  console.log(`\n📮 Running DineQR Postman Collection Automated Test Suite against ${BASE_URL}...\n`);

  let passed = 0;
  let total = 0;

  async function step(title, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✅ [${total}] ${title}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [${total}] ${title}`);
      console.error(`     Error: ${err.message}`);
    }
  }

  let testRestId = 'rest_losteria';
  let createdRestId = null;
  let testTableId = null;
  let createdDishId = null;
  let createdOrderId = null;
  let createdRzpOrderId = null;

  // 1. Health
  await step('GET /api/health -> Status 200 & Online', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'online');
  });

  // 2. Restaurants
  await step('GET /api/restaurants -> Returns active restaurants', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.restaurants.length >= 2, 'Expected at least 2 default restaurants');
    testRestId = data.restaurants[0].id;
  });

  await step('GET /api/restaurants/super-admin/overview -> Super admin metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants/super-admin/overview`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.stats.total_restaurants >= 2);
  });

  await step('POST /api/restaurants -> Provision new cafe tenant', async () => {
    const testSlug = 'chai-spot-' + Date.now().toString(36);
    const res = await fetch(`${BASE_URL}/api/restaurants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'The Chai Spot & Bakery',
        slug: testSlug,
        tagline: 'Artisanal Teas & Sourdough',
        phone: '+91 98000 11223',
        seed_starter_data: true,
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.restaurant.slug, testSlug);
    createdRestId = data.restaurant.id;
  });

  await step('PUT /api/restaurants/:id -> Configure direct Razorpay merchant keys', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants/${createdRestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_key_id: 'rzp_test_merchantDirect123',
        razorpay_key_secret: 'merchantSecret456',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.restaurant.has_custom_razorpay, true);
  });

  // 3. Tables & QRs
  await step('GET /api/tables -> List tables for restaurant', async () => {
    const res = await fetch(`${BASE_URL}/api/tables?restaurant_id=${testRestId}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.tables.length > 0);
    testTableId = data.tables[0].id;
  });

  await step('POST /api/tables -> Add new dining table', async () => {
    const res = await fetch(`${BASE_URL}/api/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: testRestId,
        table_number: 'Table Postman-' + Math.floor(100 + Math.random() * 900),
        section: 'Terrace Garden',
        capacity: 4,
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.table.menu_url.includes('/menu?restaurant='));
  });

  await step('GET /api/tables/:id/qr -> Generate scannable QR Code PNG', async () => {
    const res = await fetch(`${BASE_URL}/api/tables/${testTableId}/qr`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.qr_data_url.startsWith('data:image/png;base64,'));
  });

  // 4. Menu Editor
  await step('POST /api/menu/items -> Add new dish to existing QR menu', async () => {
    const res = await fetch(`${BASE_URL}/api/menu/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: testRestId,
        category_id: 'cat_starters',
        name: 'Crispy Truffle Croquettes (Postman Test)',
        description: 'Golden croquettes stuffed with fontina cheese and black truffle reduction.',
        price: 380,
        is_veg: 1,
        spice_level: 'Mild',
        prep_time_mins: 14,
        calories: 340,
        tags: "Chef's Special",
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    createdDishId = data.item.id;
    assert.equal(data.item.name, 'Crispy Truffle Croquettes (Postman Test)');
  });

  await step('PATCH /api/menu/items/:id/availability -> Toggle In Stock / Sold Out', async () => {
    const res = await fetch(`${BASE_URL}/api/menu/items/${createdDishId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_available: false }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.item.is_available, 0);
  });

  // 5. Orders & Placement
  await step('POST /api/orders -> Place table order with tax calculation', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: testRestId,
        table_id: testTableId,
        customer_name: 'Postman Automated Runner',
        customer_phone: '+91 98888 77777',
        special_instructions: 'Gluten sensitive, extra napkins',
        payment_method: 'RAZORPAY',
        items: [
          { id: 'item_6', quantity: 1, notes: 'Crispy base' },
          { id: 'item_15', quantity: 2, notes: 'Less ice' },
        ],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.order.subtotal, 970); // 490 + 2*240 = 970
    assert.equal(data.order.cgst, 24.25);
    assert.equal(data.order.sgst, 24.25);
    assert.equal(data.order.grand_total, 1019); // 970 + 24.25 + 24.25 = 1018.5 -> 1019
    createdOrderId = data.order.id;
  });

  // 6. Razorpay Payment
  await step('POST /api/payment/razorpay/create-order -> Create Razorpay order', async () => {
    const res = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: createdOrderId }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.razorpay_order.amount, 101900); // 1019 in paise
    createdRzpOrderId = data.razorpay_order.id;
  });

  await step('POST /api/payment/razorpay/verify -> Verify signature & update to PAID', async () => {
    const res = await fetch(`${BASE_URL}/api/payment/razorpay/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId,
        razorpay_order_id: createdRzpOrderId,
        razorpay_payment_id: 'pay_pm_test_' + Date.now().toString(36),
        razorpay_signature: 'sig_postman_valid',
        is_mock: true,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.order.payment_status, 'PAID');
  });

  // 7. Kitchen Workflow
  await step('PATCH /api/orders/:id/status -> Transition RECEIVED -> PREPARING', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PREPARING' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.order.status, 'PREPARING');
  });

  await step('PATCH /api/orders/:id/status -> Transition PREPARING -> READY', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'READY' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.order.status, 'READY');
  });

  await step('PATCH /api/orders/:id/status -> Transition READY -> COMPLETED', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.order.status, 'COMPLETED');
  });

  // 8. Invoice
  await step('GET /api/invoice/:orderId -> Official GST Tax Invoice breakdown', async () => {
    const res = await fetch(`${BASE_URL}/api/invoice/${createdOrderId}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.invoice.invoice_number.startsWith('INV-'));
    assert.equal(data.invoice.order.payment_status, 'PAID');
    assert.equal(data.invoice.breakdown.grand_total, 1019);
  });

  // 9. Spreadsheet Export
  await step('GET /api/orders/export -> Download Excel-ready CSV report', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/export?restaurant_id=${testRestId}`);
    assert.equal(res.status, 200);
    const contentType = res.headers.get('content-type') || '';
    assert.ok(contentType.includes('text/csv'));
    const text = await res.text();
    assert.ok(text.includes('Order ID'));
    assert.ok(text.includes('Subtotal (INR)'));
    assert.ok(text.includes('Postman Automated Runner'));
  });

  // 10. Multi-Platform Downloads Catalog
  await step('GET /api/downloads -> Catalog of 4 native packages', async () => {
    const res = await fetch(`${BASE_URL}/api/downloads`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.releases.length, 4);
    const platforms = data.releases.map((r) => r.platform);
    assert.ok(platforms.includes('windows'));
    assert.ok(platforms.includes('android'));
    assert.ok(platforms.includes('macos'));
    assert.ok(platforms.includes('linux'));
  });

  // 11. Windows .exe Binary
  await step('GET /api/downloads/DineQR-Terminal-Setup.exe -> Windows executable stream', async () => {
    const res = await fetch(`${BASE_URL}/api/downloads/DineQR-Terminal-Setup.exe`);
    assert.equal(res.status, 200);
    const disp = res.headers.get('content-disposition') || '';
    assert.ok(disp.includes('DineQR-Terminal-Setup.exe'));
    const buf = await res.arrayBuffer();
    assert.ok(buf.byteLength > 1000, 'Expected Windows executable size > 1KB');
  });

  // 12. Android .apk Package
  await step('GET /api/downloads/DineQR-POS-Terminal.apk -> Android APK package stream', async () => {
    const res = await fetch(`${BASE_URL}/api/downloads/DineQR-POS-Terminal.apk`);
    assert.equal(res.status, 200);
    const disp = res.headers.get('content-disposition') || '';
    assert.ok(disp.includes('DineQR-POS-Terminal.apk'));
    const buf = await res.arrayBuffer();
    assert.ok(buf.byteLength > 1000, 'Expected Android APK size > 1KB');
  });

  // 13. macOS .dmg Disk Image
  await step('GET /api/downloads/DineQR-macOS-Universal.dmg -> macOS DMG image stream', async () => {
    const res = await fetch(`${BASE_URL}/api/downloads/DineQR-macOS-Universal.dmg`);
    assert.equal(res.status, 200);
    const disp = res.headers.get('content-disposition') || '';
    assert.ok(disp.includes('DineQR-macOS-Universal.dmg'));
    const buf = await res.arrayBuffer();
    assert.ok(buf.byteLength > 10000, 'Expected macOS DMG size > 10KB');
  });

  // 14. Linux .deb Package
  await step('GET /api/downloads/dineqr-terminal_1.0.0_amd64.deb -> Debian package stream', async () => {
    const res = await fetch(`${BASE_URL}/api/downloads/dineqr-terminal_1.0.0_amd64.deb`);
    assert.equal(res.status, 200);
    const disp = res.headers.get('content-disposition') || '';
    assert.ok(disp.includes('dineqr-terminal_1.0.0_amd64.deb'));
  });

  // 15. Local SQLite Engine Setup
  await step('POST /api/erp/local-sqlite/setup -> Verify embedded SQLite on-premise engine', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/local-sqlite/setup`, { method: 'POST' });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.configured, true);
    assert.equal(data.zero_cloud_cost_active, true);
    assert.ok(data.database_path.includes('restaurant.db'));
  });

  // 16. Local Storage Status & Online Remote Access
  await step('GET /api/erp/storage/status -> Disk metrics & online reverse tunnel endpoint', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/storage/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.online_accessible, true);
    assert.ok(data.counts.orders >= 1);
  });

  // 17. Storage Raw Tables Browser
  await step('GET /api/erp/storage/browse?table=orders -> Inspect disk records', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/storage/browse?table=orders`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.table, 'orders');
    assert.ok(Array.isArray(data.records));
  });

  // 18. Visual Floor Plan Layout
  await step('GET & PUT /api/erp/floor-plan -> Visual table coordinates & active tabs', async () => {
    const getRes = await fetch(`${BASE_URL}/api/erp/floor-plan?restaurant_id=rest_losteria`);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.ok(Array.isArray(getData.floor_tables));
    assert.ok(getData.floor_tables.length > 0);

    const firstTable = getData.floor_tables[0];
    const putRes = await fetch(`${BASE_URL}/api/erp/floor-plan`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        updates: [{ id: firstTable.id, pos_x: 60, pos_y: 120, shape: 'square' }],
      }),
    });
    assert.equal(putRes.status, 200);
    const putData = await putRes.json();
    assert.equal(putData.success, true);
  });

  // 19. Table Bookings & Reservations
  let testResId = null;
  await step('POST /api/erp/reservations -> Book table & guest details', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        guest_name: 'Ananya Sharma',
        guest_phone: '+91 99887 76655',
        party_size: 4,
        reservation_date: '2026-11-05',
        reservation_time: '20:00',
        special_requests: 'Window table',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.reservation.guest_name, 'Ananya Sharma');
    testResId = data.reservation.id;
  });

  await step('PATCH /api/erp/reservations/:id/status -> Transition CONFIRMED -> SEATED', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/reservations/${testResId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SEATED' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.reservation.status, 'SEATED');
  });

  // 20. Staff Planning & Shift Conflict Check
  await step('POST /api/erp/staff-shifts -> Assign shift & detect roster conflict', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/staff-shifts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        employee_name: 'Chef Marco',
        role: 'Head Chef',
        shift_date: '2026-11-01',
        start_time: '10:00',
        end_time: '18:00',
        notes: 'Lunch Brigade Lead',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.shift.employee_name, 'Chef Marco');
  });

  // 21. Real-Time Inventory & Replenishment
  let testItemId = null;
  await step('GET /api/erp/inventory -> Stock levels and low-stock valuation metrics', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/inventory?restaurant_id=rest_losteria`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.items.length > 0);
    assert.ok(data.metrics.total_inventory_value > 0);
    testItemId = data.items[0].id;
  });

  await step('PATCH /api/erp/inventory/:id/stock -> Quick stock adjustment (+10 units)', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/inventory/${testItemId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment: 10 }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.item.current_stock > 0);
  });

  // 22. Purchases & 3-Way Matching
  let testPoId = null;
  await step('POST /api/erp/purchases -> Issue vendor RfQ with GST', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        vendor_name: 'Metro Wholesale Supply',
        vendor_email: 'orders@metro.com',
        items: [{ item: 'Olive Oil Extra Virgin', qty: 10, price: 650 }],
        payment_terms: 'Net 15 Days',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.purchase_order.rfq_number.startsWith('RFQ-'));
    testPoId = data.purchase_order.id;
  });

  await step('PATCH /api/erp/purchases/:id/status -> 3-Way Match: RFQ_SENT -> RECEIVED -> BILL_VERIFIED', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/purchases/${testPoId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'BILL_VERIFIED' }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.purchase_order.status, 'BILL_VERIFIED');
  });

  // 23. Split Bill Calculator
  await step('POST /api/erp/split-bill -> Equal bill splitting across guests', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/split-bill`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId,
        split_type: 'EQUAL',
        shares_count: 4,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.shares, 4);
    assert.ok(data.amount_per_share > 0);
  });

  // 24. Razorpay with Preferred Payment Method
  await step('POST /api/payment/razorpay/create-order -> Passes Google Pay/UPI in Razorpay notes', async () => {
    const res = await fetch(`${BASE_URL}/api/payment/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: createdOrderId,
        payment_method: 'Google Pay',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.preferred_payment_method, 'Google Pay');
    assert.equal(data.razorpay_order.notes.preferred_payment_method, 'Google Pay');
  });

  // 25. Merchant User ID Authentication
  await step('POST /api/restaurants/auth/login -> Authenticate via merchant_user_id & PIN', async () => {
    const res = await fetch(`${BASE_URL}/api/restaurants/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'rest_losteria',
        pin: '1234',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.restaurant.id, 'rest_losteria');
  });

  // 26. Counter Order Placement & Daily Rotating Token Generation
  await step('POST /api/orders -> Places counter order and assigns daily token number', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        table_id: 'counter',
        is_counter_order: 1,
        customer_name: 'Dr. Vikram Malhotra',
        customer_phone: '9876543210',
        payment_method: 'Razorpay (Google Pay)',
        items: [{ id: 'item_6', quantity: 2, notes: 'Crispy crust' }],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order.token_number > 0, 'Token number must be > 0');
    assert.ok(data.order.table_number.includes('Counter · Token #'), 'Must format table number as Counter Token');
    assert.equal(data.order.customer_name, 'Dr. Vikram Malhotra');
  });

  // 27. ESC/POS Hardware Billing Machine Dispatcher
  await step('POST /api/invoice/test/print -> Dispatches ESC/POS byte buffers to POS printer', async () => {
    const res = await fetch(`${BASE_URL}/api/invoice/test/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target_ip: '127.0.0.1',
        target_port: 9100,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.escpos_bytes_count > 100, 'Must generate valid binary ESC/POS buffer');
    assert.equal(data.order_code, 'TEST-80MM');
  });

  // 28. Multi-Platform Distributables Catalog
  await step('GET /api/downloads -> Returns catalog of EXE, APK, DMG, and DEB binaries', async () => {
    const res = await fetch(`${BASE_URL}/api/downloads`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.releases.length >= 4, 'Must include at least 4 operating system packages');
    const platforms = data.releases.map((r) => r.platform);
    assert.ok(platforms.includes('windows'));
    assert.ok(platforms.includes('android'));
    assert.ok(platforms.includes('macos'));
    assert.ok(platforms.includes('linux'));
  });

  console.log(`\n🏁 Postman Test Suite Summary: ${passed}/${total} assertions passed!`);
  if (passed === total) {
    console.log('🎉 ALL POSTMAN COLLECTION ENDPOINTS VERIFIED AND PASSING 100%!\n');
  } else {
    process.exit(1);
  }
}

runPostmanTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
