// server/routes/payment.js - Dynamic per-restaurant Razorpay routing & verification
import express from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { queryOne, execute, queryAll } from '../db.js';
import { broadcastEvent } from '../sse.js';

const router = express.Router();

// Helper to get active Razorpay instance for a specific restaurant
function getRazorpayForRestaurant(restaurantId) {
  const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurantId]);

  // 1. Check if restaurant configured their own custom Razorpay merchant keys
  if (
    restaurant &&
    restaurant.razorpay_key_id &&
    restaurant.razorpay_key_secret &&
    restaurant.razorpay_key_id.trim().length > 0 &&
    restaurant.razorpay_key_secret.trim().length > 0
  ) {
    return {
      client: new Razorpay({
        key_id: restaurant.razorpay_key_id.trim(),
        key_secret: restaurant.razorpay_key_secret.trim(),
      }),
      key_id: restaurant.razorpay_key_id.trim(),
      key_secret: restaurant.razorpay_key_secret.trim(),
      isCustom: true,
      isConfigured: true,
      restaurantName: restaurant.name,
    };
  }

  // 2. Check if platform global keys are set in environment
  const envKeyId = process.env.RAZORPAY_KEY_ID;
  const envKeySecret = process.env.RAZORPAY_KEY_SECRET;
  if (envKeyId && envKeySecret && envKeyId.trim().length > 0 && envKeySecret.trim().length > 0) {
    return {
      client: new Razorpay({ key_id: envKeyId.trim(), key_secret: envKeySecret.trim() }),
      key_id: envKeyId.trim(),
      key_secret: envKeySecret.trim(),
      isCustom: false,
      isConfigured: true,
      restaurantName: restaurant?.name || 'Platform',
    };
  }

  // 3. Fallback to interactive test simulation sandbox
  return {
    client: null,
    key_id: 'rzp_test_simulated_demo',
    key_secret: 'demo_secret_key',
    isCustom: false,
    isConfigured: false,
    restaurantName: restaurant?.name || 'Sandbox',
  };
}

// GET /api/payment/razorpay/config - Return configuration status for a restaurant
router.get('/config', (req, res) => {
  const restId = req.query.restaurant_id || 'rest_losteria';
  const { isConfigured, isCustom, key_id, restaurantName } = getRazorpayForRestaurant(restId);

  res.json({
    success: true,
    configured: isConfigured,
    is_custom_merchant_account: isCustom,
    key_id: isConfigured ? key_id : 'rzp_test_simulated_demo',
    restaurant_name: restaurantName,
    mode: isConfigured ? (isCustom ? 'direct_restaurant_account' : 'platform_gateway') : 'simulation_sandbox',
  });
});

// POST /api/payment/razorpay/test-keys - Live validation of Razorpay credentials
router.post('/test-keys', async (req, res) => {
  try {
    const { key_id, key_secret } = req.body;
    if (!key_id || !key_secret) {
      return res.status(400).json({ success: false, error: 'Both Key ID and Key Secret are required' });
    }
    const rzp = new Razorpay({ key_id: key_id.trim(), key_secret: key_secret.trim() });
    const testList = await rzp.orders.all({ count: 1 });
    const isTestMode = key_id.trim().startsWith('rzp_test_');
    res.json({
      success: true,
      valid: true,
      mode: isTestMode ? 'Test Mode' : 'Live Production',
      message: `Successfully connected to Razorpay account in ${isTestMode ? 'Test' : 'Live'} Mode`,
      existing_orders_sample_count: testList.count !== undefined ? testList.count : 0,
    });
  } catch (err) {
    console.error('Razorpay key validation failed:', err);
    res.status(400).json({
      success: false,
      valid: false,
      error: 'Razorpay authentication failed: ' + (err.error?.description || err.message),
    });
  }
});

// POST /api/payment/razorpay/create-order - Create Razorpay order
router.post('/create-order', async (req, res) => {
  try {
    const { order_id } = req.body;
    if (!order_id) {
      return res.status(400).json({ success: false, error: 'order_id is required' });
    }

    const order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [order_id, order_id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found in database' });
    }

    const restId = order.restaurant_id || 'rest_losteria';
    const { client, key_id, isConfigured, isCustom, restaurantName } = getRazorpayForRestaurant(restId);
    const amountInPaise = Math.round(order.grand_total * 100);

    let rzpOrder;

    if (isConfigured && client) {
      // Create order directly with the Restaurant's own Razorpay Account!
      rzpOrder = await client.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: order.order_code,
        notes: {
          restaurant_id: restId,
          restaurant_name: restaurantName,
          table_number: order.table_number,
          order_id: order.id,
        },
      });
    } else {
      // High-Fidelity Simulation Sandbox order
      const simId = 'order_rzp_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      rzpOrder = {
        id: simId,
        entity: 'order',
        amount: amountInPaise,
        amount_paid: 0,
        amount_due: amountInPaise,
        currency: 'INR',
        receipt: order.order_code,
        status: 'created',
        notes: {
          table_number: order.table_number,
          order_id: order.id,
          restaurant_id: restId,
        },
        created_at: Math.floor(Date.now() / 1000),
        mock: true,
      };
    }

    // Save razorpay_order_id to DB
    execute(`UPDATE orders SET razorpay_order_id = ? WHERE id = ?`, [rzpOrder.id, order.id]);

    res.json({
      success: true,
      razorpay_order: rzpOrder,
      key_id,
      is_mock: !isConfigured,
      is_direct_restaurant_payout: isCustom,
      restaurant_name: restaurantName,
      order: {
        id: order.id,
        order_code: order.order_code,
        table_number: order.table_number,
        grand_total: order.grand_total,
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/payment/razorpay/verify - Verify payment signature
router.post('/verify', (req, res) => {
  try {
    const { order_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, is_mock } = req.body;

    if (!order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, error: 'Missing payment verification parameters' });
    }

    const order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [order_id, order_id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const restId = order.restaurant_id || 'rest_losteria';
    const { key_secret, isConfigured } = getRazorpayForRestaurant(restId);

    // Verify signature with restaurant's secret key if live
    if (isConfigured && !is_mock) {
      const generatedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, error: 'Invalid Razorpay payment signature' });
      }
    }

    // Update order payment status
    execute(
      `UPDATE orders SET
        payment_status = 'PAID',
        payment_method = 'RAZORPAY',
        razorpay_order_id = COALESCE(?, razorpay_order_id),
        razorpay_payment_id = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [razorpay_order_id, razorpay_payment_id, order.id]
    );

    const updatedOrder = queryOne(`SELECT * FROM orders WHERE id = ?`, [order.id]);
    const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    const broadcastData = { ...updatedOrder, items };

    // Broadcast SSE to kitchen
    broadcastEvent('ORDER_PAID', {
      order: broadcastData,
      restaurant_id: restId,
      razorpay_payment_id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Payment verified and recorded directly into restaurant account',
      order: broadcastData,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
