// server/routes/invoice.js - Multi-tenant Tax invoice and receipt generator
import express from 'express';
import { queryOne, queryAll } from '../db.js';

const router = express.Router();

// GET /api/invoice/:orderId - Complete GST tax invoice details
router.get('/:orderId', (req, res) => {
  try {
    const order = queryOne(
      `SELECT * FROM orders WHERE id = ? OR order_code = ?`,
      [req.params.orderId, req.params.orderId]
    );

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    const table = order.table_id ? queryOne(`SELECT * FROM tables WHERE id = ?`, [order.table_id]) : null;

    // Lookup specific restaurant details
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [order.restaurant_id || 'rest_losteria']) || {
      name: "L'Osteria Gourmet Bistro",
      tagline: 'Artisanal Kitchen & Wood-Fired Oven',
      address: 'Plot 42, Galleria Boulevard, Indiranagar, Bengaluru - 560038',
      phone: '+91 98765 43210',
      email: 'orders@losteriabistro.com',
      gstin: '29ABCDE1234F1Z5',
      fssai: '11223344556677',
      currency: '₹',
      cgst_pct: 2.5,
      sgst_pct: 2.5,
      service_charge_pct: 0.0,
    };

    const invoiceNumber = `INV-${new Date(order.created_at).getFullYear()}-${order.order_code.replace('ORD-', '')}`;

    res.json({
      success: true,
      invoice: {
        invoice_number: invoiceNumber,
        invoice_date: order.created_at,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          tagline: restaurant.tagline,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
          gstin: restaurant.gstin,
          fssai: restaurant.fssai,
          currency: restaurant.currency || '₹',
        },
        order: {
          id: order.id,
          order_code: order.order_code,
          table_number: order.table_number,
          section: table ? table.section : 'Dine In',
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          status: order.status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: order.razorpay_payment_id,
          special_instructions: order.special_instructions,
        },
        items: items.map((it, idx) => ({
          sr_no: idx + 1,
          name: it.name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          amount: it.subtotal,
          notes: it.notes,
        })),
        breakdown: {
          subtotal: order.subtotal,
          cgst_rate: restaurant.cgst_pct,
          cgst_amount: order.cgst,
          sgst_rate: restaurant.sgst_pct,
          sgst_amount: order.sgst,
          service_charge_rate: restaurant.service_charge_pct,
          service_charge_amount: order.service_charge,
          grand_total: order.grand_total,
          currency: restaurant.currency || '₹',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
