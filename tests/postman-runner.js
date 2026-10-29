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
