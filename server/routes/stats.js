// server/routes/stats.js - Real-time cafe & restaurant profit analytics & sales metrics
import express from 'express';
import { queryOne, queryAll } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const restId = restaurant_id || 'rest_losteria';

    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restId]);
    const bType = restaurant?.business_type || 'restaurant';

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

    // Active orders in kitchen/counter
    const activeOrdersStat = queryOne(`
      SELECT COUNT(*) as active_count
      FROM orders
      WHERE status NOT IN ('COMPLETED', 'CANCELLED') AND restaurant_id = ?
    `, [restId]);

    // Occupied tables/desks
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

    // Calculate Profit & Loss Estimates by Business Type
    const totalRev = revenueStat?.total_revenue || 0;
    const totalOrders = revenueStat?.total_orders || 0;

    // COGS percentage based on industry standards
    const cogsMap = {
      restaurant: 0.32,
      cafe: 0.28,
      salon: 0.16,
      gym: 0.12,
      clinic: 0.22,
      event: 0.25,
      services: 0.15,
    };
    const cogsRate = cogsMap[bType] ?? 0.25;
    const totalCogs = Math.round(totalRev * cogsRate);
    const grossProfit = Math.max(0, totalRev - totalCogs);
    const grossMarginPct = totalRev > 0 ? Math.round((grossProfit / totalRev) * 100) : 0;

    // Monthly Overhead Run-Rate Estimates
    const rentEstimate = bType === 'gym' ? 28000 : bType === 'clinic' ? 32000 : 25000;
    const electricityEstimate = bType === 'restaurant' ? 8500 : bType === 'gym' ? 9500 : 5000;
    const staffSalaryEstimate = bType === 'restaurant' ? 24000 : bType === 'clinic' ? 35000 : 15000;
    const totalMonthlyOverhead = rentEstimate + electricityEstimate + staffSalaryEstimate;

    // Estimated monthly revenue run rate
    const estimatedMonthlyRev = todayStat?.today_revenue ? todayStat.today_revenue * 30 : totalRev > 0 ? totalRev * 4 : 45000;
    const estimatedMonthlyCogs = Math.round(estimatedMonthlyRev * cogsRate);
    const estimatedMonthlyGrossProfit = estimatedMonthlyRev - estimatedMonthlyCogs;
    const estimatedNetProfit = Math.round(estimatedMonthlyGrossProfit - totalMonthlyOverhead);
    const netProfitMarginPct = estimatedMonthlyRev > 0 ? Math.round((estimatedNetProfit / estimatedMonthlyRev) * 100) : 0;

    const totalTables = totalTablesStat?.total_tables || 1;
    const occupiedTables = tablesOccupiedStat?.occupied_tables || 0;
    const occupancyPct = Math.round((occupiedTables / totalTables) * 100);
    const averageOrderValue = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;

    res.json({
      success: true,
      restaurant_id: restId,
      business_type: bType,
      station_type: restaurant?.station_type || 'table',
      stats: {
        total_revenue: totalRev,
        total_orders: totalOrders,
        today_revenue: todayStat?.today_revenue || 0,
        today_orders: todayStat?.today_orders || 0,
        active_orders: activeOrdersStat?.active_count || 0,
        occupied_tables: occupiedTables,
        total_tables: totalTables,
        occupancy_pct: occupancyPct,
        average_order_value: averageOrderValue,
        top_items: topItems,
        recent_orders: recentOrders,
        payment_breakdown: paymentBreakdown,

        // Financial & Profit Estimations
        financials: {
          cogs_rate_pct: Math.round(cogsRate * 100),
          total_cogs: totalCogs,
          gross_profit: grossProfit,
          gross_margin_pct: grossMarginPct,
          overhead: {
            monthly_rent: rentEstimate,
            electricity: electricityEstimate,
            staff_wages: staffSalaryEstimate,
            total_overhead: totalMonthlyOverhead,
          },
          projections: {
            projected_monthly_revenue: estimatedMonthlyRev,
            projected_gross_profit: estimatedMonthlyGrossProfit,
            projected_net_profit: estimatedNetProfit,
            net_profit_margin_pct: netProfitMarginPct,
            is_profitable: estimatedNetProfit > 0,
          },
        },
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
