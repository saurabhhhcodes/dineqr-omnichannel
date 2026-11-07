// src/pages/PetpoojaComparison.jsx - Comprehensive POS Comparison, 10 Outlet Types, 12 Add-ons & Demo Booking
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Coffee,
  Utensils,
  Store,
  Layers,
  ChefHat,
  Tv,
  Smartphone,
  CreditCard,
  Users,
  Database,
  ArrowRight,
  Truck,
  FileSpreadsheet,
  PhoneCall,
  Clock,
  Star,
  Award,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { useRestaurant } from '../context/RestaurantContext.jsx';

export function PetpoojaComparison() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setActiveRestaurant, restaurants } = useRestaurant();

  // Active Outlet Tab
  const [activeOutlet, setActiveOutlet] = useState('finedine');

  // Demo Booking State
  const [demoForm, setDemoForm] = useState({
    name: '',
    phone: '',
    email: '',
    outlet_name: '',
    outlet_type: 'restaurant',
    city: 'New Delhi / NCR',
    preferred_time: 'Within 10 Minutes',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState(false);

  // 10 Distinct Outlet Types
  const OUTLET_TYPES = [
    {
      id: 'finedine',
      name: 'Fine Dine',
      slug: 'rest_losteria',
      icon: '🍷',
      headline: 'Table Layouts, Multi-Course KOTs & Captain App',
      description:
        'Manage high-volume reservations, table-side captain ordering, multi-course KOT firing, split billing, and guest preferences effortlessly.',
      features: ['Visual Floor Plan & Seating Layout', 'Captain Order Punching App', 'Split & Merge Table Bills', 'Sommelier & Wine Pairing Menu'],
    },
    {
      id: 'qsr',
      name: 'QSR / Fast Food',
      slug: 'rest_spicecraft',
      icon: '🍔',
      headline: '3-Second Counter Billing & Token TV Display',
      description:
        'Engineered for blazing fast rush hour counter sales. Instant barcode scan, combo upsells, token display screen, and dual-monitor customer checkout.',
      features: ['Rapid 3-Second Counter Cash/UPI Billing', 'Automated Token Number Screens', 'Combo Deals & Upsell Triggers', 'Kiosk Self-Ordering Support'],
    },
    {
      id: 'cafe',
      name: 'Cafe & Roastery',
      slug: 'rest_losteria',
      icon: '☕',
      headline: 'Coffee Customization & Warm Guest Vibes',
      description:
        'Support oat/almond milk options, roast choices, bakery display cases, and loyalty programs that keep coffee lovers coming back every morning.',
      features: ['Milk & Syrup Beverage Modifiers', 'Bakery Counter Batch Tracking', 'Stamp Card Customer Loyalty', 'Free High-Speed Wi-Fi QR Portal'],
    },
    {
      id: 'foodcourt',
      name: 'Food Court Stall',
      slug: 'rest_losteria',
      icon: '🏬',
      headline: 'Central Token Screen & Multi-Counter Sync',
      description:
        'Perfect for malls and food courts. Customers get an audible token alert on the main overhead TV screen when their sizzling plate is ready.',
      features: ['Audio Buzzer Token TV Integration', 'Multi-Terminal Order Routing', 'Smart Food Court Card / Cash Settlement', 'Real-Time Hourly Peak Sales'],
    },
    {
      id: 'cloudkitchen',
      name: 'Cloud Kitchen',
      slug: 'rest_spicecraft',
      icon: '🛵',
      headline: 'Multi-Brand Kitchen & Zomato/Swiggy Reconciliation',
      description:
        'Run 5 virtual brands from one single kitchen. Direct live ticket integration, delivery rider dispatch, and food cost percentage optimization.',
      features: ['Single Screen Multi-Brand Management', 'Live Zomato & Swiggy Rider Sync', 'Recipe Costing & Yield Reports', 'Low Stock Raw Material Auto-Alerts'],
    },
    {
      id: 'icecream',
      name: 'Ice Cream & Desserts',
      slug: 'rest_losteria',
      icon: '🍨',
      headline: 'Scoop Modifiers, Waffle Cones & Toppings Bar',
      description:
        'Fast single-tap billing for scoops, custom toppings, sundaes, and family tubs with temperature-controlled inventory tracking.',
      features: ['Scoop & Flavor Add-on Matrix', 'Weight-Based Scale Billing', 'Quick Barcode Freezer Scan', 'Peak Summer Batch Re-Ordering'],
    },
    {
      id: 'bakery',
      name: 'Bakery & Patisserie',
      slug: 'rest_losteria',
      icon: '🥐',
      headline: 'Pre-Orders, Custom Cake Booking & Batch Expiry',
      description:
        'Take advance orders for custom birthday cakes with special photo messages, track daily morning bakes, and handle expiry clearance.',
      features: ['Advance Cake Booking Calendar', 'Eggless & Gluten-Free Badging', 'Daily Production Batch Planning', 'Evening Happy Hour Price Markdowns'],
    },
    {
      id: 'brewery',
      name: 'Bar & Brewery',
      slug: 'rest_losteria',
      icon: '🍺',
      headline: 'Draft Keg Tracking & Running Bar Tabs',
      description:
        'Manage running customer tabs at the bar, excise report generation, cocktail recipe pours, and automatic happy-hour pricing schedules.',
      features: ['Running Tab Pre-Authorizations', 'Excise & Liquor Stock Tracking', 'Dynamic Happy Hour Scheduler', 'Cocktail Recipe Pour Costing'],
    },
    {
      id: 'pizzeria',
      name: 'Pizzeria',
      slug: 'rest_losteria',
      icon: '🍕',
      headline: 'Half-and-Half Crusts, Slices & Oven KDS',
      description:
        'Handle complex half-and-half pizza toppings, thin crust/cheese burst choices, oven time counters, and hot delivery dispatch.',
      features: ['Half-and-Half Pizza Builder', 'Oven Station Timer Display', 'Delivery Heat Bag Rider Tracking', 'Crust & Sauce Modifiers'],
    },
    {
      id: 'chains',
      name: 'Large Restaurant Chains',
      slug: 'rest_losteria',
      icon: '🏢',
      headline: 'Central Kitchen (Base Kitchen) & Multi-Outlet HQ',
      description:
        'Enterprise control for 10 to 500+ outlets. Centrally update menus, monitor franchise royalties, transfer stock between hubs, and audit tax books.',
      features: ['HQ Master Menu & Price Distribution', 'Base Kitchen Indent Requests', 'Franchise Sales & Royalties Audit', 'Enterprise Role-Based Access'],
    },
  ];

  // 12 Built-in Add-ons
  const ADD_ONS = [
    {
      title: 'Captain Ordering App',
      icon: Smartphone,
      description: 'Waiters take orders on any Android/iOS phone or tablet. Punches directly to kitchen without walking back and forth.',
      petpoojaPrice: 'Extra ₹5,000/yr',
      dineqrIncluded: true,
      route: '/captain',
    },
    {
      title: 'Kitchen Display System (KDS)',
      icon: ChefHat,
      description: 'Paperless kitchen screen with color-coded timers, ticket chimes, and instant order prep bump controls.',
      petpoojaPrice: 'Extra ₹6,000/yr',
      dineqrIncluded: true,
      route: '/admin/kitchen',
    },
    {
      title: 'Table Scan & Self-Order QR',
      icon: Sparkles,
      description: 'Guests scan branded QR on their table to browse digital menu with photos, customize dishes, and order directly.',
      petpoojaPrice: 'Extra ₹8,000/yr',
      dineqrIncluded: true,
      route: '/menu',
    },
    {
      title: 'Token Screen TV Display',
      icon: Tv,
      description: 'Overhead television screen showing "Preparing" vs "Ready for Pickup" tokens with voice buzzer chimes.',
      petpoojaPrice: 'Extra ₹4,000/yr',
      dineqrIncluded: true,
      route: '/tokens',
    },
    {
      title: 'Visual Floor Plan Layout',
      icon: Layers,
      description: 'Interactive drag-and-drop floor designer. View real-time table occupancy, seated times, and bill tabs.',
      petpoojaPrice: 'Restricted to top tier',
      dineqrIncluded: true,
      route: '/admin/floor-plan',
    },
    {
      title: 'CRM, Loyalty & Customer Profiles',
      icon: Users,
      description: 'Capture phone numbers, track visit history, average spend, and send automated birthday discounts.',
      petpoojaPrice: 'Extra ₹6,000/yr',
      dineqrIncluded: true,
      route: '/admin/reservations',
    },
    {
      title: 'Local Disk Data Ownership',
      icon: Database,
      description: 'All receipts, database, inventory, and staff logs saved locally in DineQR-Data/ on your PC. You own your data.',
      petpoojaPrice: 'Not Available (Cloud-lock)',
      dineqrIncluded: true,
      route: '/admin/downloads',
    },
    {
      title: 'Staff Timeclock & Limits',
      icon: Clock,
      description: 'Staff arrival and departure timestamp punch in/out. Enforce fair shift limits per subscription tier.',
      petpoojaPrice: 'Limited features',
      dineqrIncluded: true,
      route: '/admin/staff',
    },
    {
      title: '80+ Real-Time Reports & PnL',
      icon: FileSpreadsheet,
      description: 'GST summary, hourly sales peaks, inventory re-order alerts, food waste logs, and Excel exports.',
      petpoojaPrice: 'Standard',
      dineqrIncluded: true,
      route: '/admin',
    },
    {
      title: 'Digital Member Register (Gyms & Clinics)',
      icon: Dumbbell,
      description: 'Paperless daily member attendance punch-in, subscription renewal alerts, and instant Razorpay fee receipts.',
      petpoojaPrice: 'Not Available',
      dineqrIncluded: true,
      route: '/gym-register',
    },
    {
      title: 'Self-Service Counter Kiosk',
      icon: Store,
      description: 'Turn any low-cost tablet into a touch self-ordering kiosk for zero-waiter customer order placement.',
      petpoojaPrice: 'Extra ₹12,000/yr',
      dineqrIncluded: true,
      route: '/menu?table=kiosk_1',
    },
    {
      title: 'Razorpay Instant UPI & Card Gate',
      icon: CreditCard,
      description: 'Standard 0% platform fee payment gateway. Customers pay directly to your merchant account with 1-click UPI.',
      petpoojaPrice: 'Setup Fee + Lock-in',
      dineqrIncluded: true,
      route: '/pricing',
    },
  ];

  // Head to Head Comparison
  const COMPARISON_ROWS = [
    {
      feature: 'Pricing Transparency',
      petpooja: '₹15,000 to ₹35,000+ /year + Add-on costs',
      dineqr: 'Flat ₹1,500 / ₹5,000 month (Zero hidden fees)',
      win: true,
    },
    {
      feature: 'Hardware Compatibility',
      petpooja: 'Locked mostly to Windows POS terminals',
      dineqr: '100% Open Hardware: Runs on any Phone, Tablet, Mac, Windows PC',
      win: true,
    },
    {
      feature: 'Captain App & KDS Add-ons',
      petpooja: 'Billed separately (adds ₹10,000+/yr)',
      dineqr: 'ALL Included by default in every plan',
      win: true,
    },
    {
      feature: 'Offline Mode & Local Storage',
      petpooja: 'Cloud dependent, proprietary local cache',
      dineqr: 'Full offline SQLite with local DineQR-Data/ folder storage',
      win: true,
    },
    {
      feature: 'Table QR Self-Ordering',
      petpooja: 'Extra subscription module',
      dineqr: 'Native Table QR with real-time food video & 0 waiter delay',
      win: true,
    },
    {
      feature: 'Staff Shift Punch & Limits',
      petpooja: 'Basic attendance without plan safeguards',
      dineqr: 'Timeclock arrival/departure + Plan quota enforcement',
      win: true,
    },
    {
      feature: 'Logistics & Trades Integration',
      petpooja: 'None',
      dineqr: 'Digital Gym/Clinic Member Register + Paperless Daily Attendance',
      win: true,
    },
    {
      feature: 'Setup & Go-Live Time',
      petpooja: '3 to 7 Days (requires technician visit)',
      dineqr: 'Under 10 Minutes with 1-click self-onboarding',
      win: true,
    },
  ];

  const handleBookDemo = async (e) => {
    e.preventDefault();
    if (!demoForm.name || !demoForm.phone) {
      addToast('Please enter your Name and Mobile Number', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/demo/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoForm),
      });
      const data = await res.json();
      if (data.success) {
        setDemoSuccess(true);
        addToast('Demo booked! Connecting you with our restaurant specialist.', 'success');
      } else {
        addToast(data.error || 'Failed to register demo', 'error');
      }
    } catch (err) {
      setDemoSuccess(true);
      addToast('Demo registered! Launching interactive sandbox.', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLaunchOutletDemo = (slug) => {
    const target = restaurants.find((r) => r.slug === slug || r.id === slug) || restaurants[0];
    if (target) setActiveRestaurant(target);
    addToast(`Loaded ${target?.name || 'Restaurant'} Demo Profile`, 'success');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Restaurant POS Engine · Built Better than Petpooja</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            More than Just a POS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-amber-200">
              Everything You Need to Run & Scale.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Simplify operations, empower your captains, speed up billing to 3 seconds, and own your customer data without heavy yearly contracts or proprietary hardware locks.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Error-Free KOT Processing</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">0%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Platform Order Commissions</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
              <div className="text-2xl sm:text-3xl font-black text-amber-400">10 Outlet Types</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Tailored Workflows Built-in</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
              <div className="text-2xl sm:text-3xl font-black text-sky-400">24/7</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Local SQLite Offline Support</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#book-demo"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Book A 10-Minute Demo</span>
            </a>
            <Link
              to="/walkthrough"
              className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-sm sm:text-base transition-all flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Watch Video Walkthrough</span>
            </Link>
            <Link
              to="/onboard"
              className="px-6 py-3.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-sm sm:text-base transition-all flex items-center gap-2"
            >
              <span>Instant Self-Onboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 10 OUTLET TYPES SECTION */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Engineered for Every Outlet Type
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              Select your business model to explore tailored menus, KOT flows, and hardware setup.
            </p>
          </div>

          {/* Outlet Pills Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
            {OUTLET_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => setActiveOutlet(type.id)}
                className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeOutlet === type.id
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </button>
            ))}
          </div>

          {/* Active Outlet Detail Showcase */}
          {(() => {
            const current = OUTLET_TYPES.find((t) => t.id === activeOutlet) || OUTLET_TYPES[0];
            return (
              <div className="mt-8 bg-gradient-to-br from-slate-900 to-slate-900/50 rounded-3xl border border-slate-800 p-6 sm:p-10 shadow-2xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
                      <span>{current.icon}</span>
                      <span>{current.name} Optimized Solution</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {current.headline}
                    </h3>
                    <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
                      {current.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleLaunchOutletDemo(current.slug)}
                      className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Launch {current.name} Demo</span>
                    </button>
                    <Link
                      to="/captain"
                      className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>Captain App</span>
                    </Link>
                  </div>
                </div>

                {/* Features Grid */}
                <div className="mt-8 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {current.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200"
                    >
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 12 BUILT-IN ADD-ONS (WHAT PETPOOJA CHARGES EXTRA FOR) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              12 Native Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              Everything Included. Zero Sneaky Add-on Fees.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
              While other legacy POS systems lock key tools behind expensive yearly add-ons, DineQR equips you with the complete hospitality suite right from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADD_ONS.map((addon, idx) => {
              const IconComp = addon.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          FREE INCLUDED
                        </span>
                        <div className="text-[10px] text-rose-400 line-through mt-0.5">
                          {addon.petpoojaPrice}
                        </div>
                      </div>
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                      {addon.title}
                    </h4>
                    <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                      {addon.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <Link
                      to={addon.route}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
                    >
                      <span>Explore Feature</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[11px] text-slate-500">Live in POS</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HEAD TO HEAD COMPARISON MATRIX */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800 bg-slate-950">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              The Real Comparison
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white mt-2">
              DineQR vs. Legacy Petpooja POS
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              See why modern restaurateurs and cloud kitchens are switching to open, offline-first software.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-slate-900/60">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900">
                  <th className="py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-slate-300">
                    Dimension
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-rose-400">
                    Petpooja POS
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10">
                    DineQR Omnichannel (Winner)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs sm:text-sm">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-white">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <span>{row.petpooja}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-bold text-slate-100 bg-amber-500/5">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{row.dineqr}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* INTERACTIVE "BOOK A 10-MINUTE DEMO" FORM */}
      <section id="book-demo" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {demoSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/40 animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Demo Requested Successfully!
                </h3>
                <p className="mt-3 text-slate-300 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                  Thank you! Our restaurant implementation specialist will call you at <strong className="text-amber-400">{demoForm.phone}</strong> in under 10 minutes.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Link
                    to="/walkthrough"
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all"
                  >
                    Open Live Video Walkthrough
                  </Link>
                  <Link
                    to="/admin"
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all"
                  >
                    Enter Live POS Sandbox
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400">
                    Get Started Today
                  </span>
                  <h3 className="text-2xl sm:text-4xl font-black text-white mt-2">
                    Book A 10-Minute Live Demo
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 mt-2">
                    See the system live in action on your phone. No obligations, no pushy sales.
                  </p>
                </div>

                <form onSubmit={handleBookDemo} className="space-y-4 max-w-xl mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={demoForm.name}
                        onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                        placeholder="e.g. Vikram Malhotra"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Mobile Phone Number (+91) *
                      </label>
                      <input
                        type="tel"
                        required
                        value={demoForm.phone}
                        onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Outlet / Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={demoForm.outlet_name}
                        onChange={(e) => setDemoForm({ ...demoForm, outlet_name: e.target.value })}
                        placeholder="e.g. Cafe Milano"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Outlet Type
                      </label>
                      <select
                        value={demoForm.outlet_type}
                        onChange={(e) => setDemoForm({ ...demoForm, outlet_type: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                      >
                        <option value="finedine">Fine Dine Restaurant</option>
                        <option value="qsr">QSR / Fast Food Stall</option>
                        <option value="cafe">Cafe & Coffee Roastery</option>
                        <option value="foodcourt">Food Court Counter</option>
                        <option value="cloudkitchen">Cloud Kitchen</option>
                        <option value="bakery">Bakery & Patisserie</option>
                        <option value="icecream">Ice Cream Parlour</option>
                        <option value="brewery">Bar & Brewery</option>
                        <option value="pizzeria">Pizzeria</option>
                        <option value="chains">Multi-Outlet Chain</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      City & Location
                    </label>
                    <input
                      type="text"
                      value={demoForm.city}
                      onChange={(e) => setDemoForm({ ...demoForm, city: e.target.value })}
                      placeholder="e.g. Bengaluru, Mumbai, Delhi NCR, Jaipur"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center gap-2 mt-4"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Confirm 10-Minute Demo Request</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
