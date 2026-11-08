// tests/test_onboarding_payment.js
// Automated verification for Merchant Onboarding, Subscription Tier Billing, & Payment Flows

import http from 'node:http';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3005';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('====================================================');
  console.log('💳 DineQR Merchant Onboarding & Payment Test Suite');
  console.log(`🌐 Base URL: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Check Subscription Status & Tier Definitions
    console.log('▶ [Step 1] Checking subscription status & pricing tiers...');
    const statusRes = await request('GET', '/api/subscription/status?restaurant_id=rest_losteria');
    assert(statusRes.status === 200, 'Subscription status returns 200 OK');
    assert(statusRes.body.success === true, 'Response body success is true');
    const plans = statusRes.body.available_plans || [];
    assert(plans.length >= 3, `Available plans list count is ${plans.length}`);

    const starterPlan = plans.find((p) => p.id === 'starter_1500');
    assert(starterPlan && starterPlan.amount === 1500, 'Starter Local POS plan is ₹1,500');

    const aggregatorPlan = plans.find((p) => p.id === 'aggregator_3500');
    assert(aggregatorPlan && aggregatorPlan.amount === 3500, 'Aggregator Pro (Zomato/Swiggy) plan is ₹3,500');

    const cloudPlan = plans.find((p) => p.id === 'cloud_5000');
    assert(cloudPlan && cloudPlan.amount === 5000, 'Cloud Sync Hub (2GB Storage) plan is ₹5,000');

    // 2. Test Order Creation for ₹1,500 Starter
    console.log('\n▶ [Step 2] Testing Razorpay order creation for Starter POS (₹1,500)...');
    const order1500 = await request('POST', '/api/subscription/create-order', {
      restaurant_id: 'rest_losteria',
      plan_id: 'starter_1500',
    });
    assert(order1500.status === 200, 'Starter order creation returns 200 OK');
    assert(order1500.body.amount === 1500, 'Starter order amount is 1500');
    assert(order1500.body.amount_paise === 150000, 'Starter order amount in paise is 150000');
    assert(typeof order1500.body.order_id === 'string' && order1500.body.order_id.length > 0, 'Valid order_id received');

    // 3. Test Order Creation for ₹3,500 Aggregator Pro
    console.log('\n▶ [Step 3] Testing Razorpay order creation for Aggregator Pro (₹3,500)...');
    const order3500 = await request('POST', '/api/subscription/create-order', {
      restaurant_id: 'rest_losteria',
      plan_id: 'aggregator_3500',
    });
    assert(order3500.status === 200, 'Aggregator Pro order creation returns 200 OK');
    assert(order3500.body.amount === 3500, 'Aggregator Pro order amount is 3500');
    assert(order3500.body.amount_paise === 350000, 'Aggregator Pro order amount in paise is 350000');

    // 4. Test Order Creation for ₹5,000 Cloud Sync Hub
    console.log('\n▶ [Step 4] Testing Razorpay order creation for Cloud Sync Hub (₹5,000)...');
    const order5000 = await request('POST', '/api/subscription/create-order', {
      restaurant_id: 'rest_losteria',
      plan_id: 'cloud_5000',
    });
    assert(order5000.status === 200, 'Cloud Hub order creation returns 200 OK');
    assert(order5000.body.amount === 5000, 'Cloud Hub order amount is 5000');
    assert(order5000.body.amount_paise === 500000, 'Cloud Hub order amount in paise is 500000');

    // 5. Test Payment Verification Endpoint
    console.log('\n▶ [Step 5] Testing Payment Verification & 30-day term extension...');
    const verifyRes = await request('POST', '/api/subscription/verify', {
      restaurant_id: 'rest_losteria',
      plan_id: 'aggregator_3500',
      razorpay_order_id: 'order_sub_mock_test_123',
      razorpay_payment_id: 'pay_test_confirmed_999',
      razorpay_signature: 'simulated_sig',
    });
    assert(verifyRes.status === 200, 'Subscription verify returns 200 OK');
    assert(verifyRes.body.success === true, 'Verification success is true');
    assert(verifyRes.body.status === 'active', 'Subscription status marked active');
    assert(typeof verifyRes.body.expires_at === 'string', 'Expiry timestamp returned');

    // 6. Test End-to-End Self-Serve Merchant Onboarding with Payment Record
    console.log('\n▶ [Step 6] Testing Client Onboarding flow with Payment...');
    const testSlug = `cafe-pilot-${Date.now().toString(36)}`;
    const onboardRes = await request('POST', '/api/restaurants/onboard', {
      name: `Grand Royal Cafe ${Date.now().toString().slice(-4)}`,
      owner_name: 'Rajesh Sharma',
      slug: testSlug,
      business_type: 'restaurant',
      station_type: 'table',
      station_count: 6,
      phone: '+91 98765 43210',
      email: `${testSlug}@example.com`,
      address: 'Shop 12, Express Galleria, MG Road',
      gstin: '07AAAAA0000A1Z5',
      subscription_plan: 'Aggregator Pro (Zomato + Swiggy Direct) - ₹3,500/mo',
      admin_pin: '4321',
      admin_password: 'cafePassword123',
    });

    assert(onboardRes.status === 200 || onboardRes.status === 201, 'Merchant Onboarding returns 200/201 OK');
    assert(onboardRes.body.success === true, 'Onboarding response success is true');
    assert(typeof onboardRes.body.restaurant?.id === 'string', 'Restaurant ID generated');
    assert(onboardRes.body.restaurant?.slug === testSlug, 'Restaurant slug matched');
    assert(typeof onboardRes.body.restaurant?.merchant_user_id === 'string', 'Merchant User ID created');
    assert(typeof onboardRes.body.first_station === 'string', 'First station generated');

    // 7. Verify the onboarded merchant is accessible via public menu & admin endpoints
    console.log('\n▶ [Step 7] Querying public menu & tables for newly onboarded business...');
    const tablesRes = await request('GET', `/api/tables?restaurant_id=${onboardRes.body.restaurant.id}`);
    assert(tablesRes.status === 200, 'Tables endpoint returns 200 OK for new merchant');
    assert(tablesRes.body.success === true, 'Tables response success is true');
    assert(Array.isArray(tablesRes.body.tables) && tablesRes.body.tables.length >= 6, '6 tables configured and queryable');

    console.log('\n====================================================');
    console.log(`📊 RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('🎉 All onboarding & payment flows verified with 100% success!\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('❌ Test suite runtime exception:', err);
    process.exit(1);
  }
}

runTestSuite();
