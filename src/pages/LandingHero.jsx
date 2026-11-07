// src/pages/LandingHero.jsx - Professional Human-Crafted SaaS Landing Page for DineQR
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Stethoscope,
  UtensilsCrossed,
  Dumbbell,
  ShieldCheck,
  CreditCard,
  QrCode,
  Laptop,
  Database,
  CheckCircle2,
  Play,
  TrendingUp,
  Receipt,
  Building2,
  Lock,
  ChevronRight,
  ExternalLink,
  Video,
  Monitor,
  Smartphone,
  Zap,
  Check,
  Scissors,
  Truck,
  ChefHat,
  Layers,
  Store,
  Clock,
  Sparkles,
  Download,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const VIDEO_SUITE = [
  {
    id: 'restaurant_ordering',
    title: 'Table QR Ordering & GST Billing',
    subtitle: 'Customer Table QR Scan to Instant KOT Ticket & Tax Invoice',
    badge: 'Restaurant & Cafe',
    videoUrl: '/videos/walkthrough_restaurant.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    tags: ['Table QR Placards', 'Digital Menu', 'CGST + SGST Billing', 'UPI Direct Pay'],
    description: 'Customers scan the physical QR placard on Table 01, browse menu categories, add items to cart, view official GST tax breakdown, and place their order directly.',
    targetRoute: '/menu?restaurant=losteria&table=tbl_1',
    targetLabel: 'Try Table QR Menu Live',
  },
  {
    id: 'kitchen_kds',
    title: 'Kitchen Display System (KDS)',
    subtitle: 'Live Ticket Chimes, Status Pipeline & KOT Printing',
    badge: 'Kitchen Operations',
    videoUrl: '/videos/walkthrough_kds.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80',
    tags: ['Live Audio Chimes', 'Received -> Cooking -> Ready', '80mm Thermal KOT', 'Urgent Timers'],
    description: 'Incoming table orders ring live audio chimes in the kitchen. Chefs mark items "Preparing" and "Ready" with a single tap, syncing status back to front-of-house.',
    targetRoute: '/admin/kitchen',
    targetLabel: 'Open Kitchen KDS',
  },
  {
    id: 'floor_plan',
    title: 'Floor Plans & Premises Layout',
    subtitle: 'Visual Drag-and-Drop Dining Tables & Seated Tabs',
    badge: 'Floor Management',
    videoUrl: '/videos/walkthrough_floorplan.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    tags: ['Drag & Drop Tables', 'Live Seated Tabs', 'Capacity & Shapes', 'Local SQLite Sync'],
    description: 'Design custom floor layouts matching your physical dining hall. Drag tables into place, inspect running bills, and add tables dynamically.',
    targetRoute: '/admin/floor-plan',
    targetLabel: 'Launch Floor Plan Designer',
  },
  {
    id: 'mobile_pnl',
    title: 'Phone-Friendly Profit & Loss Estimator',
    subtitle: 'Interactive Sliders for Rent, Electricity & Staff Payroll',
    badge: 'Owner Analytics',
    videoUrl: '/videos/walkthrough_pnl.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    tags: ['Touch-Optimized Sliders', 'Monthly Overhead Model', 'Net Take-Home Profit', 'Margin %'],
    description: 'Restaurant owners can adjust monthly rent, electricity & AC costs, and staff salaries on low-cost smartphones to calculate exact net margin and daily profit in real time.',
    targetRoute: '/admin',
    targetLabel: 'Open Mobile Profit Calculator',
  },
  {
    id: 'trades_porter',
    title: 'Apronto Trades & Porter Logistics',
    subtitle: 'Hyperlocal Marketplace for Pros, Cement & Mini-Trucks',
    badge: 'On-Demand & Cargo',
    videoUrl: '/videos/walkthrough_trades.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    tags: ['Carpenters & Electricians', 'UltraTech Cement Depot', 'Porter Tata Ace Dispatch', 'Live Rates'],
    description: 'A separate hyperlocal hub connecting local trade professionals and building materials with real-time Porter mini-truck logistics and instant fare estimates.',
    targetRoute: '/services',
    targetLabel: 'Open Trades & Porter Hub',
  },
  {
    id: 'subscription_checkout',
    title: 'Flat ₹1,000 / month SaaS Activation',
    subtitle: '0% Commission, Unlimited Orders & Razorpay UPI',
    badge: 'SaaS License',
    videoUrl: '/videos/walkthrough_subscription.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&q=80',
    tags: ['Flat ₹1,000 / mo', 'Zero Hidden Fees', 'Razorpay UPI & Cards', 'Perpetual Local Data'],
    description: 'Activate your DineQR commercial license with zero commission per order. Includes permanent local SQLite database ownership with zero ongoing cloud hosting bills.',
    targetRoute: '/pricing',
    targetLabel: 'View Subscription Plans',
  },
  {
    id: 'sqlite_webhook',
    title: 'Local SQLite Engine & SHA-256 Webhook',
    subtitle: 'Zero Cloud Database Bills & Cryptographic Checksum',
    badge: 'Data Ownership',
    videoUrl: '/videos/walkthrough_sqlite.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    tags: ['100% On-Premise Data', 'SHA-256 Hash Audit', '18 Tables Sync', 'Zero Cloud Fees'],
    description: 'All records are saved directly in a local SQLite file on your machine. The verification webhook computes a SHA-256 cryptographic checksum across all 18 tables.',
    targetRoute: '/admin',
    targetLabel: 'Verify SQLite Webhook',
  },
];

