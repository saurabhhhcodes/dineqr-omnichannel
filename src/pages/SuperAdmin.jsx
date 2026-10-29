// src/pages/SuperAdmin.jsx - Enterprise Super Admin Control Center (Clinics, Restaurants, Gyms, Events)
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  TrendingUp,
  Receipt,
  Users,
  Plus,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Trash2,
  CreditCard,
  UtensilsCrossed,
  Stethoscope,
  Dumbbell,
  PartyPopper,
  QrCode,
  ShieldCheck,
  Lock,
  Download,
  Laptop,
  CheckCircle2,
  XCircle,
  Smartphone,
  Eye,
  Percent
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function SuperAdmin() {
  const { setActiveRestaurant, refreshRestaurants } = useRestaurant();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Authentication gate state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('dineqr_super_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Fleet state
  const [tenants, setTenants] = useState([]);
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVertical, setSelectedVertical] = useState('all');

  const fetchFleetData = async () => {
    setIsLoading(true);
    try {
      const [tenantsRes, overviewRes] = await Promise.all([
        fetch('/api/restaurants/super-admin/tenants'),
        fetch('/api/restaurants/super-admin/overview'),
      ]);

      const tenantsData = await tenantsRes.json();
      const overviewData = await overviewRes.json();

      if (tenantsData.success) {
        setTenants(tenantsData.tenants || []);
      }
      if (overviewData.success) {
        setOverview(overviewData.stats || null);
      }
    } catch (err) {
      console.error('Error fetching super admin data:', err);
      addToast('Failed to load fleet data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFleetData();
    }
  }, [isAuthenticated]);

  const handleSuperLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/restaurants/auth/super-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: pinInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.authorized) {
        setIsAuthenticated(true);
        localStorage.setItem('dineqr_super_admin_auth', 'true');
        addToast('Super Admin access granted!');
      } else {
        setAuthError(data.error || 'Invalid PIN. Enter 2026');
      }
    } catch (err) {
      setAuthError('Authentication error: ' + err.message);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('dineqr_super_admin_auth');
    setPinInput('');
  };

  const handleToggleStatus = async (tenant, newStatus) => {
    try {
      const res = await fetch(`/api/restaurants/${tenant.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboarding_status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`${tenant.name} status updated to ${newStatus}`);
        fetchFleetData();
      }
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleImpersonate = (tenant) => {
    setActiveRestaurant(tenant);
    addToast(`Switched active context to ${tenant.name}`);
    navigate('/admin');
  };

  const handleDeleteTenant = async (tenant) => {
    if (!confirm(`Are you sure you want to permanently delete "${tenant.name}"? This removes all associated tables/rooms, dishes, and orders.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/restaurants/${tenant.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(data.message);
        fetchFleetData();
        refreshRestaurants();
      } else {
        addToast(data.error || 'Failed to delete tenant', 'error');
      }
    } catch (err) {
      addToast('Error deleting tenant: ' + err.message, 'error');
    }
  };

  const handleDownloadMasterReport = () => {
    window.open('/api/orders/export', '_blank');
  };

  // Filter tenants by vertical
  const filteredTenants = tenants.filter((t) => {
    if (selectedVertical === 'all') return true;
    if (selectedVertical === 'clinic') return t.business_type === 'clinic';
    if (selectedVertical === 'restaurant') return t.business_type === 'restaurant' || t.business_type === 'cafe';
    if (selectedVertical === 'gym') return t.business_type === 'gym';
    if (selectedVertical === 'event') return t.business_type === 'event';
    return true;
  });

  const clinicCount = tenants.filter((t) => t.business_type === 'clinic').length;
  const restCount = tenants.filter((t) => t.business_type === 'restaurant' || t.business_type === 'cafe').length;
  const gymCount = tenants.filter((t) => t.business_type === 'gym').length;
  const eventCount = tenants.filter((t) => t.business_type === 'event').length;

  // PIN Gate screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Super Admin Access</h2>
          <p className="text-slate-400 text-xs mt-1">
            Enter master platform PIN to access multi-client fleet management.
          </p>

          <form onSubmit={handleSuperLogin} className="mt-6 space-y-4">
            <div>
              <input
                type="password"
                autoFocus
                placeholder="Enter Master PIN (Default: 2026)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-mono text-lg tracking-widest focus:outline-none focus:border-purple-500"
              />
            </div>

            {authError && (
              <div className="text-rose-400 text-xs font-semibold bg-rose-950/40 border border-rose-800/50 p-2.5 rounded-xl">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition cursor-pointer"
            >
              Unlock Master Portal
            </button>

            <div className="text-[11px] text-slate-500 mt-2">
              Default master passkey: <span className="font-mono text-purple-300 font-bold">2026</span>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Super Admin Master Header */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
                Platform Super Admin
              </span>
              <span className="text-xs text-slate-400">· Global Business Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Universal Multi-Tenant Operations
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Monitor onboarded clinics, restaurants, gyms, and events. Audit direct Razorpay merchant settlements, switch into client accounts, and download global reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadMasterReport}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer border border-slate-700"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Master CSV</span>
            </button>

            <Link
              to="/onboard"
              className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-sky-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard New Client</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition cursor-pointer border border-slate-700"
              title="Lock Super Admin"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global KPI Cards */}
        {overview && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Platform GMV</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">
                ₹{overview.total_gmv?.toLocaleString('en-IN') || 0}
              </div>
              <span className="text-[11px] text-emerald-400">Settled through Razorpay</span>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Total Orders / Bookings</span>
                <Receipt className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{overview.total_orders || 0}</div>
              <span className="text-[11px] text-slate-400">{overview.active_orders || 0} in progress</span>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Onboarded Businesses</span>
                <Building2 className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{tenants.length}</div>
              <span className="text-[11px] text-purple-400">Across 4 verticals</span>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active QR Stations</span>
                <QrCode className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-white mt-1.5">{overview.total_tables || 0}</div>
              <span className="text-[11px] text-amber-400">Tables, Rooms & Bays</span>
            </div>
          </div>
        )}

        {/* Windows Desktop Client Support Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-blue-600 text-white shadow-lg">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span>Windows POS & Clinic Desk Application Ready</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Electron Client
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Run natively on any Windows PC at reception or cashier desk. Includes direct ESC/POS thermal receipt printing, clinic token slips, and kiosk mode.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-700 text-sky-300">
              scripts/start-windows-app.bat
            </span>
          </div>
        </div>

        {/* Vertical Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
          {[
            { id: 'all', label: `All Businesses (${tenants.length})`, icon: Building2 },
            { id: 'clinic', label: `Medical Clinics & Labs (${clinicCount})`, icon: Stethoscope },
            { id: 'restaurant', label: `Restaurants & Cafes (${restCount})`, icon: UtensilsCrossed },
            { id: 'gym', label: `Gyms & Fitness (${gymCount})`, icon: Dumbbell },
            { id: 'event', label: `Festivals & Events (${eventCount})`, icon: PartyPopper },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = selectedVertical === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedVertical(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                  active
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Multi-Tenant Client Directory Table */}
        <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Onboarded Client Directory</h3>
            <span className="text-xs text-slate-400">{filteredTenants.length} organizations</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Organization & Industry</th>
                  <th className="py-3 px-4">Payment & Razorpay Status</th>
                  <th className="py-3 px-4">Settlement Details</th>
                  <th className="py-3 px-4">Stations & Volume</th>
                  <th className="py-3 px-4">Status & Commission</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredTenants.map((t) => {
                  const isClinic = t.business_type === 'clinic';
                  const isGym = t.business_type === 'gym';
                  const isEvent = t.business_type === 'event';

                  let badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
                  let icon = <UtensilsCrossed className="w-3.5 h-3.5" />;
                  if (isClinic) {
                    badgeColor = 'bg-teal-500/10 text-teal-400 border-teal-500/30';
                    icon = <Stethoscope className="w-3.5 h-3.5" />;
                  } else if (isGym) {
                    badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
                    icon = <Dumbbell className="w-3.5 h-3.5" />;
                  } else if (isEvent) {
                    badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
                    icon = <PartyPopper className="w-3.5 h-3.5" />;
                  }

                  return (
                    <tr key={t.id} className="hover:bg-slate-900/40 transition">
                      {/* Name & Vertical */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg border ${badgeColor}`}>
                            {icon}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm">{t.name}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">/{t.slug} · {t.phone}</div>
                          </div>
                        </div>
                      </td>

                      {/* Payment & Razorpay */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="font-mono text-[11px] text-slate-200">{t.razorpay_key_masked}</span>
                          </div>
                          <span className="text-[10px] text-sky-400 font-semibold block">
                            Direct Merchant Settlement
                          </span>
                        </div>
                      </td>

                      {/* Settlement (UPI & Bank) */}
                      <td className="py-4 px-4">
                        <div className="text-[11px]">
                          <div className="text-slate-300 font-medium">UPI: {t.upi_id || 'Not set'}</div>
                          <div className="text-slate-500 mt-0.5">
                            Bank: {t.bank_account ? `••••${t.bank_account.slice(-4)} (${t.bank_ifsc})` : 'On file'}
                          </div>
                        </div>
                      </td>

                      {/* Stations & Volume */}
                      <td className="py-4 px-4">
                        <div className="text-[11px]">
                          <span className="font-bold text-white">{t.total_stations || 4} {t.station_type || 'table'}s</span>
                          <div className="text-emerald-400 font-semibold mt-0.5">
                            ₹{t.total_revenue?.toLocaleString('en-IN') || 0} ({t.total_orders || 0} orders)
                          </div>
                        </div>
                      </td>

                      {/* Status & Commission */}
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {t.onboarding_status || 'approved'}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Commission: <span className="text-sky-300 font-bold">{t.commission_pct || 2}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleImpersonate(t)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                            title="Launch as Admin"
                          >
                            <Laptop className="w-3.5 h-3.5" />
                            <span>Dashboard</span>
                          </button>

                          <Link
                            to={`/menu?restaurant_id=${t.id}&table=tbl_1`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Preview Customer/Patient QR View"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeleteTenant(t)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
