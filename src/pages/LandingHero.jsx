// src/pages/LandingHero.jsx — Clean, Professional SaaS Landing Page for QR Flow
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
  Lock,
  ChevronRight,
  Monitor,
  Smartphone,
  Zap,
  Check,
  Scissors,
  ChefHat,
  Layers,
  Store,
  Clock,
  Boxes,
  IndianRupee,
  Wifi,
  WifiOff,
  BarChart3,
  Star,
  X,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';

const VERTICAL_DEMOS = [
  {
    id: 'rest_losteria',
    title: 'Restaurant & Cafe',
    tagline: "L'Osteria Gourmet Bistro",
    badge: 'Dining',
    icon: UtensilsCrossed,
    color: 'amber',
    stationLabel: 'Dining Table 01',
    description: 'Table QR ordering, live kitchen display (KDS), GST billing, and direct UPI checkout.',
    targetUrl: '/menu?restaurant=losteria&table=tbl_1',
    stats: '40% Faster Table Turns',
  },
  {
    id: 'rest_roastery',
    title: 'Coffee & Bakery',
    tagline: 'The Roastery Coffee House',
    badge: 'Cafe',
    icon: Store,
    color: 'orange',
    stationLabel: 'Espresso Bar 02',
    description: 'Artisanal roasts, bakery display, express counter pickup, and UPI checkout.',
    targetUrl: '/menu?restaurant=roastery&table=tbl_r1',
    stats: 'Zero Queue Billing',
  },
  {
    id: 'rest_glamour_salon',
    title: 'Salon & Spa',
    tagline: 'Glamour & Groom Salon',
    badge: 'Salon',
    icon: Scissors,
    color: 'rose',
    stationLabel: 'Chair 01',
    description: 'Chair QR menus, haircut bookings, and cashless direct UPI settlements.',
    targetUrl: '/menu?restaurant=glamour-salon&table=tbl_sal_1',
    stats: 'Cashless Settlements',
  },
  {
    id: 'rest_ironpulse_gym',
    title: 'Gym & Fitness',
    tagline: 'IronPulse Fitness Club',
    badge: 'Gym',
    icon: Dumbbell,
    color: 'blue',
    stationLabel: 'Workout Bay 01',
    description: 'Day passes, protein bar billing, member attendance, and trainer sessions.',
    targetUrl: '/menu?restaurant=ironpulse-gym&table=tbl_g1',
    stats: 'Instant Member Check-in',
  },
  {
    id: 'rest_apex_clinic',
    title: 'Clinic & Diagnostics',
    tagline: 'Apex Healthcare Clinic',
    badge: 'Healthcare',
    icon: Stethoscope,
    color: 'teal',
    stationLabel: 'Room 01',
    description: 'Patient tokens, OPD bookings, and computerized prescriptions.',
    targetUrl: '/menu?restaurant=apex-clinic&table=tbl_c1',
    stats: 'Zero Reception Wait',
  },
];

const FEATURES = [
  {
    icon: QrCode,
    title: 'QR Table Ordering',
    desc: 'Customers scan, browse the menu, add to cart, and pay — all from their phone.',
    color: 'amber',
    link: '/menu?restaurant=losteria&table=tbl_1',
    linkLabel: 'Try Live Menu',
  },
  {
    icon: ChefHat,
    title: 'Kitchen Display (KDS)',
    desc: 'Live tickets with audio chimes, color timers, and one-tap status updates.',
    color: 'emerald',
    link: '/admin/kitchen',
    linkLabel: 'Open KDS',
  },
  {
    icon: Monitor,
    title: 'Token TV Display',
    desc: 'Full-HD split-screen for food courts with voice announcements in Hindi & English.',
    color: 'sky',
    link: '/tokens',
    linkLabel: 'View Token Screen',
  },
  {
    icon: BarChart3,
    title: 'Floor Plan & Analytics',
    desc: 'Drag-and-drop table layouts, real-time P&L sliders, and daily revenue tracking.',
    color: 'purple',
    link: '/admin/floor-plan',
    linkLabel: 'Open Floor Plan',
  },
  {
    icon: Boxes,
    title: 'Inventory & Purchases',
    desc: 'Stock ledger, low-stock alerts, quick adjustments, and supplier RfQ generation.',
    color: 'orange',
    link: '/admin/inventory',
    linkLabel: 'Manage Stock',
  },
  {
    icon: Layers,
    title: 'Multi-Business Hub',
    desc: 'Switch between restaurant, salon, gym, and clinic from one dashboard.',
    color: 'rose',
    link: '/showcase',
    linkLabel: 'View All Dashboards',
  },
];

const COMPARISON = [
  { feature: 'Monthly Cost', qrflow: '₹1,500 flat', others: '₹15,000 – ₹25,000' },
  { feature: 'Per-Order Commission', qrflow: '0% (Zero)', others: '18% – 28%' },
  { feature: 'Kitchen Display System', qrflow: 'Built-in, Free', others: 'Extra hardware needed' },
  { feature: 'Floor Plan Builder', qrflow: 'Included', others: 'Paid add-on' },
  { feature: 'Database', qrflow: 'Local SQLite (₹0)', others: 'Locked cloud servers' },
  { feature: 'Offline Mode', qrflow: 'Full offline support', others: 'Internet required' },
];