const VERTICAL_DEMOS = [
  {
    id: 'rest_losteria',
    title: 'Gourmet Bistro & Cafe',
    tagline: "L'Osteria Gourmet Bistro",
    badge: 'Dining & Kitchen',
    icon: UtensilsCrossed,
    color: 'amber',
    stationLabel: 'Dining Table 01',
    description: 'Table QR ordering, live chef kitchen display system (KDS), and official GST tax billing.',
    targetUrl: '/menu?restaurant=losteria&table=tbl_1',
    stats: '40% Faster Table Turns · 100% Order Accuracy',
  },
  {
    id: 'rest_roastery',
    title: 'Coffee House & Bakery',
    tagline: 'The Roastery Coffee House',
    badge: 'Specialty Cafe',
    icon: Store,
    color: 'orange',
    stationLabel: 'Espresso Bar 02',
    description: 'Artisanal roasts, fresh bakery display, express counter pickup, and instant UPI checkout.',
    targetUrl: '/menu?restaurant=roastery&table=tbl_r1',
    stats: 'Quick Counter Pickups · Zero Queues at Billing',
  },
  {
    id: 'rest_glamour_salon',
    title: 'Salon, Barber & Spa',
    tagline: 'Glamour & Groom Salon & Spa',
    badge: 'Styling & Spa Chairs',
    icon: Scissors,
    color: 'rose',
    stationLabel: 'Chair 01 - Styling Deck',
    description: 'Chair QR styling menus, executive haircuts, beard sculpting, and direct UPI settlement.',
    targetUrl: '/menu?restaurant=glamour-salon&table=tbl_sal_1',
    stats: 'Zero Waiting Idle Time · Cashless Direct Settlement',
  },
  {
    id: 'rest_ironpulse_gym',
    title: 'Gym & Fitness Center',
    tagline: 'IronPulse Fitness Club',
    badge: 'Fitness & Sports',
    icon: Dumbbell,
    color: 'blue',
    stationLabel: 'Workout Bay 01',
    description: 'Workout day passes, protein shake blender bar, and 1-on-1 personal trainer sessions.',
    targetUrl: '/menu?restaurant=ironpulse-gym&table=tbl_g1',
    stats: 'Instant Locker Self-Pay · Recurring Member Passes',
  },
  {
    id: 'rest_apex_clinic',
    title: 'Medical Clinic & Diagnostics',
    tagline: 'Apex Healthcare & Clinic',
    badge: 'Healthcare OPD',
    icon: Stethoscope,
    color: 'teal',
    stationLabel: 'Consultation Room 01',
    description: 'Patient room QR tokens, OPD doctor bookings, and computerized prescription slips.',
    targetUrl: '/menu?restaurant=apex-clinic&table=tbl_c1',
    stats: '15m Average Consult Wait · Zero Reception Congestion',
  },
];

