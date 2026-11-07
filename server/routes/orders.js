// server/routes/orders.js - Order creation, live tracking, history & CSV spreadsheet export
import express from 'express';
import { queryAll, queryOne, execute } from '../db.js';
import { broadcastEvent } from '../sse.js';
import { saveBillReceipt } from '../localFileSystem.js';

const router = express.Router();

function generateOrderCode() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${num}`;
}

// GET /api/orders/tokens/active - Token status for TV Display / Food Court Screens
router.get('/tokens/active', (req, res) => {
  try {
    const { restaurant_id } = req.query;
    let sql = `SELECT * FROM orders WHERE status IN ('RECEIVED', 'PREPARING', 'READY', 'SERVED')`;
    const params = [];

    if (restaurant_id) {
      sql += ` AND restaurant_id = ?`;
      params.push(restaurant_id);
    }
    sql += ` ORDER BY updated_at DESC, created_at DESC LIMIT 50`;

    const allOrders = queryAll(sql, params);
    const preparing = [];
    const ready = [];
    const served = [];

    allOrders.forEach((o) => {
      const token = {
        id: o.id,
        order_code: o.order_code,
        token_number: o.order_code ? o.order_code.replace(/^[A-Za-z]+-/, '') : o.id.slice(-4),
        table_number: o.table_number,
        customer_name: o.customer_name || 'Guest',
        status: o.status,
        created_at: o.created_at,
        updated_at: o.updated_at,
      };

      if (o.status === 'READY') {
        ready.push(token);
      } else if (o.status === 'RECEIVED' || o.status === 'PREPARING') {
        preparing.push(token);
      } else if (o.status === 'SERVED') {
        if (served.length < 5) served.push(token);
      }
    });

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      preparing,
      ready,
      served,
      counts: {
        preparing: preparing.length,
        ready: ready.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/export - Download orders spreadsheet (CSV formatted for Microsoft Excel)
router.get('/export', (req, res) => {
  try {
    const { restaurant_id, startDate, endDate, status, payment_status } = req.query;

    let sql = `
      SELECT o.*,
        r.name as restaurant_name
      FROM orders o
      LEFT JOIN restaurants r ON r.id = o.restaurant_id
      WHERE 1=1
    `;
    const params = [];

    if (restaurant_id) {
      sql += ` AND (o.restaurant_id = ? OR r.slug = ?)`;
      params.push(restaurant_id, restaurant_id);
    }

    if (startDate) {
      sql += ` AND date(o.created_at) >= date(?)`;
      params.push(startDate);
    }

    if (endDate) {
      sql += ` AND date(o.created_at) <= date(?)`;
      params.push(endDate);
    }

    if (status && status !== 'ALL') {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    if (payment_status && payment_status !== 'ALL') {
      sql += ` AND o.payment_status = ?`;
      params.push(payment_status);
    }

    sql += ` ORDER BY o.created_at DESC`;

    const orders = queryAll(sql, params);

    // CSV Headers
    const headers = [
      'Order ID',
      'Restaurant',
      'Table Number',
      'Date & Time',
      'Customer Name',
      'Customer Phone',
      'Items Ordered',
      'Special Instructions',
      'Subtotal (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'Grand Total (INR)',
      'Payment Method',
      'Payment Status',
      'Razorpay Payment ID',
      'Order Status',
    ];

    const rows = orders.map((o) => {
      const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [o.id]);
      const itemsString = items
        .map((it) => `${it.quantity}x ${it.name}${it.notes ? ` [${it.notes}]` : ''}`)
        .join('; ');

      const escape = (val) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      return [
        escape(o.order_code),
        escape(o.restaurant_name || 'L\'Osteria'),
        escape(o.table_number),
        escape(new Date(o.created_at).toLocaleString()),
        escape(o.customer_name || 'Guest'),
        escape(o.customer_phone || ''),
        escape(itemsString),
        escape(o.special_instructions || ''),
        escape(o.subtotal.toFixed(2)),
        escape(o.cgst.toFixed(2)),
        escape(o.sgst.toFixed(2)),
        escape(o.grand_total.toFixed(2)),
        escape(o.payment_method),
        escape(o.payment_status),
        escape(o.razorpay_payment_id || 'N/A'),
        escape(o.status),
      ].join(',');
    });

    // UTF-8 BOM (\uFEFF) ensures Excel opens special characters and Indian Rupee / names flawlessly
    const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

    const fileName = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error generating spreadsheet export:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders - Get orders list (with date range & past history)
router.get('/', (req, res) => {
  try {
    const { status, table_id, restaurant_id, timeRange, startDate, endDate, limit } = req.query;

    let sql = `
      SELECT o.*,
        r.name as restaurant_name,
        r.slug as restaurant_slug
      FROM orders o
      LEFT JOIN restaurants r ON r.id = o.restaurant_id
      WHERE 1=1
    `;
    const params = [];

    if (restaurant_id) {
      sql += ` AND (o.restaurant_id = ? OR r.slug = ?)`;
      params.push(restaurant_id, restaurant_id);
    }

    if (status === 'active') {
      sql += ` AND o.status NOT IN ('COMPLETED', 'CANCELLED')`;
    } else if (status && status !== 'ALL') {
      sql += ` AND o.status = ?`;
      params.push(status);
    }

    if (table_id) {
      sql += ` AND o.table_id = ?`;
      params.push(table_id);
    }

    // Time range filter for viewing historical/older orders
    if (startDate) {
      sql += ` AND date(o.created_at) >= date(?)`;
      params.push(startDate);
    }
    if (endDate) {
      sql += ` AND date(o.created_at) <= date(?)`;
      params.push(endDate);
    }

    if (timeRange === 'today') {
      sql += ` AND date(o.created_at) = date('now')`;
    } else if (timeRange === 'yesterday') {
      sql += ` AND date(o.created_at) = date('now', '-1 day')`;
    } else if (timeRange === 'week') {
      sql += ` AND date(o.created_at) >= date('now', '-7 days')`;
    } else if (timeRange === 'month') {
      sql += ` AND date(o.created_at) >= date('now', '-30 days')`;
    }

    sql += ` ORDER BY o.created_at DESC`;

    if (limit) {
      sql += ` LIMIT ?`;
      params.push(parseInt(limit, 10));
    }

    const orders = queryAll(sql, params);

    const enriched = orders.map((order) => {
      const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
      
      // Robust UTC date parsing for SQLite CURRENT_TIMESTAMP (YYYY-MM-DD HH:MM:SS)
      let dateStr = order.created_at ? String(order.created_at).trim() : '';
      if (dateStr && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
        dateStr = dateStr.replace(' ', 'T') + 'Z';
      }
      const createdDate = dateStr ? new Date(dateStr) : new Date();
      const elapsedMins = Math.floor((Date.now() - createdDate.getTime()) / 60000);

      return {
        ...order,
        items,
        created_at_utc: createdDate.toISOString(),
        elapsed_minutes: elapsedMins >= 0 ? elapsedMins : 0,
      };
    });

    res.json({ success: true, orders: enriched });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/orders/:id - Get single order details
router.get('/:id', (req, res) => {
  try {
    const order = queryOne(
      `SELECT * FROM orders WHERE id = ? OR order_code = ?`,
      [req.params.id, req.params.id]
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    const table = order.table_id ? queryOne(`SELECT * FROM tables WHERE id = ?`, [order.table_id]) : null;
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [order.restaurant_id || 'rest_losteria']);

    res.json({
      success: true,
      order: {
        ...order,
        items,
        table,
        restaurant: restaurant ? { ...restaurant, razorpay_key_secret: undefined } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/orders - Place a new order
router.post('/', (req, res) => {
  try {
    const {
      table_id,
      restaurant_id,
      customer_name,
      customer_phone,
      items,
      special_instructions,
      payment_method,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty. Please add items to place an order.' });
    }

    // Lookup table or Counter Pickup Token
    let table = null;
    let resolvedRestId = restaurant_id || 'rest_losteria';
    const isCounter = !table_id || table_id === 'counter' || table_id === 'takeaway' || table_id === 'walkin';

    // Generate daily rotating token number
    const todayTokenCount = queryOne(
      `SELECT COUNT(*) as c FROM orders WHERE restaurant_id = ? AND date(created_at) = date('now')`,
      [resolvedRestId]
    )?.c || 0;
    const tokenNumber = todayTokenCount + 1;

    let tableNumber = `Counter · Token #${tokenNumber}`;

    if (!isCounter && table_id) {
      table = queryOne(`SELECT * FROM tables WHERE id = ? OR table_number = ?`, [table_id, table_id]);
      if (table) {
        tableNumber = table.table_number;
        if (table.restaurant_id) {
          resolvedRestId = table.restaurant_id;
        }
      }
    }

    // Lookup restaurant specific tax settings
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [resolvedRestId]) || {
      id: 'rest_losteria',
      cgst_pct: 2.5,
      sgst_pct: 2.5,
      service_charge_pct: 0.0,
    };

    // Calculate subtotal from verified database prices
    let subtotal = 0;
    const validatedItems = [];

    for (const cartItem of items) {
      const dbItem = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [cartItem.id || cartItem.menu_item_id]);
      if (!dbItem) continue;

      const quantity = Math.max(1, parseInt(cartItem.quantity || '1', 10));
      const unitPrice = dbItem.price;
      const lineSubtotal = unitPrice * quantity;
      subtotal += lineSubtotal;

      validatedItems.push({
        id: 'ord_item_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        menu_item_id: dbItem.id,
        name: dbItem.name,
        unit_price: unitPrice,
        quantity,
        subtotal: lineSubtotal,
        notes: cartItem.notes || '',
      });
    }

    if (validatedItems.length === 0) {
      return res.status(400).json({ success: false, error: 'None of the submitted items could be found.' });
    }

    // Calculate taxes and grand total
    const cgst = parseFloat(((subtotal * restaurant.cgst_pct) / 100).toFixed(2));
    const sgst = parseFloat(((subtotal * restaurant.sgst_pct) / 100).toFixed(2));
    const serviceCharge = parseFloat(((subtotal * restaurant.service_charge_pct) / 100).toFixed(2));
    const grandTotal = Math.round(subtotal + cgst + sgst + serviceCharge);

    const orderId = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const orderCode = generateOrderCode();
    const payMethod = payment_method || 'RAZORPAY';
    const payStatus = payMethod === 'CASH_AT_COUNTER' ? 'PENDING' : 'PENDING';

    execute(
      `INSERT INTO orders (
        id, restaurant_id, order_code, table_id, table_number, customer_name, customer_phone,
        status, payment_status, payment_method, subtotal, cgst, sgst, service_charge,
        grand_total, special_instructions, is_counter_order, token_number, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        orderId,
        resolvedRestId,
        orderCode,
        table ? table.id : null,
        tableNumber,
        customer_name || (isCounter ? `Counter Guest #${tokenNumber}` : 'Guest'),
        customer_phone || '',
        payStatus,
        payMethod,
        subtotal,
        cgst,
        sgst,
        serviceCharge,
        grandTotal,
        special_instructions || '',
        isCounter ? 1 : 0,
        tokenNumber,
      ]
    );

    // Insert order items
    for (const it of validatedItems) {
      execute(
        `INSERT INTO order_items (id, order_id, menu_item_id, name, unit_price, quantity, subtotal, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [it.id, orderId, it.menu_item_id, it.name, it.unit_price, it.quantity, it.subtotal, it.notes]
      );
    }

    const createdOrder = queryOne(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    const responsePayload = {
      ...createdOrder,
      items: validatedItems,
      table,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
    };

    // Broadcast SSE to live kitchen dashboard
    broadcastEvent('NEW_ORDER', {
      order: responsePayload,
      restaurant_id: resolvedRestId,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: responsePayload,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/orders/:id/mark-counter-paid - Mark a Pay-on-Counter order as paid & generate local bill
router.patch('/:id/mark-counter-paid', (req, res) => {
  try {
    const order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [req.params.id, req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const { payment_method = 'Cash at Counter' } = req.body;

    execute(
      `UPDATE orders SET
        payment_status = 'PAID',
        payment_method = ?,
        status = CASE WHEN status = 'RECEIVED' THEN 'PREPARING' ELSE status END,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [payment_method, order.id]
    );

    const updated = queryOne(`SELECT * FROM orders WHERE id = ?`, [order.id]);
    const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    const rest = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [order.restaurant_id]) || {};

    // Save official bill receipt into DineQR-Data/bills/
    const billFiles = saveBillReceipt(updated, items, rest);

    broadcastEvent('ORDER_PAID', {
      order: { ...updated, items },
      restaurant_id: order.restaurant_id,
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: `Counter payment recorded for order ${order.order_code}. Bill saved to DineQR-Data/bills/.`,
      order: { ...updated, items },
      bill_files: billFiles,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/orders/:id/status - Update order workflow status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['RECEIVED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [req.params.id, req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    execute(
      `UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [status, order.id]
    );

    const updated = queryOne(`SELECT * FROM orders WHERE id = ?`, [order.id]);
    const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);

    const broadcastData = { ...updated, items };

    broadcastEvent('ORDER_STATUS_CHANGED', {
      order: broadcastData,
      restaurant_id: order.restaurant_id,
      previous_status: order.status,
      new_status: status,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, order: broadcastData });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
