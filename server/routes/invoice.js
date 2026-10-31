// server/routes/invoice.js - Multi-tenant Tax invoice, ESC/POS hardware billing machine integration
import express from 'express';
import net from 'node:net';
import { queryOne, queryAll, execute } from '../db.js';

const router = express.Router();

// Helper to format text line with left and right columns
function formatRow(left, right, width = 42) {
  const l = String(left || '');
  const r = String(right || '');
  const spaces = Math.max(1, width - l.length - r.length);
  return l + ' '.repeat(spaces) + r;
}

// Helper to generate raw ESC/POS binary buffer
function generateEscPosBuffer(order, items, restaurant, widthChars = 42) {
  const chunks = [];

  // ESC @: Initialize printer
  chunks.push(Buffer.from([0x1b, 0x40]));

  // ESC a 1: Center alignment
  chunks.push(Buffer.from([0x1b, 0x61, 0x01]));

  // GS ! 0x11: Double Height & Double Width for title
  chunks.push(Buffer.from([0x1d, 0x21, 0x11]));
  chunks.push(Buffer.from(`${restaurant.name || "L'Osteria Bistro"}\n`, 'utf8'));

  // Normal font
  chunks.push(Buffer.from([0x1d, 0x21, 0x00]));
  if (restaurant.tagline) {
    chunks.push(Buffer.from(`${restaurant.tagline}\n`, 'utf8'));
  }
  if (restaurant.address) {
    chunks.push(Buffer.from(`${restaurant.address}\n`, 'utf8'));
  }
  chunks.push(Buffer.from(`Phone: ${restaurant.phone || '+91 98765 43210'}\n`, 'utf8'));
  if (restaurant.gstin) {
    chunks.push(Buffer.from(`GSTIN: ${restaurant.gstin} | FSSAI: ${restaurant.fssai || 'N/A'}\n`, 'utf8'));
  }

  // Divider line
  const divider = '='.repeat(widthChars) + '\n';
  chunks.push(Buffer.from(divider, 'utf8'));

  // Align Left
  chunks.push(Buffer.from([0x1b, 0x61, 0x00]));

  // Token or Table Header (Bold)
  chunks.push(Buffer.from([0x1b, 0x45, 0x01])); // Bold ON
  const stationOrToken = order.token_number
    ? `TOKEN NUMBER: #${order.token_number}`
    : `STATION / TABLE: ${order.table_number}`;
  chunks.push(Buffer.from(`${stationOrToken}\n`, 'utf8'));
  chunks.push(Buffer.from([0x1b, 0x45, 0x00])); // Bold OFF

  chunks.push(Buffer.from(formatRow(`Order: ${order.order_code}`, `Date: ${new Date(order.created_at).toLocaleDateString()}`, widthChars) + '\n', 'utf8'));
  chunks.push(Buffer.from(formatRow(`Customer: ${order.customer_name || 'Guest'}`, `Time: ${new Date(order.created_at).toLocaleTimeString()}`, widthChars) + '\n', 'utf8'));
  if (order.customer_phone) {
    chunks.push(Buffer.from(`Phone: ${order.customer_phone}\n`, 'utf8'));
  }

  // Divider
  chunks.push(Buffer.from('-'.repeat(widthChars) + '\n', 'utf8'));

  // Column Headers: ITEM | QTY | RATE | TOTAL
  chunks.push(Buffer.from([0x1b, 0x45, 0x01]));
  chunks.push(Buffer.from(formatRow('ITEM (QTY x RATE)', 'TOTAL', widthChars) + '\n', 'utf8'));
  chunks.push(Buffer.from([0x1b, 0x45, 0x00]));
  chunks.push(Buffer.from('-'.repeat(widthChars) + '\n', 'utf8'));

  // Line items
  for (const it of items) {
    const leftCol = `${it.name} (${it.quantity} x ${it.unit_price})`;
    const rightCol = `INR ${it.subtotal.toFixed(2)}`;
    chunks.push(Buffer.from(formatRow(leftCol, rightCol, widthChars) + '\n', 'utf8'));
    if (it.notes) {
      chunks.push(Buffer.from(`  * ${it.notes}\n`, 'utf8'));
    }
  }

  chunks.push(Buffer.from('-'.repeat(widthChars) + '\n', 'utf8'));

  // Financial Breakdown
  chunks.push(Buffer.from(formatRow('Item Subtotal:', `INR ${order.subtotal.toFixed(2)}`, widthChars) + '\n', 'utf8'));
  chunks.push(Buffer.from(formatRow(`CGST (${restaurant.cgst_pct}%):`, `INR ${order.cgst.toFixed(2)}`, widthChars) + '\n', 'utf8'));
  chunks.push(Buffer.from(formatRow(`SGST (${restaurant.sgst_pct}%):`, `INR ${order.sgst.toFixed(2)}`, widthChars) + '\n', 'utf8'));

  chunks.push(Buffer.from('='.repeat(widthChars) + '\n', 'utf8'));

  // GRAND TOTAL (Double Height + Bold)
  chunks.push(Buffer.from([0x1b, 0x45, 0x01])); // Bold ON
  chunks.push(Buffer.from([0x1d, 0x21, 0x01])); // Double height
  chunks.push(Buffer.from(formatRow('GRAND TOTAL:', `INR ${order.grand_total.toFixed(2)}`, widthChars) + '\n', 'utf8'));
  chunks.push(Buffer.from([0x1d, 0x21, 0x00])); // Normal
  chunks.push(Buffer.from([0x1b, 0x45, 0x00])); // Bold OFF

  chunks.push(Buffer.from('='.repeat(widthChars) + '\n', 'utf8'));

  // Payment Status & Method
  chunks.push(Buffer.from(formatRow(`Payment Method:`, `${order.payment_method || 'Online UPI'}`, widthChars) + '\n', 'utf8'));
  chunks.push(Buffer.from(formatRow(`Payment Status:`, `${order.payment_status || 'PAID'}`, widthChars) + '\n', 'utf8'));
  if (order.razorpay_payment_id) {
    chunks.push(Buffer.from(`Ref: ${order.razorpay_payment_id}\n`, 'utf8'));
  }

  // Footer / Greeting
  chunks.push(Buffer.from([0x1b, 0x61, 0x01])); // Center
  chunks.push(Buffer.from(`\nThank you for dining with us!\nPlease visit again\n`, 'utf8'));
  chunks.push(Buffer.from(`*** TAX INVOICE ***\n\n\n\n`, 'utf8'));

  // GS V 66 0: Paper Cut
  chunks.push(Buffer.from([0x1d, 0x56, 0x42, 0x00]));

  // ESC p 0 25 250: Cash Drawer Kick (Pin 2)
  chunks.push(Buffer.from([0x1b, 0x70, 0x00, 0x19, 0xfa]));

  return Buffer.concat(chunks);
}

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
      printer_type: 'browser',
      paper_width: '80mm',
    };

    const invoiceNumber = `INV-${new Date(order.created_at).getFullYear()}-${order.order_code.replace('ORD-', '')}`;

    res.json({
      success: true,
      invoice: {
        invoice_number: invoiceNumber,
        invoice_date: order.created_at,
        token_number: order.token_number || null,
        is_counter_order: !!order.is_counter_order,
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
          printer_type: restaurant.printer_type || 'browser',
          paper_width: restaurant.paper_width || '80mm',
        },
        order: {
          id: order.id,
          order_code: order.order_code,
          table_number: order.table_number,
          section: table ? table.section : (order.is_counter_order ? 'Counter Pickup' : 'Dine In'),
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          status: order.status,
          payment_status: order.payment_status,
          payment_method: order.payment_method,
          razorpay_order_id: order.razorpay_order_id,
          razorpay_payment_id: order.razorpay_payment_id,
          special_instructions: order.special_instructions,
          printed_at: order.printed_at,
          print_count: order.print_count || 0,
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

// GET /api/invoice/:orderId/escpos - Raw ESC/POS binary stream for thermal billing machine
router.get('/:orderId/escpos', (req, res) => {
  try {
    const order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [req.params.orderId, req.params.orderId]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [order.restaurant_id || 'rest_losteria']) || {};
    const width = req.query.width === '58mm' ? 32 : 42;

    const buffer = generateEscPosBuffer(order, items, restaurant, width);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="bill-${order.order_code}.bin"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/invoice/:orderId/print - Hardware Billing Machine Dispatcher
router.post('/:orderId/print', async (req, res) => {
  try {
    let order = null;
    let items = [];

    if (req.params.orderId === 'test') {
      order = {
        id: 'ord_test_printer',
        order_code: 'TEST-80MM',
        table_number: 'Hardware Test Station',
        customer_name: 'POS Terminal Test',
        created_at: new Date().toISOString(),
        payment_method: 'Thermal Link Check',
        payment_status: 'PAID',
        subtotal: 100.0,
        cgst: 2.5,
        sgst: 2.5,
        service_charge: 0,
        grand_total: 105.0,
        token_number: 99,
        is_counter_order: 1,
      };
      items = [
        { name: 'POS Thermal Feed Test', quantity: 1, unit_price: 50.0, subtotal: 50.0 },
        { name: 'ESC/POS Auto-Cutter Test', quantity: 1, unit_price: 50.0, subtotal: 50.0 },
      ];
    } else {
      order = queryOne(`SELECT * FROM orders WHERE id = ? OR order_code = ?`, [req.params.orderId, req.params.orderId]);
      if (!order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }
      items = queryAll(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
    }

    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [order.restaurant_id || 'rest_losteria']) || {};

    const { target_ip, target_port } = req.body;
    const printerIp = target_ip || restaurant.printer_ip;
    const printerPort = parseInt(target_port || restaurant.printer_port || 9100, 10);
    const paperWidth = restaurant.paper_width === '58mm' ? 32 : 42;

    // Generate ESC/POS buffer
    const escposBuffer = generateEscPosBuffer(order, items, restaurant, paperWidth);

    let networkDispatch = false;
    let networkError = null;

    // If a physical network billing machine IP is configured, dispatch over TCP port 9100
    if (printerIp && printerIp.trim().length > 0) {
      await new Promise((resolve) => {
        const client = new net.Socket();
        client.setTimeout(2500);

        client.connect(printerPort, printerIp.trim(), () => {
          client.write(escposBuffer, () => {
            networkDispatch = true;
            client.end();
            resolve();
          });
        });

        client.on('error', (err) => {
          networkError = err.message;
          client.destroy();
          resolve();
        });

        client.on('timeout', () => {
          networkError = 'Printer TCP socket timed out';
          client.destroy();
          resolve();
        });
      });
    }

    // Update order print stats
    let printCount = 1;
    let printedAt = new Date().toISOString();

    if (order.id !== 'ord_test_printer') {
      execute(
        `UPDATE orders SET printed_at = CURRENT_TIMESTAMP, print_count = COALESCE(print_count, 0) + 1 WHERE id = ?`,
        [order.id]
      );
      const updated = queryOne(`SELECT printed_at, print_count FROM orders WHERE id = ?`, [order.id]);
      if (updated) {
        printCount = updated.print_count;
        printedAt = updated.printed_at;
      }
    }

    res.json({
      success: true,
      message: networkDispatch
        ? `Bill dispatched to thermal printer at ${printerIp}:${printerPort}`
        : 'Bill queued for browser/kiosk print spooler',
      network_dispatch: networkDispatch,
      network_error: networkError,
      printed_at: printedAt,
      print_count: printCount,
      order_code: order.order_code,
      escpos_bytes_count: escposBuffer.length,
    });
  } catch (error) {
    console.error('Error in bill printer dispatcher:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
