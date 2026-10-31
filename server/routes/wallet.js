// server/routes/wallet.js - Multi-tenant merchant earnings, platform profit commission & bank withdrawals
import express from 'express';
import { queryOne, queryAll, execute } from '../db.js';

const router = express.Router();

// Helper to ensure wallet exists
function getOrCreateWallet(restaurantId) {
  let wallet = queryOne(`SELECT * FROM wallets WHERE restaurant_id = ?`, [restaurantId]);
  if (!wallet) {
    const r = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurantId]);
    const stats = queryOne(
      `SELECT COALESCE(SUM(grand_total), 0) as paid_total FROM orders WHERE restaurant_id = ? AND payment_status = 'PAID'`,
      [restaurantId]
    );
    const gmv = stats ? stats.paid_total : 0;
    const commissionPct = r?.commission_pct || 2.0;
    const commission = (gmv * commissionPct) / 100;
    const netEarned = gmv - commission;

    execute(
      `INSERT INTO wallets (restaurant_id, balance, total_earned, total_commission, total_withdrawn, min_withdrawal)
       VALUES (?, ?, ?, ?, 0, 500)`,
      [restaurantId, netEarned, netEarned, commission]
    );
    wallet = queryOne(`SELECT * FROM wallets WHERE restaurant_id = ?`, [restaurantId]);
  }
  return wallet;
}

// GET /api/wallet/balance - Check available balance & settlement details
router.get('/balance', (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 'rest_losteria';
    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurantId]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const wallet = getOrCreateWallet(restaurantId);

    // Dynamic stats from orders
    const stats = queryOne(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(grand_total), 0) as total_gmv
      FROM orders
      WHERE restaurant_id = ? AND payment_status = 'PAID'
    `, [restaurantId]);

    const totalGmv = stats?.total_gmv || 0;
    const commissionPct = restaurant.commission_pct || 2.0;
    const totalCommission = Math.round(((totalGmv * commissionPct) / 100) * 100) / 100;
    const netEarned = Math.round((totalGmv - totalCommission) * 100) / 100;
    const totalWithdrawn = wallet.total_withdrawn || 0;
    const availableBalance = Math.max(0, Math.round((netEarned - totalWithdrawn) * 100) / 100);

    // Keep wallet table in sync
    execute(
      `UPDATE wallets SET
        balance = ?,
        total_earned = ?,
        total_commission = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE restaurant_id = ?`,
      [availableBalance, netEarned, totalCommission, restaurantId]
    );

    res.json({
      success: true,
      wallet: {
        restaurant_id: restaurantId,
        restaurant_name: restaurant.name,
        available_balance: availableBalance,
        total_gmv: totalGmv,
        platform_commission_pct: commissionPct,
        platform_commission_deducted: totalCommission,
        net_earned: netEarned,
        total_withdrawn: totalWithdrawn,
        min_withdrawal_threshold: wallet.min_withdrawal || 500,
        can_withdraw: availableBalance >= (wallet.min_withdrawal || 500),
        settlement_bank_account: restaurant.bank_account
          ? `••••${restaurant.bank_account.slice(-4)}`
          : 'Pending Setup',
        settlement_ifsc: restaurant.bank_ifsc || 'Pending Setup',
        upi_id: restaurant.upi_id || 'Pending Setup',
      },
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/wallet/withdraw - Request bank account payout
router.post('/withdraw', (req, res) => {
  try {
    const { restaurant_id, amount } = req.body;
    if (!restaurant_id || !amount) {
      return res.status(400).json({ success: false, error: 'Restaurant ID and Amount are required' });
    }

    const restaurant = queryOne(`SELECT * FROM restaurants WHERE id = ?`, [restaurant_id]);
    if (!restaurant) {
      return res.status(404).json({ success: false, error: 'Restaurant not found' });
    }

    const wallet = getOrCreateWallet(restaurant_id);
    const numAmount = parseFloat(amount);
    const minThreshold = wallet.min_withdrawal || 500;

    if (numAmount < minThreshold) {
      return res.status(400).json({
        success: false,
        error: `Minimum withdrawal amount is ₹${minThreshold}. Your balance is ₹${wallet.balance}`,
      });
    }

    if (numAmount > wallet.balance) {
      return res.status(400).json({
        success: false,
        error: `Insufficient balance. Available balance: ₹${wallet.balance}`,
      });
    }

    const bankAccount = restaurant.bank_account || '987654321012';
    const bankIfsc = restaurant.bank_ifsc || 'HDFC0001234';

    const withdrawalId = 'wth_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const utrNumber = 'UTR' + Math.floor(100000000000 + Math.random() * 900000000000);

    // Record withdrawal
    execute(
      `INSERT INTO withdrawals (id, restaurant_id, amount, fee, net_amount, bank_account, bank_ifsc, status, utr_number)
       VALUES (?, ?, ?, 0, ?, ?, ?, 'SETTLED', ?)`,
      [withdrawalId, restaurant_id, numAmount, numAmount, bankAccount, bankIfsc, utrNumber]
    );

    // Deduct from wallet balance
    execute(
      `UPDATE wallets SET
        balance = balance - ?,
        total_withdrawn = total_withdrawn + ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE restaurant_id = ?`,
      [numAmount, numAmount, restaurant_id]
    );

    const updatedWallet = queryOne(`SELECT * FROM wallets WHERE restaurant_id = ?`, [restaurant_id]);

    res.json({
      success: true,
      message: `₹${numAmount} successfully transferred to ${restaurant.name}'s bank account.`,
      withdrawal: {
        id: withdrawalId,
        amount: numAmount,
        utr_number: utrNumber,
        bank_account_masked: `••••${bankAccount.slice(-4)}`,
        bank_ifsc: bankIfsc,
        status: 'SETTLED',
        settled_at: new Date().toISOString(),
      },
      remaining_balance: updatedWallet.balance,
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wallet/history - Payout and transaction history
router.get('/history', (req, res) => {
  try {
    const restaurantId = req.query.restaurant_id || 'rest_losteria';
    const withdrawals = queryAll(
      `SELECT * FROM withdrawals WHERE restaurant_id = ? ORDER BY created_at DESC LIMIT 30`,
      [restaurantId]
    );

    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/wallet/super-admin/profits - Super admin overview of platform profit & commissions
router.get('/super-admin/profits', (req, res) => {
  try {
    const totals = queryOne(`
      SELECT
        COALESCE(SUM(total_commission), 0) as total_platform_profit,
        COALESCE(SUM(total_earned), 0) as total_merchant_earnings,
        COALESCE(SUM(total_withdrawn), 0) as total_disbursed
      FROM wallets
    `);

    const clientLedgers = queryAll(`
      SELECT w.*, r.name, r.slug, r.business_type, r.commission_pct
      FROM wallets w
      JOIN restaurants r ON r.id = w.restaurant_id
      ORDER BY w.total_earned DESC
    `);

    res.json({
      success: true,
      platform_profits: {
        total_profit_retained: totals?.total_platform_profit || 0,
        total_merchant_volume: totals?.total_merchant_earnings || 0,
        total_disbursed: totals?.total_disbursed || 0,
        active_client_wallets: clientLedgers.length,
      },
      client_ledgers: clientLedgers,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
