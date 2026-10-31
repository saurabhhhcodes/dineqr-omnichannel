// src/components/Navbar.jsx - Enterprise responsive header with multi-vertical switching & client onboarding
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
  Sparkles,
  Stethoscope,
  Dumbbell,
  PartyPopper,
  PlusCircle,
  Lock,
  Laptop
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

  // Poll for kitchen / clinic queue count for the active restaurant
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

  const isClinic = activeRestaurant?.business_type === 'clinic';
  const isGym = activeRestaurant?.business_type === 'gym';
  const isEvent = activeRestaurant?.business_type === 'event';

  // Industry Brand Icon
  const BrandIcon = isClinic
    ? Stethoscope
    : isGym
    ? Dumbbell
    : isEvent
    ? PartyPopper
    : Utensils;

  const brandGradient = isClinic
    ? 'from-teal-600 to-emerald-500'
    : isGym
    ? 'from-blue-600 to-indigo-600'
    : isEvent
    ? 'from-purple-600 to-pink-600'
    : 'from-amber-600 to-orange-500';

  const defaultStationLabel = isClinic
    ? 'Consultation Room 01'
    : isGym
    ? 'Workout Bay 01'
    : isEvent
    ? 'VIP Lounge Booth 01'
    : 'Table 01';

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    addToast(
      isClinic
        ? 'Reception & Nurse notified! A team member will attend to your room.'
        : 'Server notified! A team member is on their way.'
    );
    setTimeout(() => setWaiterCalled(false), 8000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* ============================================================ */}
        {/* CUSTOMER / PATIENT MENU VIEW (Clean & Luxury)                */}
        {/* ============================================================ */}
        {isCustomerView ? (
          <>
            {/* Business Brand on Digital Menu */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
              <Link
                to={`/menu?restaurant=${activeRestaurant?.slug || activeRestaurant?.id || 'rest_losteria'}`}
                className="flex items-center gap-2 group min-w-0"
              >
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr ${brandGradient} flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition shrink-0`}
                >
                  <BrandIcon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-slate-900 text-xs sm:text-base tracking-tight leading-none group-hover:text-sky-600 transition truncate max-w-[130px] sm:max-w-xs">
                    {activeRestaurant?.name || "L'Osteria"}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium hidden sm:block truncate max-w-xs">
                    {activeRestaurant?.tagline || 'Self-Ordering & Instant Payment Platform'}
                  </p>
                </div>
              </Link>
            </div>

            {/* Center Station / Room / Table Indicator - Hidden on narrow mobile to prevent overlap */}
            <div className="hidden md:flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-900 text-xs font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{table ? table.table_number : 'Counter Pickup · Token Order'}</span>
                {table?.section && (
                  <span className="text-slate-500 font-normal">
                    · {table.section}
                  </span>
                )}
              </div>
            </div>

            {/* Right Customer Actions */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Call Staff Button */}
              <button
                onClick={handleCallWaiter}
                disabled={waiterCalled}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                  waiterCalled
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={isClinic ? 'Call reception / nurse' : 'Call attendant'}
              >
                <Bell className={`w-3.5 h-3.5 ${waiterCalled ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>{waiterCalled ? 'Attendant Notified' : isClinic ? 'Call Reception' : 'Call Waiter'}</span>
              </button>

              {/* Shopping / Booking Cart */}
              {onOpenCart && (
                <button
                  onClick={onOpenCart}
                  className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 active:scale-95 text-white text-xs font-black shadow-md shadow-sky-600/25 transition cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">{isClinic ? 'Bookings' : 'Cart'}</span>
                  {itemCount > 0 ? (
                    <span className="inline-flex items-center justify-center bg-white text-sky-700 font-black text-[11px] rounded-full h-5 min-w-5 px-1.5 shadow-xs animate-bounce">
                      {itemCount}
                    </span>
                  ) : null}
                  {grandTotal > 0 && (
                    <span className="border-l border-white/30 pl-2 text-xs font-black">
                      ₹{grandTotal}
                    </span>
                  )}
                </button>
              )}
            </div>
          </>
        ) : (
          /* ============================================================ */
          /* BUSINESS MANAGEMENT / ADMIN OPERATIONS VIEW                  */
          /* ============================================================ */
          <>
            {/* Brand & Multi-Tenant Organization Switcher */}
            <div className="flex items-center gap-3">
              <Link to="/admin" className="flex items-center gap-2 group shrink-0">
                <div
                  className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${brandGradient} flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition`}
                >
                  <BrandIcon className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                    <span>DineQR</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isClinic ? 'Clinic Reception & Token Queue' : 'Operations & Floor Management'}
                  </p>
                </div>
              </Link>

              {/* Multi-Tenant Organization Switcher Dropdown */}
              <div className="relative">
                <select
                  value={activeRestaurant?.id || ''}
                  onChange={(e) => {
                    const found = restaurants.find((r) => r.id === e.target.value);
                    if (found) setActiveRestaurant(found);
                  }}
                  className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs py-1.5 px-3 rounded-xl border border-slate-200 outline-none cursor-pointer pr-7 appearance-none max-w-[200px] truncate"
                >
                  {restaurants.map((r) => {
                    const prefix =
                      r.business_type === 'clinic'
                        ? '🏥'
                        : r.business_type === 'gym'
                        ? '🏋️'
                        : r.business_type === 'event'
                        ? '🎪'
                        : '🍽️';
                    return (
                      <option key={r.id} value={r.id}>
                        {prefix} {r.name}
                      </option>
                    );
                  })}
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
                    ? 'bg-sky-500 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isClinic ? <Stethoscope className="w-4 h-4" /> : <ChefHat className="w-4 h-4 text-amber-500" />}
                <span>{isClinic ? 'Token Queue' : 'Kitchen KDS'}</span>
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
                <span>{isClinic ? 'Rooms & QRs' : isGym ? 'Bays & QRs' : 'Tables & QRs'}</span>
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
                <span>{isClinic ? 'Services / Tests' : 'Catalog / Menu'}</span>
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
                to="/admin/floor-plan"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/floor-plan')
                    ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Visual Drag & Drop Floor Plan"
              >
                <span>Floor Plan</span>
              </Link>

              <Link
                to="/admin/reservations"
                className={`px-2.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/reservations')
                    ? 'bg-purple-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Table Bookings & Guest Reservations"
              >
                <span>Bookings</span>
              </Link>

              <Link
                to="/admin/staff"
                className={`px-2.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/staff')
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Staff Planning & Shift Scheduler"
              >
                <span>Staff</span>
              </Link>

              <Link
                to="/admin/inventory"
                className={`px-2.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/inventory')
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Real-Time Inventory & Stock Alerts"
              >
                <span>Inventory</span>
              </Link>

              <Link
                to="/admin/purchases"
                className={`px-2.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/purchases')
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Purchases & 3-Way Matching"
              >
                <span>Purchases</span>
              </Link>

              <Link
                to="/admin/downloads"
                className={`px-2.5 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/downloads')
                    ? 'bg-slate-900 text-amber-300 font-bold shadow-xs'
                    : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                }`}
                title="Download Standalone EXE, APK, DMG & Linux Packages"
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Apps</span>
              </Link>

              <Link
                to="/admin/settings"
                className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/settings')
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
                title="Razorpay Direct Settlement & Business Profile"
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
                title="Super Admin Fleet Command"
              >
                <Building2 className="w-4 h-4" />
                <span>Super Admin</span>
              </Link>
            </nav>

            {/* Quick Preview Customer Menu Link */}
            <div className="flex items-center gap-2">
              <Link
                to={`/menu?restaurant_id=${activeRestaurant?.id || ''}&table=tbl_1`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                <BrandIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>Live QR View</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
