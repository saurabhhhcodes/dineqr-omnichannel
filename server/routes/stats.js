// server/routes/stats.js - Real-time cafe analytics & sales metrics
import express from 'express';
import { queryOne, queryAll } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const restId = restaurant_id || 'rest_losteria';

    // Total revenue from paid orders
    const revenueStat = queryOne(`
      SELECT
        COALESCE(SUM(grand_total), 0) as total_revenue,
        COUNT(*) as total_orders
      FROM orders
      WHERE payment_status = 'PAID' AND restaurant_id = ?
    `, [restId]);

    // Today's stats
    const todayStat = queryOne(`
      SELECT
        COALESCE(SUM(grand_total), 0) as today_revenue,
        COUNT(*) as today_orders
      FROM orders
      WHERE date(created_at) = date('now') AND restaurant_id = ?
    `, [restId]);

    // Active orders in kitchen
    const activeOrdersStat = queryOne(`
      SELECT COUNT(*) as active_count
      FROM orders
      WHERE status NOT IN ('COMPLETED', 'CANCELLED') AND restaurant_id = ?
    `, [restId]);

    // Occupied tables
    const tablesOccupiedStat = queryOne(`
      SELECT COUNT(DISTINCT table_id) as occupied_tables
      FROM orders
      WHERE status NOT IN ('COMPLETED', 'CANCELLED') AND table_id IS NOT NULL AND restaurant_id = ?
    `, [restId]);

    const totalTablesStat = queryOne(
      `SELECT COUNT(*) as total_tables FROM tables WHERE restaurant_id = ?`,
      [restId]
    );

    // Top selling items
    const topItems = queryAll(`
      SELECT
        oi.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_amount
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      WHERE o.status != 'CANCELLED' AND o.restaurant_id = ?
      GROUP BY oi.name
      ORDER BY total_sold DESC
      LIMIT 6
    `, [restId]);

    // Recent orders
    const recentOrders = queryAll(`
      SELECT id, order_code, table_number, grand_total, status, payment_status, created_at
      FROM orders
      WHERE restaurant_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `, [restId]);

    // Payment method breakdown
    const paymentBreakdown = queryAll(`
      SELECT
        payment_method,
        payment_status,
        COUNT(*) as count,
        COALESCE(SUM(grand_total), 0) as total
      FROM orders
      WHERE restaurant_id = ?
      GROUP BY payment_method, payment_status
    `, [restId]);

    res.json({
      success: true,
      restaurant_id: restId,
      stats: {
        total_revenue: revenueStat?.total_revenue || 0,
        total_orders: revenueStat?.total_orders || 0,
        today_revenue: todayStat?.today_revenue || 0,
        today_orders: todayStat?.today_orders || 0,
        active_orders: activeOrdersStat?.active_count || 0,
        occupied_tables: tablesOccupiedStat?.occupied_tables || 0,
        total_tables: totalTablesStat?.total_tables || 0,
        top_items: topItems,
        recent_orders: recentOrders,
        payment_breakdown: paymentBreakdown,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
