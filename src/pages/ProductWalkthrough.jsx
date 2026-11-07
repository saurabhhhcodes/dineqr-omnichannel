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
  ChefHat,
  Layers,
} from 'lucide-react';

const CHAPTERS = [
  {
    id: 'restaurant',
    number: '01',
    title: 'Restaurant Table QR & Invoicing',
    badge: 'Dining & Kitchen',
    icon: UtensilsCrossed,
    videoUrl: '/videos/walkthrough_restaurant.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    duration: 10,
    actionLabel: 'Launch Bistro Table POS Demo',
    actionRoute: '/menu?restaurant=losteria&table=tbl_1',
    subtitles: {
      en: '[Chapter 1: Restaurant & Table POS] Live screen capture of guest table self-ordering. Diners browse the digital menu, add items to cart, view CGST + SGST tax breakdown, and submit their order for Dining Table 01.',
      hi: '[अध्याय 1: रेस्टोरेंट टेबल पीओएस व बिलिंग] डाइनिंग टेबल 01 से असली कस्टमर सेल्फ-ऑर्डर का लाइव वीडियो। ग्राहक डिजिटल मेनू देखकर कार्ट में आइटम जोड़ते हैं, जीएसटी टैक्स देखते हैं और टेबल के लिए ऑर्डर सबमिट करते हैं।',
    },
    keyPoints: [
      'Interactive Digital Table Menu with Search & Category Filters',
      'Instant Cart Drawer with Real-Time CGST/SGST Tax Breakdown',
      'Direct Table Token Allocation & Official GST Invoice',
      'Zero Waiter Delay for Cashless Table Turnarounds',
    ],
  },
  {
    id: 'kds',
    number: '02',
    title: 'Kitchen KDS & Order Chimes',
    badge: 'Kitchen Operations',
    icon: ChefHat,
    videoUrl: '/videos/walkthrough_kds.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&q=80',
    duration: 8,
    actionLabel: 'Open Live Kitchen Display (KDS)',
    actionRoute: '/admin/kitchen',
    subtitles: {
      en: '[Chapter 2: Kitchen Display System] Live recording of kitchen staff KDS screen. Incoming table orders appear instantly. Chefs click "Accept & Start Prep" to update status to Preparing, followed by Ready and Complete with audio alerts.',
      hi: '[अध्याय 2: किचन केडीएस व लाइव टिकट] किचन शेफ स्क्रीन का लाइव वीडियो। जैसे ही ग्राहक ऑर्डर करता है, स्क्रीन पर तुरंत टिकट आ जाता है। शेफ "Accept & Start Prep" पर क्लिक करके स्टेटस अपडेट करते हैं और अलर्ट घंटी बजती है।',
    },
    keyPoints: [
      'Real-Time Webhook & Server-Sent Ticket Streams',
      'Status Pipeline: Received -> Preparing -> Ready -> Served',
      'Urgent Order Timers & Color-Coded Alert Borders',
      'Single-Click ESC/POS 80mm Thermal KOT Slip Printing',
    ],
  },
  {
    id: 'floorplan',
    number: '03',
    title: 'Premises Floor Plan Management',
    badge: 'Floor Layout',
    icon: Layers,
    videoUrl: '/videos/walkthrough_floorplan.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    duration: 8,
    actionLabel: 'Open Floor Plan Designer',
    actionRoute: '/admin/floor-plan',
    subtitles: {
      en: '[Chapter 3: Visual Floor Plan Management] Real video demonstrating premises table layouts. Managers drag-and-drop dining tables to match their room architecture, inspect live seated tabs, and add new tables dynamically.',
      hi: '[अध्याय 3: विजुअल फ्लोर प्लान व टेबल सेटिंग] रेस्टोरेंट व कैफे फ्लोर प्लान का लाइव वीडियो। मैनेजर अपनी जगह के अनुसार टेबलों को ड्रैग करके सेट करते हैं, खाली व बैठी टेबलों का स्टेटस देखते हैं और नई टेबल जोड़ते हैं।',
    },
    keyPoints: [
      'Visual Coordinate Drag-and-Drop Canvas',
      'Live Table Occupancy & Seated Guest Billing Tabs',
      'Custom Table Capacities & Shape Configuration (Round/Rect)',
      'Instant Synchronized Persistence to Local SQLite',
    ],
  },
  {
    id: 'trades',
    number: '04',
    title: 'Apronto Trades & Porter Logistics',
    badge: 'On-Demand & Cargo',
    icon: Truck,
    videoUrl: '/videos/walkthrough_trades.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    duration: 9,
    actionLabel: 'Launch Trades & Porter Hub',
    actionRoute: '/services',
    subtitles: {
      en: '[Chapter 4: Apronto Trades & Porter Dispatch] Live demonstration of the standalone services hub. Customers browse verified carpenters, electricians, private chefs, select 50kg UltraTech cement, calculate Porter Tata Ace truck fare, and dispatch drivers.',
      hi: '[अध्याय 4: ऑन-डिमांड कारीगर व पोर्टर डिलीवरी] सेपरेट सर्विसेज हब का लाइव वीडियो। कारपेंटर, इलेक्ट्रीशियन व शेफ को बुक करें, 50 किलो अल्ट्राटेक सीमेंट ऑर्डर करें और पोर्टर टाटा एस का किराया देखकर ड्राइवर डिस्पैच करें।',
    },
    keyPoints: [
      'Private Chefs, Carpenters, Electricians & Submersible Pump Techs',
      'Building Materials Depot (UltraTech Cement & River Sand)',
      'Porter Logistics Rate Engine (Tata Ace, Pickup, 2-Wheeler)',
      'Live Driver Telemetry Tracking & 60s Mobile Pro Onboarding',
    ],
  },
  {
    id: 'profit',
    number: '05',
    title: 'Mobile Profit & Loss Estimator',
    badge: 'Financial Analytics',
    icon: TrendingUp,
    videoUrl: '/videos/walkthrough_pnl.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80',
    duration: 10,
    actionLabel: 'Open Mobile Profit Dashboard',
    actionRoute: '/admin',
    subtitles: {
      en: '[Chapter 5: Mobile Phone P&L Estimator] Real capture on mobile viewport. Owners adjust touch sliders for monthly rent, electricity & AC, and staff payroll to see real-time net take-home profit and margin percentages calculate dynamically.',
      hi: '[अध्याय 5: मोबाइल फोन पर नेट प्रॉफिट कैलकुलेटर] मोबाइल स्क्रीन का लाइव वीडियो। दुकान व रेस्टोरेंट मालिक अपनी दुकान का किराया, बिजली बिल और स्टाफ की सैलरी वाले स्लाइडर घुमाकर रोज और महीने का नेट प्रॉफिट लाइव देखते हैं।',
    },
    keyPoints: [
      'Phone-Friendly Touch Sliders for Rent, Electricity & Staff Wages',
      'Dynamic Industry COGS (16% Salon, 32% Restaurant, 12% Gym)',
      'Real-Time Net Profit (₹) & Take-Home Margin % Calculations',
      'Zero Cloud Fees with Instant On-Device Computation',
    ],
  },
  {
    id: 'sqlite',
    number: '06',
    title: 'Local SQLite Engine & Webhook Sync',
    badge: 'Offline-First Engine',
    icon: Database,
    videoUrl: '/videos/walkthrough_sqlite.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
    duration: 10,
    actionLabel: 'Verify SQLite Webhook Now',
    actionRoute: '/admin',
    subtitles: {
      en: '[Chapter 6: Local SQLite DB & Webhook] Live recording of the cryptographic integrity check. Clicking "Verify Database Webhook" generates a real SHA-256 checksum of restaurant.db and audits all 18 tables with 395 verified records.',
      hi: '[अध्याय 6: लोकल SQLite डेटाबेस व क्रिप्टोग्राफिक वेबहुक] डेटा वेरिफिकेशन का लाइव वीडियो। "Verify Database Webhook" पर क्लिक करने पर लोकल फाइल का SHA-256 हैश बनता है और सभी 18 टेबलों के 395 रिकॉर्ड्स का ऑडिट हो जाता है।',
    },
    keyPoints: [
      'Embedded SQLite Engine with Zero Cloud DB Monthly Costs',
      'Cryptographic SHA-256 Database Integrity Webhook Check',
      'Permanent Local Data Ownership (restaurant.db file on disk)',
      'Cross-Platform Native Standalone Apps (EXE, APK, DMG, DEB)',
    ],
  },
  {
    id: 'subscription',
    number: '07',
    title: 'Razorpay ₹1,000/mo SaaS Activation',
    badge: 'Merchant Billing',
    icon: CreditCard,
    videoUrl: '/videos/walkthrough_subscription.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?w=1200&q=80',
    duration: 8,
    actionLabel: 'Subscribe for ₹1,000 / month',
    actionRoute: '/pricing',
    subtitles: {
      en: '[Chapter 7: Flat ₹1,000/Month SaaS Plan] Live recording of the subscription checkout flow. Businesses choose monthly or annual flat pricing with zero per-order commissions and activate their license via Razorpay UPI.',
      hi: '[अध्याय 7: फ्लैट ₹1,000 प्रति माह लाइसेंस] सब्सक्रिप्शन पेमेंट का लाइव वीडियो। व्यापारी बिना किसी कमीशन के मात्र ₹1,000/माह में पूरा सॉफ्टवेयर रेजरपे यूपीआई से एक्टिवेट करके तुरंत काम शुरू करते हैं।',
    },
    keyPoints: [
      'Flat ₹1,000 / Month (Zero Hidden User, Seat or Table Commission)',
      'Official Razorpay Checkout SDK Integration',
      'Instant Merchant User ID & Admin PIN Issuance',
      'Perpetual License with Local Database Backup Left on Machine',
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
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(20);
  const [viewMode, setViewMode] = useState('video'); // 'video' | 'interactive'

  const activeChapter = CHAPTERS[activeChapterIndex];

  // Voice narration speech synthesis helper
  const speakNarration = (chapterIdx, lang) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    if (!isVoiceActive) return;

    const chap = CHAPTERS[chapterIdx];
    if (!chap) return;

    const speechText = lang === 'en' ? chap.subtitles.en : chap.subtitles.hi;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) => (lang === 'en' ? v.lang.includes('en') : v.lang.includes('hi')));
    if (voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
  };

  // When chapter changes or voice is toggled, reset playback and trigger audio
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    if (isVoiceActive) {
      speakNarration(activeChapterIndex, subtitleLang);
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [activeChapterIndex, isVoiceActive, subtitleLang]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.pause();
        }
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          } else if (isVoiceActive) {
            speakNarration(activeChapterIndex, subtitleLang);
          }
        }
      }
    }
  };

  const handleToggleVoice = () => {
    const nextState = !isVoiceActive;
    setIsVoiceActive(nextState);
    if (!nextState && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
                Watch how Restaurant Table QR, Kitchen KDS, Premises Floor Plans, Apronto Hyperlocal Trades, Porter Logistics, and Mobile Profit Estimators operate with zero cloud database costs.
              </p>
            </div>

            {/* Controls: Audio Voiceover + Subtitle Language Switcher */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Spoken Voiceover Narration Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition cursor-pointer ${
                  isVoiceActive
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Enable spoken voice narration explaining the system"
              >
                {isVoiceActive ? (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Voice Narration: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-4 h-4 text-slate-500" />
                    <span>Listen to Voiceover</span>
                  </>
                )}
              </button>

              {/* Subtitle Language Switcher */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <div className="flex items-center gap-1.5 px-2 text-slate-400">
                  <Languages className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Language:</span>
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
                  className={`px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Main Video Showcase Frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Video Player with Real-Time Subtitles Overlay or Live Interactive Sandbox */}
          <div className="lg:col-span-8 space-y-4">
            {/* View Mode Toggle */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setViewMode('video')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'video'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Real Screen Recording</span>
                </button>
                <button
                  onClick={() => setViewMode('interactive')}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'interactive'
                      ? 'bg-sky-500 text-white font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Interactive Live Sandbox</span>
                </button>
              </div>

              <Link
                to={activeChapter.actionRoute}
                target="_blank"
                className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1"
              >
                <span>Open Full Page</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {viewMode === 'interactive' ? (
              <div className="relative rounded-3xl overflow-hidden border border-slate-700 bg-slate-900 aspect-video shadow-2xl">
                <iframe
                  src={activeChapter.actionRoute}
                  title={activeChapter.title}
                  className="w-full h-full border-0 bg-white"
                />
                <div className="absolute top-3 left-3 bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-sky-400/40 text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1.5 shadow-lg pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Live Interactive Sandbox · Real Data & Actions</span>
                </div>
              </div>
            ) : (
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
            )}

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
