// server/routes/porter.js - Porter Logistics & Tempo Dispatch Integration for Materials & Bulky Goods
import express from 'express';
import crypto from 'node:crypto';
import { queryOne, queryAll, execute } from '../db.js';

const router = express.Router();

const VEHICLE_SPECS = {
  two_wheeler: {
    id: 'two_wheeler',
    name: 'Porter 2-Wheeler Courier',
    capacity_kg: 20,
    base_fare: 40,
    per_km_rate: 12,
    base_km: 2,
    description: 'Fast delivery for toolboxes, chef supplies, and spare electrical components.',
  },
  three_wheeler: {
    id: 'three_wheeler',
    name: 'Porter 3-Wheeler Open / Closed',
    capacity_kg: 350,
    base_fare: 150,
    per_km_rate: 20,
    base_km: 2,
    description: 'Ideal for bathroom sanitary fixtures, paint buckets, and light furniture.',
  },
  tata_ace: {
    id: 'tata_ace',
    name: 'Porter Tata Ace Mini-Truck',
    capacity_kg: 750,
    base_fare: 280,
    per_km_rate: 26,
    base_km: 2,
    description: 'Perfect for 10-15 bags of UltraTech cement, timber sheets, and large wardrobes.',
  },
  pickup_8ft: {
    id: 'pickup_8ft',
    name: 'Porter 8ft Large Pickup',
    capacity_kg: 1200,
    base_fare: 420,
    per_km_rate: 34,
    base_km: 2,
    description: 'Heavy construction cargo, bulk river sand, AAC blocks, and commercial catering kits.',
  },
};

// POST /api/porter/estimate - Get instant delivery fare estimate
router.post('/estimate', (req, res) => {
  try {
    const {
      pickup_address = 'Indiranagar, Bengaluru',
      drop_address = 'Koramangala, Bengaluru',
      vehicle_type = 'tata_ace',
      cargo_weight_kg = 150,
      distance_km = 4.8,
    } = req.body;

    const spec = VEHICLE_SPECS[vehicle_type] || VEHICLE_SPECS.tata_ace;
    const dist = Math.max(1, parseFloat(distance_km) || 4.5);
    const extraKm = Math.max(0, dist - spec.base_km);
    const estimatedCost = Math.round(spec.base_fare + extraKm * spec.per_km_rate);
    const etaMinutes = Math.round(15 + dist * 3.5);

    res.json({
      success: true,
      pickup_address,
      drop_address,
      distance_km: dist,
      cargo_weight_kg,
      vehicle: {
        type: spec.id,
        name: spec.name,
        capacity_kg: spec.capacity_kg,
        description: spec.description,
      },
      pricing: {
        base_fare: spec.base_fare,
        per_km_rate: spec.per_km_rate,
        total_estimated_fare: estimatedCost,
        currency: '₹',
      },
      eta_minutes: etaMinutes,
      all_vehicle_options: Object.values(VEHICLE_SPECS).map((v) => ({
        type: v.id,
        name: v.name,
        capacity_kg: v.capacity_kg,
        estimated_fare: Math.round(v.base_fare + Math.max(0, dist - v.base_km) * v.per_km_rate),
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/porter/dispatch - Dispatch real / simulated Porter driver
router.post('/dispatch', (req, res) => {
  try {
    const {
      booking_id = '',
      item_description = 'Construction & Service Materials',
      cargo_weight_kg = 200,
      vehicle_type = 'tata_ace',
      pickup_address,
      drop_address,
      distance_km = 4.5,
    } = req.body;

    if (!pickup_address || !drop_address) {
      return res.status(400).json({ success: false, error: 'Pickup and drop addresses are required' });
    }

    const spec = VEHICLE_SPECS[vehicle_type] || VEHICLE_SPECS.tata_ace;
    const dist = parseFloat(distance_km) || 4.5;
    const estimatedCost = Math.round(spec.base_fare + Math.max(0, dist - spec.base_km) * spec.per_km_rate);
    const shipmentId = `port_ship_${Date.now()}`;
    const trackingCode = `PRTR-BLR-${Math.floor(1000 + Math.random() * 9000)}`;

    const drivers = [
      { name: 'Ramesh Yadav', phone: '+91 98451 22334', vehicle: 'KA 01 AB 4590' },
      { name: 'Suresh Gowda', phone: '+91 97410 88991', vehicle: 'KA 03 MN 7812' },
      { name: 'Manjunath K', phone: '+91 99011 55667', vehicle: 'KA 05 EF 3421' },
    ];
    const assigned = drivers[Math.floor(Math.random() * drivers.length)];

    execute(
      `INSERT INTO porter_shipments (
        id, tracking_code, booking_id, item_description, cargo_weight_kg, vehicle_type,
        pickup_address, drop_address, distance_km, estimated_cost, driver_name,
        driver_phone, vehicle_number, eta_minutes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 25, 'ASSIGNED')`,
      [
        shipmentId,
        trackingCode,
        booking_id,
        item_description,
        parseFloat(cargo_weight_kg) || 100,
        vehicle_type,
        pickup_address.trim(),
        drop_address.trim(),
        dist,
        estimatedCost,
        assigned.name,
        assigned.phone,
        assigned.vehicle,
      ]
    );

    const shipment = queryOne(`SELECT * FROM porter_shipments WHERE id = ?`, [shipmentId]);
    res.json({
      success: true,
      message: `Porter ${spec.name} dispatched! Tracking: ${trackingCode}`,
      shipment,
      tracking_url: `/services/porter/track/${trackingCode}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/porter/track/:trackingCode - Track shipment status
router.get('/track/:trackingCode', (req, res) => {
  try {
    const shipment = queryOne(
      `SELECT * FROM porter_shipments WHERE tracking_code = ? OR id = ?`,
      [req.params.trackingCode, req.params.trackingCode]
    );

    if (!shipment) {
      return res.status(404).json({ success: false, error: 'Shipment not found' });
    }

    res.json({
      success: true,
      shipment,
      live_telemetry: {
        current_step: shipment.status === 'ASSIGNED' ? 'Driver on way to pickup' : shipment.status,
        gps_latitude: 12.9716,
        gps_longitude: 77.5946,
        eta_minutes: shipment.eta_minutes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/porter/shipments - List active shipments
router.get('/shipments', (req, res) => {
  try {
    const shipments = queryAll(`SELECT * FROM porter_shipments ORDER BY created_at DESC LIMIT 25`);
    res.json({ success: true, count: shipments.length, shipments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
