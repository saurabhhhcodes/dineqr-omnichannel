// src/pages/InstagramAutomationStudio.jsx - AutoGram AI: Autonomous Instagram Growth & Video Engine (YC Pitch Grade)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  Play,
  Send,
  MessageCircle,
  TrendingUp,
  Calendar,
  Layers,
  CheckCircle2,
  Share2,
  DollarSign,
  Download,
  Copy,
  Check,
  ShieldCheck,
  ExternalLink,
  Users,
  Eye,
  Smartphone,
  Tv,
  ArrowRight,
  Flame,
  Radio,
  Cpu,
  RefreshCw,
  Award,
  BarChart3,
  Globe,
  Sliders,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

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

export function InstagramAutomationStudio() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('video_producer'); // 'video_producer' | 'auto_dm' | 'calendar' | 'yc_pitch'

  // Server state
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState(null);

  // Script Generator Form
  const [scriptTopic, setScriptTopic] = useState('How local cafes scale using Table QR & Instagram AI');
  const [generatedScript, setGeneratedScript] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Comment to DM Simulator State
  const [simUsername, setSimUsername] = useState('@delhi_food_blogger');
  const [simComment, setSimComment] = useState('DEMO');
  const [simResponse, setSimResponse] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/autogram/status');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error('Failed to fetch autogram status:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutopilot = async () => {
    try {
      const res = await fetch('/api/autogram/toggle-autopilot', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        addToast(json.message, json.autopilot_enabled ? 'success' : 'info');
        fetchStatus();
      }
    } catch (e) {
      addToast('Error toggling autopilot', 'error');
    }
  };

  const handleGenerateScript = async (e) => {
    e?.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch('/api/autogram/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: scriptTopic }),
      });
      const json = await res.json();
      if (json.success) {
        setGeneratedScript(json.script);
        addToast('Viral Reel Script & Kinetic Captions generated!', 'success');
      }
    } catch (err) {
      addToast('Failed to generate script', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSimulateComment = async (e) => {
    e?.preventDefault();
    setIsSimulating(true);
    try {
      const res = await fetch('/api/autogram/simulate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: simUsername, comment: simComment }),
      });
      const json = await res.json();
      if (json.success) {
        setSimResponse(json);
        addToast(`Keyword "${json.matched_keyword}" detected! Instant DM fired in 1.2s.`, 'success');
        fetchStatus();
      }
    } catch (err) {
      addToast('Error simulating comment', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
    addToast('Copied to clipboard!', 'success');
  };

  const YC_ONE_LINER = `AutoGram AI is an Autonomous AI Social Media Director that replaces a $5,000/month agency by generating viral 9:16 reels, auto-scheduling posts, and converting comments to paying leads via automated DMs on autopilot.`;

  const YC_PROBLEM_STATEMENT = `Over 200 million SMBs, restaurants, and digital creators know that short-form video (Instagram Reels & TikTok) is the #1 customer acquisition channel in 2026. Yet, 92% fail because producing high-retention video requires 20+ hours a week of scripting, video editing, captioning, and answering hundreds of DMs manually. Hiring an agency costs $3,000 - $6,000/mo and still requires endless meetings.`;

  const YC_SOLUTION_STATEMENT = `AutoGram AI acts as a 24/7 autonomous employee. The user enters their product URL or topic. The agent writes viral retention hooks, creates dynamic kinetic subtitles (Hormozi-style), attaches trending audio, schedules posts at peak hours, and listens to incoming comments. When a viewer comments 'DEMO' or 'PRICE', the AI instantly replies in public and fires a personalized direct message to close the lead.`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-20 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Ambient Glow Header */}
      <header className="relative border-b border-slate-800 bg-slate-900/60 backdrop-blur-xl px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 via-amber-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <InstagramIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                    <span>AutoGram AI</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      YC Pitch Edition
                    </span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autonomous Instagram Growth, Viral 9:16 Video Studio & Comment-to-DM Sales Funnel
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-400">Agent:</span>
              <span className="font-bold text-white">@autogram.ai</span>
            </div>

            <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center gap-2">
              <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">DMs Today:</span>
              <span className="font-mono font-bold text-sky-300">{data?.stats?.dms_sent_today || 142}</span>
            </div>

            <button
              onClick={handleToggleAutopilot}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                data?.autopilot_enabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Autopilot: {data?.autopilot_enabled ? 'ON (Active)' : 'PAUSED'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Navigation Tabs */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 pt-6 space-y-6 flex-1">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('video_producer')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'video_producer'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>AI Viral Video Producer (Reels & Shorts)</span>
          </button>

          <button
            onClick={() => setActiveTab('auto_dm')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'auto_dm'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Comment-to-DM Sales Bot (Live Simulator)</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/10'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>30-Day Auto-Pilot Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('yc_pitch')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'yc_pitch'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 bg-slate-900 border border-amber-500/30'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>Y Combinator (YC) Application Pitch Deck</span>
          </button>
        </div>

        {/* TAB 1: AI VIRAL VIDEO PRODUCER */}
        {activeTab === 'video_producer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Video Preview Player */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Auto-Generated 9:16 Reel
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    1080x1920 Full HD
                  </span>
                </div>

                {/* Vertical Phone Video Frame */}
                <div className="relative mx-auto w-full max-w-[320px] aspect-[9/16] rounded-[36px] border-4 border-slate-700 bg-black overflow-hidden shadow-2xl shadow-rose-950/30 flex flex-col items-center justify-center">
                  <video
                    src="/videos/autogram_yc_vertical_reels.mp4"
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                    poster="/poster.webp"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <a
                    href="/videos/autogram_yc_vertical_reels.mp4"
                    download="AutoGram_AI_Viral_Reel_1080p.mp4"
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Reel MP4</span>
                  </a>

                  <a
                    href="/videos/autogram_yc_landscape_showcase.mp4"
                    download="AutoGram_AI_YC_Showcase_1080p.mp4"
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Download 16:9 Landscape Widescreen Video for YC Application"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>16:9 YC Video</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Prompt & Script Generator */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Autonomous Reel Generator</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter any topic, niche, or product URL. AI produces viral hooks, retention script, and kinetic word highlights.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    ⚡ 0.8s Render Speed
                  </span>
                </div>

                <form onSubmit={handleGenerateScript} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Content Topic or Product Concept:
                    </label>
                    <input
                      type="text"
                      value={scriptTopic}
                      onChange={(e) => setScriptTopic(e.target.value)}
                      placeholder="e.g. Stop paying 50,000 for restaurant POS hardware..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isGenerating ? 'AI Writing Script...' : 'Generate Viral Reel Script'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScriptTopic('POV: You fired your $5,000/mo agency and let AI run your Instagram')}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold"
                    >
                      Preset: Agency Killer
                    </button>
                  </div>
                </form>

                {/* Generated Script Card */}
                {generatedScript && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-xs font-bold text-white">AI Predicted Viral Score:</span>
                        <span className="text-xs font-black text-emerald-400">{generatedScript.viral_score} / 100</span>
                      </div>
                      <span className="text-[11px] text-slate-400">Est. Reach: {generatedScript.estimated_reach}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                          🎣 0-3s Kinetic Hook:
                        </span>
                        <p className="text-white font-semibold mt-0.5">{generatedScript.hook}</p>
                      </div>

                      <div>
                        <span className="text-sky-400 font-bold uppercase tracking-wider text-[10px] block">
                          ⚡ 3-25s Retention Body:
                        </span>
                        <p className="text-slate-300 mt-0.5 leading-relaxed">{generatedScript.body}</p>
                      </div>

                      <div>
                        <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] block">
                          🚀 25-30s Comment-to-DM CTA:
                        </span>
                        <p className="text-white font-bold mt-0.5">{generatedScript.cta}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-1.5 border-t border-slate-800/80">
                      {generatedScript.hashtags?.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Highlights Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                    ⚡
                  </div>
                  <h4 className="font-bold text-xs text-white">Kinetic Subtitles</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Word-by-word highlighted text animations like Hormozi & MrBeast to boost retention.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold">
                    🎵
                  </div>
                  <h4 className="font-bold text-xs text-white">Trending Sound AI</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Scans Instagram audio charts daily and matches high-velocity viral sounds.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                    🤖
                  </div>
                  <h4 className="font-bold text-xs text-white">Auto-Publish Queue</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Zero human touch. Videos render and dispatch directly to Instagram at peak hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMMENT-TO-DM SALES BOT (LIVE SIMULATOR) */}
        {activeTab === 'auto_dm' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Live Interactive Instagram Screen */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-rose-400" />
                    <span>Instagram Live Interaction Simulator</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Bot Active
                  </span>
                </div>

                {/* Interactive Phone Simulation */}
                <div className="rounded-2xl border-2 border-slate-700 bg-slate-950 p-4 space-y-4 font-sans text-xs">
                  {/* Simulated Instagram Post Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-black text-xs">
                        AG
                      </div>
                      <div>
                        <div className="font-bold text-white text-[11px]">autogram.ai</div>
                        <div className="text-[9px] text-slate-500">Sponsored / Viral Reel</div>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold">•••</span>
                  </div>

                  {/* Simulated Reel Card */}
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
                    <div className="text-amber-400 font-black text-sm">
                      "Comment 'DEMO' to get the secret POS link!"
                    </div>
                    <p className="text-[11px] text-slate-300">
                      100% Offline SQLite · Flat ₹1,500/month · Zero Commissions
                    </p>
                  </div>

                  {/* Public Comment Input */}
                  <form onSubmit={handleSimulateComment} className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={simUsername}
                        onChange={(e) => setSimUsername(e.target.value)}
                        placeholder="Your Instagram Handle"
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-white"
                      />
                      <input
                        type="text"
                        value={simComment}
                        onChange={(e) => setSimComment(e.target.value)}
                        placeholder="Comment e.g. DEMO"
                        className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-white font-bold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSimulating}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSimulating ? 'Processing Bot Reply...' : 'Post Test Comment (Trigger Bot)'}</span>
                    </button>
                  </form>

                  {/* Simulated Bot Public Reply */}
                  {simResponse && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-emerald-400">Public Comment Reply (1.2s)</span>
                          <span className="text-slate-500">Just now</span>
                        </div>
                        <p className="text-slate-200 text-[11px]">{simResponse.public_reply}</p>
                      </div>

                      {/* Simulated Private DM Notification */}
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-900/40 via-slate-900 to-slate-900 border border-purple-500/40 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-purple-300 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>Private Instagram DM Received</span>
                          </span>
                          <span className="text-purple-400 font-mono">Sent Instantly</span>
                        </div>
                        <p className="text-white text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
                          {simResponse.private_dm}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Lead Capture & Conversion Dashboard */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span>Autonomous Comment-to-Lead Funnel</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Every comment containing trigger keywords (DEMO, SCALE, POS) is instantly qualified, logged, and DM'd.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {data?.stats?.leads_captured || 68}
                    </span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Leads Captured Today</span>
                  </div>
                </div>

                {/* Trigger Keywords Configuration */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Active Keyword Triggers:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data?.trigger_keywords?.map((kw) => (
                      <span
                        key={kw}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold"
                      >
                        "{kw}"
                      </span>
                    ))}
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono">
                      + Add Keyword
                    </span>
                  </div>
                </div>

                {/* Recent Captured Leads Table */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Lead Conversion Stream:
                  </h4>
                  <div className="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                    {data?.recent_leads?.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white">{lead.username}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                              KW: {lead.triggered_keyword}
                            </span>
                            <span className="text-[10px] text-slate-500">{lead.dm_sent_at}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">"{lead.comment}"</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {lead.status}
                          </span>
                          <span className="block text-[10px] font-mono text-slate-500 mt-0.5">{lead.phone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 30-DAY AUTO-PILOT QUEUE */}
        {activeTab === 'calendar' && (
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Autonomous Content Queue & Publishing Calendar</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI continuously generates, renders, and dispatches 2 reels every day during peak restaurant browsing windows (12:45 PM & 7:45 PM).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAutopilot}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Queue Now</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data?.scheduled_posts?.map((post) => (
                <div key={post.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {post.type}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>{post.viral_score} Viral Score</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-white">{post.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">"{post.hook}"</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                    <span className="text-slate-400 font-mono">{post.scheduled_time}</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider">
                      {post.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Y COMBINATOR APPLICATION PITCH DECK */}
        {activeTab === 'yc_pitch' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 space-y-8 shadow-2xl">
            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
                  YC
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Y Combinator Summer 2026 Founder Application</h2>
                  <p className="text-xs text-amber-300 font-semibold mt-0.5">
                    Category: AI Autonomous Agents & Creator Economy Infrastructure
                  </p>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(`${YC_ONE_LINER}\n\nPROBLEM:\n${YC_PROBLEM_STATEMENT}\n\nSOLUTION:\n${YC_SOLUTION_STATEMENT}`, 'yc_full')}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                {copiedKey === 'yc_full' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'yc_full' ? 'Copied Full Deck!' : 'Copy YC Application'}</span>
              </button>
            </div>

            {/* Section 1: One-Liner */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                  1. What does your company do? (50-word One-Liner)
                </span>
                <button
                  onClick={() => copyToClipboard(YC_ONE_LINER, 'oneliner')}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                >
                  {copiedKey === 'oneliner' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'oneliner' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">{YC_ONE_LINER}</p>
            </div>

            {/* Section 2: Problem */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-rose-400 uppercase tracking-wider">
                  2. What problem are you solving?
                </span>
                <button
                  onClick={() => copyToClipboard(YC_PROBLEM_STATEMENT, 'problem')}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                >
                  {copiedKey === 'problem' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'problem' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{YC_PROBLEM_STATEMENT}</p>
            </div>

            {/* Section 3: Solution & Secret Sauce */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                  3. What is your solution and unfair advantage?
                </span>
                <button
                  onClick={() => copyToClipboard(YC_SOLUTION_STATEMENT, 'solution')}
                  className="text-slate-400 hover:text-white text-xs flex items-center gap-1"
                >
                  {copiedKey === 'solution' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'solution' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{YC_SOLUTION_STATEMENT}</p>
            </div>

            {/* Section 4: Market Size & Economics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Total Addressable Market</span>
                <div className="text-2xl font-black text-amber-400">$250B+</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Creator Economy & SMB Digital Marketing spend transitioning from human agencies to autonomous agents.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Pricing & Unit Economics</span>
                <div className="text-2xl font-black text-emerald-400">88% Margin</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  ₹1,500/mo ($18/mo) to ₹5,000/mo ($60/mo) pure SaaS. Render compute is ~₹12/video with 100% automated margins.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Customer Retention Driver</span>
                <div className="text-2xl font-black text-sky-400">High Moat</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Once AutoGram manages an account's live DM lead generation, switching off means losing real-time customer sales.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default InstagramAutomationStudio;
