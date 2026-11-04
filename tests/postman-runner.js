// tests/postman-runner.js - Automated test runner for Postman API Collection
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3005';

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

  // 29. Food Delivery Aggregator Status & Webhook URLs
  await step('GET /api/integrations/status -> Returns Zomato, Swiggy, Magicpin & ONDC status', async () => {
    const res = await fetch(`${BASE_URL}/api/integrations/status?restaurant_id=rest_losteria`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.integrations.zomato.webhook_url.includes('/api/integrations/zomato/webhook'));
    assert.ok(data.integrations.swiggy.webhook_url.includes('/api/integrations/swiggy/webhook'));
    assert.ok(data.integrations.ondc.webhook_url.includes('/api/integrations/ondc/webhook'));
  });

  // 30. Partner Credential Validation
  await step('POST /api/integrations/test-partner -> Validates Zomato ResId and Swiggy Outlet format', async () => {
    const resZom = await fetch(`${BASE_URL}/api/integrations/test-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'zomato', partner_id: '18923412' }),
    });
    assert.equal(resZom.status, 200);
    const dataZom = await resZom.json();
    assert.equal(dataZom.valid, true);

    const resSwg = await fetch(`${BASE_URL}/api/integrations/test-partner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'swiggy', partner_id: 'SWG-BLR-0419' }),
    });
    assert.equal(resSwg.status, 200);
    const dataSwg = await resSwg.json();
    assert.equal(dataSwg.valid, true);
  });

  // 31. Incoming Zomato Webhook Ingestion
  await step('POST /api/integrations/zomato/webhook -> Ingests Zomato delivery order directly to KDS', async () => {
    const res = await fetch(`${BASE_URL}/api/integrations/zomato/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        order_id: 'ZOM998877',
        customer_name: 'Ananya Roy',
        customer_phone: '9845012345',
        delivery_rider: 'Zomato Rider (Suresh K.)',
        rider_phone: '9845099999',
        total_amount: 580,
        items: [
          { name: 'Butter Chicken Masala', unit_price: 380, quantity: 1, notes: 'Medium spice' },
          { name: 'Garlic Butter Naan', unit_price: 100, quantity: 2 },
        ],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order_code.startsWith('ZOM-'));
  });

  // 32. Incoming Swiggy Webhook Ingestion
  await step('POST /api/integrations/swiggy/webhook -> Ingests Swiggy delivery order directly to KDS', async () => {
    const res = await fetch(`${BASE_URL}/api/integrations/swiggy/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        order_id: 'SWG445566',
        customer_name: 'Karan Mehra',
        customer_phone: '9845077777',
        delivery_rider: 'Swiggy Executive (Manoj D.)',
        rider_phone: '9845088888',
        total_amount: 640,
        items: [
          { name: 'Artisan Wood-Fired Margherita Pizza', unit_price: 450, quantity: 1 },
          { name: 'Iced Vanilla Cold Brew', unit_price: 190, quantity: 1 },
        ],
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.order_code.startsWith('SWG-'));
  });

  // 33. Live Delivery Order Simulator
  await step('POST /api/integrations/simulate -> Dispatches simulated aggregator order to KDS', async () => {
    const res = await fetch(`${BASE_URL}/api/integrations/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'zomato', restaurant_id: 'rest_losteria' }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.order.order_source, 'ZOMATO');
  });

  // 34. Add Floor Plan Table
  let createdFpTableId = null;
  await step('POST /api/erp/floor-plan/table -> Add new table to floor plan', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/floor-plan/table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        table_number: 'T-PM-99',
        section: 'VIP Lounge',
        capacity: 6,
        shape: 'rect',
        pos_x: 250,
        pos_y: 180,
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.table.table_number, 'T-PM-99');
    createdFpTableId = data.table.id;
  });

  // 35. Edit Floor Plan Table
  await step('PUT /api/erp/floor-plan/table/:id -> Edit table capacity & shape', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/floor-plan/table/${createdFpTableId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_number: 'T-PM-Updated',
        capacity: 8,
        shape: 'circle',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.table.table_number, 'T-PM-Updated');
    assert.equal(data.table.capacity, 8);
  });

  // 36. Delete Floor Plan Table
  await step('DELETE /api/erp/floor-plan/table/:id -> Remove table from floor plan', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/floor-plan/table/${createdFpTableId}`, {
      method: 'DELETE',
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
  });

  // 37. Staff Attendance Clock-In & Duty Assignment
  let createdAttId = null;
  await step('POST /api/erp/staff-attendance/clock-in -> Record staff arrival and duty station', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/staff-attendance/clock-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        employee_name: 'Pooja Nair',
        role: 'Waiter / Server',
        current_activity: 'Table Service (Section B)',
      }),
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.attendance.employee_name, 'Pooja Nair');
    assert.equal(data.attendance.status, 'ON_DUTY');
    createdAttId = data.attendance.id;
  });

  // 38. Staff Attendance Activity Update
  await step('PATCH /api/erp/staff-attendance/:id/activity -> Update staff activity to POS Cashier', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/staff-attendance/${createdAttId}/activity`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        current_activity: 'POS Billing Counter & Cash Register',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.attendance.current_activity, 'POS Billing Counter & Cash Register');
  });

  // 39. Staff Attendance Clock-Out
  await step('POST /api/erp/staff-attendance/clock-out -> Clock out staff with timestamp', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/staff-attendance/clock-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdAttId,
        notes: 'Shift completed successfully',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.attendance.status, 'CLOCKED_OUT');
  });

  // 40. Monthly Subscription Status
  await step('GET /api/subscription/status -> Check monthly ₹1,000 / ₹1,500 plans', async () => {
    const res = await fetch(`${BASE_URL}/api/subscription/status?restaurant_id=rest_losteria`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.available_plans.length >= 2);
  });

  // 41. Monthly Subscription Order Creation
  let subOrderId = null;
  await step('POST /api/subscription/create-order -> Create monthly subscription checkout order', async () => {
    const res = await fetch(`${BASE_URL}/api/subscription/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        plan_id: 'starter_1000',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.amount, 1000);
    subOrderId = data.order_id;
  });

  // 42. Monthly Subscription Verification
  await step('POST /api/subscription/verify -> Verify subscription payment & 30-day renewal', async () => {
    const res = await fetch(`${BASE_URL}/api/subscription/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        restaurant_id: 'rest_losteria',
        plan_id: 'starter_1000',
        razorpay_order_id: subOrderId,
        razorpay_payment_id: 'pay_pm_sub_valid_123',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.status, 'active');
  });

  // 43. Download Permanent Local SQLite Backup
  await step('GET /api/erp/local-sqlite/export -> Export permanent binary snapshot of restaurant.db', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/local-sqlite/export`);
    assert.equal(res.status, 200);
    const disp = res.headers.get('content-disposition') || '';
    assert.ok(disp.includes('restaurant-local-store.db'));
    const buf = await res.arrayBuffer();
    assert.ok(buf.byteLength > 1000, 'Expected valid SQLite database binary file');
  });

  // 44. Hyperlocal On-Demand Services Marketplace (Apronto Competitor)
  await step('GET /api/marketplace/pros -> List nearby pros (Chefs, Carpenters, Electricians, Materials)', async () => {
    const res = await fetch(`${BASE_URL}/api/marketplace/pros`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.pros));
    assert.ok(data.pros.length >= 4);
  });

  // 45. Mobile Pro Onboarding
  await step('POST /api/marketplace/onboard -> Instant 60s pro self-registration', async () => {
    const res = await fetch(`${BASE_URL}/api/marketplace/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_name: 'Vikram Singh Carpentry',
        provider_phone: '+91 99112 33445',
        category: 'carpenter',
        headline: 'Door fittings, plywood partition & modular wardrobes',
        hourly_rate: 350,
        fixed_price: 299,
        skills: ['Door Locks', 'Plywood Cutting', 'Wardrobe Hinges'],
        location_area: 'Indiranagar, Bengaluru',
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.pro.id.startsWith('srv_carpenter_'));
  });

  // 46. Service Booking
  let testBookingId = null;
  await step('POST /api/marketplace/book -> Book verified pro with address & slot', async () => {
    const res = await fetch(`${BASE_URL}/api/marketplace/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'srv_chef_1',
        customer_name: 'Priya Narayanan',
        customer_phone: '+91 98860 12345',
        customer_address: 'Flat 402, Sunshine Heights, Indiranagar',
        scheduled_at: 'Tomorrow 1:00 PM',
        instructions: 'Vegetarian Awadhi lunch for 5 guests',
        total_amount: 1499,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.booking.booking_code.startsWith('SRV-'));
    testBookingId = data.booking.id;
  });

  // 47. Porter Logistics Fare Estimation
  await step('POST /api/porter/estimate -> Calculate Porter fare for Tata Ace / Bike', async () => {
    const res = await fetch(`${BASE_URL}/api/porter/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pickup_address: 'Gupta Cement Depot, Bellandur',
        drop_address: 'Plot 42, Galleria Boulevard, Indiranagar',
        vehicle_type: 'tata_ace',
        cargo_weight_kg: 500,
        distance_km: 5.2,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.pricing.total_estimated_fare > 300);
    assert.equal(data.vehicle.type, 'tata_ace');
  });

  // 48. Porter Logistics Dispatch
  let testTrackingCode = null;
  await step('POST /api/porter/dispatch -> Dispatch Porter driver with live tracking', async () => {
    const res = await fetch(`${BASE_URL}/api/porter/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_id: testBookingId,
        item_description: '10 Bags UltraTech Cement & Sand',
        cargo_weight_kg: 500,
        vehicle_type: 'tata_ace',
        pickup_address: 'Gupta Building Materials Depot, Bellandur',
        drop_address: 'Indiranagar 100ft Road, Bengaluru',
        distance_km: 4.8,
      }),
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.shipment.tracking_code.startsWith('PRTR-BLR-'));
    testTrackingCode = data.shipment.tracking_code;
  });

  // 49. Porter Live Tracking
  await step('GET /api/porter/track/:trackingCode -> Fetch live telemetry & driver info', async () => {
    const res = await fetch(`${BASE_URL}/api/porter/track/${testTrackingCode}`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.shipment.tracking_code, testTrackingCode);
    assert.ok(data.live_telemetry.eta_minutes > 0);
  });

  // 50. Cryptographic Local SQLite Webhook Verification
  await step('POST /api/erp/webhook/sync-verify -> Cryptographic SQLite sha256 checksum & integrity', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/webhook/sync-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.verification_status, 'VERIFIED_HEALTHY');
    assert.ok(data.database.sha256_checksum.length === 64);
    assert.ok(data.total_records > 0);
  });

  // 51. Webhook Status Endpoint
  await step('GET /api/erp/webhook/status -> Return sync state and webhook health', async () => {
    const res = await fetch(`${BASE_URL}/api/erp/webhook/status`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.local_storage_active, true);
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
