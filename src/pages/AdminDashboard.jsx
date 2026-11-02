// src/pages/AdminDashboard.jsx - Executive overview, merchant payouts wallet, and 31st monthly local DB archive
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  ChefHat,
  QrCode,
  Users,
  Database,
  ShieldCheck,
  CreditCard,
  Utensils,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Download,
  Wallet,
  ArrowDownToLine,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  Laptop,
  Server,
  HardDrive,
  CalendarCheck,
  CalendarClock,
  PackageCheck,
  Truck,
  Eye,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function AdminDashboard() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [rzpConfig, setRzpConfig] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [backupSchedule, setBackupSchedule] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Local DB Browser Modal State
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [browseTable, setBrowseTable] = useState('orders');
  const [browseRecords, setBrowseRecords] = useState([]);
  const [isSettingUpDb, setIsSettingUpDb] = useState(false);

  // Withdrawal Modal State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawalReceipt, setWithdrawalReceipt] = useState(null);

  const fetchDashboardData = () => {
    if (!activeRestaurant) return;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/stats?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
      fetch(`/api/payment/razorpay/config?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
      fetch(`/api/wallet/balance?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
      fetch(`/api/backup/schedule-status?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
      fetch(`/api/erp/storage/status`).then((r) => r.json()),
    ])
      .then(([statsRes, rzpRes, walletRes, backupRes, storageRes]) => {
        if (statsRes.success) setStats(statsRes.stats);
        if (rzpRes.success) setRzpConfig(rzpRes);
        if (walletRes.success) {
          setWallet(walletRes.wallet);
          setWithdrawAmount(walletRes.wallet.available_balance || '');
        }
        if (backupRes.success) setBackupSchedule(backupRes.schedule);
        if (storageRes.success) setStorageStatus(storageRes);
      })
      .catch((err) => addToast('Failed to load dashboard: ' + err.message, 'error'))
      .finally(() => setIsLoading(false));
  };

  const handleSetupLocalDb = async () => {
    setIsSettingUpDb(true);
    try {
      const res = await fetch('/api/erp/local-sqlite/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Local SQLite Engine verified and active!');
        fetchDashboardData();
      } else {
        addToast(data.error || 'Setup failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSettingUpDb(false);
    }
  };

  const handleBrowseTable = async (tableName) => {
    setBrowseTable(tableName);
    try {
      const res = await fetch(`/api/erp/storage/browse?table=${tableName}&restaurant_id=${activeRestaurant.id}`);
      const data = await res.json();
      if (data.success) {
        setBrowseRecords(data.records || []);
        setShowBrowseModal(true);
      }
    } catch (err) {
      addToast('Failed to read table: ' + err.message, 'error');
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeRestaurant]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) < 500) {
      addToast('Minimum withdrawal amount is ₹500', 'error');
      return;
    }

    setIsWithdrawing(true);
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: activeRestaurant.id,
          amount: parseFloat(withdrawAmount),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWithdrawalReceipt(data.withdrawal);
        addToast(data.message);
        fetchDashboardData();
      } else {
        addToast(data.error || 'Withdrawal failed', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleDownloadComplianceBackup = () => {
    window.open(`/api/backup/download?restaurant_id=${activeRestaurant.id}`, '_blank');
    addToast('Downloading monthly local compliance backup (.json)...');
  };

  const handleDownloadRawSqlite = () => {
    window.open(`/api/backup/sqlite?restaurant_id=${activeRestaurant.id}`, '_blank');
    addToast('Downloading local SQLite database file (.db)...');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              Enterprise Operations Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeRestaurant?.name || "L'Osteria Bistro"} Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {activeRestaurant?.tagline || 'Contactless QR ordering, token queue, and live POS operations'} with direct Razorpay payouts and zero-cloud-cost local database storage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/kitchen"
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs shadow-md transition flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              <span>Launch Live Queue / KDS</span>
            </Link>

            <Link
              to="/admin/tables"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Station QR Placards</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Gross Volume
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{stats ? stats.total_revenue.toLocaleString('en-IN') : '...'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Verified via Razorpay</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Active Orders / Tokens */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active in Queue
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {stats ? stats.active_orders : 0} Orders
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Live tickets pending</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>

          {/* Station Occupancy */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Stations
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats ? stats.occupied_tables : 0} / {stats ? stats.total_tables : 4}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Tables, Rooms & Bays</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Total Orders Logged */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats ? stats.total_orders : 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Stored in local SQLite DB</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Odoo-Competitive ERP Operations Suite Quick Launch */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Link
            to="/admin/floor-plan"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Utensils className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black text-slate-900">Floor Plan</div>
              <div className="text-[10px] text-slate-400">Drag & drop tables</div>
            </div>
          </Link>

          <Link
            to="/admin/reservations"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black text-slate-900">Reservations</div>
              <div className="text-[10px] text-slate-400">Guest bookings</div>
            </div>
          </Link>

          <Link
            to="/admin/staff"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black text-slate-900">Staff Shifts</div>
              <div className="text-[10px] text-slate-400">Shift scheduler</div>
            </div>
          </Link>

          <Link
            to="/admin/inventory"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black text-slate-900">Inventory</div>
              <div className="text-[10px] text-slate-400">Stock & reorders</div>
            </div>
          </Link>

          <Link
            to="/admin/purchases"
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition flex flex-col justify-between group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Truck className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black text-slate-900">Purchases</div>
              <div className="text-[10px] text-slate-400">Vendor 3-way match</div>
            </div>
          </Link>

          <Link
            to="/admin/downloads"
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xs hover:shadow-md hover:border-amber-400 transition flex flex-col justify-between group text-white"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center group-hover:scale-110 transition">
              <Laptop className="w-5 h-5" />
            </div>
            <div className="mt-3">
              <div className="text-xs font-black text-white">Terminal Apps</div>
              <div className="text-[10px] text-amber-300">EXE · APK · DMG · DEB</div>
            </div>
          </Link>
        </div>

        {/* Local System Storage & Online Remote Access Center */}
        {storageStatus && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-slate-900 text-amber-400 shadow-sm">
                  <HardDrive className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-slate-900">
                      Local System Storage & Online Remote Access
                    </h2>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Zero Cloud Fees
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orders and business data are stored on this local computer in <code className="text-slate-800 font-mono font-bold bg-slate-100 px-1 py-0.5 rounded">./data/restaurant.db</code>. When online, administrators can inspect and sync remotely anytime.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSetupLocalDb}
                  disabled={isSettingUpDb}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  {isSettingUpDb ? 'Verifying...' : 'Configure Local SQLite'}
                </button>

                <button
                  onClick={() => handleBrowseTable('orders')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Browse Raw Tables</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Disk File Size</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">{storageStatus.local_size_kb} KB</div>
                <span className="text-[10px] text-emerald-600 font-bold">Embedded SQLite DB</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Orders on Disk</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">{storageStatus.counts?.orders || 0}</div>
                <span className="text-[10px] text-slate-500">Last: {storageStatus.last_order_stored}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Inventory & Shifts</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {(storageStatus.counts?.inventory_items || 0) + (storageStatus.counts?.staff_shifts || 0)} Items
                </div>
                <span className="text-[10px] text-slate-500">Tracked locally</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Remote Online Link</span>
                <div className="text-xs font-mono font-bold text-sky-600 truncate mt-1">
                  {storageStatus.remote_access_url}
                </div>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Encrypted Tunnel
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Merchant Payouts & Withdrawable Wallet */}
        {wallet && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span>Merchant Payouts & Withdrawable Balance</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Razorpay Settlement
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Payments received through QR orders land in your ledger. Withdraw anytime to your verified bank account after reaching ₹{wallet.min_withdrawal_threshold}.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setWithdrawalReceipt(null);
                  setShowWithdrawModal(true);
                }}
                disabled={!wallet.can_withdraw}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Withdraw to Bank Account</span>
              </button>
            </div>

            {/* Financial Ledger Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Available Payout Balance
                </span>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  ₹{wallet.available_balance.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {wallet.can_withdraw ? 'Ready to withdraw' : `Threshold: Min ₹${wallet.min_withdrawal_threshold}`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Gross GMV Collected
                </span>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹{wallet.total_gmv.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Total customer receipts</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Platform Fee Deducted
                </span>
                <div className="text-2xl font-black text-slate-700 mt-1">
                  ₹{wallet.platform_commission_deducted.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-sky-600 font-semibold mt-0.5 block">
                  {wallet.platform_commission_pct}% platform fee (Profit)
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Settlement Bank Account
                </span>
                <div className="text-lg font-mono font-bold text-slate-900 mt-1">
                  {wallet.settlement_bank_account}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  IFSC: {wallet.settlement_ifsc}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Zero Cloud Cost Local Database & Monthly 31st Download Section */}
        {backupSchedule && (
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white">
                      Zero-Cloud-Cost Local Database & Monthly 31st Archive
                    </h2>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      ₹0 Cloud Bills
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Your complete order database and patient records are saved locally. High-level aggregates sync to the Super Admin's free MongoDB cluster, and your full compliance backup automatically compiles on the 31st of every month for local download.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={handleDownloadComplianceBackup}
                  className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Monthly JSON Archive</span>
                </button>

                <button
                  onClick={handleDownloadRawSqlite}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Raw SQLite (.db)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Current Monthly Period</div>
                <div className="font-bold text-white text-sm">{backupSchedule.current_period}</div>
                <span className="text-[10px] text-emerald-400">Next Auto Archive: {backupSchedule.next_download_date}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Monthly Records Logged</div>
                <div className="font-bold text-white text-sm">{backupSchedule.total_monthly_records} Orders / Tokens</div>
                <span className="text-[10px] text-slate-400">Volume: ₹{backupSchedule.total_volume.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Super Admin Sync Architecture</div>
                <div className="font-bold text-sky-300 text-sm">{backupSchedule.super_admin_sync}</div>
                <span className="text-[10px] text-purple-300">Local privacy preserved</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bank Payout Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Instant Bank Withdrawal</h3>
                  <p className="text-xs text-slate-500">Direct settlement from Razorpay</p>
                </div>
              </div>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {withdrawalReceipt ? (
              <div className="text-center space-y-4 py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg">
                    ₹{withdrawalReceipt.amount.toLocaleString('en-IN')} Transferred!
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Settled to Bank A/C {withdrawalReceipt.bank_account_masked}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bank UTR Reference:</span>
                    <span className="font-bold text-slate-900">{withdrawalReceipt.utr_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="font-bold text-emerald-600">IMPS SETTLED</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Withdrawal Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="500"
                    max={wallet.available_balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-lg font-black text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Available: ₹{wallet.available_balance.toLocaleString('en-IN')} · Min: ₹500
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Depositing to:</span>
                    <span className="font-bold text-slate-900">{wallet.settlement_bank_account}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bank IFSC:</span>
                    <span className="font-mono text-slate-900">{wallet.settlement_ifsc}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isWithdrawing || parseFloat(withdrawAmount) < 500}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isWithdrawing ? 'Processing Settlement...' : `Confirm & Withdraw ₹${withdrawAmount || 0}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Raw Local Database Tables Browser Modal */}
      {showBrowseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 text-amber-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Local SQLite Store Inspector
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live raw records from local file: ./data/restaurant.db
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {['orders', 'reservations', 'inventory_items', 'staff_shifts', 'purchase_orders', 'tables'].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleBrowseTable(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      browseTable === t ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t}
                  </button>
                ))}
                <button
                  onClick={() => setShowBrowseModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto my-3 border border-slate-200 rounded-2xl">
              {browseRecords.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No records found in this table</div>
              ) : (
                <table className="w-full text-left text-[11px] font-mono">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase sticky top-0">
                    <tr>
                      {Object.keys(browseRecords[0]).slice(0, 7).map((col) => (
                        <th key={col} className="p-2.5">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {browseRecords.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        {Object.keys(browseRecords[0]).slice(0, 7).map((col) => (
                          <td key={col} className="p-2.5 truncate max-w-xs">{String(row[col] ?? '')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="text-right text-[11px] text-slate-400 pt-1">
              Showing up to 50 recent records from local SQLite disk database · Zero Cloud Database Fees
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