export function LandingHero() {
  const navigate = useNavigate();
  const { setActiveRestaurant, restaurants } = useRestaurant();
  const [selectedDemo, setSelectedDemo] = useState(VERTICAL_DEMOS[0]);

  const handleLaunchDemo = (demo) => {
    const matched = restaurants.find((r) => r.id === demo.id);
    if (matched) setActiveRestaurant(matched);
    navigate(demo.targetUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 pb-20 w-full max-w-full overflow-x-hidden font-sans">

      {/* ─── HERO SECTION ─── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/[0.03] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-amber-500/[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6">
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Flat ₹1,500/month · Zero commission · Works offline</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
            Your Restaurant Deserves a{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
              Better POS
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            QR menus, kitchen display, GST billing, token TV, and inventory — all in one platform.
            No commissions. No cloud fees. Your data stays on <strong className="text-slate-200">your</strong> computer.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/onboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
            >
              Start Free Setup
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/walkthrough"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              Watch Demo
            </Link>
            <Link
              to="/menu?restaurant=losteria&table=tbl_1"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 font-medium text-sm border border-slate-800 flex items-center justify-center gap-2 transition"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              Try QR Menu
            </Link>
          </div>

          {/* Quick links */}
          <div className="mt-5 flex items-center justify-center gap-5 text-xs text-slate-500">
            <Link to="/gym-register" className="hover:text-emerald-400 transition flex items-center gap-1">
              <Dumbbell className="w-3 h-3" /> Gym Register
            </Link>
            <Link to="/pricing" className="hover:text-amber-400 transition flex items-center gap-1">
              <Zap className="w-3 h-3" /> Pricing Plans
            </Link>
            <Link to="/admin" className="hover:text-slate-300 transition flex items-center gap-1">
              <Lock className="w-3 h-3" /> Staff Login
            </Link>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { value: '₹1,500', label: 'per month, flat', icon: IndianRupee, color: 'amber' },
            { value: '0%', label: 'commission on orders', icon: CreditCard, color: 'emerald' },
            { value: '3 sec', label: 'scan to kitchen chime', icon: Clock, color: 'sky' },
            { value: '₹0', label: 'cloud database fees', icon: Database, color: 'purple' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center group hover:border-slate-700 transition"
            >
              <stat.icon className={`w-5 h-5 text-${stat.color}-400 mx-auto mb-2 opacity-60`} />
              <div className="text-xl sm:text-2xl font-extrabold text-white">{stat.value}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything you need to run your business
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            From customer ordering to kitchen operations to inventory management — all included at ₹1,500/month.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition group"
              >
                <div className={`w-10 h-10 rounded-xl bg-${f.color}-500/10 border border-${f.color}-500/20 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${f.color}-400`} />
                </div>
                <h3 className="text-sm font-bold text-white">{f.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
                <Link
                  to={f.link}
                  className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold text-${f.color}-400 hover:text-${f.color}-300 transition`}
                >
                  {f.linkLabel} <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── INDUSTRY VERTICALS ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Works for every type of business
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-lg mx-auto">
            Same powerful platform — adapts menus, stations, and ticket formats for your industry.
          </p>
        </div>

        {/* Vertical pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {VERTICAL_DEMOS.map((demo) => {
            const Icon = demo.icon;
            const isActive = selectedDemo.id === demo.id;
            return (
              <button
                key={demo.id}
                onClick={() => setSelectedDemo(demo)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-600 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {demo.title}
              </button>
            );
          })}
        </div>

        {/* Selected demo card */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wide">
                {selectedDemo.badge}
              </span>
              <span className="text-xs text-slate-500">{selectedDemo.stationLabel}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white">{selectedDemo.tagline}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{selectedDemo.description}</p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              {selectedDemo.stats}
            </div>

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                onClick={() => handleLaunchDemo(selectedDemo)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                Launch Demo <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/onboard"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              >
                Start Onboarding
              </Link>
            </div>
          </div>

          {/* Why QR Flow mini-cards */}
          <div className="w-full md:w-64 shrink-0 grid grid-cols-2 md:grid-cols-1 gap-2.5">
            {[
              { icon: CreditCard, title: 'Direct UPI Pay', desc: 'Zero middleman. Money to your bank.', color: 'emerald' },
              { icon: WifiOff, title: 'Works Offline', desc: 'Runs without internet on your PC.', color: 'sky' },
              { icon: Database, title: 'Own Your Data', desc: 'Local SQLite. No cloud lock-in.', color: 'purple' },
              { icon: Receipt, title: 'GST Invoicing', desc: 'Auto CGST + SGST tax breakdowns.', color: 'amber' },
            ].map((item) => (
              <div key={item.title} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <item.icon className={`w-3.5 h-3.5 text-${item.color}-400`} />
                  <span className="text-[11px] font-bold text-white">{item.title}</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPARISON TABLE ─── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            How QR Flow compares
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            See exactly what you save vs. traditional POS and aggregator platforms.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Feature</th>
                  <th className="text-left py-3.5 px-5 text-xs font-bold text-amber-400 uppercase tracking-wider">QR Flow</th>
                  <th className="text-left py-3.5 px-5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Others</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {COMPARISON.map((row) => (
                  <tr key={row.feature} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-5 text-sm font-medium text-slate-300">{row.feature}</td>
                    <td className="py-3 px-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        {row.qrflow}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-sm text-slate-500">{row.others}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 text-center">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Ready to switch?
          </h2>
          <p className="text-sm text-slate-400 mt-3 max-w-md mx-auto">
            Set up your QR menus, kitchen display, and billing in under 10 minutes. Cancel anytime.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/onboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
            >
              Get Started — ₹1,500/month
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition"
            >
              View All Plans
            </Link>
          </div>
          <p className="text-xs text-slate-600 mt-4">No credit card required · 7-day free trial · Cancel anytime</p>
        </div>
      </section>
    </div>
  );
}

export default LandingHero;
