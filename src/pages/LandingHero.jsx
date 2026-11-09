// src/pages/LandingHero.jsx - Professional Human-Crafted SaaS Landing Page for QR Flow
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
  Boxes,
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
    id: 'gym_register',
    title: 'Daily Member Attendance & Gym Register',
    subtitle: 'Paperless Register for Fitness Studios, Gyms & Crossfit',
    badge: 'Gym & Attendance',
    videoUrl: '/videos/walkthrough_cashier.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
    tags: ['Paperless Member Roster', '1-Tap Daily Punch In', 'Membership Expiry Alert', 'Protein Bar Billing'],
    description: 'Replace physical paper notebooks with a high-speed digital member register, 1-tap attendance punch-in, instant Razorpay renewal, and protein shake bar billing.',
    targetRoute: '/gym-register',
    targetLabel: 'Open Digital Gym Register',
  },
  {
    id: 'subscription_checkout',
    title: 'Flat ₹1,500 / month SaaS Activation',
    subtitle: '0% Commission, Unlimited Orders & Razorpay UPI',
    badge: 'SaaS License',
    videoUrl: '/videos/walkthrough_owner.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&q=80',
    tags: ['Flat ₹1,500 / mo', 'Zero Hidden Fees', 'Razorpay UPI & Cards', 'Perpetual Local Data'],
    description: 'Activate your QR Flow commercial license with zero commission per order. Includes permanent local SQLite database ownership with zero ongoing cloud hosting bills.',
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
            <Zap className="w-3 h-3" /> Flat ₹1,500 / month
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
            <span>Start Onboarding - ₹1,500/mo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/walkthrough"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Watch Live Walkthrough</span>
          </Link>

          <Link
            to="/menu?restaurant=losteria&table=tbl_1"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-medium text-sm border border-slate-800 flex items-center justify-center gap-2 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Try Table QR Menu</span>
          </Link>
        </div>

        {/* Secondary Hubs (Gym & Admin) */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <Link
            to="/gym-register"
            className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Digital Gym Attendance Register &rarr;</span>
          </Link>

          <span className="text-slate-700">·</span>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 font-medium"
          >
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Staff Portal (PIN: 1234) &rarr;</span>
          </Link>
        </div>

        {/* Animated Cybernetic Workflow Motion Loop (Pure Motion Graphic, 0 Humans) */}
        <div className="mt-10 max-w-4xl mx-auto rounded-3xl border border-amber-500/30 bg-slate-900/80 p-3 sm:p-5 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 px-1 border-b border-slate-800 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                QRFlow Autonomous Architecture · High-Tech Motion Visuals
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              1080p 60fps · 100% Human-Free Motion Graphics
            </span>
          </div>

          <div className="relative aspect-video rounded-2xl overflow-hidden mt-3 bg-black border border-slate-800 shadow-inner">
            <video
              key="hero_anim_video"
              src="/videos/neon_hud_loop.mp4"
              autoPlay
              loop
              muted
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>

          {/* Quick Motion Clip Switcher */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Motion Style:</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <a
                href="/videos/neon_hud_loop.mp4"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-[11px] hover:bg-amber-500 hover:text-slate-950 transition"
              >
                ⚡ Neon Cyber HUD
              </a>
              <a
                href="/videos/glowing_circuit_loop.mp4"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 font-bold text-[11px] hover:bg-sky-500 hover:text-slate-950 transition"
              >
                🌐 Glowing Circuit Matrix
              </a>
              <a
                href="/videos/tech_network_loop.mp4"
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold text-[11px] hover:bg-purple-500 hover:text-slate-950 transition"
              >
                📡 Data Network Stream
              </a>
            </div>
          </div>
        </div>

        {/* Real Metrics Badges */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">₹1,500/mo</div>
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

      {/* LIVE OPERATIONAL CAPABILITIES SHOWCASE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-amber-400 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Operational Suite</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Full-Stack Hospitality & Retail Operations
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Explore live interactive software: customer digital QR ordering, kitchen display systems, visual floor plans, and real-time inventory tracking.
          </p>
        </div>

        {/* Live Operational Capability Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition">
                Customer QR Ordering & Pay
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Table-aware digital menu with dietary filters, cooking notes, cart basket, and instant UPI / Razorpay checkout.
              </p>
            </div>
            <Link
              to="/menu?restaurant=losteria&table=tbl_1"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <span>Launch Live Customer Menu &rarr;</span>
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-4">
                <ChefHat className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition">
                Multi-Channel Kitchen KDS
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Color-coded kitchen workflow (ORDERED &rarr; PREPARING &rarr; READY &rarr; COMPLETED) with audio alerts and elapsed timers.
              </p>
            </div>
            <Link
              to="/admin/kitchen"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <span>Open Live Kitchen KDS &rarr;</span>
            </Link>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition group flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-400 transition">
                Inventory & Purchases (RfQ)
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Stock ledger tracking, low-stock threshold alerts, quick adjustment modal, and automated supplier Request for Quotations.
              </p>
            </div>
            <Link
              to="/admin/inventory"
              className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300"
            >
              <span>Explore Stock Manager &rarr;</span>
            </Link>
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

        {/* COMPARISON TABLE: QR Flow vs Traditional ERP / Aggregators */}
        <div className="mt-16 sm:mt-20 p-5 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Clear Comparison
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-white">
              QR Flow vs. Traditional ERP & Aggregators
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Full multi-activity and venue management without the 25% commissions or expensive cloud software fees.
            </p>
          </div>

          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[500px]">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Feature / Requirement</th>
                  <th className="py-3 px-4 text-amber-400 font-extrabold text-xs sm:text-sm">
                    QR Flow Omnichannel
                  </th>
                  <th className="py-3 px-4 text-slate-400">Traditional ERP / Portals</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
                <tr>
                  <td className="py-3 px-4 font-semibold text-white">Monthly Subscription</td>
                  <td className="py-3 px-4 text-amber-400 font-bold font-mono">
                    ₹1,500 / month flat
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
              <span>Get Started for Flat ₹1,500 / month</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
