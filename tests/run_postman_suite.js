// tests/run_postman_suite.js - Automated Postman Runner for DineQR Enterprise API
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = process.env.BASE_URL || 'http://localhost:3005';
const collectionPath = path.resolve(__dirname, '../postman_collection.json');

async function runPostmanSuite() {
  console.log(`=============================================================`);
  console.log(` DineQR Enterprise - Automated Postman Test Suite Runner`);
  console.log(` Target Server: ${BASE_URL}`);
  console.log(` Local Time: ${new Date().toISOString()}`);
  console.log(`=============================================================\n`);

  if (!fs.existsSync(collectionPath)) {
    console.error(`Error: postman_collection.json not found at ${collectionPath}`);
    process.exit(1);
  }

  const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failureDetails = [];

  // Shared test context
  let createdOrderId = null;
  let createdRzpOrderId = null;
  let createdMenuItemId = null;

  for (const item of collection.item) {
    totalTests++;
    const name = item.name;
    const method = item.request.method;
    let url = item.request.url.raw.replace('{{baseUrl}}', BASE_URL);

    let headers = { 'Content-Type': 'application/json' };
    let body = null;

    if (item.request.body && item.request.body.raw) {
      body = item.request.body.raw;
    }

    process.stdout.write(`[TEST ${totalTests}] ${name} ... `);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: ['GET', 'HEAD'].includes(method) ? undefined : body,
      });

      const resText = await res.text();
      let resJson = null;
      try {
        resJson = JSON.parse(resText);
      } catch {
        resJson = null;
      }

      // Assertions per test
      let pass = false;
      let reason = '';

      if (name.includes('Health')) {
        pass = res.status === 200 && resJson?.status === 'online';
      } else if (name.includes('Create Order (Standard Checkout)')) {
        pass = res.status === 200 && resJson?.success === true && resJson?.order_id?.startsWith('order_');
        if (pass) createdRzpOrderId = resJson.order_id;
        else reason = `Expected status 200 and order_id, got status ${res.status}: ${resText}`;
      } else if (name.includes('Amount < 100 paise')) {
        pass = res.status === 400 && resJson?.success === false && resJson?.error?.includes('100 paise');
        if (!pass) reason = `Expected status 400 with 100 paise error, got ${res.status}`;
      } else if (name.includes('Signature Mismatch Failure')) {
        pass = res.status === 400 && resJson?.success === false;
        if (!pass) reason = `Expected status 400 for invalid signature, got ${res.status}`;
      } else if (name.includes('List All Active Tenancies')) {
        pass = res.status === 200 && Array.isArray(resJson?.restaurants) && resJson.restaurants.length > 0;
      } else if (name.includes('Register New Client (Enterprise')) {
        pass = (res.status === 201 && resJson?.success === true) || (res.status === 400 && resJson?.error?.includes('already taken'));
      } else if (name.includes('Fetch Items & Categories')) {
        pass = res.status === 200 && resJson?.success === true && Array.isArray(resJson?.items) && resJson.items.length > 0;
      } else if (name.includes('Instant Price Change')) {
        pass = res.status === 200 && resJson?.success === true && resJson?.item?.price === 380;
      } else if (name.includes('Add Custom Dish')) {
        pass = res.status === 201 && resJson?.success === true && resJson?.item?.id;
        if (pass) createdMenuItemId = resJson.item.id;
      } else if (name.includes('Fetch Tables')) {
        pass = res.status === 200 && resJson?.success === true && Array.isArray(resJson?.tables);
      } else if (name.includes('Add New Dining Table')) {
        pass = res.status === 201 && resJson?.success === true;
      } else if (name.includes('Create Pay-on-Counter Order')) {
        pass = res.status === 201 && resJson?.success === true && resJson?.order?.id;
        if (pass) createdOrderId = resJson.order.id;
      } else if (name.includes('List Members & Inspect Plan Limits')) {
        pass = res.status === 200 && resJson?.success === true && resJson?.staff_limit !== undefined;
      } else if (name.includes('Add Staff Member with User ID')) {
        // Succeeds on 201 or validates plan staff limit on 400
        pass = (res.status === 201 && resJson?.success === true) || (res.status === 400 && (resJson?.error?.includes('already taken') || resJson?.error?.includes('limit reached')));
      } else if (name.includes('Staff - Login & Clock-In')) {
        pass = res.status === 200 && resJson?.success === true && resJson?.arrival_time;
      } else if (name.includes('Staff - Clock-Out')) {
        pass = res.status === 200 && resJson?.success === true;
      } else if (name.includes('Inspect Local DineQR-Data Folders')) {
        pass = res.status === 200 && resJson?.success === true && resJson?.folders?.database && resJson?.folders?.bills;
      } else if (name.includes('Verify Current Plan')) {
        pass = res.status === 200 && resJson?.success === true && resJson?.plan?.amount > 0;
      } else {
        pass = res.status >= 200 && res.status < 300;
      }

      if (pass) {
        passedTests++;
        console.log(`PASSED (HTTP ${res.status})`);
      } else {
        failedTests++;
        console.log(`FAILED (HTTP ${res.status})`);
        failureDetails.push({ name, status: res.status, reason: reason || resText });
      }
    } catch (err) {
      failedTests++;
      console.log(`ERROR: ${err.message}`);
      failureDetails.push({ name, error: err.message });
    }
  }

  // Bonus: Razorpay Signature Verification with valid HMAC-SHA256
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] 19. Razorpay - Verify Payment (Valid Signature HMAC Match) ... `);
  try {
    const keySecret = '3c5JGUBSPS7S8GuBggFSHpw1';
    const testRzpOrder = createdRzpOrderId || 'order_TxIEOzZMVeoNrl';
    const testPaymentId = 'pay_postman_pass_99';
    const validSig = crypto.createHmac('sha256', keySecret).update(`${testRzpOrder}|${testPaymentId}`).digest('hex');

    const vRes = await fetch(`${BASE_URL}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        razorpay_order_id: testRzpOrder,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: validSig,
        order_id: createdOrderId || undefined,
      }),
    });

    const vData = await vRes.json();
    if (vRes.status === 200 && vData.success === true && vData.message?.includes('verified')) {
      passedTests++;
      console.log(`PASSED (HTTP 200)`);
    } else {
      failedTests++;
      console.log(`FAILED: ${JSON.stringify(vData)}`);
      failureDetails.push({ name: 'Valid Signature HMAC Match', details: vData });
    }
  } catch (err) {
    failedTests++;
    console.log(`ERROR: ${err.message}`);
  }

  // Bonus: Mark counter order paid and verify local bill saved
  if (createdOrderId) {
    totalTests++;
    process.stdout.write(`[TEST ${totalTests}] 20. Orders - Mark Counter Paid & Save Local Bill ... `);
    try {
      const pRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/mark-counter-paid`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_method: 'Cash at Counter' }),
      });
      const pData = await pRes.json();
      if (pRes.status === 200 && pData.success && pData.bill_files?.htmlPath) {
        passedTests++;
        console.log(`PASSED (Bill saved locally: ${pData.bill_files.filename})`);
      } else {
        failedTests++;
        console.log(`FAILED: ${JSON.stringify(pData)}`);
      }
    } catch (err) {
      failedTests++;
      console.log(`ERROR: ${err.message}`);
    }
  }

  // Bonus 21: Token TV Display Active Orders
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] 21. TV Display - Fetch Active Tokens (Preparing vs Ready) ... `);
  try {
    const tRes = await fetch(`${BASE_URL}/api/tokens/active`);
    const tData = await tRes.json();
    if (tRes.status === 200 && tData.success === true && tData.counts !== undefined) {
      passedTests++;
      console.log(`PASSED (Preparing: ${tData.counts.preparing}, Ready: ${tData.counts.ready})`);
    } else {
      failedTests++;
      console.log(`FAILED: ${JSON.stringify(tData)}`);
      failureDetails.push({ name: 'TV Display Tokens', details: tData });
    }
  } catch (err) {
    failedTests++;
    console.log(`ERROR: ${err.message}`);
  }

  // Bonus 22: Book a 10-Minute Demo (Petpooja Parity)
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] 22. Lead Ingestion - Book A 10-Minute Demo ... `);
  try {
    const dRes = await fetch(`${BASE_URL}/api/demo/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Saurabh Bajpai',
        phone: '+919876543210',
        email: 'saurabhbajpai03@gmail.com',
        outlet_name: 'Saurabh Bistro',
        outlet_type: 'finedine',
        city: 'Bengaluru',
      }),
    });
    const dData = await dRes.json();
    if (dRes.status === 201 && dData.success === true && dData.demo_id) {
      passedTests++;
      console.log(`PASSED (Demo ID: ${dData.demo_id})`);
    } else {
      failedTests++;
      console.log(`FAILED: ${JSON.stringify(dData)}`);
      failureDetails.push({ name: 'Book Demo', details: dData });
    }
  } catch (err) {
    failedTests++;
    console.log(`ERROR: ${err.message}`);
  }

  // Bonus 23: Cloud Sync Status (Local DB ₹1500 vs Cloud ₹5000)
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] 23. Cloud Engine - Status (Dual SQLite & MongoDB Atlas) ... `);
  try {
    const cRes = await fetch(`${BASE_URL}/api/cloud/status?restaurant_id=rest_losteria`);
    const cData = await cRes.json();
    if (cRes.status === 200 && cData.success === true && cData.pricing) {
      passedTests++;
      console.log(`PASSED (Architecture: ${cData.architecture})`);
    } else {
      failedTests++;
      console.log(`FAILED: ${JSON.stringify(cData)}`);
      failureDetails.push({ name: 'Cloud Status', details: cData });
    }
  } catch (err) {
    failedTests++;
    console.log(`ERROR: ${err.message}`);
  }

  // Bonus 24: Cloud Sync Snapshot Trigger
  totalTests++;
  process.stdout.write(`[TEST ${totalTests}] 24. Cloud Engine - Sync Snapshot to MongoDB Atlas Buffer ... `);
  try {
    const sRes = await fetch(`${BASE_URL}/api/cloud/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant_id: 'rest_losteria' }),
    });
    const sData = await sRes.json();
    if (sRes.status === 200 && sData.success === true && sData.counts) {
      passedTests++;
      console.log(`PASSED (Mode: ${sData.mode}, Synced Tables: ${sData.counts.tables_count})`);
    } else {
      failedTests++;
      console.log(`FAILED: ${JSON.stringify(sData)}`);
      failureDetails.push({ name: 'Cloud Sync', details: sData });
    }
  } catch (err) {
    failedTests++;
    console.log(`ERROR: ${err.message}`);
  }

  console.log(`\n=============================================================`);
  console.log(` POSTMAN RUN SUMMARY:`);
  console.log(` Total Tests Executed: ${totalTests}`);
  console.log(` Passed:              ${passedTests} (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log(` Failed:              ${failedTests}`);
  console.log(`=============================================================`);

  if (failureDetails.length > 0) {
    console.log(`\nFailure Details:`);
    console.dir(failureDetails, { depth: null });
    process.exit(1);
  } else {
    console.log(`\n All Postman endpoints verified 100% operational!\n`);
    process.exit(0);
  }
}

runPostmanSuite();