export function LandingHero() {
  const navigate = useNavigate();
  const { setActiveRestaurant, restaurants } = useRestaurant();
  const [selectedDemo, setSelectedDemo] = useState(VERTICAL_DEMOS[0]);
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_SUITE[0]);

  const handleLaunchDemo = (demo) => {
    const matched = restaurants.find((r) => r.id === demo.id);
    if (matched) setActiveRestaurant(matched);
    navigate(demo.targetUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 pb-24 w-full max-w-full overflow-x-hidden font-sans">
      {/* Top Value Banner */}
      <div className="border-b border-slate-800 bg-slate-900/80 px-4 py-2.5 text-center text-xs sm:text-sm text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30 text-[11px]">
            <Zap className="w-3 h-3" /> Flat ₹1,000 / month
          </span>
          <span className="font-medium text-slate-200">
            Zero per-order commission · Unlimited tables & orders · Works offline on local SQLite
          </span>
          <Link
            to="/pricing"
            className="text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-2 ml-1"
          >
            See Pricing &rarr;
          </Link>
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 text-center">
        {/* Industry Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold mb-6 shadow-sm">
          <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
          <span>Made for Indian Restaurants, Cafes & Food Businesses</span>
        </div>

        {/* Clean, Non-AI Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          The No-Commission QR Menu & POS Platform for Your Restaurant
        </h1>

        {/* Practical Indian SaaS Copy */}
        <p className="mt-5 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Customers scan table QR codes and order in seconds. Orders chime instantly on your kitchen display (KDS), print GST bills, and store securely on your computer's local SQLite database.
        </p>

        {/* Primary CTA Action Row - Mobile First */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md sm:max-w-none mx-auto">
          <Link
            to="/onboard"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition active:scale-98 cursor-pointer"
          >
            <span>Start Onboarding - ₹1,000/mo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/walkthrough"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Watch 7-Chapter Walkthrough</span>
          </Link>

          <Link
            to="/menu?restaurant=losteria&table=tbl_1"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-sm border border-slate-800 flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Try Table QR Menu</span>
          </Link>
        </div>

        {/* Secondary Hubs (Trades & Admin) */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-medium"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Apronto Trades & Porter Logistics &rarr;</span>
          </Link>
          <span className="text-slate-700">·</span>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 font-medium"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff Portal (PIN: 1234) &rarr;</span>
          </Link>
        </div>

        {/* Real Metrics Badges */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">₹1,000/mo</div>
            <div className="text-xs text-slate-400 mt-0.5">Flat SaaS fee · 0% order cut</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">3 Seconds</div>
            <div className="text-xs text-slate-400 mt-0.5">Table scan to Kitchen KDS chime</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">₹0 Cloud DB</div>
            <div className="text-xs text-slate-400 mt-0.5">Local SQLite stays on your PC</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">100% Direct</div>
            <div className="text-xs text-slate-400 mt-0.5">Razorpay UPI to your bank account</div>
          </div>
        </div>
      </div>

      {/* REAL VIDEO WALKTHROUGH SUITE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Real Screen Recordings</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            See the Live Software in Action
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Actual screen recordings of table QR ordering, kitchen display chimes, visual floor plans, and mobile margin calculators.
          </p>
        </div>

        {/* Video Selector Tab Bar - Mobile Scrollable */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar scroll-smooth">
          {VIDEO_SUITE.map((v) => {
            const isSelected = selectedVideo.id === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVideo(v)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 shrink-0 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{v.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Video Player Showcase */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-7 border border-slate-800 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left: Video Player */}
          <div className="lg:col-span-7 rounded-xl overflow-hidden border border-slate-800 bg-black aspect-video relative group">
            <video
              key={selectedVideo.videoUrl}
              src={selectedVideo.videoUrl}
              poster={selectedVideo.posterUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              ref={(el) => {
                if (el) {
                  el.muted = true;
                  el.defaultMuted = true;
                  el.play().catch(() => {});
                }
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-sm px-2.5 py-1 rounded-md text-[11px] font-bold text-amber-300 border border-slate-700/80 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedVideo.badge}</span>
            </div>
          </div>

          {/* Right: Feature Summary & Direct Links */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                {selectedVideo.badge}
              </span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mt-1">
                {selectedVideo.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                {selectedVideo.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {selectedVideo.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {selectedVideo.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 rounded-md bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              {selectedVideo.targetRoute && (
                <Link
                  to={selectedVideo.targetRoute}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{selectedVideo.targetLabel || 'Try Feature Live'}</span>
                </Link>
              )}

              <Link
                to="/onboard"
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1 border border-slate-700 transition"
              >
                <span>Onboard Restaurant (₹1k/mo)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* INDUSTRY VERTICALS (Bistro, Cafe, Salon, Gym, Clinic) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Interactive Demos
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Adapts Instantly to Your Business Model
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Select a vertical below to preview how station names, catalog items, and ticket formats tailor to each service industry.
          </p>
        </div>

        {/* Demo Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-6">
          {VERTICAL_DEMOS.map((demo) => {
            const Icon = demo.icon;
            const isSelected = selectedDemo.id === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => setSelectedDemo(demo)}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-amber-500 bg-slate-900 shadow-md ring-1 ring-amber-500/30'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-800 text-amber-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {demo.badge}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate">{demo.title}</div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{demo.stationLabel}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Featured Showcase Card */}
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-8 border border-slate-800 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {selectedDemo.badge}
              </span>
              <span className="text-xs text-slate-400">· Station: {selectedDemo.stationLabel}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white">
              {selectedDemo.tagline}
            </h3>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              {selectedDemo.description}
            </p>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{selectedDemo.stats}</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleLaunchDemo(selectedDemo)}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>Launch {selectedDemo.title} Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/onboard"
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              >
                <span>Onboard In This Category</span>
              </Link>
            </div>
          </div>

          {/* Quick Feature Pillars */}
          <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md shrink-0 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-amber-400" />
                <span>Video Dish Loops</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Items feature looping videos and photos that increase customer order size by 30%.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Direct UPI Settlements</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Zero middleman commissions. Money goes directly into the restaurant's merchant bank account.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>Offline Windows & Android</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Native desktop installer runs offline on any Windows 10/11 laptop or Android POS tablet.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Zero Cloud DB Bills</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Your data stays in your local SQLite file. Even if your subscription lapses, your records remain yours.
              </p>
            </div>
          </div>
        </div>

        {/* COMPARISON TABLE: DineQR vs Traditional ERP / Aggregators */}
        <div className="mt-16 sm:mt-20 p-5 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Clear Comparison
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-white">
              DineQR vs. Traditional ERP & Aggregators
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Full restaurant management without the 25% commissions or expensive cloud software fees.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Feature / Requirement</th>
                  <th className="py-3 px-4 text-amber-400 font-extrabold text-xs sm:text-sm">
                    DineQR Omnichannel
                  </th>
                  <th className="py-3 px-4 text-slate-400">Traditional ERP / Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Monthly Subscription</td>
                  <td className="py-3 px-4 text-amber-400 font-bold font-mono">
                    ₹1,000 / month flat
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono">
                    ₹15,000 - ₹25,000 / month
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Per-Order Commission</td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">
                    0% (₹0 per order)
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    18% to 28% per order
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Visual Floor Plan Builder</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Included (/admin/floor-plan)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Expensive add-on module</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Kitchen Display System (KDS)</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                    <span>Live Chimes & Status (/admin/kitchen)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Requires dedicated hardware</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Database Location & Fees</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">
                    <span>Local SQLite on Premise (₹0 Fees)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Locked in cloud servers</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Phone Profit & Margin Estimator</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5 text-emerald-400 inline mr-1" />
                    <span>Live Rent & Payroll Sliders</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400">Complex manual Excel exports</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/onboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <span>Get Started for Flat ₹1,000 / month</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
