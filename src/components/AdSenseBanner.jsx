// src/components/AdSenseBanner.jsx - Google AdSense Monetization Banner & Passive Revenue Unit
import React, { useEffect, useState } from 'react';
import { Sparkles, DollarSign, ExternalLink, ShieldCheck } from 'lucide-react';

export function AdSenseBanner({
  slot = 'auto',
  format = 'auto',
  responsive = true,
  className = '',
  showDemoNotice = true,
}) {
  const [pubId, setPubId] = useState('');
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    const savedPubId =
      localStorage.getItem('dineqr_adsense_pub_id') ||
      import.meta.env.VITE_ADSENSE_CLIENT_ID ||
      '';
    const savedEnabled = localStorage.getItem('dineqr_adsense_enabled') !== 'false';
    setPubId(savedPubId);
    setAdsEnabled(savedEnabled);

    if (savedEnabled && savedPubId && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Suppress AdSense duplicate push errors
      }
    }
  }, []);

  if (!adsEnabled) return null;

  return (
    <div className={`w-full max-w-4xl mx-auto my-4 px-2 sm:px-0 ${className}`}>
      {pubId ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-2 overflow-hidden text-center">
          <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold block mb-1">
            Sponsored Advertisement · Google AdSense
          </span>
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={pubId}
            data-ad-slot={slot}
            data-ad-format={format}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        </div>
      ) : showDemoNotice ? (
        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-slate-900 to-amber-500/5 p-3 sm:p-4 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xs">Google AdSense Monetization Active</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Zero Ad Spend
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Earn daily passive ad revenue from your QR menus, token screens & digital invoices. Add your publisher ID in Settings.
              </p>
            </div>
          </div>
          <a
            href="https://www.google.com/adsense/start/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition border border-slate-700"
          >
            <span>Setup AdSense</span>
            <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
        </div>
      ) : null}
    </div>
  );
}

export default AdSenseBanner;
