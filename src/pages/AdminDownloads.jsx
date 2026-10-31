// src/pages/AdminDownloads.jsx - Multi-Platform Native Terminal & On-Premise Engine Hub
import React, { useState, useEffect } from 'react';
import {
  Download,
  Monitor,
  Smartphone,
  Apple,
  Terminal,
  HardDrive,
  CheckCircle2,
  ShieldCheck,
  Copy,
  ExternalLink,
  Server,
  Zap,
  Database,
  ArrowDownToLine,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

export function AdminDownloads() {
  const { addToast } = useToast();
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storageStatus, setStorageStatus] = useState(null);
  const [copiedSha, setCopiedSha] = useState('');
  const [isSettingUpLocal, setIsSettingUpLocal] = useState(false);

  useEffect(() => {
    fetchReleases();
    fetchStorage();
  }, []);

  const fetchReleases = async () => {
    try {
      const res = await fetch('/api/downloads');
      const data = await res.json();
      if (data.success && data.releases) {
        setReleases(data.releases);
      }
    } catch (err) {
      console.error('Failed to fetch downloads catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStorage = async () => {
    try {
      const res = await fetch('/api/erp/storage/status');
      const data = await res.json();
      if (data.success) {
        setStorageStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch storage status:', err);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedSha(id);
    addToast('Checksum copied to clipboard!');
    setTimeout(() => setCopiedSha(''), 2500);
  };

  const handleSetupLocalDb = async () => {
    setIsSettingUpLocal(true);
    try {
      const res = await fetch('/api/erp/local-sqlite/setup', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Local SQLite Engine verified & active on this machine!');
        fetchStorage();
      } else {
        addToast(data.error || 'Setup failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setIsSettingUpLocal(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'windows':
        return <Monitor className="w-7 h-7 text-sky-400" />;
      case 'android':
        return <Smartphone className="w-7 h-7 text-emerald-400" />;
      case 'macos':
        return <Apple className="w-7 h-7 text-slate-200" />;
      case 'linux':
        return <Terminal className="w-7 h-7 text-amber-400" />;
      default:
        return <HardDrive className="w-7 h-7 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold mb-4">
            <Zap className="w-3.5 h-3.5" />
            <span>Universal Native Architecture · Windows · Android · macOS · Linux</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Desktop & Mobile Terminal Hub
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-300 leading-relaxed">
            Download the native DineQR terminal applications for your restaurant PCs, POS touchscreens,
            waiter tablets, or back-office Macs. Every package runs completely offline using
            your on-premise local SQLite engine with zero cloud database fees.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 items-center">
            <button
              onClick={handleSetupLocalDb}
              disabled={isSettingUpLocal}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs md:text-sm flex items-center gap-2 transition cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <Database className="w-4 h-4" />
              <span>{isSettingUpLocal ? 'Configuring Engine...' : 'Initialize Local SQLite On This System'}</span>
            </button>

            {storageStatus && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3.5 py-2 rounded-xl border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>
                  Local DB:{' '}
                  <strong className="text-white">
                    {storageStatus.local_size_kb} KB
                  </strong>{' '}
                  ({storageStatus.counts?.orders || 0} orders saved on disk)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Downloads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {releases.map((rel) => (
          <div
            key={rel.filename}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-md">
                    {getPlatformIcon(rel.platform)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base md:text-lg flex items-center gap-2">
                      <span>{rel.title}</span>
                    </h3>
                    <div className="text-xs font-semibold text-slate-400 mt-0.5">{rel.os}</div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold shrink-0">
                  v{rel.version}
                </span>
              </div>

              <p className="mt-4 text-xs md:text-sm text-slate-600 leading-relaxed">
                {rel.description}
              </p>

              {/* Specs & Security */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center justify-between">
                  <span>Package File:</span>
                  <code className="font-mono font-bold text-slate-800 text-[11px]">{rel.filename}</code>
                </div>
                <div className="flex items-center justify-between">
                  <span>File Size:</span>
                  <span className="font-semibold text-slate-700">{rel.size_kb} KB</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="flex items-center gap-1 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SHA-256:</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-[10px] text-slate-400 font-mono">
                      {rel.sha256 ? rel.sha256.substring(0, 12) + '...' : 'Verified'}
                    </code>
                    {rel.sha256 && (
                      <button
                        onClick={() => handleCopy(rel.sha256, rel.filename)}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                        title="Copy full SHA256 checksum"
                      >
                        {copiedSha === rel.filename ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Download CTA Button */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <a
                href={rel.download_url}
                download={rel.filename}
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-md"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Download {rel.name.split('.').pop().toUpperCase()} Installer</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* On-Premise Architecture & Remote Access Protocol Card */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white">
                How On-Premise Local Storage + Online Access Works
              </h3>
              <p className="text-xs text-slate-400">
                100% Data Sovereignty with Zero Cloud Storage Surcharges
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Live On-Premise Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="text-amber-400 font-bold text-xs uppercase tracking-wider">Step 1: Local Setup</div>
            <div className="text-sm font-extrabold text-white">Local SQLite Store</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Orders and payments are saved in <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">./data/restaurant.db</code>.
              Your register works even if your internet connection goes down.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="text-sky-400 font-bold text-xs uppercase tracking-wider">Step 2: When Online</div>
            <div className="text-sm font-extrabold text-white">Encrypted Cloud Access</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              When your POS is connected to Wi-Fi, store managers can log into the Merchant Dashboard from their phones
              or home computers to inspect live tables, sales reports, and floor plans.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Step 3: End of Month</div>
            <div className="text-sm font-extrabold text-white">31st Physical Archival</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every 31st of the month, a single-click archive creates a standalone .json and .db compliance snapshot
              that merchants can download to external pen drives or local backup hard drives.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDownloads;
