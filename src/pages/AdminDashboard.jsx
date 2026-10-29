// src/pages/AdminDashboard.jsx - Executive overview & system analytics
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
  Sparkles
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function AdminDashboard() {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [rzpConfig, setRzpConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeRestaurant) return;
    setIsLoading(true);

    Promise.all([
      fetch(`/api/stats?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
      fetch(`/api/payment/razorpay/config?restaurant_id=${activeRestaurant.id}`).then((r) => r.json()),
    ])
      .then(([statsRes, rzpRes]) => {
        if (statsRes.success) setStats(statsRes.stats);
        if (rzpRes.success) setRzpConfig(rzpRes);
      })
      .catch((err) => addToast('Failed to load stats: ' + err.message, 'error'))
      .finally(() => setIsLoading(false));
  }, [activeRestaurant]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider mb-2">
              Restaurant Manager Suite
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {activeRestaurant?.name || "L'Osteria Bistro"} Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
              {activeRestaurant?.tagline || 'Real-time table QR codes, contactless ordering, live kitchen display system'} with automated GST tax invoices and Razorpay direct payouts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/kitchen"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              <span>Launch Live KDS</span>
            </Link>

            <Link
              to="/admin/tables"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Manage Tables & QRs</span>
            </Link>
          </div>
        </div>

        {/* 4 Key Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                ₹{stats ? stats.total_revenue : '...'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Verified via Razorpay / POS</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Active Orders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active in Kitchen
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {stats ? stats.active_orders : 0} Tickets
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Cooking & Queue</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <ChefHat className="w-6 h-6" />
            </div>
          </div>

          {/* Table Occupancy */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tables Active
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {stats ? stats.occupied_tables : 0} / {stats ? stats.total_tables : 8}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Seated dining groups</div>
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
              <div className="text-[11px] text-slate-400 mt-0.5">Stored in SQLite DB</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* System Architecture & Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* SQLite Local Database */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                Active & Synced
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">System Local Database</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Powered by native node:sqlite engine in data/restaurant.db with zero cloud dependencies.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
              Tables, Orders, Items, Invoices: <b>Persistent</b>
            </div>
          </div>

          {/* Razorpay Gateway */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold text-[10px] uppercase">
                {rzpConfig?.configured ? 'Live / Test Key' : 'Simulation Ready'}
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Razorpay Integration</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports UPI (GPay/PhonePe), Credit/Debit Cards, and NetBanking with HMAC signature verification.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Key ID: <span className="font-mono font-semibold">{rzpConfig?.key_id || 'rzp_test_simulated'}</span>
            </div>
          </div>

          {/* GST & Invoicing Compliance */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                GST Compliant
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">GST Tax Invoicing</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatic 5% GST computation (2.5% CGST + 2.5% SGST) with 80mm thermal receipt & A4 print formats.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-500">
              GSTIN: <b>29ABCDE1234F1Z5</b> · FSSAI: <b>11223344556677</b>
            </div>
          </div>
        </div>

        {/* Popular Dishes & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Dishes */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-600" />
                <h3 className="font-extrabold text-slate-900 text-base">Top Selling Dishes</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">By sales volume</span>
            </div>

            {stats?.top_items?.length ? (
              <div className="divide-y divide-slate-100">
                {stats.top_items.map((it, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-black flex items-center justify-center text-xs">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-slate-900">{it.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-slate-900">{it.total_sold} ordered</div>
                      <div className="text-[11px] text-slate-400">₹{it.total_amount}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                Dishes will rank here as customers order from tables!
              </div>
            )}
          </div>

          {/* Quick Actions Hub */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-slate-900 text-base mb-2">Quick Navigation</h3>

            <Link
              to="/menu?table=tbl_1"
              target="_blank"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-orange-600 transition">
                    Test Customer Digital Menu (Table 01)
                  </div>
                  <div className="text-[11px] text-slate-500">Preview what customers experience when scanning QR</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/tables"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                    Generate New Table QRs & Stand Cards
                  </div>
                  <div className="text-[11px] text-slate-500">Add tables, print tent cards and download PNGs</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/admin/kitchen"
              className="p-3.5 rounded-2xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition">
                    Open Kitchen Display Screen (KDS)
                  </div>
                  <div className="text-[11px] text-slate-500">Live order queue with audio chime alerts</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
