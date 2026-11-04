// src/pages/ProductWalkthrough.jsx - Interactive Product Video Walkthrough with Dual-Language Subtitles
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Languages,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  UtensilsCrossed,
  Hammer,
  Truck,
  TrendingUp,
  Database,
  CreditCard,
  Maximize2,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const CHAPTERS = [
  {
    id: 'library',
    number: '01',
    title: 'Study Library Desk QR Recharge',
    badge: 'Education & Co-Working',
    icon: BookOpen,
    videoUrl: '/videos/item_4.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80',
    duration: 18,
    actionLabel: 'Launch Alexandria Library Demo',
    actionRoute: '/menu?restaurant=alexandria-library&table=tbl_lib_1',
    subtitles: {
      en: '[Chapter 1: Study Library Desk QR] Readers scan the physical QR placard on their quiet study desk or cabin. They can select 6-hour, full-day, or monthly passes, pay instantly via UPI, and receive a digital seat pass without disturbing anyone.',
      hi: '[अध्याय 1: स्टडी लाइब्रेरी डेस्क क्यूआर] विद्यार्थी अपनी स्टडी टेबल या एसी केबिन पर लगा क्यूआर कोड स्कैन करते हैं। वे 6-घंटे, पूरे दिन या मासिक पास चुनकर सीधे यूपीआई से भुगतान करते हैं और बिना किसी रुकावट के डिजिटल रसीद पाते हैं।',
    },
    keyPoints: [
      'Desk & Silent Cabin Specific QR Placards',
      'Hourly (₹49), Full-Day (₹99) & Monthly (₹1,499) Recharge Passes',
      'Silent Coffee & Beverage Top-Ups Delivered to Desk',
      'Direct Razorpay UPI Settlement with Zero Commission',
    ],
  },
  {
    id: 'restaurant',
    number: '02',
    title: 'Restaurant & Cafe Table POS',
    badge: 'Dining & Kitchen',
    icon: UtensilsCrossed,
    videoUrl: '/videos/item_6.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    duration: 20,
    actionLabel: 'Launch Bistro Table POS Demo',
    actionRoute: '/menu?restaurant=losteria&table=tbl_1',
    subtitles: {
      en: '[Chapter 2: Restaurant & Cafe Table POS] Diners view high-definition looping dishes on their smartphones. Orders stream directly into the kitchen display system (KDS) with sound chimes while ESC/POS printers cut tickets automatically.',
      hi: '[अध्याय 2: रेस्टोरेंट और कैफे टेबल पीओएस] ग्राहक फोन पर हर डिश का एचडी वीडियो लूप देखते हैं। ऑर्डर सीधे किचन केडीएस स्क्रीन पर घंटी की आवाज के साथ पहुंचते हैं और थर्मल प्रिंटर से बिल कट जाता है।',
    },
    keyPoints: [
      'Dual Media Video Looping Food Dishes',
      'Live Kitchen Display System (KDS) & Audio Bells',
      'ESC/POS Thermal Auto-Cut Receipts & 3-Way Split Bills',
      'Visual Drag-and-Drop Floor Plan Matching Premises',
    ],
  },
  {
    id: 'trades',
    number: '03',
    title: 'Apronto Hyperlocal Trades & Chefs',
    badge: 'On-Demand Services',
    icon: Hammer,
    videoUrl: '/videos/item_7.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    duration: 22,
    actionLabel: 'Open Apronto Services Directory',
    actionRoute: '/services',
    subtitles: {
      en: '[Chapter 3: Apronto Hyperlocal Trades] Local customers hire verified private chefs, licensed electricians, master carpenters, and plumbers with transparent hourly or fixed pricing.',
      hi: '[अध्याय 3: ऑन-डिमांड कारीगर व शेफ] ग्राहक अपने घर के लिए प्राइवेट शेफ, इलेक्ट्रीशियन, कारपेंटर और प्लंबर को तय दाम पर सीधे मोबाइल से बुक कर सकते हैं।',
    },
    keyPoints: [
      'Private Chefs for Live Barbecue & Banquets',
      'Master Carpenters for Door Locks & Wardrobes',
      'Certified Electricians for Inverter & MCB Outages',
      '60-Second Mobile Self-Onboarding for Local Pros',
    ],
  },
  {
    id: 'porter',
    number: '04',
    title: 'Porter Logistics & Materials Dispatch',
    badge: 'Logistics & Cargo',
    icon: Truck,
    videoUrl: '/videos/item_8.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80',
    duration: 19,
    actionLabel: 'Launch Porter Delivery Calculator',
    actionRoute: '/services',
    subtitles: {
      en: '[Chapter 4: Porter Logistics Dispatch] Order building materials like UltraTech cement and river sand, or move heavy furniture with immediate Porter Tata Ace and pickup tempo dispatches.',
      hi: '[अध्याय 4: पोर्टर टेम्पो व भारी सामान डिलीवरी] अल्ट्राटेक सीमेंट, बालू या भारी फर्नीचर मंगाने के लिए पोर्टर टाटा एस और पिकअप तुरंत बुक करके लाइव ट्रैक करें।',
    },
    keyPoints: [
      'Direct UltraTech Cement & River Sand Ordering',
      'Instant Vehicle Selection (Tata Ace, 8ft Pickup, 2-Wheeler)',
      'Real-Time Porter Driver Assignment & Live Telemetry',
      'Transparent Per-KM Fare Estimation',
    ],
  },
  {
    id: 'profit',
    number: '05',
    title: 'Mobile Profit & Loss Margin Estimator',
    badge: 'Financial Analytics',
    icon: TrendingUp,
    videoUrl: '/videos/item_4.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    duration: 21,
    actionLabel: 'View Mobile Analytics Dashboard',
    actionRoute: '/admin',
    subtitles: {
      en: '[Chapter 5: Mobile Profit & Margin Estimator] Business owners view daily and monthly revenue on their phone. An interactive simulator calculates Cost of Goods (COGS), rent, staff wages, and net profit margins in real time.',
      hi: '[अध्याय 5: फोन पर मुनाफा और खर्च कैलकुलेटर] लाइब्रेरी व दुकान मालिक अपने फोन पर रोज की कमाई देखते हैं। इसमें किराया, बिजली और स्टाफ वेतन घटाकर नेट प्रॉफिट तुरंत कैलकुलेट हो जाता है।',
    },
    keyPoints: [
      'Phone-Friendly Responsive Dashboard for Low-End Devices',
      'Gross Profit & Cost of Goods Sold (COGS) Breakdown',
      'Interactive Sliders for Rent, Electricity & Staff Wages',
      'Live Net Profit Margin % and Monthly Projections',
    ],
  },
  {
    id: 'sqlite',
    number: '06',
    title: 'Local SQLite & Webhook Sync Engine',
    badge: 'Offline-First Engine',
    icon: Database,
    videoUrl: '/videos/item_6.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    duration: 17,
    actionLabel: 'Inspect Local SQLite Engine',
    actionRoute: '/admin',
    subtitles: {
      en: '[Chapter 6: Local SQLite Database & Webhooks] All data resides on your physical local machine in SQLite. Even if the internet drops, offline operations continue and sync via cryptographic webhooks with zero cloud database fees.',
      hi: '[अध्याय 6: लोकल डेटाबेस व वेबहुक] सारा डेटा आपके अपने कंप्यूटर में सुरक्षित रहता है। इंटरनेट न होने पर भी काम नहीं रुकता और वेबहुक से पूरा डेटा वेरीफाई रहता है।',
    },
    keyPoints: [
      'Embedded SQLite Engine with Zero Cloud DB Monthly Costs',
      'Cryptographic SHA-256 Database Integrity Webhook',
      'Perpetual Data Ownership (Download .db File Anytime)',
      'Cross-Platform Native Binaries (EXE, APK, DMG, DEB)',
    ],
  },
  {
    id: 'razorpay',
    number: '07',
    title: 'Razorpay ₹1,000/mo SaaS Activation',
    badge: 'Merchant Billing',
    icon: CreditCard,
    videoUrl: '/videos/item_7.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&q=80',
    duration: 18,
    actionLabel: 'Subscribe for ₹1,000 / month',
    actionRoute: '/pricing',
    subtitles: {
      en: '[Chapter 7: ₹1,000/Month SaaS Subscription] Businesses get started in 60 seconds. Subscribe via official Razorpay checkout, receive your merchant User ID, and run your entire business for flat ₹1,000/month.',
      hi: '[अध्याय 7: मात्र ₹1,000 प्रति माह सब्सक्रिप्शन] कोई भी नया व्यापारी मात्र 60 सेकंड में ऑनबोर्ड हो सकता है। रेजरपे से सुरक्षित पेमेंट करें और बिना किसी कमीशन के अपना काम शुरू करें।',
    },
    keyPoints: [
      'Flat ₹1,000 / Month (Zero Hidden User or Table Fees)',
      'Official Razorpay Checkout SDK Integration',
      'Instant Merchant User ID & Admin PIN Issuance',
      'Automatic GST Invoice Generation & Business License',
    ],
  },
];

