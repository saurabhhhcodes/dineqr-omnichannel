// server/routes/menu.js - Menu categories and items API (Multi-Tenant)
import express from 'express';
import { queryAll, queryOne, execute } from '../db.js';

const router = express.Router();

// GET /api/menu - Get categories and items for a restaurant
router.get('/', (req, res) => {
  try {
    const { vegOnly, category, search, admin } = req.query;
    const restId = req.query.restaurant_id || req.query.restaurant || 'rest_losteria';

    let itemQuery = `SELECT * FROM menu_items WHERE 1=1`;
    const params = [];

    // Filter by restaurant (or restaurant slug)
    itemQuery += ` AND (restaurant_id = ? OR restaurant_id = (SELECT id FROM restaurants WHERE slug = ?))`;
    params.push(restId, restId);

    // Filter available only unless admin view
    if (admin !== 'true') {
      itemQuery += ` AND is_available = 1`;
    }

    if (vegOnly === 'true') {
      itemQuery += ` AND is_veg = 1`;
    }

    if (category && category !== 'all') {
      itemQuery += ` AND category_id = ?`;
      params.push(category);
    }

    if (search && search.trim()) {
      itemQuery += ` AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    itemQuery += ` ORDER BY category_id, name ASC`;

    const items = queryAll(itemQuery, params);

    // Fetch categories for this restaurant
    const categories = queryAll(
      `SELECT * FROM categories
       WHERE restaurant_id = ? OR restaurant_id = (SELECT id FROM restaurants WHERE slug = ?)
       ORDER BY display_order ASC`,
      [restId, restId]
    );

    // Group items by category
    const grouped = categories.map((cat) => ({
      ...cat,
      items: items.filter((item) => item.category_id === cat.id),
    }));

    res.json({
      success: true,
      categories,
      items,
      grouped: grouped.filter((g) => g.items.length > 0 || admin === 'true'),
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/menu/categories - Categories list for a restaurant
router.get('/categories', (req, res) => {
  try {
    const restId = req.query.restaurant_id || req.query.restaurant || 'rest_losteria';
    const categories = queryAll(
      `SELECT * FROM categories
       WHERE restaurant_id = ? OR restaurant_id = (SELECT id FROM restaurants WHERE slug = ?)
       ORDER BY display_order ASC`,
      [restId, restId]
    );
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/menu/categories - Add a new category
router.post('/categories', (req, res) => {
  try {
    const { name, icon, description, restaurant_id } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Category name is required' });
    }

    const restId = restaurant_id || 'rest_losteria';
    const id = 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    const maxOrder = queryOne(
      `SELECT COALESCE(MAX(display_order), 0) as max_ord FROM categories WHERE restaurant_id = ?`,
      [restId]
    )?.max_ord || 0;

    execute(
      `INSERT INTO categories (id, restaurant_id, name, icon, display_order, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, restId, name.trim(), icon || 'Utensils', maxOrder + 1, description || '']
    );

    const created = queryOne(`SELECT * FROM categories WHERE id = ?`, [id]);
    res.status(201).json({ success: true, category: created });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/menu/items/:id - Single item
router.get('/items/:id', (req, res) => {
  try {
    const item = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/menu/items/:id/availability - Toggle item availability (sold out / in stock)
router.patch('/items/:id/availability', (req, res) => {
  try {
    const item = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const newStatus = typeof req.body.is_available === 'boolean'
      ? (req.body.is_available ? 1 : 0)
      : (item.is_available ? 0 : 1);

    execute(`UPDATE menu_items SET is_available = ? WHERE id = ?`, [newStatus, req.params.id]);
    const updated = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);

    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/menu/items/:id/price - Instant quick price update
router.patch('/items/:id/price', (req, res) => {
  try {
    const { price } = req.body;
    if (price === undefined || isNaN(parseFloat(price))) {
      return res.status(400).json({ success: false, error: 'Valid price number is required' });
    }

    const item = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const numericPrice = Math.max(0, parseFloat(price));
    execute(`UPDATE menu_items SET price = ? WHERE id = ?`, [numericPrice, req.params.id]);
    const updated = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);

    res.json({ success: true, message: `Price updated to ₹${numericPrice}`, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/menu/items - Add a new dish to the digital QR menu
router.post('/items', (req, res) => {
  try {
    const {
      restaurant_id,
      category_id,
      name,
      description,
      price,
      image_url,
      video_url,
      is_veg,
      spice_level,
      prep_time_mins,
      calories,
      tags,
    } = req.body;

    if (!name || price === undefined || !category_id) {
      return res.status(400).json({ success: false, error: 'Name, price, and category are required' });
    }

    const restId = restaurant_id || 'rest_losteria';
    const id = 'item_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

    execute(
      `INSERT INTO menu_items (
        id, restaurant_id, category_id, name, description, price, image_url, video_url,
        is_veg, is_available, spice_level, prep_time_mins, calories, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        id,
        restId,
        category_id,
        name.trim(),
        description || '',
        parseFloat(price),
        image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop',
        video_url || '',
        is_veg ? 1 : 0,
        spice_level || 'None',
        parseInt(prep_time_mins || '15', 10),
        parseInt(calories || '0', 10),
        tags || '',
      ]
    );

    const created = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [id]);
    res.status(201).json({ success: true, message: 'New dish added to menu successfully', item: created });
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/menu/items/:id - Update dish
router.put('/items/:id', (req, res) => {
  try {
    const item = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    const {
      category_id,
      name,
      description,
      price,
      image_url,
      video_url,
      is_veg,
      is_available,
      spice_level,
      prep_time_mins,
      calories,
      tags,
    } = req.body;

    execute(
      `UPDATE menu_items SET
        category_id = COALESCE(?, category_id),
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        price = COALESCE(?, price),
        image_url = COALESCE(?, image_url),
        video_url = COALESCE(?, video_url),
        is_veg = COALESCE(?, is_veg),
        is_available = COALESCE(?, is_available),
        spice_level = COALESCE(?, spice_level),
        prep_time_mins = COALESCE(?, prep_time_mins),
        calories = COALESCE(?, calories),
        tags = COALESCE(?, tags)
       WHERE id = ?`,
      [
        category_id,
        name ? name.trim() : null,
        description,
        price !== undefined ? parseFloat(price) : null,
        image_url,
        video_url,
        is_veg !== undefined ? (is_veg ? 1 : 0) : null,
        is_available !== undefined ? (is_available ? 1 : 0) : null,
        spice_level,
        prep_time_mins !== undefined ? parseInt(prep_time_mins, 10) : null,
        calories !== undefined ? parseInt(calories, 10) : null,
        tags,
        req.params.id,
      ]
    );

    const updated = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Dish updated successfully', item: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/menu/items/:id - Delete dish
router.delete('/items/:id', (req, res) => {
  try {
    const item = queryOne(`SELECT * FROM menu_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    execute(`DELETE FROM menu_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: `Dish "${item.name}" removed from menu` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
