// src/pages/SuperAdmin.jsx - Platform Master Command Center for Multi-Restaurant Fleet
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Utensils,
  QrCode
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function SuperAdmin() {
  const { restaurants, setActiveRestaurant, refreshRestaurants } = useRestaurant();
  const { addToast } = useToast();

  const [platformOverview, setPlatformOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Restaurant modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRest, setNewRest] = useState({
    name: '',
    slug: '',
    tagline: 'Artisanal Kitchen & Cafe',
    address: 'Indiranagar 100ft Road, Bengaluru',
    phone: '+91 98765 00000',
    email: '',
    gstin: '',
    fssai: '',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    seed_starter_data: true,
  });

  const fetchOverview = () => {
    setIsLoading(true);
    fetch('/api/restaurants/super-admin/overview')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.stats) {
          setPlatformOverview(data.stats);
        }
      })
      .catch((err) => console.error('Failed to load super admin stats:', err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!newRest.name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/restaurants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRest),
      });

      const data = await res.json();
      if (data.success) {
        addToast(`Cafe "${data.restaurant.name}" created and provisioned!`);
        setShowAddModal(false);
        setNewRest({
          name: '',
          slug: '',
          tagline: 'Artisanal Kitchen & Cafe',
          address: 'Indiranagar 100ft Road, Bengaluru',
          phone: '+91 98765 00000',
          email: '',
          gstin: '',
          fssai: '',
          razorpay_key_id: '',
          razorpay_key_secret: '',
          seed_starter_data: true,
        });
        refreshRestaurants();
        fetchOverview();
      } else {
        addToast(data.error || 'Failed to create restaurant', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRestaurant = async (rest) => {
    if (!confirm(`Are you sure you want to delete ${rest.name}? This will delete all its tables, dishes, and orders.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/restaurants/${rest.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast(data.message);
        refreshRestaurants();
        fetchOverview();
      } else {
        addToast(data.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      addToast('Error: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Super Admin Banner */}
        <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
                Multi-Tenant SaaS
              </span>
              <span className="text-xs text-slate-400">· Super Admin Control Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Restaurant Fleet Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Monitor all registered cafes and bistros, provision new restaurant tenants, and oversee platform-wide gross sales and direct Razorpay accounts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchOverview}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              title="Refresh platform stats"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Provision New Restaurant</span>
            </button>
          </div>
        </div>

        {/* Global Platform Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Restaurants
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {platformOverview ? platformOverview.total_restaurants : restaurants.length}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-0.5">
                Active Tenants
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-950/60 text-purple-400 flex items-center justify-center border border-purple-800/40">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Platform GMV
              </span>
              <div className="text-2xl font-black text-amber-400 mt-1">
                ₹{platformOverview ? platformOverview.total_gmv : 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Settled to accounts
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-950/60 text-amber-400 flex items-center justify-center border border-amber-800/40">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Orders Placed
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {platformOverview ? platformOverview.total_orders : 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Across all cafes
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-950/60 text-sky-400 flex items-center justify-center border border-sky-800/40">
              <Receipt className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active QR Tables
              </span>
              <div className="text-2xl font-black text-white mt-1">
                {platformOverview ? platformOverview.total_tables : 0}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Generated & Placed
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center border border-emerald-800/40">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Restaurant Tenants Directory */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white">Registered Restaurants & Cafes</h2>
            <span className="text-xs text-slate-400">Showing {restaurants.length} accounts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-slate-950 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{rest.name}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                          /{rest.slug}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400/90 mt-0.5 font-medium">{rest.tagline}</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm">{rest.address}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold uppercase shrink-0">
                      Active Tenant
                    </span>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 mt-5 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Tables</div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {rest.total_tables || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Orders</div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {rest.total_orders || 0}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Revenue</div>
                      <div className="text-sm font-black text-amber-400 mt-0.5">
                        ₹{rest.total_revenue || 0}
                      </div>
                    </div>
                  </div>

                  {/* Payment Routing Badge */}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span>Razorpay:</span>
                      <b className={rest.has_custom_razorpay ? 'text-emerald-400' : 'text-sky-400'}>
                        {rest.has_custom_razorpay ? 'Direct Merchant Account' : 'Platform Sandbox'}
                      </b>
                    </span>

                    {rest.gstin && (
                      <span className="font-mono text-[10px] text-slate-400">
                        GST: {rest.gstin}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveRestaurant(rest);
                      addToast(`Switched active context to ${rest.name}`);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Manage Cafe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`/menu?restaurant=${rest.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                    title="Preview Customer Digital Menu"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {restaurants.length > 1 && (
                    <button
                      onClick={() => handleDeleteRestaurant(rest)}
                      className="p-2 rounded-xl hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Delete Restaurant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Provision New Restaurant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div
            className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-800 my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-black text-white">Provision New Restaurant Tenant</h3>
                <p className="text-xs text-slate-400">Sets up instant QR menus, tables and billing</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRestaurant} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Restaurant / Cafe Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Copper Chimney Bistro"
                  value={newRest.name}
                  onChange={(e) => setNewRest({ ...newRest, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. copper-chimney"
                    value={newRest.slug}
                    onChange={(e) => setNewRest({ ...newRest, slug: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newRest.phone}
                    onChange={(e) => setNewRest({ ...newRest, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={newRest.tagline}
                  onChange={(e) => setNewRest({ ...newRest, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Location / Address
                </label>
                <input
                  type="text"
                  value={newRest.address}
                  onChange={(e) => setNewRest({ ...newRest, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="29ABCDE1234F1Z5"
                    value={newRest.gstin}
                    onChange={(e) => setNewRest({ ...newRest, gstin: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono uppercase focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    FSSAI (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="11223344556677"
                    value={newRest.fssai}
                    onChange={(e) => setNewRest({ ...newRest, fssai: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>

              {/* Direct Razorpay keys */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400">
                  Direct Razorpay Settlement (Optional)
                </div>
                <input
                  type="text"
                  placeholder="Restaurant Razorpay Key ID (rzp_live_...)"
                  value={newRest.razorpay_key_id}
                  onChange={(e) => setNewRest({ ...newRest, razorpay_key_id: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
                <input
                  type="password"
                  placeholder="Restaurant Razorpay Key Secret"
                  value={newRest.razorpay_key_secret}
                  onChange={(e) => setNewRest({ ...newRest, razorpay_key_secret: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400">
                  Can be added later by the cafe owner in their settings panel.
                </span>
              </div>

              {/* Seed starter checkbox */}
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRest.seed_starter_data}
                  onChange={(e) => setNewRest({ ...newRest, seed_starter_data: e.target.checked })}
                  className="accent-amber-500 rounded"
                />
                <span>Automatically seed 4 starter dining tables and menu categories</span>
              </label>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Provisioning...' : 'Provision Restaurant Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
