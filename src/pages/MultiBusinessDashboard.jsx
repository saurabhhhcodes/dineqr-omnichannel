// src/pages/MultiBusinessDashboard.jsx - Master Multi-Business Showcase Dashboard & Vertical Switcher
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  UtensilsCrossed,
  ChefHat,
  Tv,
  Smartphone,
  CreditCard,
  Users,
  Database,
  ArrowRight,
  TrendingUp,
  Receipt,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Coffee,
  Beer,
  Stethoscope,
  Dumbbell,
  Layers,
  Search,
  ExternalLink,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { openRazorpayCheckout } from '../utils/razorpayCheckout.js';

const BUSINESS_VERTICALS = [
  {
    id: 'rest_losteria',
    slug: 'losteria',
    name: "L'Osteria Fine Dine Bistro",
    category: 'Fine Dine Restaurant',
    icon: '🍷',
    themeColor: 'amber',
    tagline: 'Multi-course KOTs, wine pairing and table-side captain ordering',
    todaySales: '₹48,250',
    ordersToday: 64,
    avgTicket: '₹753',
    stationLabel: 'Dining Tables',
    stationCount: '12 Tables (8 Seated)',
    primaryCapabilities: [
      'Interactive Visual Floor Plan Layout',
      'Table-Side Captain Waiter Ordering App',
      'AI CCTV Table Occupancy & Waiter Attention Alert Bell',
      'Multi-Course KOT Firing (Starters -> Mains)',
      'Split Billing & Sommelier Recommendations',
    ],
    recommendedPlan: '₹1,500 / mo Local Plan',
    activeStations: [
      { id: 'tbl_1', name: 'Table 01', status: 'SEATED', guests: 2, bill: '₹780', time: '24 mins' },
      { id: 'tbl_2', name: 'Table 02', status: 'VACANT', guests: 4, bill: '₹0', time: 'Ready' },
      { id: 'tbl_3', name: 'Table 03', status: 'SEATED', guests: 4, bill: '₹1,420', time: '42 mins' },
      { id: 'tbl_4', name: 'Table 04', status: 'BILLED', guests: 6, bill: '₹2,350', time: 'Paying' },
    ],
  },
  {
    id: 'rest_spicecraft',
    slug: 'spicecraft',
    name: 'SpiceCraft QSR & Burger Bar',
    category: 'Fast Food & QSR',
    icon: '🍔',
    themeColor: 'orange',
    tagline: '3-second counter billing, combo upsells and token TV announcer',
    todaySales: '₹72,400',
    ordersToday: 218,
    avgTicket: '₹332',
    stationLabel: 'Order Terminals',
    stationCount: '3 Billing Counters + 2 Kiosks',
    primaryCapabilities: [
      'Rapid 3-Second Counter Cash/UPI Billing',
      'Food Court Overhead Token Screen TV',
      'Automated Voice Announcer ("Token #101 Ready")',
      'Combo Deals & Self-Service Tablet Kiosk',
    ],
    recommendedPlan: '₹1,500 / mo Local Plan',
    activeStations: [
      { id: 'kiosk_1', name: 'Kiosk #1', status: 'SEATED', guests: 1, bill: '₹340', time: 'Ordering' },
      { id: 'counter_1', name: 'Counter 01', status: 'SEATED', guests: 1, bill: '₹510', time: 'Punching' },
      { id: 'counter_2', name: 'Counter 02', status: 'VACANT', guests: 0, bill: '₹0', time: 'Open' },
      { id: 'token_tv', name: 'Token TV', status: 'SEATED', guests: 18, bill: 'Live', time: 'Broadcasting' },
    ],
  },
  {
    id: 'rest_cafe_botanica',
    slug: 'cafe-botanica',
    name: 'Cafe Botanica & Roastery',
    category: 'Cafe & Coffee Roastery',
    icon: '☕',
    themeColor: 'emerald',
    tagline: 'Beverage modifiers, bakery counter batches and guest loyalty cards',
    todaySales: '₹34,120',
    ordersToday: 112,
    avgTicket: '₹304',
    stationLabel: 'Cafe Corners',
    stationCount: '8 Coffee Tables + Patio',
    primaryCapabilities: [
      'Almond, Oat & Syrup Modifiers Matrix',
      'Bakery Display Case Batch Expiry Tracking',
      'Customer Loyalty Stamps (10th Coffee Free)',
      'High-Speed Wi-Fi QR Digital Portal',
    ],
    recommendedPlan: '₹1,500 / mo Local Plan',
    activeStations: [
      { id: 'c_1', name: 'Corner 01', status: 'SEATED', guests: 2, bill: '₹460', time: '15 mins' },
      { id: 'c_2', name: 'Patio Bay', status: 'SEATED', guests: 3, bill: '₹620', time: '35 mins' },
      { id: 'c_3', name: 'High Table', status: 'VACANT', guests: 2, bill: '₹0', time: 'Ready' },
      { id: 'c_4', name: 'Window Bar', status: 'SEATED', guests: 1, bill: '₹220', time: '10 mins' },
    ],
  },
  {
    id: 'rest_cloud_kitchen_one',
    slug: 'cloud-kitchen-one',
    name: 'GhostBrand Cloud Kitchen (5-in-1)',
    category: 'Cloud Kitchen (Delivery Only)',
    icon: '🛵',
    themeColor: 'purple',
    tagline: 'Multi-brand Zomato & Swiggy aggregator ingestion with recipe yield costing',
    todaySales: '₹98,600',
    ordersToday: 284,
    avgTicket: '₹347',
    stationLabel: 'Virtual Brands',
    stationCount: '5 Online Delivery Brands',
    primaryCapabilities: [
      'Single KDS Screen for 5 Virtual Cloud Brands',
      'Live Zomato & Swiggy Rider Dispatch Sync',
      'Recipe Costing & Raw Ingredient Auto-Deductions',
      'Porter Cargo Mini-Truck Ingredient Restock',
    ],
    recommendedPlan: '₹5,000 / mo Cloud Sync Plan',
    activeStations: [
      { id: 'b_1', name: 'Biryani Co', status: 'SEATED', guests: 12, bill: '₹4,120', time: 'Zomato Live' },
      { id: 'b_2', name: 'Burger Hub', status: 'SEATED', guests: 8, bill: '₹2,680', time: 'Swiggy Live' },
      { id: 'b_3', name: 'Wok & Roll', status: 'SEATED', guests: 6, bill: '₹1,890', time: 'Prepping' },
      { id: 'b_4', name: 'Dessert Den', status: 'SEATED', guests: 4, bill: '₹950', time: 'Rider En Route' },
    ],
  },
  {
    id: 'rest_taproom_brewery',
    slug: 'taproom-brewery',
    name: 'HopCraft Brewery & Taproom',
    category: 'Bar & Microbrewery',
    icon: '🍺',
    themeColor: 'amber',
    tagline: 'Running bar tabs, draft keg volume tracking and excise reports',
    todaySales: '₹1,24,000',
    ordersToday: 142,
    avgTicket: '₹873',
    stationLabel: 'Bar Seats & Booths',
    stationCount: '16 Bar Stools + 6 VIP Booths',
    primaryCapabilities: [
      'Running Customer Bar Tab Pre-Authorizations',
      'Excise Department Daily Liquor Consumption Log',
      'Dynamic Happy Hour Automated Price Scheduler',
      'Beer Keg Litre Weighing & Pour Cost Analytics',
    ],
    recommendedPlan: '₹5,000 / mo Cloud Sync Plan',
    activeStations: [
      { id: 'bar_1', name: 'Bar Stool 04', status: 'SEATED', guests: 1, bill: '₹1,120', time: 'Running Tab' },
      { id: 'bar_2', name: 'VIP Booth A', status: 'SEATED', guests: 6, bill: '₹4,800', time: '55 mins' },
      { id: 'bar_3', name: 'Tap Station 1', status: 'SEATED', guests: 4, bill: '₹2,640', time: 'Pouring' },
      { id: 'bar_4', name: 'Booth B', status: 'VACANT', guests: 4, bill: '₹0', time: 'Ready' },
    ],
  },
  {
    id: 'rest_medix_clinic',
    slug: 'medix-clinic',
    name: 'Medix OPD Clinic & Diagnostic Lab',
    category: 'Healthcare OPD & Pharmacy',
    icon: '🩺',
    themeColor: 'sky',
    tagline: 'Doctor OPD consultation rooms, digital pharmacy bills and patient tokens',
    todaySales: '₹52,800',
    ordersToday: 76,
    avgTicket: '₹694',
    stationLabel: 'Doctor OPD Rooms',
    stationCount: '4 Doctor Chambers + 1 Lab',
    primaryCapabilities: [
      'Patient Digital Queue & Consultation Rooms',
      'Instant Diagnostic Lab Test Bill Punching',
      'Pharmacy POS with Batch & Expiry Validation',
      '0% GST Configuration on Healthcare Consultations',
    ],
    recommendedPlan: '₹1,500 / mo Local Plan',
    activeStations: [
      { id: 'opd_1', name: 'Chamber 1 (Dr. Roy)', status: 'SEATED', guests: 1, bill: '₹600', time: 'Consulting' },
      { id: 'opd_2', name: 'Chamber 2 (Dr. Sen)', status: 'SEATED', guests: 1, bill: '₹800', time: 'Consulting' },
      { id: 'opd_3', name: 'Lab Phlebotomy', status: 'SEATED', guests: 2, bill: '₹1,450', time: 'Blood Sample' },
      { id: 'opd_4', name: 'Pharmacy Counter', status: 'VACANT', guests: 0, bill: '₹0', time: 'Open' },
    ],
  },
  {
    id: 'rest_ironpeak_gym',
    slug: 'ironpeak-gym',
    name: 'IronPeak Athletics & Protein Bar',
    category: 'Gym, Fitness & Supplements',
    icon: '🏋️',
    themeColor: 'rose',
    tagline: 'Workout day passes, locker tokens and whey protein shake counter',
    todaySales: '₹28,500',
    ordersToday: 58,
    avgTicket: '₹491',
    stationLabel: 'Workout Zones',
    stationCount: '6 Workout Bays + Shake Bar',
    primaryCapabilities: [
      'Single-Day & Monthly Workout Access Passes',
      'Whey Protein Shake & Smoothie Recipe Punch',
      'Biometric Check-in & Member Roster Logs',
      'Creatine, BCAA & Supplement Inventory Depot',
    ],
    recommendedPlan: '₹1,500 / mo Local Plan',
    activeStations: [
      { id: 'bay_1', name: 'Cardio Deck', status: 'SEATED', guests: 8, bill: '₹2,400', time: 'Active' },
      { id: 'bay_2', name: 'Free Weights', status: 'SEATED', guests: 14, bill: '₹4,200', time: 'Active' },
      { id: 'bay_3', name: 'Protein Bar', status: 'SEATED', guests: 3, bill: '₹780', time: 'Prepping Shakes' },
      { id: 'bay_4', name: 'Spin Studio', status: 'VACANT', guests: 0, bill: '₹0', time: 'Next Class 6 PM' },
    ],
  },
];

