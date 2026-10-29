// src/components/Navbar.jsx - Premium responsive header with customer vs admin experience
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Utensils,
  QrCode,
  ChefHat,
  ShoppingBag,
  ReceiptText,
  Settings,
  BookOpen,
  Building2,
  ChevronDown,
  Bell,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function Navbar({ onOpenCart }) {
  const location = useLocation();
  const { itemCount, grandTotal, table } = useCart();
  const { restaurants, activeRestaurant, setActiveRestaurant } = useRestaurant();
  const { addToast } = useToast();
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [waiterCalled, setWaiterCalled] = useState(false);

  // Poll for kitchen alert count for the active restaurant
  useEffect(() => {
    if (!activeRestaurant) return;

    const fetchActiveCount = () => {
      fetch(`/api/orders?status=active&restaurant_id=${activeRestaurant.id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && data.orders) {
            setActiveOrdersCount(data.orders.length);
          }
        })
        .catch(() => {});
    };

    fetchActiveCount();
    const interval = setInterval(fetchActiveCount, 6000);
    return () => clearInterval(interval);
  }, [activeRestaurant]);

  const isCustomerView =
    location.pathname.startsWith('/menu') ||
    location.pathname.startsWith('/order/') ||
    location.pathname.startsWith('/invoice/');

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    addToast('Server notified! A team member is on their way to your table.');
    setTimeout(() => setWaiterCalled(false), 8000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* ============================================================ */}
        {/* CUSTOMER MENU VIEW (Clean, Luxury, Uncluttered Experience)  */}
        {/* ============================================================ */}
        {isCustomerView ? (
          <>
            {/* Restaurant Brand on Table Menu */}
            <div className="flex items-center gap-3">
              <Link to="/menu" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-none group-hover:text-amber-600 transition">
                    {activeRestaurant?.name || "L'Osteria Gourmet Bistro"}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium hidden sm:block">
                    {activeRestaurant?.tagline || 'Artisanal Kitchen & Wood-Fired Oven'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Center Table Indicator */}
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{table ? table.table_number : 'Table 01'}</span>
                {table?.section && (
                  <span className="text-amber-700/70 font-normal hidden sm:inline">
                    · {table.section}
                  </span>
                )}
              </div>
            </div>

            {/* Right Customer Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Call Waiter Button */}
              <button
                onClick={handleCallWaiter}
                disabled={waiterCalled}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  waiterCalled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Call your waiter for assistance"
              >
                <Bell className={`w-3.5 h-3.5 ${waiterCalled ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>{waiterCalled ? 'Staff Called!' : 'Call Waiter'}</span>
              </button>

              {/* Shopping Cart Button */}
              {onOpenCart && (
                <button
                  onClick={onOpenCart}
                  className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white text-xs font-black shadow-md shadow-orange-500/25 transition cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {itemCount > 0 ? (
                    <span className="inline-flex items-center justify-center bg-white text-orange-700 font-black text-[11px] rounded-full h-5 min-w-5 px-1.5 shadow-xs animate-bounce">
                      {itemCount}
                    </span>
                  ) : null}
                  {grandTotal > 0 && (
                    <span className="hidden sm:inline border-l border-white/30 pl-2">
                      ₹{grandTotal}
                    </span>
                  )}
                </button>
              )}

              {/* Discrete Staff Portal link for cafe owners */}
              <Link
                to="/admin"
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-xs font-semibold flex items-center gap-1"
                title="Switch to Restaurant Staff / Management Portal"
              >
                <span className="hidden md:inline text-[11px]">Staff Mode</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        ) : (
          /* ============================================================ */
          /* RESTAURANT MANAGEMENT / ADMIN OPERATIONS VIEW                */
          /* ============================================================ */
          <>
            {/* Brand & Restaurant Selector */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2 group shrink-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition">
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                    <span>DineQR</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800">
                      Ops
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Kitchen & Floor Operations</p>
                </div>
              </Link>

              {/* Multi-Tenant Cafe Switcher Dropdown */}
              <div className="relative">
                <select
                  value={activeRestaurant?.id || ''}
                  onChange={(e) => {
                    const found = restaurants.find((r) => r.id === e.target.value);
                    if (found) setActiveRestaurant(found);
                  }}
                  className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs py-1.5 px-3 rounded-xl border border-slate-200 outline-none cursor-pointer pr-7 appearance-none"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id}>
                      ☕ {r.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Operations Navigation tabs */}
            <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
              <Link
                to="/admin/kitchen"
                className={`relative px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/kitchen')
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Kitchen KDS</span>
                {activeOrdersCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-full animate-pulse">
                    {activeOrdersCount}
                  </span>
                )}
              </Link>

              <Link
                to="/admin/tables"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/tables')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Tables & QRs</span>
              </Link>

              <Link
                to="/admin/menu"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/menu')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Edit Menu</span>
              </Link>

              <Link
                to="/admin/orders"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/orders')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ReceiptText className="w-4 h-4" />
                <span>Orders & Excel</span>
              </Link>

              <Link
                to="/admin/settings"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/settings')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Razorpay Direct Settlement & Cafe Profile"
              >
                <Settings className="w-4 h-4" />
                <span>Payments</span>
              </Link>

              <Link
                to="/super-admin"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname === '/super-admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
                }`}
                title="Super Admin Multi-Tenant Fleet Command"
              >
                <Building2 className="w-4 h-4" />
                <span>Super Admin</span>
              </Link>
            </nav>

            {/* Quick Preview Customer Menu Link */}
            <div className="flex items-center gap-2">
              <Link
                to="/menu?table=tbl_1"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                <Utensils className="w-3.5 h-3.5 text-amber-400" />
                <span>Customer Menu</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
