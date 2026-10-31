// src/pages/LandingHero.jsx - High-converting enterprise landing page for DineQR Platform
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Stethoscope,
  UtensilsCrossed,
  Dumbbell,
  PartyPopper,
  ShieldCheck,
  CreditCard,
  QrCode,
  Laptop,
  Database,
  Download,
  CheckCircle2,
  Play,
  TrendingUp,
  Receipt,
  Building2,
  Lock,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const VERTICAL_DEMOS = [
  {
    id: 'rest_apex_clinic',
    title: 'Medical Clinic & Diagnostics',
    tagline: 'Apex Healthcare & Multi-Specialty Clinic',
    badge: 'Healthcare OPD',
    icon: Stethoscope,
    gradient: 'from-teal-500 to-emerald-600',
    stationLabel: 'Consultation Room 01',
    description: 'Patient room QR tokens, OPD doctor bookings, NABL blood panel tests, and computerized prescription slips.',
    targetUrl: '/menu?restaurant=apex-clinic&table=tbl_c1',
    stats: '15m Average Consult Wait · Zero Reception Congestion',
  },
  {
    id: 'rest_losteria',
    title: 'Gourmet Bistro & Cafe',
    tagline: "L'Osteria Gourmet Bistro",
    badge: 'Dining & Kitchen',
    icon: UtensilsCrossed,
    gradient: 'from-amber-500 to-orange-600',
    stationLabel: 'Dining Table 01',
    description: '4K looping food videos with photo switcher, live kitchen display system (KDS), and official GST tax billing.',
    targetUrl: '/menu?restaurant=losteria&table=tbl_1',
    stats: '40% Faster Table Turns · 100% Order Accuracy',
  },
  {
    id: 'rest_ironpulse_gym',
    title: 'Gym & Performance Bar',
    tagline: 'IronPulse Fitness Club',
    badge: 'Fitness & Sports',
    icon: Dumbbell,
    gradient: 'from-blue-600 to-indigo-600',
    stationLabel: 'Workout Bay 01',
    description: 'Workout day passes, protein shake blender bar, intra-workout BCAAs, and 1-on-1 personal trainer sessions.',
    targetUrl: '/menu?restaurant=ironpulse-gym&table=tbl_g1',
    stats: 'Instant Locker Self-Pay · Recurring Member Passes',
  },
  {
    id: 'rest_neonwave_event',
    title: 'Music Festival & VIP Lounge',
    tagline: 'NeonWave Cultural Fest 2026',
    badge: 'Social Events',
    icon: PartyPopper,
    gradient: 'from-purple-600 to-pink-600',
    stationLabel: 'VIP Lounge Booth 01',
    description: 'VIP lounge table service, fast-track craft beer pickups, backstage wristbands, and festival glow merchandise.',
    targetUrl: '/menu?restaurant=neonwave-fest&table=tbl_e1',
    stats: 'Zero Line-Ups at Bar · 3x Faster Drink Dispatches',
  },
];

export function LandingHero() {
  const navigate = useNavigate();
  const { setActiveRestaurant, restaurants } = useRestaurant();
  const { addToast } = useToast();
  const [selectedDemo, setSelectedDemo] = useState(VERTICAL_DEMOS[0]);

  const handleLaunchDemo = (demo) => {
    const matched = restaurants.find((r) => r.id === demo.id);
    if (matched) setActiveRestaurant(matched);
    navigate(demo.targetUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white pb-24">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-sky-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-sky-400 text-xs font-semibold shadow-xl mb-6 hover:border-sky-500/50 transition">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Universal Self-Checkout & Operations OS · Powered by Razorpay</span>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Turn Every Table, Room & Booth into an{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-orange-500">
            Instant Self-Order POS
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
          The all-in-one platform for <span className="text-white font-semibold">Clinics</span>,{' '}
          <span className="text-white font-semibold">Restaurants</span>,{' '}
          <span className="text-white font-semibold">Gyms</span>, and{' '}
          <span className="text-white font-semibold">Festivals</span>. Features 4K looping video catalogs, direct Razorpay merchant settlement, real-time queues, and a native Windows Desktop POS.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/onboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-sky-500/25 transition active:scale-98 cursor-pointer"
          >
            <span>Onboard Your Business Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleLaunchDemo(selectedDemo)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Launch Live Interactive Demo</span>
          </button>

          <Link
            to="/super-admin"
            className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 text-purple-300 font-bold text-sm border border-purple-500/30 flex items-center justify-center gap-2 transition"
          >
            <Lock className="w-4 h-4 text-purple-400" />
            <span>Super Admin (PIN: 2026)</span>
          </Link>
        </div>

        {/* Quick Trust Badges */}
        <div className="mt-10 pt-8 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-semibold">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Direct Razorpay Bank Payouts</span>
          </div>
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-rose-400" />
            <span>Dual Media (Video Loop + Photo Carousel)</span>
          </div>
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-400" />
            <span>Native Windows POS & Thermal Printing</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Zero-Cost Local SQLite + 31st Monthly Download</span>
          </div>
        </div>
      </div>

      {/* Interactive Vertical Showcases */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Tailored Industry Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Engineered for High-Velocity Service Businesses
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Click any vertical below to preview how the vocabulary, station designations, and customer interface adapt instantly.
          </p>
        </div>

        {/* Demo Selector Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {VERTICAL_DEMOS.map((demo) => {
            const Icon = demo.icon;
            const isSelected = selectedDemo.id === demo.id;
            return (
              <button
                key={demo.id}
                type="button"
                onClick={() => setSelectedDemo(demo)}
                className={`p-4 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-slate-900 ring-2 ring-sky-500/20 shadow-xl'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${demo.gradient} text-white shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {demo.badge}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{demo.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 truncate">{demo.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Featured Showcase Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-400/20">
                {selectedDemo.badge} Experience
              </span>
              <span className="text-xs text-slate-400">· Station: {selectedDemo.stationLabel}</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white">
              {selectedDemo.tagline}
            </h3>

            <p className="text-slate-300 text-sm leading-relaxed">
              {selectedDemo.description}
            </p>

            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-emerald-400 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{selectedDemo.stats}</span>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => handleLaunchDemo(selectedDemo)}
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-sky-500/20 cursor-pointer"
              >
                <span>Launch {selectedDemo.title} Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/onboard"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                <span>Onboard In This Category</span>
              </Link>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md shrink-0 text-xs">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-400" />
                <span>Dual Media Controls</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Clients can provide custom image URLs & video URLs. Customers toggle or scroll inside each card box.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>Wallet & Withdrawals</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Payments land in Razorpay. Platform retains profit fee; merchants withdraw funds anytime after ₹500.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-amber-400" />
                <span>Windows POS Client</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Reception desks run native Electron on Windows with silent ESC/POS thermal printing & F11 token kiosk.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-purple-400" />
                <span>31st Monthly Download</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Zero cloud database cost. Local SQLite downloads compile on the 31st of every month for local compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
