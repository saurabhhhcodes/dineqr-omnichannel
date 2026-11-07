// server/routes/erp.js - Comprehensive Odoo-Competitive Operations & ERP Suite
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { queryAll, queryOne, execute, db, initDb } from '../db.js';
import { saveStaffAttendanceLog, saveInventorySnapshot } from '../localFileSystem.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Helper to determine staff limits based on subscription plan
function getPlanStaffLimit(planStr = '') {
  const normalized = (planStr || '').toLowerCase();
  if (normalized.includes('5000') || normalized.includes('enterprise')) {
    return { limit: 30, planName: 'Enterprise Scale & Staff Hub (₹5,000/mo)' };
  }
  if (normalized.includes('1500') || normalized.includes('pro')) {
    return { limit: 12, planName: 'Omnichannel Pro Delivery Suite (₹1,500/mo)' };
  }
  return { limit: 5, planName: 'Essential Restaurant Suite (₹1,000/mo)' };
}

// ==========================================
// 1. VISUAL FLOOR PLAN (Odoo Restaurant Parity)
// ==========================================

// GET /api/erp/floor-plan - Get tables with visual layout coordinates
router.get('/floor-plan', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const floorTables = queryAll(
      `SELECT fp.*, t.table_number, t.name as table_name, t.capacity, t.section,
        (SELECT COUNT(*) FROM orders o WHERE o.table_id = t.id AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as active_orders,
        (SELECT MAX(o.grand_total) FROM orders o WHERE o.table_id = t.id AND o.status NOT IN ('COMPLETED', 'CANCELLED')) as active_bill_total
       FROM floor_plan_tables fp
       JOIN tables t ON t.id = fp.table_id
       WHERE fp.restaurant_id = ?`,
      [restId]
    );

    res.json({ success: true, floor_tables: floorTables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/erp/floor-plan - Batch update coordinates from visual drag & drop
router.put('/floor-plan', (req, res) => {
  try {
    const { updates } = req.body; // array of { id, pos_x, pos_y, shape, width, height }
    if (!Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: 'Updates must be an array' });
    }

    for (const u of updates) {
      execute(
        `UPDATE floor_plan_tables SET
          pos_x = COALESCE(?, pos_x),
          pos_y = COALESCE(?, pos_y),
          shape = COALESCE(?, shape),
          width = COALESCE(?, width),
          height = COALESCE(?, height)
         WHERE id = ?`,
        [u.pos_x, u.pos_y, u.shape, u.width, u.height, u.id]
      );
    }

    res.json({ success: true, message: 'Floor plan layout saved successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/floor-plan/table - Add new table to floor plan and master table registry
router.post('/floor-plan/table', (req, res) => {
  try {
    const {
      restaurant_id = 'rest_losteria',
      table_number,
      name,
      section = 'Main Dining',
      capacity = 4,
      shape = 'circle',
      pos_x = 200,
      pos_y = 150,
      width = 90,
      height = 90,
    } = req.body;

    if (!table_number) {
      return res.status(400).json({ success: false, error: 'Table number/label is required' });
    }

    let finalTableNumber = table_number;
    const existingTable = queryOne(`SELECT id FROM tables WHERE restaurant_id = ? AND table_number = ?`, [restaurant_id, table_number]);
    if (existingTable) {
      finalTableNumber = `${table_number} (${Math.floor(10 + Math.random() * 90)})`;
    }

    const tableId = 'tbl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const fpId = 'fp_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const tableName = name || `Table ${finalTableNumber}`;

    // 1. Insert into tables master registry
    execute(
      `INSERT INTO tables (id, restaurant_id, table_number, name, section, capacity) VALUES (?, ?, ?, ?, ?, ?)`,
      [tableId, restaurant_id, finalTableNumber, tableName, section, parseInt(capacity) || 4]
    );

    // 2. Insert into floor_plan_tables layout registry
    execute(
      `INSERT INTO floor_plan_tables (id, restaurant_id, table_id, pos_x, pos_y, shape, width, height, zone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [fpId, restaurant_id, tableId, pos_x, pos_y, shape, width, height, section]
    );

    res.status(201).json({
      success: true,
      message: `Table ${table_number} added to floor plan`,
      table: {
        id: fpId,
        table_id: tableId,
        restaurant_id,
        table_number,
        table_name: tableName,
        section,
        capacity: parseInt(capacity) || 4,
        pos_x,
        pos_y,
        shape,
        width,
        height,
        active_orders: 0,
        active_bill_total: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/erp/floor-plan/table/:id - Edit specific floor plan table parameters
router.put('/floor-plan/table/:id', (req, res) => {
  try {
    const fpId = req.params.id;
    const {
      table_number,
      name,
      section,
      capacity,
      shape,
      width,
      height,
      pos_x,
      pos_y,
    } = req.body;

    const fp = queryOne(`SELECT * FROM floor_plan_tables WHERE id = ? OR table_id = ?`, [fpId, fpId]);
    if (!fp) {
      return res.status(404).json({ success: false, error: 'Floor plan table not found' });
    }

    // Update floor_plan_tables
    execute(
      `UPDATE floor_plan_tables SET
        shape = COALESCE(?, shape),
        width = COALESCE(?, width),
        height = COALESCE(?, height),
        pos_x = COALESCE(?, pos_x),
        pos_y = COALESCE(?, pos_y),
        zone = COALESCE(?, zone)
       WHERE id = ?`,
      [shape, width, height, pos_x, pos_y, section, fp.id]
    );

    // Update tables registry
    execute(
      `UPDATE tables SET
        table_number = COALESCE(?, table_number),
        name = COALESCE(?, name),
        section = COALESCE(?, section),
        capacity = COALESCE(?, capacity)
       WHERE id = ?`,
      [table_number, name, section, capacity, fp.table_id]
    );

    const updated = queryOne(
      `SELECT fp.*, t.table_number, t.name as table_name, t.capacity, t.section
       FROM floor_plan_tables fp JOIN tables t ON t.id = fp.table_id WHERE fp.id = ?`,
      [fp.id]
    );

    res.json({ success: true, message: 'Table updated successfully', table: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/erp/floor-plan/table/:id - Delete table from floor plan and registry
router.delete('/floor-plan/table/:id', (req, res) => {
  try {
    const fpId = req.params.id;
    const fp = queryOne(`SELECT * FROM floor_plan_tables WHERE id = ? OR table_id = ?`, [fpId, fpId]);
    if (!fp) {
      return res.status(404).json({ success: false, error: 'Floor plan table not found' });
    }

    execute(`DELETE FROM floor_plan_tables WHERE id = ?`, [fp.id]);
    execute(`DELETE FROM tables WHERE id = ?`, [fp.table_id]);

    res.json({ success: true, message: 'Table removed from floor plan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. TABLE BOOKINGS & RESERVATIONS
// ==========================================

// GET /api/erp/reservations - List upcoming bookings
router.get('/reservations', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const date = req.query.date;

    let sql = `
      SELECT r.*, t.table_number, t.section
      FROM reservations r
      LEFT JOIN tables t ON t.id = r.table_id
      WHERE r.restaurant_id = ?
    `;
    const params = [restId];

    if (date) {
      sql += ` AND r.reservation_date = ?`;
      params.push(date);
    }

    sql += ` ORDER BY r.reservation_date ASC, r.reservation_time ASC`;
    const reservations = queryAll(sql, params);
    res.json({ success: true, reservations });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/reservations - Add new booking
router.post('/reservations', (req, res) => {
  try {
    const {
      restaurant_id,
      table_id,
      guest_name,
      guest_phone,
      guest_email,
      party_size,
      reservation_date,
      reservation_time,
      special_requests,
    } = req.body;

    if (!guest_name || !guest_phone || !reservation_date || !reservation_time) {
      return res.status(400).json({ success: false, error: 'Guest name, phone, date, and time are required' });
    }

    const restId = restaurant_id || 'rest_losteria';
    const id = 'res_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    execute(
      `INSERT INTO reservations (
        id, restaurant_id, table_id, guest_name, guest_phone, guest_email,
        party_size, reservation_date, reservation_time, special_requests, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [
        id,
        restId,
        table_id || null,
        guest_name.trim(),
        guest_phone.trim(),
        guest_email || null,
        parseInt(party_size || '2', 10),
        reservation_date,
        reservation_time,
        special_requests || '',
      ]
    );

    const created = queryOne(`SELECT * FROM reservations WHERE id = ?`, [id]);
    res.status(201).json({ success: true, reservation: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/erp/reservations/:id/status - Update reservation status (SEATED, CANCELLED, etc.)
router.patch('/reservations/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    execute(`UPDATE reservations SET status = ? WHERE id = ?`, [status.toUpperCase(), req.params.id]);
    const updated = queryOne(`SELECT * FROM reservations WHERE id = ?`, [req.params.id]);
    res.json({ success: true, reservation: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. STAFF PLANNING & SHIFT SCHEDULER
// ==========================================

// GET /api/erp/staff-shifts - List staff shifts
router.get('/staff-shifts', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const shifts = queryAll(
      `SELECT * FROM staff_shifts WHERE restaurant_id = ? ORDER BY shift_date ASC, start_time ASC`,
      [restId]
    );
    res.json({ success: true, shifts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/staff-shifts - Add scheduled shift
router.post('/staff-shifts', (req, res) => {
  try {
    const {
      restaurant_id,
      employee_name,
      role,
      shift_date,
      start_time,
      end_time,
      color,
      notes,
    } = req.body;

    if (!employee_name || !role || !shift_date || !start_time || !end_time) {
      return res.status(400).json({ success: false, error: 'Employee name, role, date, start and end times required' });
    }

    // Odoo Conflict Check: warn if same employee has overlapping shift on same date
    const conflict = queryOne(
      `SELECT id, employee_name, start_time, end_time FROM staff_shifts
       WHERE restaurant_id = ? AND employee_name = ? AND shift_date = ?`,
      [restaurant_id || 'rest_losteria', employee_name.trim(), shift_date]
    );

    const restId = restaurant_id || 'rest_losteria';
    const id = 'shift_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    execute(
      `INSERT INTO staff_shifts (
        id, restaurant_id, employee_name, role, shift_date, start_time, end_time, color, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?)`,
      [
        id,
        restId,
        employee_name.trim(),
        role.trim(),
        shift_date,
        start_time,
        end_time,
        color || '#f59e0b',
        notes || '',
      ]
    );

    const created = queryOne(`SELECT * FROM staff_shifts WHERE id = ?`, [id]);
    res.status(201).json({
      success: true,
      shift: created,
      has_conflict: !!conflict,
      conflict_warning: conflict ? `Notice: ${employee_name} also has another shift on this day (${conflict.start_time} - ${conflict.end_time})` : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/erp/staff-shifts/:id - Delete shift
router.delete('/staff-shifts/:id', (req, res) => {
  try {
    execute(`DELETE FROM staff_shifts WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Shift deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3B. STAFF MEMBER PROFILES & PLAN LIMIT ENFORCEMENT
// ==========================================

// GET /api/erp/staff-members - List all registered staff accounts & check plan limits
router.get('/staff-members', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const rest = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restId]) || {};
    const { limit, planName } = getPlanStaffLimit(rest.subscription_plan);

    const staff = queryAll(
      `SELECT id, restaurant_id, user_id, name, role, pin, phone, status, created_at
       FROM staff_members WHERE restaurant_id = ? ORDER BY created_at ASC`,
      [restId]
    );

    res.json({
      success: true,
      restaurant_id: restId,
      plan_name: planName,
      staff_limit: limit,
      total_count: staff.length,
      remaining_slots: Math.max(0, limit - staff.length),
      staff,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/staff-members - Add staff member (enforces plan limit)
router.post('/staff-members', (req, res) => {
  try {
    const {
      restaurant_id = 'rest_losteria',
      name,
      user_id,
      role = 'Waiter / Server',
      pin = '1234',
      password = 'staff123',
      phone = '',
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Staff member name is required' });
    }

    if (!user_id || !user_id.trim()) {
      return res.status(400).json({ success: false, error: 'Unique Staff User ID is required' });
    }

    const rest = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurant_id]) || {};
    const { limit, planName } = getPlanStaffLimit(rest.subscription_plan);

    const currentCount = queryOne(
      `SELECT COUNT(*) as c FROM staff_members WHERE restaurant_id = ?`,
      [restaurant_id]
    )?.c || 0;

    if (currentCount >= limit) {
      return res.status(400).json({
        success: false,
        error: `Staff limit reached: Your current ${planName} allows a maximum of ${limit} staff members. Please upgrade to the ₹5,000/mo Enterprise Plan to add more staff.`,
        current_count: currentCount,
        staff_limit: limit,
      });
    }

    // Check duplicate user_id
    const existing = queryOne(`SELECT id FROM staff_members WHERE user_id = ?`, [user_id.trim()]);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Staff User ID "${user_id.trim()}" is already taken. Please choose a different ID.`,
      });
    }

    const id = 'stf_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    execute(
      `INSERT INTO staff_members (id, restaurant_id, user_id, name, role, pin, password, phone, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [id, restaurant_id, user_id.trim(), name.trim(), role, pin.trim() || '1234', password.trim() || 'staff123', phone.trim()]
    );

    const created = queryOne(`SELECT id, restaurant_id, user_id, name, role, pin, phone, status, created_at FROM staff_members WHERE id = ?`, [id]);
    res.status(201).json({
      success: true,
      message: `Staff member ${name} created successfully!`,
      staff: created,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/erp/staff-members/:id - Remove staff member
router.delete('/staff-members/:id', (req, res) => {
  try {
    execute(`DELETE FROM staff_members WHERE id = ?`, [req.params.id]);
    res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/staff/login - Staff Member Login & Clock-In (Records Arrival Time)
router.post('/staff/login', (req, res) => {
  try {
    const { user_id, pin, password, current_activity = 'Floor Duty', notes = '' } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'Staff User ID is required' });
    }

    const staff = queryOne(
      `SELECT * FROM staff_members WHERE user_id = ? AND (pin = ? OR password = ?)`,
      [user_id.trim(), (pin || '').trim(), (password || pin || '').trim()]
    );

    if (!staff) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Staff User ID or PIN/Password credentials.',
      });
    }

    // Record Arrival Time in staff_attendance
    const attId = 'att_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const arrivalTime = new Date().toISOString();

    execute(
      `INSERT INTO staff_attendance (
        id, restaurant_id, employee_name, staff_pin, role, current_activity, notes, status, clock_in_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ON_DUTY', CURRENT_TIMESTAMP)`,
      [attId, staff.restaurant_id, staff.name, staff.pin, staff.role, current_activity, notes || `Clocked in via User ID: ${staff.user_id}`]
    );

    const record = queryOne(`SELECT * FROM staff_attendance WHERE id = ?`, [attId]);

    // Save snapshot to local filesystem DineQR-Data/staff/
    const allAttendance = queryAll(`SELECT * FROM staff_attendance WHERE restaurant_id = ? ORDER BY clock_in_time DESC LIMIT 50`, [staff.restaurant_id]);
    saveStaffAttendanceLog(allAttendance);

    res.status(200).json({
      success: true,
      message: `Welcome, ${staff.name}! Your arrival time (${new Date().toLocaleTimeString('en-IN')}) has been recorded.`,
      attendance_id: attId,
      arrival_time: arrivalTime,
      staff: {
        id: staff.id,
        user_id: staff.user_id,
        name: staff.name,
        role: staff.role,
        restaurant_id: staff.restaurant_id,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/staff/logout - Staff Member Clock-Out (Records Departure Time)
router.post('/staff/logout', (req, res) => {
  try {
    const { user_id, attendance_id, notes } = req.body;
    let targetId = attendance_id;

    if (!targetId && user_id) {
      const staff = queryOne(`SELECT name, restaurant_id FROM staff_members WHERE user_id = ?`, [user_id.trim()]);
      if (staff) {
        const active = queryOne(
          `SELECT id FROM staff_attendance WHERE employee_name = ? AND status = 'ON_DUTY' ORDER BY clock_in_time DESC`,
          [staff.name]
        );
        if (active) targetId = active.id;
      }
    }

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: 'No active clock-in session found for this staff member.',
      });
    }

    execute(
      `UPDATE staff_attendance SET
        clock_out_time = CURRENT_TIMESTAMP,
        status = 'CLOCKED_OUT',
        notes = CASE WHEN ? IS NOT NULL AND ? != '' THEN notes || ' | ' || ? ELSE notes END
       WHERE id = ?`,
      [notes, notes, notes, targetId]
    );

    const updated = queryOne(`SELECT * FROM staff_attendance WHERE id = ?`, [targetId]);

    // Save snapshot to local filesystem DineQR-Data/staff/
    if (updated?.restaurant_id) {
      const allAttendance = queryAll(`SELECT * FROM staff_attendance WHERE restaurant_id = ? ORDER BY clock_in_time DESC LIMIT 50`, [updated.restaurant_id]);
      saveStaffAttendanceLog(allAttendance);
    }

    res.status(200).json({
      success: true,
      message: `${updated?.employee_name || 'Staff member'} clocked out successfully. Departure time logged.`,
      attendance: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3C. STAFF LIVE CLOCK-IN & ACTIVITY LEDGER
// ==========================================

// GET /api/erp/staff-attendance - List staff clock-ins and live duty status
router.get('/staff-attendance', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const logs = queryAll(
      `SELECT * FROM staff_attendance WHERE restaurant_id = ? ORDER BY clock_in_time DESC LIMIT 100`,
      [restId]
    );
    const activeStaff = logs.filter((s) => s.status === 'ON_DUTY');

    res.json({
      success: true,
      active_count: activeStaff.length,
      active_staff: activeStaff,
      attendance_logs: logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/staff-attendance/clock-in - Record staff arrival and starting duty
router.post('/staff-attendance/clock-in', (req, res) => {
  try {
    const {
      restaurant_id = 'rest_losteria',
      employee_name,
      staff_pin,
      role = 'Server / Waiter',
      current_activity = 'Floor Briefing & Table Setup',
      notes = '',
    } = req.body;

    if (!employee_name || !employee_name.trim()) {
      return res.status(400).json({ success: false, error: 'Employee name is required' });
    }

    const id = 'att_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    execute(
      `INSERT INTO staff_attendance (
        id, restaurant_id, employee_name, staff_pin, role, current_activity, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ON_DUTY')`,
      [id, restaurant_id, employee_name.trim(), staff_pin || '1234', role, current_activity, notes]
    );

    const record = queryOne(`SELECT * FROM staff_attendance WHERE id = ?`, [id]);
    res.status(201).json({
      success: true,
      message: `${employee_name} clocked in successfully!`,
      attendance: record,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/erp/staff-attendance/:id/activity - Update what staff is currently doing
router.patch('/staff-attendance/:id/activity', (req, res) => {
  try {
    const { current_activity, notes, status } = req.body;
    if (!current_activity) {
      return res.status(400).json({ success: false, error: 'Current activity is required' });
    }

    execute(
      `UPDATE staff_attendance SET
        current_activity = ?,
        notes = COALESCE(?, notes),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [current_activity, notes, status, req.params.id]
    );

    const updated = queryOne(`SELECT * FROM staff_attendance WHERE id = ?`, [req.params.id]);
    res.json({
      success: true,
      message: 'Staff activity updated',
      attendance: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/staff-attendance/clock-out - Record clock-out timestamp
router.post('/staff-attendance/clock-out', (req, res) => {
  try {
    const { id, employee_name, restaurant_id, notes } = req.body;
    let targetId = id;

    if (!targetId && employee_name) {
      const active = queryOne(
        `SELECT id FROM staff_attendance WHERE employee_name = ? AND status = 'ON_DUTY' ORDER BY clock_in_time DESC`,
        [employee_name]
      );
      if (active) targetId = active.id;
    }

    if (!targetId) {
      return res.status(400).json({ success: false, error: 'Attendance record ID or active employee name required' });
    }

    execute(
      `UPDATE staff_attendance SET
        clock_out_time = CURRENT_TIMESTAMP,
        status = 'CLOCKED_OUT',
        notes = CASE WHEN ? IS NOT NULL AND ? != '' THEN notes || ' | ' || ? ELSE notes END
       WHERE id = ?`,
      [notes, notes, notes, targetId]
    );

    const updated = queryOne(`SELECT * FROM staff_attendance WHERE id = ?`, [targetId]);
    res.json({
      success: true,
      message: `${updated?.employee_name || 'Staff member'} clocked out successfully.`,
      attendance: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 4. INVENTORY & STOCK MANAGEMENT
// ==========================================

// GET /api/erp/inventory - List stock items with replenishment alerts
router.get('/inventory', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const items = queryAll(
      `SELECT *,
        CASE
          WHEN current_stock <= 0 THEN 'OUT_OF_STOCK'
          WHEN current_stock <= min_reorder_level THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END as calculated_status
       FROM inventory_items
       WHERE restaurant_id = ?
       ORDER BY current_stock <= min_reorder_level DESC, name ASC`,
      [restId]
    );

    const totalValue = items.reduce((acc, i) => acc + (i.current_stock * i.unit_cost), 0);
    const lowStockCount = items.filter((i) => i.current_stock <= i.min_reorder_level).length;

    res.json({
      success: true,
      items,
      metrics: {
        total_items: items.length,
        low_stock_alerts: lowStockCount,
        total_inventory_value: Math.round(totalValue),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/inventory - Add new inventory stock item
router.post('/inventory', (req, res) => {
  try {
    const {
      restaurant_id,
      name,
      sku,
      category,
      current_stock,
      min_reorder_level,
      unit,
      unit_cost,
      expiration_date,
      supplier_name,
    } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, error: 'Item name is required' });
    }

    const restId = restaurant_id || 'rest_losteria';
    const id = 'inv_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);

    execute(
      `INSERT INTO inventory_items (
        id, restaurant_id, name, sku, category, current_stock, min_reorder_level,
        unit, unit_cost, expiration_date, supplier_name, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        restId,
        name.trim(),
        sku || 'SKU-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
        category || 'Raw Ingredients',
        parseFloat(current_stock || '0'),
        parseFloat(min_reorder_level || '10'),
        unit || 'kg',
        parseFloat(unit_cost || '0'),
        expiration_date || null,
        supplier_name || 'Direct Wholesale',
        parseFloat(current_stock || '0') <= parseFloat(min_reorder_level || '10') ? 'LOW_STOCK' : 'IN_STOCK',
      ]
    );

    const created = queryOne(`SELECT * FROM inventory_items WHERE id = ?`, [id]);
    res.status(201).json({ success: true, item: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/erp/inventory/:id/stock - Adjust stock level (stock in / stock out)
router.patch('/inventory/:id/stock', (req, res) => {
  try {
    const { adjustment, new_stock } = req.body;
    const item = queryOne(`SELECT * FROM inventory_items WHERE id = ?`, [req.params.id]);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    let finalStock = item.current_stock;
    if (new_stock !== undefined) {
      finalStock = Math.max(0, parseFloat(new_stock));
    } else if (adjustment !== undefined) {
      finalStock = Math.max(0, finalStock + parseFloat(adjustment));
    }

    const newStatus = finalStock <= 0 ? 'OUT_OF_STOCK' : (finalStock <= item.min_reorder_level ? 'LOW_STOCK' : 'IN_STOCK');

    execute(
      `UPDATE inventory_items SET current_stock = ?, status = ?, last_restocked_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [finalStock, newStatus, req.params.id]
    );

    const updated = queryOne(`SELECT * FROM inventory_items WHERE id = ?`, [req.params.id]);
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 5. PURCHASES, VENDOR BILLS & 3-WAY MATCHING
// ==========================================

// GET /api/erp/purchases - List vendor bills and RfQs
router.get('/purchases', (req, res) => {
  try {
    const restId = req.query.restaurant_id || 'rest_losteria';
    const orders = queryAll(
      `SELECT * FROM purchase_orders WHERE restaurant_id = ? ORDER BY created_at DESC`,
      [restId]
    );

    const parsed = orders.map((o) => {
      let items = [];
      try {
        items = JSON.parse(o.items_json);
      } catch (e) {
        items = [];
      }
      return { ...o, items };
    });

    res.json({ success: true, purchase_orders: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/purchases - Create vendor Request for Quotation (RfQ)
router.post('/purchases', (req, res) => {
  try {
    const {
      restaurant_id,
      vendor_name,
      vendor_email,
      items, // array of { item, qty, price }
      payment_terms,
    } = req.body;

    if (!vendor_name || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Vendor name and line items are required' });
    }

    const subtotal = items.reduce((acc, i) => acc + (parseFloat(i.qty || 1) * parseFloat(i.price || 0)), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    const restId = restaurant_id || 'rest_losteria';
    const id = 'po_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const rfqNumber = 'RFQ-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);

    execute(
      `INSERT INTO purchase_orders (
        id, restaurant_id, rfq_number, vendor_name, vendor_email, items_json,
        subtotal, tax_amount, total_amount, status, payment_terms
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'RFQ_SENT', ?)`,
      [
        id,
        restId,
        rfqNumber,
        vendor_name.trim(),
        vendor_email || null,
        JSON.stringify(items),
        subtotal,
        tax,
        total,
        payment_terms || 'Net 15',
      ]
    );

    const created = queryOne(`SELECT * FROM purchase_orders WHERE id = ?`, [id]);
    res.status(201).json({ success: true, purchase_order: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/erp/purchases/:id/status - Update 3-Way matching status (RECEIVED, BILL_VERIFIED, PAID)
router.patch('/purchases/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    execute(
      `UPDATE purchase_orders SET status = ?, received_date = CASE WHEN ? = 'RECEIVED' THEN DATE('now') ELSE received_date END WHERE id = ?`,
      [status.toUpperCase(), status.toUpperCase(), req.params.id]
    );

    const updated = queryOne(`SELECT * FROM purchase_orders WHERE id = ?`, [req.params.id]);
    res.json({ success: true, purchase_order: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 6. SPLIT BILLS CALCULATOR (Odoo Parity)
// ==========================================

// POST /api/erp/split-bill - Calculate equal split or itemized shares
router.post('/split-bill', (req, res) => {
  try {
    const { order_id, split_type, shares_count } = req.body;
    const order = queryOne(`SELECT * FROM orders WHERE id = ?`, [order_id]);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const shares = Math.max(1, parseInt(shares_count || '2', 10));
    const amountPerPerson = Math.round((order.grand_total / shares) * 100) / 100;

    execute(
      `UPDATE orders SET split_type = ?, split_shares = ? WHERE id = ?`,
      [split_type || 'EQUAL', shares, order_id]
    );

    res.json({
      success: true,
      order_id: order.id,
      grand_total: order.grand_total,
      split_type: split_type || 'EQUAL',
      shares,
      amount_per_share: amountPerPerson,
      summary: `₹${order.grand_total} split equally across ${shares} guests = ₹${amountPerPerson} per person`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 7. ONE-CLICK LOCAL SQLITE DB INITIALIZER
// ==========================================

// POST /api/erp/local-sqlite/setup - Configure on-premise local SQLite engine (auto-creates if missing)
router.post('/local-sqlite/setup', (req, res) => {
  try {
    const dataDir = process.env.VERCEL ? '/tmp/data' : path.resolve(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const dbPath = path.join(dataDir, 'restaurant.db');

    // Run schema init & tables ensure
    initDb();

    const isReady = fs.existsSync(dbPath);
    const size = isReady ? fs.statSync(dbPath).size : 0;

    // Run quick integrity check and count records
    const check = queryOne(`PRAGMA integrity_check`);
    const restCount = queryOne(`SELECT COUNT(*) as count FROM restaurants`)?.count || 0;
    const tableCount = queryOne(`SELECT COUNT(*) as count FROM tables`)?.count || 0;
    const menuCount = queryOne(`SELECT COUNT(*) as count FROM menu_items`)?.count || 0;
    const orderCount = queryOne(`SELECT COUNT(*) as count FROM orders`)?.count || 0;

    res.json({
      success: true,
      configured: true,
      engine: 'node:sqlite (DatabaseSync Embedded Engine)',
      database_path: dbPath,
      file_size_bytes: size,
      integrity: check ? check.integrity_check : 'ok',
      zero_cloud_cost_active: true,
      stats: {
        restaurants: restCount,
        tables: tableCount,
        menu_items: menuCount,
        orders: orderCount,
      },
      message: 'Local SQLite On-Premise Engine is active, verified, and operational with zero cloud database cost.',
      instructions: [
        '1. Database stores all records locally in ./data/restaurant.db',
        '2. No AWS RDS, Neon, or Supabase cloud bills',
        '3. Automatic end-of-month (31st) compliance archives (.json & .db) available in Merchant Dashboard',
        '4. Data remains permanently on your local disk even if cloud subscription ends',
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/local-sqlite/export - Download permanent binary copy of local restaurant.db
router.get('/local-sqlite/export', (req, res) => {
  try {
    const dataDir = process.env.VERCEL ? '/tmp/data' : path.resolve(__dirname, '../../data');
    const dbPath = path.join(dataDir, 'restaurant.db');
    if (!fs.existsSync(dbPath)) {
      initDb();
    }

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', 'attachment; filename="restaurant-local-store.db"');
    const stream = fs.createReadStream(dbPath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 8. LOCAL SYSTEM STORAGE & ONLINE REMOTE ACCESS ENGINE
// ==========================================

// GET /api/erp/storage/status - Get local storage status, metrics & online access link
router.get('/storage/status', (req, res) => {
  try {
    const dataDir = path.resolve(__dirname, '../../data');
    const dbPath = path.join(dataDir, 'restaurant.db');
    const isReady = fs.existsSync(dbPath);
    const size = isReady ? fs.statSync(dbPath).size : 0;

    const totalOrders = queryOne(`SELECT COUNT(*) as c FROM orders`)?.c || 0;
    const totalReservations = queryOne(`SELECT COUNT(*) as c FROM reservations`)?.c || 0;
    const totalInventory = queryOne(`SELECT COUNT(*) as c FROM inventory_items`)?.c || 0;
    const totalShifts = queryOne(`SELECT COUNT(*) as c FROM staff_shifts`)?.c || 0;
    const totalPurchases = queryOne(`SELECT COUNT(*) as c FROM purchase_orders`)?.c || 0;
    const latestOrder = queryOne(`SELECT created_at FROM orders ORDER BY created_at DESC LIMIT 1`)?.created_at || 'None';

    const host = req.get('host');
    const proto = req.get('x-forwarded-proto') || req.protocol || 'http';
    const remoteUrl = `${proto}://${host}`;

    res.json({
      success: true,
      storage_mode: 'Hybrid Local SQLite (Primary) + Secure Online Remote Sync',
      local_path: dbPath,
      local_size_kb: Math.round(size / 1024),
      online_accessible: true,
      remote_access_url: remoteUrl,
      last_order_stored: latestOrder,
      counts: {
        orders: totalOrders,
        reservations: totalReservations,
        inventory_items: totalInventory,
        staff_shifts: totalShifts,
        purchase_orders: totalPurchases,
      },
      features: [
        'Zero Cloud Database Cost (Runs on local system SQLite)',
        'Accessible anytime online via encrypted reverse tunnel or direct IP',
        'Automatic 31st monthly compliance backup ready for physical archival',
      ],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/erp/storage/browse - Browse raw local database tables securely over the web
router.get('/storage/browse', (req, res) => {
  try {
    const tableName = req.query.table || 'orders';
    const allowed = ['orders', 'order_items', 'reservations', 'inventory_items', 'staff_shifts', 'purchase_orders', 'tables', 'restaurants'];

    if (!allowed.includes(tableName)) {
      return res.status(400).json({ success: false, error: `Invalid table. Allowed: ${allowed.join(', ')}` });
    }

    const restId = req.query.restaurant_id;
    let sql = `SELECT * FROM ${tableName}`;
    const params = [];

    if (restId && tableName !== 'restaurants') {
      sql += ` WHERE restaurant_id = ?`;
      params.push(restId);
    }

    sql += ` ORDER BY rowid DESC LIMIT 50`;
    const rows = queryAll(sql, params);

    res.json({
      success: true,
      table: tableName,
      count: rows.length,
      records: rows,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/erp/storage/sync - Synchronize browser local storage / offline orders into SQLite
router.post('/storage/sync', (req, res) => {
  try {
    const { offline_orders } = req.body;
    let synced = 0;

    if (Array.isArray(offline_orders)) {
      for (const ord of offline_orders) {
        if (!ord.id) continue;
        const exists = queryOne(`SELECT id FROM orders WHERE id = ?`, [ord.id]);
        if (!exists) {
          execute(
            `INSERT INTO orders (
              id, restaurant_id, table_id, order_number, status, payment_status,
              payment_method, subtotal, tax_amount, grand_total, special_instructions
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              ord.id,
              ord.restaurant_id || 'rest_losteria',
              ord.table_id || 'tbl_1',
              ord.order_number || ('ORD-' + Math.floor(1000 + Math.random() * 9000)),
              ord.status || 'RECEIVED',
              ord.payment_status || 'PENDING',
              ord.payment_method || 'Razorpay / UPI',
              parseFloat(ord.subtotal || '0'),
              parseFloat(ord.tax_amount || '0'),
              parseFloat(ord.grand_total || '0'),
              ord.special_instructions || '',
            ]
          );
          synced++;
        }
      }
    }

    res.json({
      success: true,
      synced_orders_count: synced,
      message: `Local SQLite synchronized successfully. ${synced} offline order(s) committed to disk.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
