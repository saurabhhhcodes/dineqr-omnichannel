// src/components/Navbar.jsx - Enterprise responsive header with multi-vertical switching & client onboarding
import React, { useState, useEffect, useRef } from 'react';
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
  Laptop,
  Download,
  Zap,
  ArrowRight,
  Boxes,
  Users,
  Calendar,
  Layers,
  FileSpreadsheet,
  CreditCard,
  Truck,
  PlayCircle,
  Wrench
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
  const [isOperationsDropdownOpen, setIsOperationsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOperationsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const isLandingView =
    location.pathname === '/' ||
    location.pathname === '/home' ||
    location.pathname === '/walkthrough' ||
    location.pathname === '/services' ||
    location.pathname === '/demo';
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

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    addToast(
      isClinic
        ? 'Reception & Nurse notified! A team member will attend to your room.'
        : 'Server notified! A team member is on their way.'
    );
    setTimeout(() => setWaiterCalled(false), 8000);
  };

  // ============================================================
  // 1. LANDING & MARKETING PORTAL HEADER (Universal Hero)
  // ============================================================
  if (isLandingView) {
    return (
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-white/10 shadow-lg text-white w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
              <Utensils className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-lg tracking-tight">DineQR</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-400/30 hidden sm:inline-block">
                Enterprise POS
              </span>
            </div>
          </Link>

          {/* Quick Marketing Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-300">
            <Link
              to="/walkthrough"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/walkthrough' ? 'text-amber-400' : ''
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Walkthrough Video</span>
            </Link>
            <Link
              to="/services"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/services' ? 'text-amber-400' : ''
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span>Trades & Porter Hub</span>
            </Link>
            <Link to="/menu?restaurant=losteria&table=counter" className="hover:text-amber-400 transition flex items-center gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Scanner</span>
            </Link>
            <Link to="/onboard" className="hover:text-amber-400 transition flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>₹1,000/mo Plan</span>
            </Link>
            <Link to="/downloads" className="hover:text-sky-300 transition flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-sky-400" />
              <span>Installers (.exe/.apk)</span>
            </Link>
          </nav>

          {/* Right Action CTA Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/walkthrough"
              className="hidden sm:inline-flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold transition"
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Video</span>
            </Link>

            <Link
              to="/downloads"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-sky-300 hover:text-white hover:border-sky-500 text-xs font-bold transition"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Downloads</span>
            </Link>

            <Link
              to="/admin"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-amber-300 text-xs font-bold transition"
              title="Staff back-office access with 4-digit PIN"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </Link>

            <Link
              to="/onboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95"
            >
              <span>Join as Business</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Mobile quick-nav pill strip for marketing / portal views */}
        <div className="lg:hidden bg-slate-900/90 border-t border-white/5 px-3 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap text-xs font-bold">
          <Link
            to="/walkthrough"
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
              location.pathname === '/walkthrough'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 bg-slate-800/80 hover:text-white'
            }`}
          >
            <PlayCircle className="w-3 h-3 text-amber-400" />
            <span>Walkthrough Video</span>
          </Link>
          <Link
            to="/services"
            className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 shrink-0 ${
              location.pathname === '/services'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-300 bg-slate-800/80 hover:text-white'
            }`}
          >
            <Truck className="w-3 h-3 text-amber-400" />
            <span>Trades & Porter</span>
          </Link>
          <Link
            to="/menu?restaurant=alexandria-library&table=tbl_lib_1"
            className="px-3 py-1 rounded-lg text-slate-300 bg-slate-800/80 hover:text-white transition flex items-center gap-1.5 shrink-0"
          >
            <BookOpen className="w-3 h-3 text-amber-400" />
            <span>Library Desk QR</span>
          </Link>
          <Link
            to="/downloads"
            className="px-3 py-1 rounded-lg text-sky-300 bg-slate-800/80 hover:text-white transition flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-3 h-3 text-sky-400" />
            <span>Installer Apps</span>
          </Link>
        </div>
      </header>
    );
  }

  // ============================================================
  // 2. CUSTOMER & PATIENT MENU VIEW (Clean & Luxury)
  // ============================================================
  if (isCustomerView) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
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
        </div>
      </header>
    );
  }

  // ============================================================
  // 3. BUSINESS MANAGEMENT & ADMIN OPERATIONS VIEW
  // ============================================================
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs transition-all w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand & Organization Identity (Clean Restaurant Name - No multi-vertical demo switcher here) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
            <div
              className={`w-9 h-9 rounded-2xl bg-gradient-to-tr ${brandGradient} flex items-center justify-center text-white shadow-md shadow-slate-900/10 group-hover:scale-105 transition`}
            >
              <BrandIcon className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-sm tracking-tight leading-none flex items-center gap-1.5">
                <span className="truncate max-w-[130px] sm:max-w-[190px]">
                  {activeRestaurant?.name || "L'Osteria Bistro"}
                </span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 hidden sm:inline-block">
                  Active POS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5 hidden sm:block truncate max-w-[190px]">
                {activeRestaurant?.tagline || 'Self-Ordering & Instant Payment Platform'}
              </p>
            </div>
          </Link>
        </div>

        {/* Core Operations Tabs (Fits beautifully on all screen resolutions with zero clipping) */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-600">
          <Link
            to="/admin/kitchen"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              location.pathname.startsWith('/admin/kitchen')
                ? 'bg-sky-500 text-white font-bold shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {isClinic ? <Stethoscope className="w-3.5 h-3.5" /> : <ChefHat className="w-3.5 h-3.5 text-amber-500" />}
            <span className="whitespace-nowrap">{isClinic ? 'Queue' : 'KDS'}</span>
            {activeOrdersCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black bg-rose-600 text-white rounded-full animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/floor-plan"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              location.pathname.startsWith('/admin/floor-plan')
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Floor Plan</span>
          </Link>

          <Link
            to="/admin/tables"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              location.pathname.startsWith('/admin/tables')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">{isClinic ? 'Rooms' : 'Tables'}</span>
          </Link>

          <Link
            to="/admin/menu"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              location.pathname.startsWith('/admin/menu')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Catalog</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              location.pathname.startsWith('/admin/orders')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Orders</span>
          </Link>

          <Link
            to="/admin/staff"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              location.pathname.startsWith('/admin/staff')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span className="whitespace-nowrap">Staff Duty</span>
          </Link>

          {/* Grouped Operations Dropdown with high z-index and clear shadow */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOperationsDropdownOpen(!isOperationsDropdownOpen)}
              className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shrink-0 ${
                location.pathname.includes('/reservations') ||
                location.pathname.includes('/inventory') ||
                location.pathname.includes('/purchases') ||
                location.pathname.includes('/downloads')
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="whitespace-nowrap">Operations</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isOperationsDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-[9999] ring-1 ring-black/5 animate-in fade-in zoom-in-95">
                <Link
                  to="/admin/reservations"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span>Table Bookings</span>
                </Link>
                <Link
                  to="/admin/inventory"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Boxes className="w-4 h-4 text-emerald-600" />
                  <span>Inventory Stocks</span>
                </Link>
                <Link
                  to="/admin/purchases"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  <span>Vendor Purchases</span>
                </Link>
                <div className="my-1 border-t border-slate-100" />
                <Link
                  to="/admin/downloads"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition"
                >
                  <Laptop className="w-4 h-4 text-amber-600" />
                  <span>Standalone POS Apps (EXE/APK)</span>
                </Link>
                <Link
                  to="/services"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>On-Demand Trades & Porter</span>
                </Link>
                <Link
                  to="/walkthrough"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <PlayCircle className="w-4 h-4 text-sky-600" />
                  <span>Product Video Walkthrough</span>
                </Link>
              </div>
            )}
          </div>

          <Link
            to="/admin/subscription"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              location.pathname.startsWith('/admin/subscription')
                ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100 font-bold border border-amber-200/80'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span className="whitespace-nowrap">Plan (₹1k/mo)</span>
          </Link>

          <Link
            to="/admin/settings"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              location.pathname.startsWith('/admin/settings')
                ? 'bg-slate-900 text-white shadow-xs'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Settings</span>
          </Link>

          <Link
            to="/super-admin"
            className={`whitespace-nowrap px-2.5 py-1.5 rounded-xl transition flex items-center gap-1 shrink-0 ${
              location.pathname === '/super-admin'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap">Super Admin</span>
          </Link>
        </nav>

        {/* Quick Preview Customer Menu Link (Guaranteed never to clip or shrink) */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/menu?restaurant_id=${activeRestaurant?.id || ''}&table=tbl_1`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs shrink-0 whitespace-nowrap"
            title="Preview Customer Live QR Menu"
          >
            <BrandIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="whitespace-nowrap">Live QR View</span>
          </Link>
        </div>
      </div>

      {/* Admin Sub-Navigation Pill Bar for Tablets & Mobile (<1024px viewports like 942px, 768px, 390px) */}
      <div className="lg:hidden bg-slate-900 border-t border-slate-800/90 px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap shadow-inner w-full max-w-full">
        <Link
          to="/admin/kitchen"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/kitchen')
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {isClinic ? <Stethoscope className="w-3.5 h-3.5" /> : <ChefHat className="w-3.5 h-3.5 text-amber-400" />}
          <span>{isClinic ? 'Queue' : 'KDS'}</span>
          {activeOrdersCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black bg-rose-600 text-white rounded-full">
              {activeOrdersCount}
            </span>
          )}
        </Link>

        <Link
          to="/admin/floor-plan"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/floor-plan')
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Floor Plan</span>
        </Link>

        <Link
          to="/admin/tables"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/tables')
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>{isClinic ? 'Rooms' : 'Tables'}</span>
        </Link>

        <Link
          to="/admin/menu"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/menu')
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Catalog</span>
        </Link>

        <Link
          to="/admin/orders"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/orders')
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <ReceiptText className="w-3.5 h-3.5" />
          <span>Orders</span>
        </Link>

        <Link
          to="/admin/staff"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/staff')
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Staff Duty</span>
        </Link>

        <Link
          to="/admin/subscription"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/subscription')
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Plan (₹1k)</span>
        </Link>

        <Link
          to="/admin/reservations"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/reservations')
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Bookings</span>
        </Link>

        <Link
          to="/admin/inventory"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/inventory')
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Inventory</span>
        </Link>

        <Link
          to="/admin/purchases"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/purchases')
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Purchases</span>
        </Link>

        <Link
          to="/admin/downloads"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/downloads')
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-amber-400 hover:bg-slate-800'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>Apps</span>
        </Link>

        <Link
          to="/services"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname === '/services'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>Trades</span>
        </Link>

        <Link
          to="/walkthrough"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname === '/walkthrough'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <PlayCircle className="w-3.5 h-3.5 text-sky-400" />
          <span>Walkthrough</span>
        </Link>

        <Link
          to="/admin/settings"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname.startsWith('/admin/settings')
              ? 'bg-slate-800 text-white shadow-xs'
              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </Link>

        <Link
          to="/super-admin"
          className={`px-2.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shrink-0 text-xs font-bold ${
            location.pathname === '/super-admin'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-purple-400 hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Super Admin</span>
        </Link>
      </div>
    </header>
  );
}
