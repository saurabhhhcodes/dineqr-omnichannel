// server/routes/cloud.js - MongoDB Atlas Cloud Sync & Remote Owner Access API
import express from 'express';
import { syncRestaurantToCloud, getCloudOrders, isCloudEligible } from '../cloudMongo.js';
import { queryOne, execute } from '../db.js';

const router = express.Router();

// GET /api/cloud/status?restaurant_id=xxx
router.get('/status', async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const restId = restaurant_id || 'rest_losteria';
    const rest = queryOne('SELECT * FROM restaurants WHERE id = ? OR slug = ?', [restId, restId]);

    if (!rest) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const isCloud = isCloudEligible(rest.id);
    const plan = rest.subscription_plan || 'pro_monthly_1500';

    res.json({
      success: true,
      restaurant_id: rest.id,
      restaurant_name: rest.name,
      subscription_plan: plan,
      is_cloud_sync_enabled: isCloud,
      architecture: isCloud
        ? 'DUAL_MODE_SQLITE_AND_MONGODB_ATLAS'
        : 'LOCAL_ON_PREMISE_SQLITE',
      pricing: isCloud ? '₹5,000 / month (Cloud Sync)' : '₹1,500 / month (Local DB)',
      remote_owner_access: isCloud
        ? '24/7 Global Remote Access (Even if restaurant PC is OFF)'
        : 'Active while restaurant POS machine is running on Wi-Fi/LAN',
      data_storage_path: 'DineQR-Data/database/restaurant.db',
      cloud_target: 'MongoDB Atlas Free Cluster M0',
      last_sync: rest.last_cloud_sync_at || 'Automatic On Transaction',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/cloud/sync - Trigger sync to MongoDB Atlas
router.post('/sync', async (req, res) => {
  try {
    const { restaurant_id } = req.body;
    const restId = restaurant_id || 'rest_losteria';

    const result = await syncRestaurantToCloud(restId);
    if (result.success) {
      execute(
        `UPDATE restaurants SET last_cloud_sync_at = CURRENT_TIMESTAMP WHERE id = ? OR slug = ?`,
        [restId, restId]
      );
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cloud/orders - Fetch remote orders
router.get('/orders', async (req, res) => {
  try {
    const { restaurant_id } = req.query;
    const restId = restaurant_id || 'rest_losteria';
    const result = await getCloudOrders(restId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