export function MultiBusinessDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { activeRestaurant, setActiveRestaurant, restaurants } = useRestaurant();

  const [selectedVerticalId, setSelectedVerticalId] = useState('rest_losteria');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const activeVertical =
    BUSINESS_VERTICALS.find((v) => v.id === selectedVerticalId) || BUSINESS_VERTICALS[0];

  const handleSwitchActiveBusiness = (vertical) => {
    setSelectedVerticalId(vertical.id);
    const matched = restaurants.find((r) => r.slug === vertical.slug || r.id === vertical.id);
    if (matched) {
      setActiveRestaurant(matched);
      addToast(`Switched active workspace to: ${vertical.name}`, 'success');
    } else {
      addToast(`Viewing showcase profile for: ${vertical.name}`, 'info');
    }
  };

  const handleTestRazorpayKey = async () => {
    setIsProcessingCheckout(true);
    try {
      addToast('Launching Razorpay Standard Checkout (Test Key: rzp_test_TxIAxSWbhZU5bk)...', 'info');
      await openRazorpayCheckout({
        amountPaise: 150000,
        receipt: `rcpt_test_${Date.now()}`,
        customerName: 'Verified Business Partner',
        customerEmail: 'merchant@dineqr.com',
        customerPhone: '+919876543210',
        restaurantName: activeVertical.name,
        onSuccess: (p) => {
          addToast(`Payment Verified! ID: ${p.razorpay_payment_id}`, 'success');
        },
        onDismiss: () => {
          addToast('Checkout modal dismissed by user.', 'info');
        },
        onError: (err) => {
          addToast(`Checkout error: ${err.message}`, 'error');
        },
      });
    } catch (e) {
      addToast(`Error: ${e.message}`, 'error');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Banner */}
      <section className="border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-4 sm:px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Universal Multi-Vertical Architecture · 10 Tailored Dashboards</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Switch Business Models Instantly
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Explore how DineQR dynamically adapts its KOT rules, station layouts, billing speeds, and reports for every hospitality and retail vertical.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTestRazorpayKey}
              disabled={isProcessingCheckout}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Test Razorpay (rzp_test_TxIAxSWbhZU5bk)</span>
            </button>
            <Link
              to="/walkthrough"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center gap-1.5 transition"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>All-Flows Walkthrough</span>
            </Link>
          </div>
        </div>

        {/* Business Selector Pills */}
        <div className="max-w-7xl mx-auto mt-6 flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {BUSINESS_VERTICALS.map((vertical) => {
            const isSelected = selectedVerticalId === vertical.id;
            return (
              <button
                key={vertical.id}
                onClick={() => handleSwitchActiveBusiness(vertical)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 scale-105 font-black'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="text-sm">{vertical.icon}</span>
                <span>{vertical.category}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Active Vertical Dashboard View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Active Business Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-3xl flex items-center justify-center border border-amber-500/30 shrink-0">
              {activeVertical.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {activeVertical.category}
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {activeVertical.recommendedPlan}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">{activeVertical.name}</h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">{activeVertical.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <Link
              to={`/menu?restaurant=${activeVertical.slug}&table=tbl_1`}
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Customer Menu</span>
            </Link>
            <Link
              to="/captain"
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Captain App</span>
            </Link>
            <Link
              to="/admin/kitchen"
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kitchen KDS</span>
            </Link>
            <Link
              to="/tokens"
              className="flex-1 lg:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              <span>Token TV</span>
            </Link>
          </div>
        </div>

        {/* 4 Core KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Today's Revenue</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1">
              {activeVertical.todaySales}
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+18% vs yesterday</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Completed Orders</div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
              {activeVertical.ordersToday}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">0 canceled orders</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">Average Ticket Value</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1">
              {activeVertical.avgTicket}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Zero commission taken</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="text-xs text-slate-400 font-medium">{activeVertical.stationLabel}</div>
            <div className="text-lg sm:text-xl font-black text-white font-mono mt-1 truncate">
              {activeVertical.stationCount}
            </div>
            <div className="text-[11px] text-sky-400 mt-1 font-semibold">Live status tracking</div>
          </div>
        </div>

        {/* Live Station / Table Activity Grid & Functionality Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Active Tables / Stations (7 Cols) */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>Live {activeVertical.stationLabel} Grid</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-xs text-slate-400">Click any station to open customer menu or captain order</p>
              </div>
              <Link
                to="/admin/floor-plan"
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Floor Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeVertical.activeStations.map((stn) => (
                <div
                  key={stn.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    stn.status === 'SEATED'
                      ? 'bg-amber-500/10 border-amber-500/40 text-white'
                      : stn.status === 'BILLED'
                      ? 'bg-purple-500/10 border-purple-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-white text-sm">{stn.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        stn.status === 'SEATED'
                          ? 'bg-amber-500 text-slate-950'
                          : stn.status === 'BILLED'
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {stn.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs flex justify-between text-slate-300 font-mono">
                    <span>Current Tab: <strong className="text-white">{stn.bill}</strong></span>
                    <span>{stn.time}</span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <Link
                      to={`/menu?restaurant=${activeVertical.slug}&table=${stn.id}`}
                      className="text-amber-400 hover:underline font-bold"
                    >
                      Scan QR &rarr;
                    </Link>
                    <Link
                      to="/captain"
                      className="text-slate-300 hover:text-white font-semibold"
                    >
                      Punch KOT &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tailored Capabilities for this Vertical (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Tailored Vertical Capabilities</span>
              </div>
              <h3 className="text-lg font-black text-white">Why {activeVertical.category} Wins with DineQR</h3>
              <p className="text-xs text-slate-400 mt-1">
                Configured out-of-the-box. No extra developer work, zero expensive yearly add-on bills.
              </p>

              <div className="mt-4 space-y-2.5">
                {activeVertical.primaryCapabilities.map((cap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/cctv-demo"
                className="mt-3.5 p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs font-bold text-rose-200 flex items-center justify-between hover:bg-rose-900/40 transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <div className="text-white font-extrabold flex items-center gap-1.5">
                      <span>Live AI CCTV Table Risk Demo</span>
                      <span className="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-black">NEW</span>
                    </div>
                    <div className="text-[10px] text-rose-300">Test computer vision surveillance &amp; waiter alert bell</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Database Hosting:</span>
                <span className="text-emerald-400 font-bold">100% Free SQLite + Mongo Atlas M0</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Payment Gateway:</span>
                <span className="text-amber-400 font-bold">Razorpay 0% Platform Fee</span>
              </div>
              <Link
                to="/pricing"
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition mt-2"
              >
                <span>View {activeVertical.recommendedPlan} Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default MultiBusinessDashboard;
