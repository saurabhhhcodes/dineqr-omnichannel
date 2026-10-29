// server/routes/restaurants.js - Multi-restaurant management & Super Admin API
import express from 'express';
import { queryAll, queryOne, execute } from '../db.js';

const router = express.Router();

// Helper to generate clean slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// GET /api/restaurants - List all restaurants with metrics
router.get('/', (req, res) => {
  try {
    const restaurants = queryAll(`
      SELECT r.*,
        (SELECT COUNT(*) FROM tables t WHERE t.restaurant_id = r.id) as total_tables,
        (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id) as total_orders,
        (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as active_orders,
        (SELECT COALESCE(SUM(grand_total), 0) FROM orders o WHERE o.restaurant_id = r.id AND o.payment_status = 'PAID') as total_revenue
      FROM restaurants r
      ORDER BY r.created_at ASC
    `);

    // Hide secret from public list for security
    const sanitized = restaurants.map((r) => ({
      ...r,
      has_custom_razorpay: !!(r.razorpay_key_id && r.razorpay_key_secret),
      razorpay_key_secret: undefined, // Never expose secret key
    }));

    res.json({ success: true, restaurants: sanitized });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/restaurants/:idOrSlug - Single restaurant details
router.get('/:idOrSlug', (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const restaurant = queryOne(
      `SELECT * FROM restaurants WHERE id = ? OR slug = ?`,
      [idOrSlug, idOrSlug]
    );

    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const stats = queryOne(`
      SELECT
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status NOT IN ('COMPLETED', 'CANCELLED') THEN 1 END) as active_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN grand_total ELSE 0 END), 0) as total_revenue
      FROM orders
      WHERE restaurant_id = ?
    `, [restaurant.id]);

    const sanitized = {
      ...restaurant,
      has_custom_razorpay: !!(restaurant.razorpay_key_id && restaurant.razorpay_key_secret),
      razorpay_key_secret: undefined, // mask secret
      stats: stats || { total_orders: 0, active_orders: 0, total_revenue: 0 },
    };

    res.json({ success: true, restaurant: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/restaurants - Register a new restaurant / cafe
router.post('/', (req, res) => {
  try {
    const {
      name,
      slug,
      tagline,
      address,
      phone,
      email,
      gstin,
      fssai,
      currency,
      cgst_pct,
      sgst_pct,
      service_charge_pct,
      razorpay_key_id,
      razorpay_key_secret,
      seed_starter_data,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Restaurant name is required' });
    }

    const finalSlug = slug ? slugify(slug) : slugify(name);

    // Check duplicate slug
    const existing = queryOne(`SELECT id FROM restaurants WHERE slug = ?`, [finalSlug]);
    if (existing) {
      return res.status(400).json({ success: false, error: `Restaurant slug "${finalSlug}" is already taken` });
    }

    const id = 'rest_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    execute(
      `INSERT INTO restaurants (
        id, name, slug, tagline, address, phone, email, gstin, fssai, currency,
        cgst_pct, sgst_pct, service_charge_pct, razorpay_key_id, razorpay_key_secret, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        id,
        name,
        finalSlug,
        tagline || 'Artisanal Kitchen & Cafe',
        address || 'City Center Mall, Food Court, Bengaluru',
        phone || '+91 98000 00000',
        email || `orders@${finalSlug}.com`,
        gstin || '',
        fssai || '',
        currency || '₹',
        cgst_pct !== undefined ? parseFloat(cgst_pct) : 2.5,
        sgst_pct !== undefined ? parseFloat(sgst_pct) : 2.5,
        service_charge_pct !== undefined ? parseFloat(service_charge_pct) : 0.0,
        razorpay_key_id ? razorpay_key_id.trim() : '',
        razorpay_key_secret ? razorpay_key_secret.trim() : '',
      ]
    );

    // Seed starter tables & categories if requested
    if (seed_starter_data !== false) {
      // Starter Tables
      const starterTables = [
        { table_number: 'Table 01', section: 'Main Dining', capacity: 2 },
        { table_number: 'Table 02', section: 'Main Dining', capacity: 4 },
        { table_number: 'Table 03', section: 'Window Corner', capacity: 4 },
        { table_number: 'Table 04', section: 'Patio & Garden', capacity: 6 },
      ];
      for (const t of starterTables) {
        const tblId = 'tbl_' + id + '_' + t.table_number.toLowerCase().replace(/\s+/g, '');
        execute(
          `INSERT INTO tables (id, restaurant_id, table_number, name, section, capacity) VALUES (?, ?, ?, ?, ?, ?)`,
          [tblId, id, t.table_number, t.table_number, t.section, t.capacity]
        );
      }

      // Starter Categories
      const starterCategories = [
        { id: `cat_${id}_starters`, name: 'Appetizers & Starters', icon: 'Utensils', order: 1 },
        { id: `cat_${id}_mains`, name: 'Chef Specialties & Mains', icon: 'Soup', order: 2 },
        { id: `cat_${id}_beverages`, name: 'Shakes & Coolers', icon: 'GlassWater', order: 3 },
      ];
      for (const c of starterCategories) {
        execute(
          `INSERT INTO categories (id, restaurant_id, name, icon, display_order, description) VALUES (?, ?, ?, ?, ?, ?)`,
          [c.id, id, c.name, c.icon, c.order, `Delicious selection of ${c.name}`]
        );
      }

      // Starter sample item
      execute(
        `INSERT INTO menu_items (id, restaurant_id, category_id, name, description, price, image_url, is_veg, is_available, spice_level, prep_time_mins, calories, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, 1, 'Mild', 15, 380, 'Signature,Popular')`,
        [
          `item_${id}_1`,
          id,
          `cat_${id}_starters`,
          'Artisan Crispy Fries with Truffle Mayo',
          'Golden crisped French fries served with house-made herb seasoning and truffle dip.',
          260,
          'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&q=80&auto=format&fit=crop',
        ]
      );
    }

    const created = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [id]);
    res.status(201).json({
      success: true,
      message: `Restaurant "${name}" created successfully`,
      restaurant: {
        ...created,
        razorpay_key_secret: undefined,
      },
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/restaurants/:id - Update restaurant profile & Razorpay keys
router.put('/:id', (req, res) => {
  try {
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [req.params.id]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const {
      name,
      tagline,
      address,
      phone,
      email,
      gstin,
      fssai,
      currency,
      cgst_pct,
      sgst_pct,
      service_charge_pct,
      razorpay_key_id,
      razorpay_key_secret,
      is_active,
    } = req.body;

    execute(
      `UPDATE restaurants SET
        name = COALESCE(?, name),
        tagline = COALESCE(?, tagline),
        address = COALESCE(?, address),
        phone = COALESCE(?, phone),
        email = COALESCE(?, email),
        gstin = COALESCE(?, gstin),
        fssai = COALESCE(?, fssai),
        currency = COALESCE(?, currency),
        cgst_pct = COALESCE(?, cgst_pct),
        sgst_pct = COALESCE(?, sgst_pct),
        service_charge_pct = COALESCE(?, service_charge_pct),
        razorpay_key_id = COALESCE(?, razorpay_key_id),
        razorpay_key_secret = COALESCE(?, razorpay_key_secret),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name,
        tagline,
        address,
        phone,
        email,
        gstin,
        fssai,
        currency,
        cgst_pct !== undefined ? parseFloat(cgst_pct) : null,
        sgst_pct !== undefined ? parseFloat(sgst_pct) : null,
        service_charge_pct !== undefined ? parseFloat(service_charge_pct) : null,
        razorpay_key_id !== undefined ? razorpay_key_id.trim() : null,
        razorpay_key_secret !== undefined && razorpay_key_secret.trim() ? razorpay_key_secret.trim() : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        req.params.id,
      ]
    );

    const updated = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [req.params.id]);
    res.json({
      success: true,
      message: 'Restaurant settings and payment credentials updated successfully',
      restaurant: {
        ...updated,
        has_custom_razorpay: !!(updated.razorpay_key_id && updated.razorpay_key_secret),
        razorpay_key_secret: undefined,
      },
    });
  } catch (error) {
    console.error('Error updating restaurant:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/restaurants/:id - Delete a restaurant
router.delete('/:id', (req, res) => {
  try {
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [req.params.id]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    // Don't delete last restaurant
    const count = queryOne(`SELECT COUNT(*) as count FROM restaurants`).count;
    if (count <= 1) {
      return res.status(400).json({ success: false, error: 'Cannot delete the only existing restaurant' });
    }

    // Cascade delete related entities
    execute(`DELETE FROM menu_items WHERE restaurant_id = ?`, [req.params.id]);
    execute(`DELETE FROM categories WHERE restaurant_id = ?`, [req.params.id]);
    execute(`DELETE FROM tables WHERE restaurant_id = ?`, [req.params.id]);
    execute(`DELETE FROM restaurants WHERE id = ?`, [req.params.id]);

    res.json({ success: true, message: `Restaurant ${restaurant.name} and its assets deleted` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/super-admin/stats - Super admin overall platform metrics
router.get('/super-admin/overview', (req, res) => {
  try {
    const restaurantsCount = queryOne(`SELECT COUNT(*) as total FROM restaurants`).total;
    const ordersCount = queryOne(`SELECT COUNT(*) as total FROM orders`).total;
    const activeOrders = queryOne(`SELECT COUNT(*) as total FROM orders WHERE status NOT IN ('COMPLETED', 'CANCELLED')`).total;
    const totalGmv = queryOne(`SELECT COALESCE(SUM(grand_total), 0) as total FROM orders WHERE payment_status = 'PAID'`).total;
    const totalTables = queryOne(`SELECT COUNT(*) as total FROM tables`).total;

    const topRestaurants = queryAll(`
      SELECT r.id, r.name, r.slug,
        COUNT(o.id) as orders_count,
        COALESCE(SUM(o.grand_total), 0) as total_volume
      FROM restaurants r
      LEFT JOIN orders o ON o.restaurant_id = r.id AND o.payment_status = 'PAID'
      GROUP BY r.id
      ORDER BY total_volume DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        total_restaurants: restaurantsCount,
        total_orders: ordersCount,
        active_orders: activeOrders,
        total_gmv: totalGmv,
        total_tables: totalTables,
        top_restaurants: topRestaurants,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
