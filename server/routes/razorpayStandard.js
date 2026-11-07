// server/routes/razorpayStandard.js - Razorpay Standard Web Checkout API endpoints
import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { execute, queryOne } from '../db.js';
import { saveBillReceipt } from '../localFileSystem.js';

const router = express.Router();

// Helper to initialize Razorpay client from environment variables
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return {
    client: new Razorpay({ key_id: keyId.trim(), key_secret: keySecret.trim() }),
    keyId: keyId.trim(),
    keySecret: keySecret.trim(),
  };
}

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request: { amount (in paise), currency, receipt }
 * Return: { success: true, order_id, amount, currency, key_id }
 * Minimum amount: 100 paise
 */
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validate amount
    if (amount === undefined || amount === null || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be a valid number in paise',
      });
    }

    const parsedAmount = parseInt(amount, 10);
    if (parsedAmount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be at least 100 paise (₹1.00)',
      });
    }

    const rzpConfig = getRazorpayClient();
    if (!rzpConfig) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay API credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env',
      });
    }

    const options = {
      amount: parsedAmount,
      currency: (currency || 'INR').toUpperCase(),
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || { platform: 'DineQR Standard Checkout' },
    };

    // Call Razorpay API: POST https://api.razorpay.com/v1/orders
    const order = await rzpConfig.client.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: rzpConfig.keyId,
      receipt: order.receipt,
    });
  } catch (err) {
    console.error('Razorpay Create Order Error:', err);
    const statusCode = err.statusCode || (err.error?.code === 'BAD_REQUEST_ERROR' ? 400 : 500);
    return res.status(statusCode).json({
      success: false,
      error: err.error?.description || err.message || 'Failed to create Razorpay order',
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Request: { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id }
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
router.post('/verify-payment', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    // Missing fields check
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are all required',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(401).json({
        success: false,
        error: 'RAZORPAY_KEY_SECRET not configured on server',
      });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret.trim())
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Compare signatures securely
    let signaturesMatch = false;
    try {
      const expBuf = Buffer.from(expectedSignature, 'utf-8');
      const actBuf = Buffer.from(razorpay_signature, 'utf-8');
      if (expBuf.length === actBuf.length) {
        signaturesMatch = crypto.timingSafeEqual(expBuf, actBuf);
      }
    } catch {
      signaturesMatch = false;
    }

    if (!signaturesMatch) {
      return res.status(400).json({
        success: false,
        error: 'Signature verification failed: generated signature does not match razorpay_signature',
      });
    }

    // If an associated database order_id was provided, update database and save receipt into DineQR-Data/bills/
    if (order_id) {
      try {
        execute(
          `UPDATE orders SET
            payment_status = 'PAID',
            payment_method = 'Razorpay Standard Checkout',
            razorpay_order_id = ?,
            razorpay_payment_id = ?,
            updated_at = CURRENT_TIMESTAMP
           WHERE id = ? OR order_code = ?`,
          [razorpay_order_id, razorpay_payment_id, order_id, order_id]
        );

        const order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [order_id, order_id]);
        if (order) {
          saveBillReceipt(order, [], { name: "L'Osteria Gourmet Bistro" });
        }
      } catch (dbErr) {
        console.warn('Note: order update in db skipped or errored:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      razorpay_payment_id,
      razorpay_order_id,
    });
  } catch (err) {
    console.error('Razorpay Verify Payment Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error verifying signature',
    });
  }
});

export default router;
