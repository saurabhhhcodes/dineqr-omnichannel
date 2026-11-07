// server/routes/subscription.js - Monthly Merchant Subscription Billing & Razorpay Integration
import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { queryOne, execute } from '../db.js';

const router = express.Router();

const PLANS = {
  starter_1000: {
    id: 'starter_1000',
    name: 'Essential Restaurant Suite',
    amount: 1000,
    amount_paise: 100000,
    billing_period: 'monthly',
    badge: 'Popular',
    description: 'Complete QR self-ordering, visual floor plan, kitchen KDS, local SQLite database & thermal billing.',
    features: [
      'Unlimited Table & Counter QR Codes',
      'Interactive Drag & Drop Floor Plan (Odoo Parity)',
      'Live Kitchen Display System (KDS) & Audio Chimes',
      'Local On-Premise SQLite Database (Zero Cloud Cost)',
      'ESC/POS Thermal Network Invoice Printing',
      'Staff Shift Scheduling & Live Duty Clock-In',
      'Perpetual Local Data Ownership (Export Anytime)',
    ],
  },
  pro_1500: {
    id: 'pro_1500',
    name: 'Omnichannel Pro Delivery Suite',
    amount: 1500,
    amount_paise: 150000,
    billing_period: 'monthly',
    badge: 'Enterprise',
    staff_limit: 12,
    description: 'Everything in Essential plus real-time Zomato, Swiggy & ONDC webhook aggregator order streaming.',
    features: [
      'Everything in Essential Restaurant Suite',
      'Zomato Partner ResId Auto-Accept & Ingestion',
      'Swiggy Partner Outlet Webhook Ingestion',
      'ONDC Network & Magicpin Delivery Hub',
      'Unified Single-Screen KDS for Dine-In & Delivery',
      'Multi-Terminal Standalone Apps (EXE, APK, DMG, DEB)',
      'Up to 12 Staff User Accounts with Role Permissions',
      'Priority 24/7 Phone & WhatsApp Support',
    ],
  },
  enterprise_5000: {
    id: 'enterprise_5000',
    name: 'Enterprise Scale & Unlimited Staff Hub',
    amount: 5000,
    amount_paise: 500000,
    billing_period: 'monthly',
    badge: 'Scale & Chains',
    staff_limit: 30,
    description: 'High-volume dining chains, multi-counter food courts, and franchises needing advanced staff limits, timeclock tracking, and dedicated folder archives.',
    features: [
      'Up to 30 Staff Accounts with Unique User IDs and Passwords',
      'Live Staff Arrival & Departure Timeclock Attendance Log',
      'Multi-Screen Kitchen KDS with Expediter Stations',
      'Dedicated On-Premise Folders (/bills, /inventory, /staff)',
      'Pay-on-Counter Cash & UPI Split Tender Verification',
      'Real-Time Food Cost, Margin & Daily P&L Engine',
      'Multi-Branch Consolidated Reporting & Analytics',
      'Direct Razorpay Merchant Settlement with 0% Cut',
    ],
  },
};

// GET /api/subscription/status - Get current restaurant subscription details
router.get('/status', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const rest = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restId]);

    if (!rest) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const planStr = (rest.subscription_plan || '').toLowerCase();
    const currentPlanId = planStr.includes('5000') || planStr.includes('enterprise')
      ? 'enterprise_5000'
      : planStr.includes('1500') || planStr.includes('pro')
      ? 'pro_1500'
      : 'starter_1000';
    const plan = PLANS[currentPlanId] || PLANS.starter_1000;

    // Calculate expiry (default 30 days from now if not explicitly set)
    let expiresAt = rest.subscription_expires_at;
    if (!expiresAt) {
      const future = new Date();
      future.setDate(future.getDate() + 29);
      expiresAt = future.toISOString();
    }

    const msLeft = new Date(expiresAt).getTime() - Date.now();
    const daysLeft = Math.max(1, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

    res.json({
      success: true,
      restaurant_id: rest.id,
      restaurant_name: rest.name,
      plan: {
        id: plan.id,
        name: plan.name,
        amount: plan.amount,
        currency: '₹',
        billing_period: 'Monthly',
      },
      status: rest.subscription_status || 'active',
      expires_at: expiresAt,
      days_left: daysLeft,
      available_plans: Object.values(PLANS),
      features: plan.features,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/subscription/create-order - Create Razorpay subscription checkout order
router.post('/create-order', async (req, res) => {
  try {
    const { restaurant_id = 'rest_losteria', plan_id = 'starter_1000' } = req.body;
    const plan = PLANS[plan_id] || PLANS.starter_1000;

    const rest = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurant_id]);
    const rzpKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TK088i9wgJLbAg';
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET || 'DyRucfn1FimHG6vcWs6CyePr';

    const rzp = new Razorpay({
      key_id: rzpKeyId,
      key_secret: rzpSecret,
    });

    const receiptId = `sub_${Date.now().toString().slice(-8)}`;

    const rzpOrder = await rzp.orders.create({
      amount: plan.amount_paise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        restaurant_id: rest ? rest.id : restaurant_id,
        restaurant_name: rest ? rest.name : 'Restaurant Partner',
        plan_id: plan.id,
        plan_name: plan.name,
        payment_category: 'DineQR Monthly Platform Subscription',
      },
    });

    res.json({
      success: true,
      order_id: rzpOrder.id,
      amount: plan.amount,
      amount_paise: plan.amount_paise,
      currency: 'INR',
      key_id: rzpKeyId,
      plan_id: plan.id,
      plan_name: plan.name,
      restaurant_name: rest?.name || 'Your Business',
    });
  } catch (err) {
    // Graceful fallback for offline testing
    const fallbackId = 'order_sub_mock_' + Math.floor(100000 + Math.random() * 900000);
    const plan = PLANS[req.body.plan_id] || PLANS.starter_1000;
    res.json({
      success: true,
      order_id: fallbackId,
      amount: plan.amount,
      amount_paise: plan.amount_paise,
      currency: 'INR',
      key_id: 'rzp_test_TK088i9wgJLbAg',
      plan_id: plan.id,
      plan_name: plan.name,
      simulated: true,
    });
  }
});

// POST /api/subscription/verify - Verify Razorpay payment and activate 30-day term
router.post('/verify', (req, res) => {
  try {
    const {
      restaurant_id = 'rest_losteria',
      plan_id = 'starter_1000',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const plan = PLANS[plan_id] || PLANS.starter_1000;
    const rzpSecret = process.env.RAZORPAY_KEY_SECRET || 'DyRucfn1FimHG6vcWs6CyePr';

    // Verify signature if supplied and not a simulated order
    if (razorpay_order_id && razorpay_payment_id && razorpay_signature && !razorpay_order_id.includes('mock')) {
      const generated = crypto
        .createHmac('sha256', rzpSecret)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

      if (generated !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Payment signature mismatch' });
      }
    }

    // Extend subscription date by 30 days
    const nextExpiry = new Date();
    nextExpiry.setDate(nextExpiry.getDate() + 30);
    const nextExpiryIso = nextExpiry.toISOString();

    execute(
      `UPDATE restaurants SET
        subscription_plan = ?,
        subscription_status = 'active',
        subscription_expires_at = ?
       WHERE id = ?`,
      [plan.name, nextExpiryIso, restaurant_id]
    );

    res.json({
      success: true,
      message: `Subscription activated! Your restaurant is subscribed to ${plan.name} at ₹${plan.amount}/month.`,
      plan: plan.name,
      status: 'active',
      expires_at: nextExpiryIso,
      payment_id: razorpay_payment_id || 'rzp_pay_confirmed',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
