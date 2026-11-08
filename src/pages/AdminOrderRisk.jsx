// src/pages/AdminOrderRisk.jsx - AI CCTV Vision & Order Risk Guard (Table Occupancy & Waiter Attention Bell)
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
  ShieldAlert,
  Sliders,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  Eye,
  Radio,
  Tv,
  Sparkles,
  Zap,
  ArrowRight,
  UserCheck,
  Video,
  Upload,
  Settings,
  ShieldCheck,
  Activity,
  Layers,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export function AdminOrderRisk({ isPublicDemo = false }) {
  const { activeRestaurant } = useRestaurant();
  const { addToast } = useToast();

  const [activeCam, setActiveCam] = useState('cam_01');
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamStream, setWebcamStream] = useState(null);
  const videoRef = useRef(null);

  const camFeeds = {
    cam_01: {
      name: 'Cam 01: Dining Hall (Ceiling 4K)',
      src: '/videos/cctv_dining_feed.mp4',
      resolution: '4K Ultra HD · 30 FPS',
      rtsp: 'RTSP://192.168.1.120:554/live/dining_hall',
    },
    cam_02: {
      name: 'Cam 02: Counter & Kitchen (IP Dome)',
      src: '/videos/cctv_patio_feed.mp4',
      resolution: '1080p HD · 30 FPS',
      rtsp: 'RTSP://192.168.1.121:554/live/ip_dome_counter',
    },
    cam_03: {
      name: 'Cam 03: VIP Lounge & Tables',
      src: '/videos/cctv_vip_feed.mp4',
      resolution: '1080p HD · 29.9 FPS',
      rtsp: 'RTSP://192.168.1.122:554/live/vip_lounge',
    },
  };

  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isAutoBellActive, setIsAutoBellActive] = useState(true);
  const [slaThreshold, setSlaThreshold] = useState(120); // 2 minutes
  const [showHudOverlay, setShowHudOverlay] = useState(true);
  const [isBellRinging, setIsBellRinging] = useState(false);

  const [tables, setTables] = useState([
    {
      table_number: 'Table 01',
      section: 'Main Dining',
      status: 'OCCUPIED',
      guests_detected: 2,
      seated_seconds: 412,
      waiter_assigned: 'Sunil Verma',
      waiter_attended: true,
      last_attended_seconds_ago: 38,
      risk_level: 'LOW',
      current_order: 'ORD-9128',
    },
    {
      table_number: 'Table 02',
      section: 'Main Dining',
      status: 'VACANT',
      guests_detected: 0,
      seated_seconds: 0,
      waiter_assigned: null,
      waiter_attended: false,
      last_attended_seconds_ago: null,
      risk_level: 'NONE',
      current_order: null,
    },
    {
      table_number: 'Table 03',
      section: 'Main Dining',
      status: 'ATTENTION_REQUIRED',
      guests_detected: 3,
      seated_seconds: 236, // 3m 56s
      waiter_assigned: null,
      waiter_attended: false,
      last_attended_seconds_ago: null,
      risk_level: 'CRITICAL',
      current_order: null,
      alert_reason: 'Guests seated >3 mins with no server contact (Walkout Risk)',
    },
    {
      table_number: 'Table 04',
      section: 'Main Dining',
      status: 'OCCUPIED',
      guests_detected: 4,
      seated_seconds: 795,
      waiter_assigned: 'Pooja Nair',
      waiter_attended: true,
      last_attended_seconds_ago: 85,
      risk_level: 'LOW',
      current_order: 'ORD-9115',
    },
    {
      table_number: 'Table 05',
      section: 'Patio Deck',
      status: 'BUSY_DIRTY',
      guests_detected: 0,
      seated_seconds: 0,
      waiter_assigned: null,
      waiter_attended: false,
      last_attended_seconds_ago: 130,
      risk_level: 'MEDIUM',
      current_order: null,
      alert_reason: 'Table vacant with uncleaned dishes >5 mins',
    },
    {
      table_number: 'Table 06',
      section: 'Patio Deck',
      status: 'VACANT',
      guests_detected: 0,
      seated_seconds: 0,
      waiter_assigned: null,
      waiter_attended: false,
      last_attended_seconds_ago: null,
      risk_level: 'NONE',
      current_order: null,
    },
  ]);

  const [incidentLog, setIncidentLog] = useState([
    {
      id: 'inc_101',
      timestamp: '15:43:10',
      table: 'Table 03',
      event: 'GUESTS_SEATED',
      details: 'Computer vision detected 3 guests arriving at Table 03.',
      type: 'INFO',
    },
    {
      id: 'inc_102',
      timestamp: '15:45:15',
      table: 'Table 03',
      event: 'SLA_BREACH_ALERT',
      details: 'Guests unattended for > 2m. Service alert chime bell triggered.',
      type: 'WARNING',
    },
    {
      id: 'inc_103',
      timestamp: '15:45:20',
      table: 'Table 03',
      event: 'BELL_CHIME_DISPATCHED',
      details: 'Restaurant bell chime & Captain alert broadcasted for Table 03.',
      type: 'ALARM',
    },
  ]);

  const [activeAlertBanner, setActiveAlertBanner] = useState({
    active: true,
    table: 'Table 03',
    message: 'Guests seated 3m 56s without waiter attendance · High Walkout Risk!',
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [customRtspUrl, setCustomRtspUrl] = useState('rtsp://192.168.1.120:554/h264/ch1/main');
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // 1. Synthesize Rich Brass Restaurant Counter Bell
  const playRestaurantBellChime = (tableNumber = 'Table 03') => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const now = ctx.currentTime;

      // Bell Strike (Primary fundamental 880Hz + overtone 1760Hz + 1320Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1760, now); // Octave

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(1318.5, now + 0.04); // E6 fifth

      // Exponential decay envelope (metallic bell chime)
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.8, now + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now + 0.04);

      osc1.stop(now + 1.8);
      osc2.stop(now + 1.8);
      osc3.stop(now + 1.8);

      // Voice prompt announcement
      setTimeout(() => {
        if ('speechSynthesis' in window) {
          const utt = new SpeechSynthesisUtterance(`Attention. Waiter needed at ${tableNumber}.`);
          utt.lang = 'en-IN';
          utt.rate = 1.05;
          window.speechSynthesis.speak(utt);
        }
      }, 400);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Stopwatch ticker for seated tables
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setTables((prev) =>
        prev.map((t) => {
          if (t.status === 'ATTENTION_REQUIRED' || (t.status === 'OCCUPIED' && !t.waiter_attended)) {
            const nextSec = t.seated_seconds + 1;
            return {
              ...t,
              seated_seconds: nextSec,
              risk_level: nextSec > slaThreshold ? 'CRITICAL' : 'MEDIUM',
            };
          }
          if (t.status === 'OCCUPIED' && t.waiter_attended) {
            return {
              ...t,
              seated_seconds: t.seated_seconds + 1,
              last_attended_seconds_ago: (t.last_attended_seconds_ago || 0) + 1,
            };
          }
          return t;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [slaThreshold]);

  // Handle Manual or Auto Bell Trigger
  const handleTriggerBell = async (tableNum = 'Table 03', reason = 'Service bell rung by operator') => {
    setIsBellRinging(true);
    setTimeout(() => setIsBellRinging(false), 3000);
    playRestaurantBellChime(tableNum);
    addToast(`🔔 Service Alert Chime Sounded for ${tableNum}! Server Alerted.`);

    setActiveAlertBanner({
      active: true,
      table: tableNum,
      message: `🔔 Service Attention Chime Active for ${tableNum} · Server Alert Dispatched!`,
    });

    const newInc = {
      id: 'inc_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      table: tableNum,
      event: 'BELL_CHIME_DISPATCHED',
      details: reason,
      type: 'ALARM',
    };

    setIncidentLog((prev) => [newInc, ...prev.slice(0, 49)]);

    try {
      await fetch('/api/erp/cctv-risk/bell-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: tableNum, manual: true, reason }),
      });
    } catch {}
  };

  // Handle Dispatching Waiter to At-Risk Table
  const handleAssignWaiter = async (tableNum = 'Table 03', waiterName = 'Sunil Verma') => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.table_number === tableNum) {
          return {
            ...t,
            status: 'OCCUPIED',
            waiter_assigned: waiterName,
            waiter_attended: true,
            risk_level: 'LOW',
            alert_reason: null,
            last_attended_seconds_ago: 0,
          };
        }
        return t;
      })
    );

    setActiveAlertBanner({ active: false, table: null, message: '' });
    addToast(`✓ Waiter ${waiterName} assigned to ${tableNum}. Walkout risk resolved!`);

    const newInc = {
      id: 'inc_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      table: tableNum,
      event: 'WAITER_DISPATCHED',
      details: `Server ${waiterName} arrived at ${tableNum}. Order flow restored.`,
      type: 'SUCCESS',
    };
    setIncidentLog((prev) => [newInc, ...prev.slice(0, 49)]);

    try {
      await fetch('/api/erp/cctv-risk/assign-waiter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table_number: tableNum, waiter_name: waiterName }),
      });
    } catch {}
  };

  // Toggle Live Webcam
  const handleToggleWebcam = async () => {
    if (useWebcam) {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
      setWebcamStream(null);
      setUseWebcam(false);
      addToast('Switched back to Dining Room Cam 01');
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setWebcamStream(stream);
        setUseWebcam(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        addToast('Connected to Live Device Camera Feed!');
      } catch (err) {
        addToast('Camera permission denied or camera not found: ' + err.message, 'error');
      }
    }
  };

  // Simulate New Guest Arrival
  const handleSimulateArrival = () => {
    setTables((prev) =>
      prev.map((t) => {
        if (t.table_number === 'Table 02') {
          return {
            ...t,
            status: 'ATTENTION_REQUIRED',
            guests_detected: 2,
            seated_seconds: 15,
            waiter_assigned: null,
            waiter_attended: false,
            risk_level: 'MEDIUM',
            alert_reason: 'New guests seated. Awaiting server contact.',
          };
        }
        return t;
      })
    );

    const newInc = {
      id: 'inc_' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      table: 'Table 02',
      event: 'GUESTS_SEATED',
      details: 'Computer Vision detected 2 new guests arriving at Table 02.',
      type: 'INFO',
    };
    setIncidentLog((prev) => [newInc, ...prev.slice(0, 49)]);
    addToast('Simulated 2 guests seated at Table 02! Dwell stopwatch started.');
  };

  const occupiedCount = tables.filter((t) => t.status === 'OCCUPIED' || t.status === 'ATTENTION_REQUIRED').length;
  const atRiskCount = tables.filter((t) => t.risk_level === 'CRITICAL' || t.status === 'ATTENTION_REQUIRED').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Live Computer Vision AI
            </span>
            <span className="text-xs text-slate-400 font-mono">
              YOLOv11x Spatial Table Tracking · 24.8 FPS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>AI CCTV Vision & Order Risk Guard</span>
            <span className="text-xs font-normal text-slate-400">
              (सुरक्षा कैमरा टेबल ऑक्यूपेंसी व वेटर अलर्ट बेल)
            </span>
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Test Alert Bell Chime Button */}
          <button
            onClick={() => handleTriggerBell('Table 03', 'Manual Test Bell Chime Pressed')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            title="Sound authentic restaurant counter chime & voice alert"
          >
            <Bell className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Test Service Bell (घंटी बजाएं)</span>
          </button>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              setIsAudioEnabled(!isAudioEnabled);
              addToast(isAudioEnabled ? 'Chime sound muted' : 'Chime sound enabled');
            }}
            className={`p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
              isAudioEnabled
                ? 'bg-slate-900 border-slate-700 text-amber-400'
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
            title="Toggle Chime Sound"
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Connect Live Webcam Button */}
          <button
            onClick={handleToggleWebcam}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              useWebcam
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-400" />
            <span>{useWebcam ? 'Disconnect Webcam' : 'Use Live Camera'}</span>
          </button>

          {/* Config SLA Modal Button */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Configure SLA Thresholds"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Persistent Critical SLA Alert Banner */}
      {activeAlertBanner.active && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500/60 shadow-xl shadow-rose-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in shake duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-lg animate-bounce">
              <Bell className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500 text-white">
                  URGENT SERVICE BREACH
                </span>
                <span className="text-xs font-mono font-bold text-rose-300">{currentTime}</span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white mt-0.5">
                {activeAlertBanner.message}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => handleTriggerBell('Table 03', 'Operator re-rang loud service chime')}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ring Bell Again</span>
            </button>
            <button
              onClick={() => handleAssignWaiter('Table 03', 'Sunil Verma')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Dispatch Waiter (Sunil)</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Overview Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tables at Risk (Walkout Alert)
          </span>
          <div className="text-2xl font-black text-rose-400 flex items-center gap-2">
            <span>{atRiskCount} Table</span>
            {atRiskCount > 0 && <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />}
          </div>
          <span className="text-[10px] text-slate-500 font-medium">SLA Threshold: &gt; 2 mins unattended</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Occupancy Rate
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {Math.round((occupiedCount / tables.length) * 100)}%
          </div>
          <span className="text-[10px] text-slate-500 font-medium">
            {occupiedCount} of {tables.length} tables active
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Walkouts Prevented Today
          </span>
          <div className="text-2xl font-black text-amber-400 font-mono">14 Tables</div>
          <span className="text-[10px] text-slate-500 font-medium">Approx. ₹12,600 revenue saved</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Server Response Time
          </span>
          <div className="text-2xl font-black text-sky-400 font-mono">1m 18s</div>
          <span className="text-[10px] text-emerald-400 font-semibold">✓ 42s faster than industry avg</span>
        </div>
      </div>

      {/* Main Layout: CCTV Live Vision Canvas (Left) + Table Attention Matrix (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: CCTV Live Video Canvas with Spatial Overlays */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-2xl relative">
            {/* Camera Header Bar */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-white tracking-wide">
                  {useWebcam ? 'LIVE WEBCAM FEED' : (camFeeds[activeCam]?.name || activeCam.toUpperCase())}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                  {camFeeds[activeCam]?.rtsp || 'RTSP://192.168.1.120:554'}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold">
                  {camFeeds[activeCam]?.resolution || '4K · 30 FPS'}
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px] flex items-center gap-2">
                <span className="text-emerald-400 font-bold hidden sm:inline">● LIVE STREAM</span>
                <span>{currentTime}</span>
              </div>
            </div>

            {/* Video Viewport with Real CCTV Video Stream & Vision AI Bounding Overlays */}
            <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {useWebcam ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Authentic Real-Life CCTV Security Stream of Restaurant Dining Room */
                <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-black select-none">
                  {/* REAL PLAYING CCTV FOOTAGE */}
                  <video
                    key={activeCam}
                    src={camFeeds[activeCam]?.src || '/videos/cctv_dining_feed.mp4'}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover brightness-100 contrast-105"
                  />

                  {/* CCTV scanlines & security camera vignette filter */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,27,0)_50%,rgba(0,0,0,0.18)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30 z-10" />

                  {/* Active Service Bell Chime Alarm Screen Glow Effect */}
                  {isBellRinging && (
                    <div className="absolute inset-0 border-4 border-rose-500 bg-rose-500/25 pointer-events-none z-30 animate-pulse flex items-center justify-center">
                      <div className="p-4 rounded-2xl bg-slate-950/95 border-2 border-rose-500 text-rose-300 text-center space-y-1.5 shadow-2xl animate-in zoom-in-95 backdrop-blur-md">
                        <Bell className="w-10 h-10 text-rose-400 mx-auto fill-rose-400 animate-bounce" />
                        <div className="text-base font-black text-white">
                          🔔 SERVICE ATTENTION BELL RUNG!
                        </div>
                        <div className="text-xs text-rose-300 font-mono">
                          Table 03 SLA Breach · Captain POS &amp; Server Sunil Notified
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Top CCTV Overlay Stats & Camera OSD */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex justify-between items-start text-[11px] font-mono pointer-events-none">
                    <div className="space-y-0.5 bg-slate-950/85 px-2.5 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-sm shadow-lg">
                      <div className="text-emerald-400 font-black flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span>● YOLO-11x SPATIAL VISION ACTIVE</span>
                      </div>
                      <div className="text-slate-300 text-[10px]">FPS: 30.0 · Detects: Tables, Guests, Chairs &amp; Staff</div>
                    </div>
                    <div className="text-right space-y-0.5 bg-slate-950/85 px-2.5 py-1.5 rounded-xl border border-slate-700/80 backdrop-blur-sm shadow-lg">
                      <div className="text-amber-300 font-bold">MONITORED: 4 TABLES</div>
                      <div className={`font-black text-[10px] ${tables[2]?.waiter_attended ? 'text-emerald-400' : 'text-rose-400 animate-pulse'}`}>
                        {tables[2]?.waiter_attended ? '✓ ALL TABLES ATTENDED' : '⚠️ ATTENTION RISK: TABLE 03'}
                      </div>
                    </div>
                  </div>

                  {/* SPATIAL BOUNDING BOXES (Computer Vision Live Overlays) */}
                  {showHudOverlay && (
                    <div className="absolute inset-0 z-20 pointer-events-none">
                      {activeCam === 'cam_01' && (
                        <>
                          {/* Bounding Box 1: Table 01 (Occupied & Attended Booth) */}
                          <div className="absolute left-[20%] top-[16%] w-[22%] h-[28%] rounded-xl border-2 border-emerald-400 bg-emerald-500/15 p-2 text-left space-y-0.5 backdrop-blur-xs pointer-events-auto shadow-lg shadow-emerald-500/30">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                Table 01 · Occupied
                              </span>
                              <span className="text-emerald-300 font-mono font-bold text-[9px]">2 Guests</span>
                            </div>
                            <div className="text-[9px] text-emerald-200 font-semibold">Server: Sunil Verma</div>
                            <div className="text-[8px] text-slate-300 font-mono">Dwell: {formatTime(tables[0]?.seated_seconds || 412)} · Served</div>
                          </div>

                          {/* Bounding Box 2: Table 02 (Vacant 2-Seater) */}
                          <div className="absolute left-[47%] top-[19%] w-[16%] h-[22%] rounded-xl border-2 border-dashed border-cyan-400/90 bg-slate-950/50 p-2 text-left space-y-0.5 backdrop-blur-xs pointer-events-auto shadow-md">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded uppercase text-[9px] font-black">
                                Table 02 · Vacant
                              </span>
                              <span className="text-slate-400 font-mono text-[9px]">0 Guests</span>
                            </div>
                            <div className="text-[8px] text-slate-300">Sanitized &amp; Ready</div>
                          </div>

                          {/* Bounding Box 3: Table 03 (FOREGROUND LARGE TABLE - Dynamic State) */}
                          {tables[2]?.waiter_attended ? (
                            /* State A: Attended (Safe) */
                            <div className="absolute left-[34%] top-[45%] w-[48%] h-[48%] rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 p-3 text-left space-y-1 backdrop-blur-xs pointer-events-auto shadow-2xl shadow-emerald-500/40">
                              <div className="flex items-center justify-between text-[11px] font-black">
                                <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                                  <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                                  Table 03 · Attended &amp; Safe
                                </span>
                                <span className="text-emerald-300 font-mono font-bold">3 Guests</span>
                              </div>
                              <div className="text-xs font-bold text-emerald-100">
                                Server: Sunil Verma On-Site · Order Flow Restored
                              </div>
                              <div className="text-[10px] text-emerald-200 font-mono">
                                Walkout Risk Resolved · Attended at {currentTime}
                              </div>
                            </div>
                          ) : (
                            /* State B: Unattended (CRITICAL WALKOUT RISK) */
                            <div className="absolute left-[34%] top-[45%] w-[48%] h-[48%] rounded-2xl border-2 border-rose-500 bg-rose-500/25 p-3 text-left space-y-1.5 shadow-2xl shadow-rose-500/50 animate-pulse pointer-events-auto backdrop-blur-xs">
                              <div className="flex items-center justify-between text-[11px] font-black">
                                <span className="bg-rose-500 text-white px-2 py-0.5 rounded font-black uppercase flex items-center gap-1 shadow-md">
                                  <Bell className="w-3.5 h-3.5 fill-white animate-bounce" />
                                  Table 03 · ⚠️ Walkout Risk
                                </span>
                                <span className="text-rose-200 font-mono font-bold text-xs bg-slate-950/80 px-2 py-0.5 rounded border border-rose-500/40">
                                  3 Guests Seated
                                </span>
                              </div>
                              <div className="text-xs font-black text-white drop-shadow-md">
                                Unattended: <span className="text-rose-300 font-mono text-sm underline">{formatTime(tables[2]?.seated_seconds || 236)}</span> · No Server Visited!
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleTriggerBell('Table 03', 'Triggered from CCTV Video Box')}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer transition active:scale-95 flex items-center justify-center gap-1"
                                >
                                  <Bell className="w-3.5 h-3.5 fill-slate-950" />
                                  <span>Ring Bell (बजर)</span>
                                </button>
                                <button
                                  onClick={() => handleAssignWaiter('Table 03', 'Sunil Verma')}
                                  className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg cursor-pointer transition active:scale-95 flex items-center justify-center gap-1"
                                >
                                  <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                                  <span>Dispatch Sunil</span>
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Bounding Box 4: Table 04 (Upper Right Window Table) */}
                          <div className="absolute left-[70%] top-[17%] w-[25%] h-[28%] rounded-xl border-2 border-emerald-400 bg-emerald-500/15 p-2 text-left space-y-0.5 backdrop-blur-xs pointer-events-auto shadow-lg shadow-emerald-500/30">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider">
                                Table 04 · Occupied
                              </span>
                              <span className="text-emerald-300 font-mono font-bold text-[9px]">4 Guests</span>
                            </div>
                            <div className="text-[9px] text-emerald-200 font-semibold">Server: Pooja Nair</div>
                            <div className="text-[8px] text-slate-300 font-mono">Order #ORD-9115 Active</div>
                          </div>

                          {/* Staff Waiter Spatial Tracking Marker */}
                          <div className="absolute left-[23%] top-[39%] w-[12%] h-[30%] rounded-xl border border-dashed border-amber-400 bg-amber-400/10 p-1.5 text-left space-y-0.5 pointer-events-auto">
                            <div className="bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black uppercase text-[8px]">
                              STAFF: WAITER
                            </div>
                            <div className="text-[8px] text-amber-200 font-semibold leading-tight">Sunil Verma</div>
                            <div className="text-[7px] text-slate-400 font-mono">Station 01</div>
                          </div>
                        </>
                      )}

                      {activeCam === 'cam_02' && (
                        <>
                          {/* Counter IP Dome Camera Detections */}
                          <div className="absolute left-[20%] top-[8%] w-[24%] h-[28%] rounded-xl border-2 border-emerald-400 bg-emerald-500/15 p-2 text-left space-y-1 backdrop-blur-xs pointer-events-auto shadow-lg shadow-emerald-500/20">
                            <div className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase text-[9px]">
                              Table 05 · Seated &amp; Dining
                            </div>
                            <div className="text-[9px] text-emerald-200">2 Guests · Meal In Progress</div>
                          </div>

                          <div className="absolute left-[37%] top-[28%] w-[30%] h-[36%] rounded-xl border-2 border-emerald-400 bg-emerald-500/15 p-2 text-left space-y-1 backdrop-blur-xs pointer-events-auto shadow-lg shadow-emerald-500/20">
                            <div className="bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase text-[9px]">
                              Bar Counter · 3 Seated Guests
                            </div>
                            <div className="text-[9px] text-emerald-200">Drinks &amp; Starters Active</div>
                          </div>

                          <div className="absolute left-[66%] top-[38%] w-[30%] h-[50%] rounded-xl border-2 border-amber-400/90 bg-amber-400/10 p-2 text-left space-y-1 backdrop-blur-xs pointer-events-auto">
                            <div className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase text-[9px]">
                              Barista / Prep Area · Active
                            </div>
                            <div className="text-[9px] text-amber-200">Chef Preparing Order #ORD-9128</div>
                          </div>
                        </>
                      )}

                      {activeCam === 'cam_03' && (
                        <>
                          {/* VIP Lounge Table Detections */}
                          <div className="absolute left-[12%] top-[14%] w-[76%] h-[74%] rounded-2xl border-2 border-sky-400 bg-sky-500/15 p-3 text-left space-y-1.5 backdrop-blur-xs pointer-events-auto shadow-xl shadow-sky-500/30">
                            <div className="flex items-center justify-between text-xs font-bold">
                              <span className="bg-sky-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                                VIP Table 06 · Dining &amp; Drinks
                              </span>
                              <span className="text-sky-300 font-mono font-bold">4 Guests</span>
                            </div>
                            <div className="text-xs text-sky-200 font-semibold">Status: QR Order Placed · Kitchen Preparing</div>
                            <div className="text-[10px] text-slate-300 font-mono">Server: Pooja Nair · Table Satisfaction: High</div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Bottom Camera Timestamp Watermark */}
                  <div className="absolute bottom-2 left-3 right-3 z-20 flex justify-between items-end text-[10px] font-mono text-white/90 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{camFeeds[activeCam]?.name || 'DINING ROOM CCTV'} · AI VISION STREAM</span>
                    </div>
                    <div>{currentTime} · YOLO-11x INFERENCE ENGINE</div>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Switcher Tabs & Live Controls */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                {[
                  { id: 'cam_01', name: 'Cam 01: Dining Hall (4K)' },
                  { id: 'cam_02', name: 'Cam 02: Counter & Kitchen' },
                  { id: 'cam_03', name: 'Cam 03: VIP Lounge' },
                ].map((cam) => (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setActiveCam(cam.id);
                      setUseWebcam(false);
                      addToast(`Switched view to ${cam.name}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                      activeCam === cam.id && !useWebcam
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md shadow-amber-500/20'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {cam.name}
                  </button>
                ))}

                {/* Toggle AI Computer Vision HUD Overlay */}
                <button
                  onClick={() => {
                    setShowHudOverlay(!showHudOverlay);
                    addToast(showHudOverlay ? 'Raw CCTV Mode (Overlays Hidden)' : 'AI Computer Vision HUD Overlays Enabled');
                  }}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                    showHudOverlay
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-black shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Computer Vision Bounding Boxes"
                >
                  <span className={`w-2 h-2 rounded-full ${showHudOverlay ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showHudOverlay ? 'AI Vision HUD: ON' : 'Raw CCTV (Overlays Off)'}</span>
                </button>
              </div>

              <button
                onClick={handleSimulateArrival}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Simulate Guest Arrival (Table 02)</span>
              </button>
            </div>
          </div>

          {/* Incident Alert Log */}
          <div className="p-4 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-extrabold text-white">
                  Real-Time Computer Vision Detection Log
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Auto-syncing every second
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {incidentLog.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                    inc.type === 'ALARM'
                      ? 'bg-rose-950/30 border-rose-800/40 text-rose-200'
                      : inc.type === 'WARNING'
                      ? 'bg-amber-950/30 border-amber-800/40 text-amber-200'
                      : inc.type === 'SUCCESS'
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {inc.type === 'ALARM' ? (
                      <Bell className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : inc.type === 'SUCCESS' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{inc.table}</span>
                        <span className="text-[10px] font-mono font-normal opacity-70">
                          · {inc.event}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-90">{inc.details}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold shrink-0 opacity-80">
                    {inc.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Table Occupancy & Waiter Attention Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-3xl border border-slate-800 bg-slate-900/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Table Occupancy & Attention Matrix
                </h3>
                <p className="text-xs text-slate-400">
                  Live detection of seated guests and waiter attendance SLA
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-amber-300 font-mono text-xs font-bold border border-slate-700">
                SLA: 2m Limit
              </span>
            </div>

            {/* Table Cards List */}
            <div className="space-y-3">
              {tables.map((tbl) => {
                const isCritical = tbl.risk_level === 'CRITICAL' || tbl.status === 'ATTENTION_REQUIRED';
                const isOccupied = tbl.status === 'OCCUPIED';
                const isVacant = tbl.status === 'VACANT';
                const minutes = Math.floor(tbl.seated_seconds / 60);
                const seconds = tbl.seated_seconds % 60;
                const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

                return (
                  <div
                    key={tbl.table_number}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCritical
                        ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/20'
                        : isOccupied
                        ? 'bg-slate-950 border-slate-800'
                        : 'bg-slate-950/50 border-slate-800/60 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-sm">
                          {tbl.table_number}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({tbl.section})
                        </span>
                      </div>

                      {/* Status Badges */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${
                          isCritical
                            ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                            : isOccupied
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : tbl.status === 'BUSY_DIRTY'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isCritical
                          ? 'ATTENTION NEEDED'
                          : isOccupied
                          ? 'SEATED & SERVED'
                          : tbl.status === 'BUSY_DIRTY'
                          ? 'NEEDS BUSSING'
                          : 'VACANT'}
                      </span>
                    </div>

                    {/* Table Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs py-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Guests Detected:</span>
                        <span className="font-bold text-white flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          {tbl.guests_detected > 0 ? `${tbl.guests_detected} People` : 'None'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Dwell / Wait Time:</span>
                        <span
                          className={`font-mono font-bold ${
                            isCritical ? 'text-rose-400' : 'text-slate-300'
                          }`}
                        >
                          {tbl.seated_seconds > 0 ? formattedTime : '--:--'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Assigned Server:</span>
                        <span className="font-bold text-slate-200">
                          {tbl.waiter_assigned || (
                            <span className="text-rose-400 font-bold">Unassigned</span>
                          )}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block">Risk Status:</span>
                        <span
                          className={`font-bold ${
                            isCritical
                              ? 'text-rose-400'
                              : isOccupied
                              ? 'text-emerald-400'
                              : 'text-slate-500'
                          }`}
                        >
                          {tbl.risk_level === 'CRITICAL'
                            ? 'Critical (Walkout Risk)'
                            : tbl.risk_level === 'MEDIUM'
                            ? 'Medium Attention'
                            : tbl.risk_level === 'LOW'
                            ? 'Safe / Attended'
                            : 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Table Actions (Ring Bell & Assign Server) */}
                    {isCritical ? (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        <button
                          onClick={() => handleTriggerBell(tbl.table_number, 'Attention bell triggered for ' + tbl.table_number)}
                          className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-amber-500/20"
                        >
                          <Bell className="w-3.5 h-3.5 fill-slate-950" />
                          <span>Ring Bell (बजर)</span>
                        </button>
                        <button
                          onClick={() => handleAssignWaiter(tbl.table_number, 'Sunil Verma')}
                          className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md shadow-emerald-500/20"
                        >
                          <UserCheck className="w-3.5 h-3.5 text-slate-950" />
                          <span>Dispatch Sunil</span>
                        </button>
                      </div>
                    ) : tbl.table_number === 'Table 03' && tbl.waiter_attended ? (
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Server Sunil Verma Attending Table
                        </span>
                        <button
                          onClick={() => {
                            setTables((prev) =>
                              prev.map((t) =>
                                t.table_number === 'Table 03'
                                  ? {
                                      ...t,
                                      status: 'ATTENTION_REQUIRED',
                                      waiter_attended: false,
                                      waiter_assigned: null,
                                      risk_level: 'CRITICAL',
                                      seated_seconds: 245,
                                    }
                                  : t
                              )
                            );
                            addToast('Simulating: Table 03 guests unattended again');
                          }}
                          className="text-[10px] text-slate-400 hover:text-amber-300 underline cursor-pointer"
                        >
                          Reset to Unattended
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SLA Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-base">
                  CCTV Vision & Bell Alert Rules
                </h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Unattended Table Alert Threshold (SLA Delay):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="60"
                    max="300"
                    step="30"
                    value={slaThreshold}
                    onChange={(e) => setSlaThreshold(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {Math.floor(slaThreshold / 60)} min {slaThreshold % 60 ? '30s' : ''}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">
                  If guests remain seated longer than this limit with no waiter attendance, the alert bell automatically rings.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Auto-Ring Bell on Breach</div>
                  <div className="text-[10px] text-slate-400">
                    Play audio chime & voice callout automatically
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isAutoBellActive}
                  onChange={(e) => setIsAutoBellActive(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white">Camera RTSP / WebRTC Endpoint</div>
                <input
                  type="text"
                  value={customRtspUrl}
                  onChange={(e) => setCustomRtspUrl(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => {
                setShowConfigModal(false);
                addToast('CCTV Risk SLA rules updated successfully!');
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderRisk;
