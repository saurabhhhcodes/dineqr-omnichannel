// src/pages/TokenDisplay.jsx - Fullscreen QSR & Food Court Token TV Display
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Tv,
  CheckCircle2,
  Clock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Sparkles,
  ArrowLeft,
  ChefHat,
  Bell,
  Coffee,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { AdSenseBanner } from '../components/AdSenseBanner.jsx';

export function TokenDisplay() {
  const { activeRestaurant } = useRestaurant();
  const restId = activeRestaurant?.id || 'rest_losteria';

  const [tokens, setTokens] = useState({ preparing: [], ready: [], served: [] });
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newlyReadyToken, setNewlyReadyToken] = useState(null);

  const prevReadyRef = useRef([]);

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Audio Chime Synth
  const playBuzzerChime = (tokenNumber) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, audioCtx.currentTime + 0.35); // D6

      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);

      // Voice announcement if speech synthesis supported
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Token number ${tokenNumber}, your order is ready for pickup.`);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      // Audio autoplay may require user interaction
    }
  };

  // Fetch active tokens
  const fetchTokens = async () => {
    try {
      const res = await fetch(`/api/tokens/active?restaurant_id=${restId}`);
      const data = await res.json();
      if (data.success) {
        // Detect newly ready tokens to chime
        const currentReadyCodes = (data.ready || []).map((t) => t.token_number);
        const prevCodes = prevReadyRef.current;
        const newArrival = currentReadyCodes.find((code) => !prevCodes.includes(code));

        if (newArrival && prevCodes.length > 0) {
          setNewlyReadyToken(newArrival);
          playBuzzerChime(newArrival);
          setTimeout(() => setNewlyReadyToken(null), 8000);
        }

        prevReadyRef.current = currentReadyCodes;
        setTokens(data);
      }
    } catch (err) {
      console.warn('Failed to fetch active tokens:', err);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 4000);

    // SSE Realtime events
    let eventSource;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.addEventListener('ORDER_STATUS_CHANGED', () => {
        fetchTokens();
      });
      eventSource.addEventListener('NEW_ORDER', () => {
        fetchTokens();
      });
    } catch (e) {}

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [restId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top TV Header Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-2xl z-20">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/kitchen"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">KDS Kitchen</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                {activeRestaurant?.name || 'DineQR Food Court'}
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE TOKEN SCREEN
                </span>
              </h1>
              <p className="text-xs text-slate-400">Order Ready Pickup Announcer · Smart KDS Sync</p>
            </div>
          </div>
        </div>

        {/* Controls: Time, Audio & Fullscreen */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400 tracking-wider">
              {currentTime}
            </div>
            <div className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Live TV Sync
            </div>
          </div>

          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playBuzzerChime('TEST');
            }}
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={soundEnabled ? 'Chime sound is ON' : 'Chime sound is MUTED'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
            title="Toggle TV Fullscreen"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Floating Announcement Banner for Newly Ready Token */}
      {newlyReadyToken && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white px-6 py-3 flex items-center justify-center gap-3 animate-bounce shadow-2xl z-30">
          <Bell className="w-6 h-6 animate-spin" />
          <span className="text-lg sm:text-xl font-black tracking-wide">
            TOKEN #{newlyReadyToken} IS READY! PLEASE COLLECT AT COUNTER!
          </span>
          <Sparkles className="w-6 h-6" />
        </div>
      )}

      {/* Main Split Screen: Preparing vs Ready */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 p-4 sm:p-6 gap-4 sm:gap-6 overflow-hidden">
        {/* Left Column: Preparing / In Kitchen */}
        <section className="flex flex-col bg-slate-900/40 rounded-2xl border border-slate-800/80 p-5 overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-amber-400 tracking-wide">
                  NOW PREPARING
                </h2>
                <p className="text-xs text-slate-400">किचन में तैयार हो रहा है</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
              {tokens.preparing.length} ORDERS
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {tokens.preparing.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <ChefHat className="w-16 h-16 stroke-[1.5] mb-3 opacity-40 text-amber-400" />
                <p className="text-lg font-medium">Kitchen is all caught up!</p>
                <p className="text-xs text-slate-600">New table/kiosk orders will appear here</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tokens.preparing.map((t) => (
                  <div
                    key={t.id}
                    className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:scale-105"
                  >
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      {t.table_number || 'Token'}
                    </span>
                    <span className="text-3xl sm:text-4xl font-mono font-black text-amber-400 tracking-wider">
                      #{t.token_number}
                    </span>
                    <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-300/80 font-medium">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>Cooking...</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Ready for Pickup */}
        <section className="flex flex-col bg-emerald-950/20 rounded-2xl border border-emerald-500/30 p-5 overflow-hidden shadow-2xl relative">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-pulse">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-emerald-400 tracking-wide">
                  READY FOR PICKUP
                </h2>
                <p className="text-xs text-emerald-300/80">काउंटर से कलेक्ट करें</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/30 text-emerald-200 border border-emerald-400">
              {tokens.ready.length} READY
            </span>
          </div>

          <div className="flex-1 overflow-y-auto mt-4 pr-1">
            {tokens.ready.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <Bell className="w-8 h-8 text-emerald-400/60" />
                </div>
                <p className="text-lg font-medium text-slate-400">No pending pickups</p>
                <p className="text-xs text-slate-600">Fresh dishes ready will chime loudly</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tokens.ready.map((t) => (
                  <div
                    key={t.id}
                    className="bg-emerald-900/40 border-2 border-emerald-400 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xl shadow-emerald-500/20 animate-pulse transition-all hover:scale-105"
                  >
                    <span className="text-xs font-bold text-emerald-200 uppercase tracking-widest mb-1">
                      {t.table_number || 'Token'}
                    </span>
                    <span className="text-4xl sm:text-5xl font-mono font-black text-emerald-300 tracking-wider">
                      #{t.token_number}
                    </span>
                    <div className="mt-2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider">
                      PICK UP NOW
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Optional Sponsor Ad Banner for Food Court Monetization */}
      <div className="bg-slate-950 px-4 py-1 border-t border-slate-900">
        <AdSenseBanner showDemoNotice={false} className="my-1" />
      </div>

      {/* Bottom TV Ticker Marquee */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-semibold text-slate-300">
            Please show your digital order token or printed thermal slip at the collection counter. Thank you for dining with us!
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-slate-500 text-[11px] flex-shrink-0 font-medium">
          <span>DineQR Cloud Engine v3.5</span>
          <span>•</span>
          <Link to="/poss" className="text-amber-400 hover:underline">
            POS & Outlet Solutions
          </Link>
        </div>
      </footer>
    </div>
  );
}
