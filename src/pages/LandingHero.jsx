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
  ExternalLink,
  Video,
  Monitor,
  Smartphone,
  Apple,
  Terminal,
  Zap,
  Check,
  X as XIcon,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const VIDEO_SUITE = [
  {
    id: 'restaurant_kds',
    title: 'Restaurant Operations & Kitchen KDS',
    subtitle: 'Table QR Ordering to Live Chef Ticket Chimes',
    badge: 'Restaurant & Cafe',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    tags: ['Table QR Codes', 'Kitchen KDS', 'ESC/POS Printer', 'Razorpay UPI'],
    description: 'Customers scan table QR codes, view 4K looping food dishes, and pay via UPI. Orders stream to kitchen KDS screens with audio bells and auto-cutting thermal bills.',
  },
  {
    id: 'hotel_floor_plan',
    title: 'Hotel Management & Floor Plans',
    subtitle: 'Visual Drag & Drop Tables, Room Service & Split Bills',
    badge: 'Hotels & Fine Dining',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    tags: ['Interactive Floor Plan', 'Room Service QR', 'Split Invoicing', 'Table Bookings'],
    description: 'Design custom floor layouts matching your physical premises. Rearrange tables with drag-and-drop, manage room service dispatch, and split guest checks.',
  },
  {
    id: 'bar_pub_speed',
    title: 'High-Velocity Bar & Pub Concessions',
    subtitle: 'Zero Bar Line-Ups with Cashless Speed-Ordering',
    badge: 'Bars & Pubs',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80',
    tags: ['Cashless Bar', 'Drink Queue Tokens', 'Instant Settlements', 'Zero Waiter Delay'],
    description: 'Patrons scan counter codes at busy bars to order craft beers and cocktails without waiting for bartenders to bring cards or change.',
  },
  {
    id: 'fast_food_tokens',
    title: 'Fast Food, Bakery & Counter Pickups',
    subtitle: 'Daily Token Call Screens & Instant Takeaway Bills',
    badge: 'QSR & Food Courts',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200&q=80',
    tags: ['Token Call Screen', 'Takeaway QR', 'GST Invoices', 'Local SQLite Backup'],
    description: 'Display live daily pickup tokens (#01, #02) on overhead screens. Complete order processing in seconds with zero paper waste.',
  },
];

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
  const [selectedVideo, setSelectedVideo] = useState(VIDEO_SUITE[0]);

  const handleLaunchDemo = (demo) => {
    const matched = restaurants.find((r) => r.id === demo.id);
    if (matched) setActiveRestaurant(matched);
    navigate(demo.targetUrl);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white pb-24 w-full max-w-full overflow-x-hidden">
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-96 bg-gradient-to-b from-sky-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 text-center">
        {/* Flat Pricing Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-linear-to-r from-amber-500/20 via-orange-500/20 to-sky-500/20 border border-amber-500/40 text-amber-300 text-xs font-black shadow-xl mb-6">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Flat ₹1,000 / month · Unlimited Tables & Orders · Zero Cloud DB Fees</span>
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full text-[10px] uppercase font-black ml-1">
            60s Setup
          </span>
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
          The all-in-one operations suite for <span className="text-white font-semibold">Clinics</span>,{' '}
          <span className="text-white font-semibold">Restaurants</span>,{' '}
          <span className="text-white font-semibold">Gyms</span>, and{' '}
          <span className="text-white font-semibold">Events</span>. Features 4K looping video catalogs, direct Razorpay UPI settlements, visual floor plans, inventory reorder alerts, and native desktop installers.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/onboard"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/25 transition active:scale-98 cursor-pointer"
          >
            <span>Subscribe for ₹1,000 / month</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => handleLaunchDemo(selectedDemo)}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
          >
            <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span>Launch Live Interactive Demo</span>
          </button>

          <Link
            to="/admin/downloads"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-sky-300 font-bold text-sm border border-sky-500/30 flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download EXE / APK / DMG</span>
          </Link>

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
            <span>Native Windows (.exe) & Android (.apk)</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <span>Zero-Cost Local SQLite + 31st Monthly Download</span>
          </div>
        </div>
      </div>

      {/* ENTERPRISE VIDEO SHOWCASE SUITE */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-400/20 text-rose-400 text-xs font-bold mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Interactive Platform Video Demos</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            See DineQR in Real Restaurant & Hotel Action
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Watch how customer QR table scans, live kitchen display chimes, and visual floor plans operate seamlessly in real time.
          </p>
        </div>

        {/* Video Tabs Selector */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
          {VIDEO_SUITE.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVideo(v)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                selectedVideo.id === v.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{v.title}</span>
            </button>
          ))}
        </div>

        {/* Video Player Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Video Player */}
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl relative bg-black aspect-video group">
            <video
              key={selectedVideo.videoUrl}
              src={selectedVideo.videoUrl}
              poster={selectedVideo.posterUrl}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30">
              🔴 Live Demonstration: {selectedVideo.badge}
            </div>
          </div>

          {/* Right: Feature Highlights & CTA */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {selectedVideo.badge}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {selectedVideo.title}
              </h3>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                {selectedVideo.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {selectedVideo.description}
            </p>

            {/* Tag Pills */}
            <div className="flex flex-wrap gap-2">
              {selectedVideo.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold flex items-center gap-1.5"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <Link
                to="/onboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <span>Get Started for ₹1,000 / month</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/pricing"
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <span>View All Plans</span>
              </Link>
            </div>
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
                <span>Direct UPI & Razorpay</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Google Pay, PhonePe, Paytm, and Cards route directly to the merchant account with instant settlements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Laptop className="w-4 h-4 text-amber-400" />
                <span>Native Multi-OS Packages</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Windows (.exe), Android (.apk), macOS (.dmg), and Linux (.deb) ready for immediate offline-first deployment.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-purple-400" />
                <span>Zero Cloud Database Fees</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Orders stored in local SQLite database on premise. Remote online access available anytime via cloud tunnel.
              </p>
            </div>
          </div>
        </div>

        {/* Odoo vs DineQR Enterprise Comparison Section */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Why Pay 20x More for Enterprise ERP?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              DineQR Omnichannel vs. Odoo Hospitality
            </h2>
            <p className="text-sm text-slate-400">
              Full enterprise restaurant & retail parity at a flat ₹1,000 / month with zero per-user or database surcharges.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-extrabold uppercase">
                <tr>
                  <th className="py-4 px-5">Capability / Module</th>
                  <th className="py-4 px-5 text-amber-400 font-black text-base">
                    DineQR Omnichannel
                  </th>
                  <th className="py-4 px-5 text-slate-400">Odoo Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Subscription Pricing</td>
                  <td className="py-3.5 px-5 text-amber-400 font-black">
                    ₹1,000 / month flat (All Included)
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    ₹20,000+ / mo ($240+/user/year + apps)
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Visual Drag & Drop Floor Plans</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Included (/admin/floor-plan)</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">Requires POS Restaurant App</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Table Bookings & Reservations</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                    <span>Included (/admin/reservations)</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">Separate Appointments App</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Staff Planning & Shift Scheduler</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                    <span>Included (/admin/staff) with conflict checks</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">Separate Planning App</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Purchases & 3-Way Matching</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                    <span>Included (/admin/purchases)</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">Separate Purchase App</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Inventory & Replenishment Alerts</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold">
                    <Check className="w-4 h-4 text-emerald-400 inline mr-1.5" />
                    <span>Included (/admin/inventory)</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">Separate Inventory App</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Cloud Database Costs</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold">
                    <span>₹0 (Local SQLite Storage on Premise)</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">
                    Odoo.sh hosting fees apply
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold text-white">Native Standalone Packages</td>
                  <td className="py-3.5 px-5 text-emerald-400 font-bold">
                    <span>Windows (.exe), Android (.apk), macOS (.dmg), Linux (.deb)</span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-400">IoT Box hardware extra cost</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-4 text-center">
            <Link
              to="/onboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer"
            >
              <span>Get Started for ₹1,000 / month</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingHero;
