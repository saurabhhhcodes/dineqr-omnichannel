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
  Sparkles,
  Plus,
} from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { DineQRLogo } from './DineQRLogo.jsx';

function BusinessSwitcher({ activeRestaurant, setActiveRestaurant, addToast, isDark = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const BUSINESS_OPTIONS = [
    {
      id: 'rest_losteria',
      slug: 'losteria',
      name: "L'Osteria Gourmet Bistro",
      niche: 'Restaurant & Bar · Tables',
      icon: Utensils,
      color: 'bg-amber-500 text-slate-950',
      badge: 'Fine Dine',
    },
    {
      id: 'rest_roastery',
      slug: 'roastery-cafe',
      name: 'The Roastery Coffee House',
      niche: 'Cafe & Bakery · Counter',
      icon: Store,
      color: 'bg-orange-500 text-white',
      badge: 'Cafe',
    },
    {
      id: 'rest_ironpulse_gym',
      slug: 'ironpulse-gym',
      name: 'IronPulse Fitness Club',
      niche: 'Gym, Member Register & Shakes',
      icon: Dumbbell,
      color: 'bg-emerald-500 text-slate-950',
      badge: 'Gym & Fitness',
    },
    {
      id: 'rest_apex_clinic',
      slug: 'apex-clinic',
      name: 'Apex Healthcare Clinic',
      niche: 'OPD Tokens & Consultations',
      icon: Stethoscope,
      color: 'bg-sky-500 text-white',
      badge: 'Doctor Clinic',
    },
    {
      id: 'rest_glamour_salon',
      slug: 'glamour-salon',
      name: 'Glamour & Groom Salon',
      niche: 'Stylist Chairs & Spa',
      icon: Sparkles,
      color: 'bg-purple-500 text-white',
      badge: 'Salon & Spa',
    },
    {
      id: 'rest_mw6ft1z4h1j',
      slug: 'saurabh-bajpai-bistro-roastery',
      name: 'Saurabh Bajpai Bistro & Roastery',
      niche: 'Custom Onboarded User',
      icon: Zap,
      color: 'bg-rose-500 text-white',
      badge: 'Your Account',
    },
  ];

  const currentOption = BUSINESS_OPTIONS.find(
    (b) => b.id === activeRestaurant?.id || b.slug === activeRestaurant?.slug
  ) || BUSINESS_OPTIONS[0];

  const CurrentIcon = currentOption.icon;

  const handleSelect = (b) => {
    setActiveRestaurant(b.id);
    addToast(`Switched active business to ${b.name}!`, 'info');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
          isDark
            ? 'bg-slate-900 border-slate-700 hover:border-amber-500 text-white'
            : 'bg-slate-100 border-slate-200 hover:border-amber-500 text-slate-900'
        }`}
        title="Switch Business Vertical (Restaurant, Cafe, Gym, Clinic, Salon)"
      >
        <span className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] ${currentOption.color}`}>
          <CurrentIcon className="w-3 h-3" />
        </span>
        <span className="max-w-[100px] sm:max-w-[150px] truncate text-left">
          {activeRestaurant?.name || currentOption.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180 text-amber-400' : 'text-slate-400'}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 sm:left-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
            <span>Switch Business Niche</span>
            <span className="text-amber-400 font-mono">1-Tap Switch</span>
          </div>

          <div className="space-y-1 py-1.5 max-h-72 overflow-y-auto">
            {BUSINESS_OPTIONS.map((b) => {
              const Icon = b.icon;
              const isSelected = activeRestaurant?.id === b.id || activeRestaurant?.slug === b.slug;
              return (
                <button
                  key={b.id}
                  onClick={() => handleSelect(b)}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border border-amber-500/40 text-white'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${b.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-white text-xs truncate flex items-center justify-between">
                      <span className="truncate">{b.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-amber-300 border border-slate-700 font-extrabold shrink-0">
                        {b.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{b.niche}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function Navbar({ onOpenCart }) {
  const location = useLocation();
  const { itemCount, grandTotal, table } = useCart();
  const { activeRestaurant, setActiveRestaurant } = useRestaurant();
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
    location.pathname === '/downloads' ||
    location.pathname === '/poss' ||
    location.pathname === '/compare/petpooja' ||
    location.pathname === '/captain' ||
    location.pathname === '/tokens' ||
    location.pathname === '/showcase' ||
    location.pathname === '/dashboards' ||
    location.pathname === '/business-dashboard';

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
            <DineQRLogo size="md" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-lg tracking-tight">DineQR</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-800 hidden sm:inline-block">
                ₹1,500/mo POS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link
              to="/showcase"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/showcase' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>10 Dashboards</span>
            </Link>

            <Link
              to="/poss"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/poss' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>POS Solutions</span>
            </Link>

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
              to="/pricing"
              className={`hover:text-amber-400 transition flex items-center gap-1.5 ${
                location.pathname === '/pricing' ? 'text-amber-400 font-bold' : ''
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Pricing (₹1,500/mo)</span>
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            <BusinessSwitcher
              activeRestaurant={activeRestaurant}
              setActiveRestaurant={setActiveRestaurant}
              addToast={addToast}
              isDark={true}
            />

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
                to="/showcase"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>Switch 10 Business Dashboards</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

              <Link
                to="/poss"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>Petpooja POS Alternative & Demo</span>
                </div>
                <ChevronDown className="w-4 h-4 -rotate-90 text-slate-500" />
              </Link>

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
                to="/pricing"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 text-slate-200 hover:text-amber-400 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Subscription Pricing (Flat ₹1,500/mo)</span>
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
              <DineQRLogo size="md" />
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

          {/* Right Customer Actions: Business Switcher + Call Waiter + Cart Button */}
          <div className="flex items-center gap-2 shrink-0">
            <BusinessSwitcher
              activeRestaurant={activeRestaurant}
              setActiveRestaurant={setActiveRestaurant}
              addToast={addToast}
              isDark={false}
            />

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
    <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-md w-full max-w-full overflow-x-clip">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Restaurant Identity & Active Station */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link to="/admin" className="flex items-center gap-2.5 group shrink-0">
            <DineQRLogo size="md" />
            <div>
              <div className="font-bold text-white text-sm tracking-tight leading-none flex items-center gap-1.5">
                <span className="truncate max-w-[140px] sm:max-w-[180px]">
                  {activeRestaurant?.name || "L'Osteria Bistro"}
                </span>
                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hidden sm:inline-block">
                  Terminal
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block truncate max-w-[180px]">
                {activeRestaurant?.tagline || 'Restaurant Operations Suite'}
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Admin Operations Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 text-xs font-medium text-slate-300 shrink">
          {activeRestaurant?.business_type === 'gym' ? (
            <>
              <Link
                to="/gym-register"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/gym-register')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Member Attendance</span>
              </Link>
              <Link
                to="/admin/tables"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/tables')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Bays & Lockers</span>
              </Link>
              <Link
                to="/admin/menu"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/menu')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Shakes & Passes</span>
              </Link>
              <Link
                to="/admin/inventory"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/inventory')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Supplements Stock</span>
              </Link>
              <Link
                to="/admin/purchases"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/purchases')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Purchases (RfQ)</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/orders')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Fees & Bills</span>
              </Link>
              <Link
                to="/admin/staff"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/staff')
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Trainers Roster</span>
              </Link>
            </>
          ) : activeRestaurant?.business_type === 'clinic' ? (
            <>
              <Link
                to="/admin/kitchen"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/kitchen')
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>OPD Token Queue</span>
                {activeOrdersCount > 0 && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-black bg-rose-600 text-white rounded-full">
                    {activeOrdersCount}
                  </span>
                )}
              </Link>
              <Link
                to="/admin/tables"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/tables')
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Chambers & Kiosks</span>
              </Link>
              <Link
                to="/admin/menu"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/menu')
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Services & Tests</span>
              </Link>
              <Link
                to="/admin/inventory"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/inventory')
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Pharmacy Stock</span>
              </Link>
              <Link
                to="/admin/purchases"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/purchases')
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Purchases (RfQ)</span>
              </Link>
              <Link
                to="/admin/orders"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/orders')
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <ReceiptText className="w-3.5 h-3.5" />
                <span>Patient Bills</span>
              </Link>
            </>
          ) : (
            <>
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
                to="/admin/tables"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/tables')
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Tables & QR</span>
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
                to="/admin/inventory"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/inventory')
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Inventory</span>
              </Link>
              <Link
                to="/admin/purchases"
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                  location.pathname.startsWith('/admin/purchases')
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'hover:bg-slate-900 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Purchases (RfQ)</span>
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
                <span>Staff</span>
              </Link>
            </>
          )}

          {/* Operations Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOperationsDropdownOpen(!isOperationsDropdownOpen)}
              className="px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 hover:bg-slate-900 hover:text-white cursor-pointer"
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {isOperationsDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-2xl border border-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95">
                <Link
                  to="/admin/floor-plan"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Floor Plan (Odoo Parity)</span>
                </Link>
                <Link
                  to="/admin/reservations"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Table Reservations</span>
                </Link>
                <Link
                  to="/captain"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Captain Waiter App</span>
                </Link>
                <Link
                  to="/tokens"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Token TV Display</span>
                </Link>
                <div className="my-1 border-t border-slate-800" />
                <Link
                  to="/admin/subscription"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-amber-400 hover:bg-slate-800 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SaaS Plans (₹1.5k / ₹3.5k / ₹7k)</span>
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setIsOperationsDropdownOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>POS Settings & Aggregators</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Quick Customer Live Preview + Business Switcher + Mobile Admin Menu Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <BusinessSwitcher
            activeRestaurant={activeRestaurant}
            setActiveRestaurant={setActiveRestaurant}
            addToast={addToast}
            isDark={true}
          />

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
            to="/admin/inventory"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Boxes className="w-4 h-4 text-emerald-400" />
            <span>Inventory Tracking</span>
          </Link>
          <Link
            to="/admin/purchases"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <FileSpreadsheet className="w-4 h-4 text-sky-400" />
            <span>Vendor Purchases (RfQ)</span>
          </Link>
          <Link
            to="/admin/reservations"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Table Reservations</span>
          </Link>
          <Link
            to="/gym-register"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-emerald-300"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>Gym Member Attendance</span>
          </Link>
          <Link
            to="/admin/subscription"
            className="flex items-center gap-2.5 p-2 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Subscription Plans (₹1,500 / ₹3,500 / ₹7,000)</span>
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-900 text-slate-200"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>POS & Aggregator Settings</span>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Navbar;
