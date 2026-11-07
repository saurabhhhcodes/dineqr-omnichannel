// server/routes/subscription.js - Monthly Merchant Subscription Billing & Razorpay Integration
import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { queryOne, execute } from '../db.js';

const router = express.Router();

const PLANS = {
  starter_1000: {
    id: 'starter_1000',
    name: 'Legacy Starter Plan',
    amount: 1000,
    amount_paise: 100000,
    billing_period: 'monthly',
    badge: 'Legacy',
    staff_limit: 8,
    description: 'Legacy tier for backward compatibility.',
    features: ['Offline SQLite Engine', 'QR Menu', 'Kitchen KDS'],
  },
  starter_1500: {
    id: 'starter_1500',
    name: 'Local SQLite On-Premise POS',
    amount: 1500,
    amount_paise: 150000,
    billing_period: 'monthly',
    badge: 'Starter (Offline)',
    staff_limit: 8,
    description: '100% On-Premise Local SQLite Billing & KDS without cloud dependencies. Offline dine-in & counter only; no Zomato/Swiggy aggregators.',
    features: [
      '100% Offline SQLite On-Premise Engine (Zero Cloud Costs)',
      'Dynamic QR Digital Menus & Table Ordering',
      'Live Kitchen Display System (KDS) & Elapsed Timer',
      'Smart TV Token Announcer with Audio Chimes',
      'Local ESC/POS Thermal Printing & PDF Bills',
      'Up to 8 Staff Members with Role Authorization',
      'Local Inventory & Daily Expense Register',
      'Zero Third-Party Cut (100% Direct Merchant Settlements)',
    ],
  },
  aggregator_3500: {
    id: 'aggregator_3500',
    name: 'Aggregator Pro (Zomato + Swiggy Direct)',
    amount: 3500,
    amount_paise: 350000,
    billing_period: 'monthly',
    badge: 'Most Popular',
    staff_limit: 18,
    description: 'Everything in Starter PLUS direct two-way Zomato & Swiggy online order ingestion, rider dispatch, and auto-accept.',
    features: [
      'Everything in Starter Local POS',
      'LIVE Zomato Partner ResID Ingestion & Auto-Accept',
      'LIVE Swiggy Outlet Webhook Ingestion & Dispatch',
      'Unified Single-Screen KDS for Dine-In + Online Orders',
      'Rider Arrival & Handover Notification Management',
      'Magicpin & ONDC Food Delivery Integration',
      'Up to 18 Staff User Accounts & Clock-In/Clock-Out',
      'Priority WhatsApp & Phone Technical Support',
    ],
  },
  enterprise_7000: {
    id: 'enterprise_7000',
    name: 'Enterprise Cloud Hub & Multi-Chain Sync',
    amount: 7000,
    amount_paise: 700000,
    billing_period: 'monthly',
    badge: 'Enterprise Cloud',
    staff_limit: 40,
    description: 'Multi-outlet dining chains, gym networks, and high-volume restaurants requiring dual SQLite + MongoDB Atlas Cloud Sync with Unlimited Cloud Storage.',
    features: [
      'Everything in Aggregator Pro (Zomato + Swiggy Included)',
      'Dual Local SQLite + MongoDB Atlas Real-Time Cloud Replication',
      'Unlimited Cloud Storage (No 2GB Storage Limit Caps)',
      'Owner Mobile App Live Revenue & Profit Dashboard from Anywhere',
      'Multi-Chain Centralized Menu & Recipe Management',
      'Up to 40 Staff Accounts with Unique User IDs and Passwords',
      'Dedicated Remote Backup & Automated Disaster Recovery',
      'Dedicated Account Manager & 24/7 Enterprise SLA',
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
    const currentPlanId = planStr.includes('7000') || planStr.includes('enterprise') || planStr.includes('5000')
      ? 'enterprise_7000'
      : planStr.includes('3500') || planStr.includes('aggregator')
      ? 'aggregator_3500'
      : 'starter_1500';
    const plan = PLANS[currentPlanId] || PLANS.starter_1500;

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
    const { restaurant_id = 'rest_losteria', plan_id = 'starter_1500' } = req.body;
    const plan = PLANS[plan_id] || PLANS.starter_1500;

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
    const plan = PLANS[req.body?.plan_id] || PLANS.starter_1500;
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
      plan_id = 'starter_1500',
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const plan = PLANS[plan_id] || PLANS.starter_1500;
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