export function ProductWalkthrough() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [subtitleLang, setSubtitleLang] = useState('hi'); // 'en', 'hi', 'off'
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(20);

  const activeChapter = CHAPTERS[activeChapterIndex];

  // When chapter changes, reset playback
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [activeChapterIndex]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setVideoDuration(videoRef.current.duration || 20);
    }
  };

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current && videoDuration > 0) {
      videoRef.current.currentTime = pos * videoDuration;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28 selection:bg-amber-500 selection:text-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interactive Video Walkthrough · Dual Subtitle Engine</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                Complete Platform Walkthrough
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
                Watch how Study Library QR passes, Restaurant POS, Apronto Hyperlocal Trades, Porter Logistics, and Mobile Profit Estimators operate with zero cloud database costs.
              </p>
            </div>

            {/* Subtitle Language Switcher */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
              <div className="flex items-center gap-1.5 px-2 text-slate-400">
                <Languages className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Subtitles:</span>
              </div>
              <button
                onClick={() => setSubtitleLang('hi')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  subtitleLang === 'hi'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिंदी (Hindi)
              </button>
              <button
                onClick={() => setSubtitleLang('en')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  subtitleLang === 'en'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setSubtitleLang('off')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  subtitleLang === 'off'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Off
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Main Video Showcase Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Video Player with Real-Time Subtitles Overlay */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-black aspect-video shadow-2xl group">
              <video
                ref={(el) => {
                  videoRef.current = el;
                  if (el) {
                    el.muted = isMuted;
                    el.defaultMuted = isMuted;
                  }
                }}
                src={activeChapter.videoUrl}
                poster={activeChapter.posterUrl}
                autoPlay
                playsInline
                loop
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-cover"
              />

              {/* Top Chapter Badge */}
              <div className="absolute top-4 left-4 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/80 flex items-center gap-2 text-xs font-bold text-white shadow-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Chapter {activeChapter.number}: {activeChapter.badge}</span>
              </div>

              {/* Subtitle Overlay Box */}
              {subtitleLang !== 'off' && (
                <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none">
                  <div className="inline-block px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-md border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-semibold shadow-2xl max-w-xl mx-auto leading-relaxed animate-in fade-in">
                    {activeChapter.subtitles[subtitleLang] || activeChapter.subtitles.en}
                  </div>
                </div>
              )}

              {/* Custom Scrub Bar & Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col gap-2">
                {/* Scrub Progress Bar */}
                <div
                  onClick={handleSeek}
                  className="w-full h-1.5 bg-slate-700/80 hover:h-2.5 rounded-full cursor-pointer transition-all relative overflow-hidden"
                >
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                    style={{ width: `${(currentTime / (videoDuration || 1)) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleTogglePlay}
                      className="p-1 rounded-lg hover:text-white transition cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={handleToggleMute}
                      className="p-1 rounded-lg hover:text-white transition cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                    </button>
                    <span className="font-mono text-[11px] text-slate-400">
                      {Math.floor(currentTime)}s / {Math.floor(videoDuration)}s
                    </span>
                  </div>

                  <div className="text-[11px] font-bold text-amber-300 truncate max-w-xs sm:max-w-none">
                    {activeChapter.title}
                  </div>
                </div>
              </div>
            </div>

            {/* Chapter Action Bar */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-white text-base">
                  Ready to test Chapter {activeChapter.number}?
                </h3>
                <p className="text-xs text-slate-400">
                  Try this live module inside the platform right now.
                </p>
              </div>

              <Link
                to={activeChapter.actionRoute}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>{activeChapter.actionLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right: Chapter Navigation Playlist */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Walkthrough Chapters (7)
              </span>
              <span className="text-[11px] text-amber-400 font-bold">
                Chapter {activeChapterIndex + 1} of {CHAPTERS.length}
              </span>
            </div>

            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {CHAPTERS.map((ch, idx) => {
                const Icon = ch.icon;
                const isSelected = activeChapterIndex === idx;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapterIndex(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/30 shadow-lg'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${
                          isSelected ? 'text-amber-400' : 'text-slate-500'
                        }`}>
                          Part {ch.number} · {ch.badge}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        )}
                      </div>
                      <h4 className="font-bold text-white text-xs truncate mt-0.5">{ch.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {ch.subtitles[subtitleLang === 'hi' ? 'hi' : 'en']}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deep Dive Breakdown for Active Chapter */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Technical Architecture Highlights
            </span>
            <span className="text-xs text-slate-500">· Part {activeChapter.number}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white">
            {activeChapter.title}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {activeChapter.keyPoints.map((kp, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 font-medium leading-relaxed">{kp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductWalkthrough;
