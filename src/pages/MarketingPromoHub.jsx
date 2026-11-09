// src/pages/MarketingPromoHub.jsx - Social Media Video Studio, Viral Promo Hub & Google AdSense Monetization
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Download,
  Copy,
  Check,
  Share2,
  DollarSign,
  TrendingUp,
  Sparkles,
  Smartphone,
  Tv,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Play,
  Layers,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';
import { AdSenseBanner } from '../components/AdSenseBanner.jsx';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function YoutubeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
      <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
    </svg>
  );
}

export function MarketingPromoHub() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('shorts'); // 'shorts' | 'youtube' | 'adsense' | 'outreach'
  const [copiedKey, setCopiedKey] = useState(null);

  // Google AdSense settings
  const [pubId, setPubId] = useState('');
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    const savedPubId = localStorage.getItem('dineqr_adsense_pub_id') || '';
    const savedEnabled = localStorage.getItem('dineqr_adsense_enabled') !== 'false';
    setPubId(savedPubId);
    setAdsEnabled(savedEnabled);
  }, []);

  const handleSaveAdSense = () => {
    localStorage.setItem('dineqr_adsense_pub_id', pubId.trim());
    localStorage.setItem('dineqr_adsense_enabled', String(adsEnabled));
    addToast('Google AdSense settings saved! Monetization active on public menus & screens.', 'success');
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    addToast('Copied to clipboard! Ready to paste into Instagram / YouTube.', 'success');
    setTimeout(() => setCopiedKey(null), 3000);
  };

  const SHORTS_CAPTION = `₹50,000 की महंगी POS मशीन और क्लाउड बिल भूल जाओ! 🛑

QR Flow — Restaurant, Cafe, Gym और Clinics के लिए 100% On-Premise Local POS सिस्टम:
✅ टेबल QR डिजिटल मेन्यू & इंस्टेंट UPI पेमेंट (0% कमीशन)
✅ कैप्टन वेटर मोबाइल ऐप (सीधे फोन से KOT पंच)
✅ किचन शेफ KDS स्क्रीन (लाइव टाइमर & ऑडियो अलार्म)
✅ फूड कोर्ट टोकन टीवी अनाउंसर (लाउडस्पीकर कॉलआउट्स)
✅ डायरेक्ट Zomato & Swiggy ऑनलाइन डिलीवरी इंटीग्रेशन
✅ पेपरलेस जिम अटेंडेंस रजिस्टर & क्लिनिक रूम मैनेजमेंट

💰 सिर्फ ₹1,500/माह फ्लैट! कोई क्लाउड डेटाबेस बिल नहीं, कोई एक्स्ट्रा कमीशन नहीं।

👉 अभी फ्री में टेस्ट करें: qrflow-app.netlify.app (Link in Bio!)

#restaurantpos #restauranttech #cafeowner #billingsoftware #zomato #swiggy #restaurantmanagement #posbilling #qrordering #indiastartup #smallbusinessindia #foodcourt`;

  const YOUTUBE_DESCRIPTION = `Complete Walkthrough: QR Flow Omnichannel Restaurant POS & Management Platform (₹1,500/Month).

In this video, explore how QR Flow completely eliminates expensive legacy POS hardware and heavy recurring cloud bills for Restaurants, Cafes, Cloud Kitchens, Gyms, and Healthcare Clinics.

🚀 Try the 100% Real Live Demo:
https://qrflow-app.netlify.app/walkthrough

⚡ Key Features Covered:
0:00 - The Problem: Overpaying ₹50,000 for legacy POS hardware
0:08 - Table QR Digital Menu & 0% Commission UPI Payments
0:15 - Mobile Captain Waiter App & Instant KOT Punching
0:22 - Kitchen Display System (KDS) & Automated Audio Alarms
0:28 - Large Screen Food Court Token TV Display & Voice Callouts
0:35 - Direct Two-Way Zomato & Swiggy Order Ingestion
0:42 - Multi-Business Suite: Gym Member Register & Clinic Queues
0:50 - Pricing & 60-Second Self-Serve Onboarding (Flat ₹1,500/mo)

💰 Pricing Plans:
• Starter Local POS: ₹1,500/month (100% Offline SQLite, Zero Cloud Bills)
• Aggregator Pro: ₹3,500/month (Zomato + Swiggy Webhooks Direct)
• Cloud Sync Hub: ₹5,000/month (Dual SQLite + 2GB Managed Cloud Storage)

👉 Launch Your Outlet Today:
https://qrflow-app.netlify.app/onboard`;

  const WHATSAPP_OUTREACH = `नमस्ते सर/मैडम! 🙏

क्या आप अपने रेस्टोरेंट/कैफे के लिए महंगी POS मशीनों या हर महीने के भारी क्लाउड सॉफ्टवेयर बिल से परेशान हैं?

QR Flow एक आधुनिक, 100% सुरक्षित और सुपर-फास्ट POS सिस्टम है:
• ग्राहक टेबल पर QR कोड स्कैन करके सीधे UPI से ऑर्डर कर सकते हैं (0% कमीशन)।
• वेटर अपने फोन से सीधे किचन को KOT भेज सकते हैं।
• किचन में शेफ के लिए बड़ी स्क्रीन (KDS) और फूड कोर्ट के लिए टोकन टीवी अनाउंसमेंट।
• जोमैटो और स्विगी के ऑर्डर्स सीधे आपके किचन स्क्रीन पर आते हैं।
• 100% ऑफलाइन लोकल कंप्यूटर पर चलता है — इंटरनेट कटने पर भी बिलिंग नहीं रुकती!

💰 खर्च: मात्र ₹1,500 प्रति माह फ्लैट (कोई हिडन चार्ज नहीं)।

आप अपने फोन पर इसका असली लाइव डेमो अभी देख सकते हैं:
👉 https://qrflow-app.netlify.app/walkthrough

अगर आप अपने आउटलेट पर इसे 10 मिनट में चालू करवाना चाहते हैं, तो मुझे रिप्लाई करें।`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-amber-500 selection:text-slate-950 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
                PROMO STUDIO & MARKETING HUB
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Zero Ad Spend · Social Viral Strategy · Google AdSense Monetization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              QR Flow Viral Promo Videos & Free Growth Center
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Download broadcast-ready promotional videos for Instagram Reels, YouTube Shorts, and WhatsApp. Monetize free traffic with Google AdSense without paying for ads.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              to="/walkthrough"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
            >
              <span>Live Walkthrough</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
            <Link
              to="/pricing"
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition shadow-lg shadow-amber-500/20"
            >
              <span>Plans (₹1.5k / ₹3.5k / ₹5k)</span>
            </Link>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('shorts')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'shorts'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Instagram Reels & Shorts (9:16 Vertical)</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'youtube'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <YoutubeIcon className="w-4 h-4" />
            <span>YouTube Showcase (16:9 Landscape)</span>
          </button>

          <button
            onClick={() => setActiveTab('motion')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'motion'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Pure Animation Loop (0 Humans)</span>
          </button>

          <button
            onClick={() => setActiveTab('adsense')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'adsense'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Google AdSense Monetization</span>
          </button>

          <button
            onClick={() => setActiveTab('outreach')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'outreach'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Free WhatsApp Client Outreach</span>
          </button>
        </div>

        {/* TAB 1: INSTAGRAM REELS & YOUTUBE SHORTS (9:16 VERTICAL) */}
        {activeTab === 'shorts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Video Player */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-[340px] rounded-[36px] border-[8px] border-slate-900 bg-black shadow-2xl overflow-hidden ring-1 ring-slate-800 relative">
                <video
                  src="/videos/dineqr_promo_vertical_shorts.mp4"
                  controls
                  playsInline
                  className="w-full h-[580px] object-cover bg-black"
                  poster="/poster.webp"
                >
                  Your browser does not support video playback.
                </video>
              </div>

              <div className="w-full max-w-[340px] mt-4 flex gap-2">
                <a
                  href="/videos/dineqr_promo_vertical_shorts.mp4"
                  download="QR Flow_Promo_Reels_Shorts.mp4"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1080x1920 MP4</span>
                </a>
              </div>
            </div>

            {/* Right: Copy Ready Captions & Posting Strategy */}
            <div className="lg:col-span-7 space-y-5">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <InstagramIcon className="w-4 h-4 text-rose-400" />
                    <h3 className="text-sm font-extrabold text-white">
                      1-Click Copy Ready Instagram & Shorts Caption
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(SHORTS_CAPTION, 'shorts_caption')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedKey === 'shorts_caption' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'shorts_caption' ? 'Copied!' : 'Copy Caption'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                  {SHORTS_CAPTION}
                </div>
              </div>

              {/* Zero-Cost Organic Strategy Tips */}
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>How to Get 10,000+ Views Free (No Ads Needed)</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li><strong>Post Timing:</strong> Post between <strong>12:30 PM - 2:00 PM</strong> or <strong>7:30 PM - 9:30 PM</strong> when restaurant owners check their phones.</li>
                  <li><strong>Trending Audio:</strong> When uploading to Instagram, select a subtle trending lo-fi / tech audio track at 5% volume under the voiceover.</li>
                  <li><strong>Bio Link:</strong> Put <code className="text-amber-400 font-mono">qrflow-app.netlify.app</code> in your Instagram and YouTube channel bio.</li>
                  <li><strong>Direct Comments:</strong> Search for cafe & food bloggers in your city and comment: "Love the ambience! Have you guys checked out self-order QR menus?"</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: YOUTUBE SHOWCASE (16:9 LANDSCAPE) */}
        {activeTab === 'youtube' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-2xl">
              <video
                src="/videos/dineqr_promo_landscape_youtube.mp4"
                controls
                playsInline
                className="w-full aspect-video rounded-2xl bg-black object-contain shadow-lg"
                poster="/poster.webp"
              >
                Your browser does not support video playback.
              </video>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-white">QR Flow Omnichannel POS Full Ecosystem Showcase</h3>
                  <p className="text-xs text-slate-400">1920x1080 (16:9) Full HD · Complete Role Walkthrough</p>
                </div>

                <a
                  href="/videos/dineqr_promo_landscape_youtube.mp4"
                  download="QR Flow_YouTube_Showcase_1080p.mp4"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1080p Widescreen Video</span>
                </a>
              </div>
            </div>

            {/* Ready YouTube Description */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <YoutubeIcon className="w-4 h-4 text-rose-500" />
                  <h3 className="text-sm font-extrabold text-white">
                    Ready-to-Paste YouTube Video Title & Timestamps
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(YOUTUBE_DESCRIPTION, 'yt_desc')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedKey === 'yt_desc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'yt_desc' ? 'Copied!' : 'Copy Description'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                {YOUTUBE_DESCRIPTION}
              </div>
            </div>
          </div>
        )}

        {/* TAB: PURE ANIMATION LOOP (ZERO HUMANS) */}
        {activeTab === 'motion' && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-cyan-500/30 bg-slate-900 p-4 sm:p-6 shadow-2xl">
              <video
                src="/videos/qrflow_animated_hero_loop.mp4"
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full aspect-video rounded-2xl bg-black object-contain shadow-lg border border-slate-800"
              >
                Your browser does not support video playback.
              </video>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>QRFlow Cybernetic 3D Motion Graphic Loop (No Humans)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    1920x1080 (16:9) 60fps Full HD · Pure Vector/3D Laser QR Scan & Orbiting Workflow Telemetry
                  </p>
                </div>

                <a
                  href="/videos/qrflow_animated_hero_loop.mp4"
                  download="QRFlow_Cybernetic_Animation_Loop_1080p.mp4"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 1080p Animation Loop MP4</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">🎯 100% Human-Free</span>
                <p className="text-xs text-slate-300">
                  Ideal for website hero background, pitch decks, investor demos, and tech Instagram reels without actor fatigue.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">⚡ Seamless 60-Frame Loop</span>
                <p className="text-xs text-slate-300">
                  Engineered with mathematical sine curves for infinite seamless loop playback on landing pages and TVs.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">💾 0 Cloud Fees Graphic</span>
                <p className="text-xs text-slate-300">
                  Visually proves the offline SQLite architecture, table ordering, KDS, and token TV flow.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE ADSENSE MONETIZATION */}
        {activeTab === 'adsense' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 flex items-center justify-center font-black shadow-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">
                      Google AdSense Passive Monetization Setup
                    </h2>
                    <p className="text-xs text-slate-400">
                      Earn passive income from digital menu views & token screen displays with zero ad expense.
                    </p>
                  </div>
                </div>

                <a
                  href="https://www.google.com/adsense/start/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>Apply for Google AdSense</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Google AdSense Publisher Client ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ca-pub-1234567890123456"
                    value={pubId}
                    onChange={(e) => setPubId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:border-amber-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Found in your Google AdSense Dashboard &rarr; Account &rarr; Settings &rarr; Publisher ID
                  </span>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Monetization Status
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer mt-2 text-xs text-slate-300">
                      <input
                        type="checkbox"
                        checked={adsEnabled}
                        onChange={(e) => setAdsEnabled(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                      />
                      <span>Enable Google AdSense on Public QR Menus & Token Screens</span>
                    </label>
                  </div>

                  <button
                    onClick={handleSaveAdSense}
                    className="w-full sm:w-auto mt-4 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer self-start shadow-md"
                  >
                    Save Monetization Settings
                  </button>
                </div>
              </div>
            </div>

            {/* AdSense Live Banner Preview */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Live Banner Preview (Appearing on Customer Menus & Token Screens)
                </span>
                <span className="text-xs text-emerald-400 font-bold">100% Non-Intrusive</span>
              </div>
              <AdSenseBanner showDemoNotice={true} />
            </div>

            {/* Revenue Projection Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-xs text-slate-400">Monthly QR Menu Scans</span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1">20,000+</div>
                <p className="text-[10px] text-slate-500">Across your local restaurant network</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Est. Ad Impressions</span>
                <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1">50,000+</div>
                <p className="text-[10px] text-slate-500">Menu + TV + Bill views</p>
              </div>
              <div>
                <span className="text-xs text-slate-400">Estimated Ad Earnings</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1">₹8,000 - ₹18,000 <span className="text-xs font-normal text-slate-400">/mo</span></div>
                <p className="text-[10px] text-slate-500">Pure profit with ₹0 advertising cost</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FREE WHATSAPP CLIENT OUTREACH */}
        {activeTab === 'outreach' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">
                    Copy-Paste WhatsApp Message for 50 Local Cafe & Gym Owners
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(WHATSAPP_OUTREACH, 'wa_pitch')}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copiedKey === 'wa_pitch' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'wa_pitch' ? 'Copied Message!' : 'Copy WhatsApp Pitch'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed">
                {WHATSAPP_OUTREACH}
              </div>
            </div>

            {/* Daily Execution Playbook */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>The 7-Day Free Client Acquisition Plan (Zero Budget)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-amber-400">Step 1: Google Maps Hunt</div>
                  <p className="text-slate-400 text-[11px]">
                    Open Google Maps, search "cafes near me", "gyms near me", or "bakeries". Click each listing to find their direct WhatsApp / phone numbers.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-amber-400">Step 2: Send 25 DMs Daily</div>
                  <p className="text-slate-400 text-[11px]">
                    Paste the WhatsApp message above with your live demo link. 25 messages takes only 20 minutes a day.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="font-extrabold text-amber-400">Step 3: Close at ₹1,500/mo</div>
                  <p className="text-slate-400 text-[11px]">
                    Even at a 5% reply rate, you get 1-2 new paying clients every week. 10 clients = ₹15,000/month recurring income with zero server costs!
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MarketingPromoHub;
