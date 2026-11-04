// server/routes/marketplace.js - Hyperlocal On-Demand Services & Trades Marketplace (Apronto Competitor)
import express from 'express';
import crypto from 'node:crypto';
import { queryOne, queryAll, execute } from '../db.js';

const router = express.Router();

// GET /api/marketplace/pros - List on-demand service providers & suppliers
router.get('/pros', (req, res) => {
  try {
    const { category, search } = req.query;
    let sql = `SELECT * FROM services_marketplace WHERE 1=1`;
    const params = [];

    if (category && category !== 'all') {
      sql += ` AND category = ?`;
      params.push(category);
    }

    if (search) {
      sql += ` AND (provider_name LIKE ? OR headline LIKE ? OR skills_json LIKE ? OR description LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    sql += ` ORDER BY rating DESC, distance_km ASC`;
    const pros = queryAll(sql, params).map((p) => {
      try {
        p.skills = JSON.parse(p.skills_json || '[]');
      } catch {
        p.skills = [];
      }
      return p;
    });

    res.json({ success: true, count: pros.length, pros });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/marketplace/pros/:id - Single provider details
router.get('/pros/:id', (req, res) => {
  try {
    const pro = queryOne(`SELECT * FROM services_marketplace WHERE id = ?`, [req.params.id]);
    if (!pro) {
      return res.status(404).json({ success: false, error: 'Provider not found' });
    }
    try {
      pro.skills = JSON.parse(pro.skills_json || '[]');
    } catch {
      pro.skills = [];
    }
    res.json({ success: true, pro });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/marketplace/onboard - 60-second mobile self-serve pro registration
router.post('/onboard', (req, res) => {
  try {
    const {
      provider_name,
      provider_phone,
      category = 'carpenter',
      headline,
      description,
      hourly_rate = 0,
      fixed_price = 199,
      pricing_unit = 'visit',
      skills = [],
      location_area = 'Bengaluru',
      porter_eligible = 1,
    } = req.body;

    if (!provider_name || !provider_phone) {
      return res.status(400).json({ success: false, error: 'Provider name and phone number are required' });
    }

    const proId = `srv_${category}_${Date.now()}`;
    const skillsJson = typeof skills === 'string' ? skills : JSON.stringify(skills);

    execute(
      `INSERT INTO services_marketplace (
        id, provider_name, provider_phone, category, headline, description,
        hourly_rate, fixed_price, pricing_unit, rating, reviews_count, distance_km,
        availability_status, skills_json, location_area, porter_eligible, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, 0.8, 'AVAILABLE', ?, ?, ?, ?)`,
      [
        proId,
        provider_name.trim(),
        provider_phone.trim(),
        category,
        headline?.trim() || `${provider_name} Professional Services`,
        description?.trim() || 'Verified local service expert.',
        parseFloat(hourly_rate) || 0,
        parseFloat(fixed_price) || 199,
        pricing_unit.trim(),
        skillsJson,
        location_area.trim(),
        porter_eligible ? 1 : 0,
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&q=80',
      ]
    );

    const created = queryOne(`SELECT * FROM services_marketplace WHERE id = ?`, [proId]);
    res.json({
      success: true,
      message: `${provider_name} onboarded successfully! Your service is live on the marketplace.`,
      pro: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/marketplace/book - Book a pro or order materials
router.post('/book', (req, res) => {
  try {
    const {
      service_id,
      customer_name,
      customer_phone,
      customer_address,
      scheduled_at,
      instructions = '',
      payment_method = 'UPI / Razorpay',
      total_amount,
      quantity = 1,
    } = req.body;

    if (!customer_name || !customer_phone || !customer_address) {
      return res.status(400).json({ success: false, error: 'Customer name, phone, and address are required' });
    }

    const pro = queryOne(`SELECT * FROM services_marketplace WHERE id = ?`, [service_id]);
    const finalAmount = total_amount || (pro ? pro.fixed_price * (quantity || 1) : 299);
    const bookingId = `bkg_${Date.now()}`;
    const bookingCode = `SRV-${Math.floor(1000 + Math.random() * 9000)}`;

    execute(
      `INSERT INTO service_bookings (
        id, booking_code, service_id, provider_name, customer_name, customer_phone,
        customer_address, category, scheduled_at, instructions, status, total_amount,
        payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?, 'PAID', ?)`,
      [
        bookingId,
        bookingCode,
        service_id || 'srv_general',
        pro?.provider_name || 'Assigned Service Specialist',
        customer_name.trim(),
        customer_phone.trim(),
        customer_address.trim(),
        pro?.category || 'general',
        scheduled_at || 'Immediate / Within 60 Mins',
        instructions.trim(),
        finalAmount,
        payment_method,
      ]
    );

    const booking = queryOne(`SELECT * FROM service_bookings WHERE id = ?`, [bookingId]);
    res.json({
      success: true,
      message: `Booking confirmed with ${pro?.provider_name || 'specialist'}! Booking Code: ${bookingCode}`,
      booking,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/marketplace/bookings - List all bookings
router.get('/bookings', (req, res) => {
  try {
    const { phone } = req.query;
    let sql = `SELECT * FROM service_bookings`;
    const params = [];
    if (phone) {
      sql += ` WHERE customer_phone = ?`;
      params.push(phone);
    }
    sql += ` ORDER BY created_at DESC LIMIT 50`;
    const bookings = queryAll(sql, params);
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/marketplace/bookings/:id/status - Update booking lifecycle
router.patch('/bookings/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['REQUESTED', 'CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    execute(`UPDATE service_bookings SET status = ? WHERE id = ?`, [status, req.params.id]);
    const updated = queryOne(`SELECT * FROM service_bookings WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: `Booking updated to ${status}`, booking: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
