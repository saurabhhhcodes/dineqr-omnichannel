// src/components/Navbar.jsx - High-End Professional Navigation Suite (Landing, Menu, & Admin)
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
  ChevronDown,
  Bell,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Dumbbell,
  PartyPopper,
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
  Menu as MenuIcon,
  X as CloseIcon,
  Store,
  Compass,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function Navbar({ onOpenCart }) {
  const location = useLocation();
  const { itemCount, grandTotal, table } = useCart();
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOperationsDropdownOpen, setIsOperationsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsOperationsDropdownOpen(false);
  }, [location.pathname]);

  // Close operations dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOperationsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Poll for kitchen queue count for active restaurant
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
    location.pathname === '/demo' ||
    location.pathname === '/pricing' ||
    location.pathname === '/downloads';

  const isCustomerView =
    location.pathname.startsWith('/menu') ||
    location.pathname.startsWith('/order/') ||
    location.pathname.startsWith('/invoice/');

  const handleCallWaiter = () => {
    setWaiterCalled(true);
    addToast('Server notified! A team member is on their way to your table.');
    setTimeout(() => setWaiterCalled(false), 8000);
  };

  // ============================================================
  // 1. PUBLIC MARKETING & LANDING HEADER (Clean, Sleek & Modern)
  // ============================================================
  if (isLandingView) {
    return (
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/10 group-hover:bg-amber-400 transition">
              <Utensils className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">DineQR</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-800 hidden sm:inline-block">
                ₹1,000/mo POS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link
              to="/walkthrough"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/walkthrough' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Video Walkthrough</span>
            </Link>

            <Link
              to="/menu?restaurant=losteria&table=tbl_1"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname.startsWith('/menu') ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>Table QR Demo</span>
            </Link>

            <Link
              to="/services"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/services' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Trades & Porter Hub</span>
            </Link>

            <Link
              to="/pricing"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/pricing' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Pricing (₹1k/mo)</span>
            </Link>

            <Link
              to="/downloads"
              className={`hover:text-sky-300 transition flex items-center gap-1.5 ${
                location.pathname === '/downloads' ? 'text-sky-400 font-bold' : ''
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-slate-400" />
              <span>Desktop Apps (.exe/.apk)</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition"
              title="Staff back-office access with 4-digit PIN"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Login</span>
            </Link>

            <Link
              to="/onboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-98"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <CloseIcon className="w-5 h-5 text-amber-400" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Clean Mobile Slide-Down Drawer (Zero AI Clutter, Highly Usable) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-1 gap-1 text-sm font-semibold">
              <Link
                to="/walkthrough"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <PlayCircle className="w-4 h-4 text-amber-400" />
                  <span>Video Walkthrough (7 Chapters)</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

              <Link
                to="/menu?restaurant=losteria&table=tbl_1"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Try Customer Table QR Menu</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

              <Link
                to="/services"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-sky-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-sky-400" />
                  <span>Apronto Trades & Porter Logistics</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

              <Link
                to="/pricing"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Subscription Pricing (₹1,000/mo)</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

              <Link
                to="/downloads"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-slate-100 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Laptop className="w-4 h-4 text-slate-400" />
                  <span>Windows & Android Offline Apps</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

              <Link
                to="/admin"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-300 font-bold transition mt-2"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Staff Terminal Login (PIN: 1234)</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/onboard"
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm shadow-md mt-2"
              >
                <span>Onboard Your Restaurant</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>
    );
  }

  // ============================================================
  // 2. CUSTOMER DIGITAL MENU HEADER (Clean, Luxury & Table-Aware)
  // ============================================================
  if (isCustomerView) {
    return (
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all w-full max-w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Restaurant Brand + Table Number Pill (Always visible on mobile!) */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <Link
              to={`/menu?restaurant=${activeRestaurant?.slug || activeRestaurant?.id || 'rest_losteria'}`}
              className="flex items-center gap-2.5 min-w-0"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                <Utensils className="w-4.5 h-4.5 text-amber-400" />
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight leading-tight truncate">
                  {activeRestaurant?.name || "L'Osteria Bistro"}
                </div>
                {/* Active Table Pill */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 truncate">
                    {table ? table.table_number : 'Table 01'}
                  </span>
                  {table?.section && (
                    <span className="text-[10px] text-slate-400 hidden sm:inline truncate">
                      · {table.section}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Right Customer Actions: Call Waiter + Cart Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Call Waiter Button */}
            <button
              onClick={handleCallWaiter}
              disabled={waiterCalled}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                waiterCalled
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              title="Call server to your table"
            >
              <Bell className={`w-3.5 h-3.5 ${waiterCalled ? 'text-emerald-600' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">{waiterCalled ? 'Waiter Notified' : 'Call Server'}</span>
            </button>

            {/* Shopping Cart Button */}
            {onOpenCart && (
              <button
                onClick={onOpenCart}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold shadow-md transition cursor-pointer shrink-0"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Order</span>
                {itemCount > 0 && (
                  <span className="inline-flex items-center justify-center bg-amber-500 text-slate-950 font-extrabold text-[11px] rounded-full h-5 min-w-5 px-1.5">
                    {itemCount}
                  </span>
                )}
                {grandTotal > 0 && (
                  <span className="border-l border-slate-700 pl-2 text-xs font-bold font-mono">
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
  // 3. ADMIN BACK-OFFICE HEADER (Clean, Cohesive Enterprise Bar)
  // ============================================================
  return (
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Restaurant Identity & Active Station */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-sm group-hover:bg-amber-400 transition">
              <Utensils className="w-4.5 h-4.5 text-slate-950" />
            </div>
            <div>
              <div className="font-bold text-white text-sm tracking-tight leading-none flex items-center gap-1.5">
                <span className="truncate max-w-[140px] sm:max-w-[200px]">
                  {activeRestaurant?.name || "L'Osteria Bistro"}
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                  Terminal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block truncate max-w-[200px]">
                {activeRestaurant?.tagline || 'Restaurant Operations Suite'}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Admin Operations Navigation */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-medium text-slate-300">
          <Link
            to="/admin/kitchen"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin/kitchen')
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen KDS</span>
            {activeOrdersCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black bg-rose-600 text-white rounded-full">
                {activeOrdersCount}
              </span>
            )}
          </Link>

          <Link
            to="/admin/floor-plan"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin/floor-plan')
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Floor Plan</span>
          </Link>

          <Link
            to="/admin/tables"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin/tables')
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Tables & QR Placards</span>
          </Link>

          <Link
            to="/admin/menu"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin/menu')
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Menu & Prices</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin/orders')
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            <span>Bills & Orders</span>
          </Link>

          <Link
            to="/admin/staff"
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              location.pathname.startsWith('/admin/staff')
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff Roster</span>
          </Link>

          {/* Operations Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOperationsDropdownOpen(!isOperationsDropdownOpen)}
              className="px-3 py-1.5 rounded-lg transition flex items-center gap-1 hover:bg-slate-900 hover:text-white cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isOperationsDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <Link
                  to="/admin/reservations"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Table Reservations</span>
                </Link>
                <Link
                  to="/admin/inventory"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Boxes className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Inventory Tracking</span>
                </Link>
                <Link
                  to="/admin/purchases"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                  <span>Vendor Purchases</span>
                </Link>
                <Link
                  to="/admin/subscription"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-400 hover:bg-slate-800 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SaaS Plan (₹1k/mo)</span>
                </Link>
                <div className="my-1 border-t border-slate-800" />
                <Link
                  to="/admin/settings"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>POS Settings</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Quick Customer Live Preview + Mobile Admin Menu Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            to={`/menu?restaurant_id=${activeRestaurant?.id || ''}&table=tbl_1`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
            title="Preview Customer Live QR Menu"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live QR Menu</span>
            <span className="sm:hidden">QR</span>
          </Link>

          {/* Mobile Admin Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Admin Menu"
          >
            {isMobileMenuOpen ? <CloseIcon className="w-4 h-4 text-amber-400" /> : <MenuIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Admin Mobile Slide-Down Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-4 py-3 space-y-1 text-xs font-semibold animate-in slide-in-from-top-2">
          <Link
            to="/admin"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>Dashboard Overview</span>
          </Link>
          <Link
            to="/admin/kitchen"
            className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <div className="flex items-center gap-2.5">
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Kitchen Display (KDS)</span>
            </div>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white font-bold text-[10px]">
                {activeOrdersCount}
              </span>
            )}
          </Link>
          <Link
            to="/admin/floor-plan"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Floor Plan & Layout</span>
          </Link>
          <Link
            to="/admin/tables"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Tables & QR Code Placards</span>
          </Link>
          <Link
            to="/admin/menu"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Menu & Price Changes</span>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <ReceiptText className="w-4 h-4 text-amber-400" />
            <span>Orders & Invoicing</span>
          </Link>
          <Link
            to="/admin/staff"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Staff Roster & Duty</span>
          </Link>
          <Link
            to="/admin/subscription"
            className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Subscription Plan (₹1,000/mo)</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>POS & Printer Settings</span>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
