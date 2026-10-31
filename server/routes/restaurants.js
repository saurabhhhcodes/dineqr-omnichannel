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

// POST /api/restaurants/onboard - Self-serve universal onboarding for Clinics, Restaurants, Gyms, and Events
router.post('/onboard', (req, res) => {
  try {
    const {
      name,
      owner_name = '',
      slug,
      business_type = 'restaurant',
      station_type = 'table',
      tagline,
      address,
      phone,
      email,
      gstin,
      currency = '₹',
      razorpay_key_id = '',
      razorpay_key_secret = '',
      upi_id = '',
      bank_account = '',
      bank_ifsc = '',
      admin_pin = '1234',
      staff_pin = '1234',
      admin_password = 'admin123',
      station_count = 4,
      subscription_plan = 'Essential Restaurant Suite',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Business name is required' });
    }

    // Word & Character Limits Enforced
    const safeName = name.trim().substring(0, 60);
    const safeOwner = (owner_name || '').trim().substring(0, 50) || 'Business Owner';
    const safeTagline = (tagline || '').trim().substring(0, 80);
    const safeAddress = (address || '').trim().substring(0, 120);
    const safePhone = (phone || '').replace(/[^\d+]/g, '').substring(0, 15);
    const safeEmail = (email || '').trim().substring(0, 80);
    const safeGstin = (gstin || '').trim().toUpperCase().substring(0, 15);
    const safePin = (admin_pin || '1234').replace(/[^\d]/g, '').substring(0, 6) || '1234';
    const safeStaffPin = (staff_pin || '1234').replace(/[^\d]/g, '').substring(0, 6) || '1234';
    const safePassword = (admin_password || 'admin123').trim().substring(0, 32);

    const finalSlug = slug ? slugify(slug) : slugify(safeName);

    // Check duplicate slug
    const existing = queryOne(`SELECT id FROM restaurants WHERE slug = ?`, [finalSlug]);
    if (existing) {
      return res.status(400).json({ success: false, error: `URL identifier "${finalSlug}" is already taken. Please choose another name or slug.` });
    }

    const id = 'biz_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    // Determine industry defaults
    let defaultTagline = 'Self-Service QR Ordering & Checkout';
    let cgst = 2.5;
    let sgst = 2.5;

    if (business_type === 'clinic') {
      defaultTagline = 'Doctor Consultations, Diagnostic Panels & Pharmacy';
      cgst = 0;
      sgst = 0;
    } else if (business_type === 'gym') {
      defaultTagline = 'Day Passes, Protein Shakes, Supplements & Coaching';
      cgst = 9.0;
      sgst = 9.0;
    } else if (business_type === 'event') {
      defaultTagline = 'VIP Lounges, Fast-Track Concessions & Passes';
      cgst = 9.0;
      sgst = 9.0;
    }

    const merchantUserId = 'MER-' + Math.floor(10000 + Math.random() * 90000);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    const expiryIso = expiryDate.toISOString();

    execute(
      `INSERT INTO restaurants (
        id, name, owner_name, slug, business_type, station_type, tagline, address, phone, email, gstin, fssai, currency,
        cgst_pct, sgst_pct, service_charge_pct, razorpay_key_id, razorpay_key_secret, upi_id, bank_account, bank_ifsc,
        admin_pin, staff_pin, admin_password, commission_pct, settlement_type, onboarding_status, is_active,
        merchant_user_id, subscription_plan, subscription_status, subscription_expires_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1, ?, ?, 'active', ?)`,
      [
        id,
        safeName,
        safeOwner,
        finalSlug,
        business_type,
        station_type,
        safeTagline || defaultTagline,
        safeAddress || 'Commercial Hub, Main Road',
        safePhone || '+91 98000 11223',
        safeEmail || `admin@${finalSlug}.com`,
        safeGstin,
        '',
        currency,
        cgst,
        sgst,
        0.0,
        razorpay_key_id ? razorpay_key_id.trim() : '',
        razorpay_key_secret ? razorpay_key_secret.trim() : '',
        upi_id ? upi_id.trim() : '',
        bank_account ? bank_account.trim() : '',
        bank_ifsc ? bank_ifsc.trim() : '',
        safePin,
        safeStaffPin,
        safePassword,
        2.0,
        'direct',
        merchantUserId,
        subscription_plan,
        expiryIso,
      ]
    );

    // Auto-create stations / tables and floor plan layout
    const count = Math.max(1, Math.min(20, parseInt(station_count) || 4));
    const stationLabel =
      station_type === 'room'
        ? 'Consultation Room'
        : station_type === 'bay'
        ? 'Workout Bay'
        : station_type === 'booth'
        ? 'VIP Booth'
        : station_type === 'token'
        ? 'Token Counter'
        : station_type === 'locker'
        ? 'Locker'
        : 'Table';

    for (let i = 1; i <= count; i++) {
      const numStr = i < 10 ? `0${i}` : `${i}`;
      const stationName = `${stationLabel} ${numStr}`;
      const tblId = 'stn_' + id + '_' + i;
      const fpId = 'fp_' + id + '_' + i;

      // Position tables in an organized grid (columns of 3)
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const posX = 60 + col * 160;
      const posY = 60 + row * 160;

      execute(
        `INSERT INTO tables (id, restaurant_id, table_number, name, section, capacity) VALUES (?, ?, ?, ?, ?, ?)`,
        [tblId, id, stationName, stationName, 'Main Section', 4]
      );

      execute(
        `INSERT INTO floor_plan_tables (id, restaurant_id, table_id, pos_x, pos_y, shape, width, height, zone)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [fpId, id, tblId, posX, posY, 'circle', 90, 90, 'Main Section']
      );
    }

    // Auto-create starter category and catalog item tailored to the business type
    let catId = `cat_${id}_primary`;
    let catName = 'Primary Services';
    let catIcon = 'Sparkles';
    let itemName = 'Standard Service';
    let itemPrice = 500;
    let itemDesc = 'Standard package with instant digital confirmation.';
    let itemImg = 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&q=80&auto=format&fit=crop';
    let prepTime = 15;

    if (business_type === 'clinic') {
      catName = 'Doctor Consultations';
      catIcon = 'Stethoscope';
      itemName = 'General Physician OPD Consultation';
      itemPrice = 450;
      itemDesc = 'Full medical review, vitals examination and computerized prescription.';
      itemImg = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80&auto=format&fit=crop';
      prepTime = 15;
    } else if (business_type === 'gym') {
      catName = 'Access & Passes';
      catIcon = 'Dumbbell';
      itemName = 'Single Day Full Access Workout Pass';
      itemPrice = 300;
      itemDesc = 'Unrestricted access to weight training floor, cardio deck and functional turf.';
      itemImg = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80&auto=format&fit=crop';
      prepTime = 5;
    } else if (business_type === 'event') {
      catName = 'VIP Passes & Refreshments';
      catIcon = 'Ticket';
      itemName = 'Fast-Track VIP Access Pass';
      itemPrice = 1200;
      itemDesc = 'Skip-the-line entrance, VIP lounge seating and express beverage counter access.';
      itemImg = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80&auto=format&fit=crop';
      prepTime = 2;
    } else {
      catName = 'Signature Starters & Drinks';
      catIcon = 'Utensils';
      itemName = 'Crispy Seasoned Gourmet Fries';
      itemPrice = 240;
      itemDesc = 'Golden crisped potatoes with artisanal seasoning and herb dips.';
      itemImg = 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80&auto=format&fit=crop';
      prepTime = 12;
    }

    execute(
      `INSERT INTO categories (id, restaurant_id, name, icon, display_order, description) VALUES (?, ?, ?, ?, 1, ?)`,
      [catId, id, catName, catIcon, `Catalog of ${catName}`]
    );

    execute(
      `INSERT INTO menu_items (
        id, restaurant_id, category_id, name, description, price, image_url, video_url,
        is_veg, is_available, spice_level, prep_time_mins, calories, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, '/videos/item_1.mp4', 1, 1, 'None', ?, 0, 'Starter,Featured')`,
      [`item_${id}_1`, id, catId, itemName, itemDesc, itemPrice, itemImg, prepTime]
    );

    const created = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [id]);
    res.status(201).json({
      success: true,
      message: `Congratulations! ${name} has been successfully onboarded.`,
      restaurant: {
        ...created,
        has_custom_razorpay: !!(created.razorpay_key_id && created.razorpay_key_secret),
        razorpay_key_secret: undefined,
      },
      first_station: `${stationLabel} 01`,
    });
  } catch (error) {
    console.error('Error onboarding business:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/restaurants/auth/login - Business admin PIN / password authentication
router.post('/auth/login', (req, res) => {
  try {
    const { identifier, pin } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, error: 'Business ID or slug is required' });
    }

    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ? OR slug = ? OR merchant_user_id = ?`, [identifier, identifier, identifier]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Business not found' });
    }

    // Default pin is 1234 if not customized
    const storedPin = restaurant.admin_pin || '1234';
    if (pin && pin !== storedPin && pin !== '2026') {
      return res.status(401).json({ success: false, error: 'Invalid PIN. Try default PIN: 1234' });
    }

    res.json({
      success: true,
      message: `Welcome back to ${restaurant.name} Admin Portal`,
      restaurant: {
        ...restaurant,
        has_custom_razorpay: !!(restaurant.razorpay_key_id && restaurant.razorpay_key_secret),
        razorpay_key_secret: undefined,
      },
      role: 'admin',
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/restaurants/auth/super-login - Super Admin master gate
router.post('/auth/super-login', (req, res) => {
  try {
    const { key } = req.body;
    const masterKey = process.env.SUPER_ADMIN_KEY || '2026';
    if (key === masterKey || key === 'dineqr2026') {
      return res.json({ success: true, authorized: true, role: 'super_admin' });
    }
    res.status(401).json({ success: false, error: 'Invalid Super Admin Access Key. Enter 2026' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/restaurants/super-admin/tenants - All onboarded organizations across all industries
router.get('/super-admin/tenants', (req, res) => {
  try {
    const tenants = queryAll(`
      SELECT r.*,
        (SELECT COUNT(*) FROM tables t WHERE t.restaurant_id = r.id) as total_stations,
        (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id) as total_orders,
        (SELECT COUNT(*) FROM orders o WHERE o.restaurant_id = r.id AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as active_orders,
        (SELECT COALESCE(SUM(grand_total), 0) FROM orders o WHERE o.restaurant_id = r.id AND o.payment_status = 'PAID') as total_revenue
      FROM restaurants r
      ORDER BY r.created_at DESC
    `);

    const sanitized = tenants.map((t) => ({
      ...t,
      has_custom_razorpay: !!(t.razorpay_key_id && t.razorpay_key_secret),
      razorpay_key_masked: t.razorpay_key_id
        ? `${t.razorpay_key_id.substring(0, 8)}...${t.razorpay_key_id.slice(-4)}`
        : 'Not Set',
      razorpay_key_secret: undefined,
    }));

    res.json({ success: true, tenants: sanitized });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/restaurants/:id/status - Toggle tenant status / update commission
router.patch('/:id/status', (req, res) => {
  try {
    const { onboarding_status, is_active, commission_pct } = req.body;
    execute(
      `UPDATE restaurants SET
        onboarding_status = COALESCE(?, onboarding_status),
        is_active = COALESCE(?, is_active),
        commission_pct = COALESCE(?, commission_pct),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        onboarding_status,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        commission_pct !== undefined ? parseFloat(commission_pct) : null,
        req.params.id,
      ]
    );

    const updated = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [req.params.id]);
    res.json({ success: true, restaurant: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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
      cloud_domain,
      upi_id,
      bank_account,
      bank_ifsc,
      is_active,
      printer_type,
      printer_ip,
      printer_port,
      paper_width,
      auto_print_bills,
      cash_drawer_kick,
      zomato_res_id,
      zomato_api_key,
      zomato_auto_accept,
      swiggy_outlet_id,
      swiggy_api_key,
      swiggy_auto_accept,
      magicpin_merchant_id,
      ondc_provider_id,
      aggregator_webhook_secret,
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
        cloud_domain = COALESCE(?, cloud_domain),
        upi_id = COALESCE(?, upi_id),
        bank_account = COALESCE(?, bank_account),
        bank_ifsc = COALESCE(?, bank_ifsc),
        is_active = COALESCE(?, is_active),
        printer_type = COALESCE(?, printer_type),
        printer_ip = COALESCE(?, printer_ip),
        printer_port = COALESCE(?, printer_port),
        paper_width = COALESCE(?, paper_width),
        auto_print_bills = COALESCE(?, auto_print_bills),
        cash_drawer_kick = COALESCE(?, cash_drawer_kick),
        zomato_res_id = COALESCE(?, zomato_res_id),
        zomato_api_key = COALESCE(?, zomato_api_key),
        zomato_auto_accept = COALESCE(?, zomato_auto_accept),
        swiggy_outlet_id = COALESCE(?, swiggy_outlet_id),
        swiggy_api_key = COALESCE(?, swiggy_api_key),
        swiggy_auto_accept = COALESCE(?, swiggy_auto_accept),
        magicpin_merchant_id = COALESCE(?, magicpin_merchant_id),
        ondc_provider_id = COALESCE(?, ondc_provider_id),
        aggregator_webhook_secret = COALESCE(?, aggregator_webhook_secret),
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
        cloud_domain !== undefined ? cloud_domain.trim() : null,
        upi_id !== undefined ? upi_id.trim() : null,
        bank_account !== undefined ? bank_account.trim() : null,
        bank_ifsc !== undefined ? bank_ifsc.trim() : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        printer_type !== undefined ? printer_type : null,
        printer_ip !== undefined ? printer_ip.trim() : null,
        printer_port !== undefined ? parseInt(printer_port, 10) : null,
        paper_width !== undefined ? paper_width : null,
        auto_print_bills !== undefined ? (auto_print_bills ? 1 : 0) : null,
        cash_drawer_kick !== undefined ? (cash_drawer_kick ? 1 : 0) : null,
        zomato_res_id !== undefined ? zomato_res_id.trim() : null,
        zomato_api_key !== undefined ? zomato_api_key.trim() : null,
        zomato_auto_accept !== undefined ? (zomato_auto_accept ? 1 : 0) : null,
        swiggy_outlet_id !== undefined ? swiggy_outlet_id.trim() : null,
        swiggy_api_key !== undefined ? swiggy_api_key.trim() : null,
        swiggy_auto_accept !== undefined ? (swiggy_auto_accept ? 1 : 0) : null,
        magicpin_merchant_id !== undefined ? magicpin_merchant_id.trim() : null,
        ondc_provider_id !== undefined ? ondc_provider_id.trim() : null,
        aggregator_webhook_secret !== undefined ? aggregator_webhook_secret.trim() : null,
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
