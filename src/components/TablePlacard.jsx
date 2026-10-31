// src/components/TablePlacard.jsx - High-resolution printable table tent & QR stand card (Multi-Vertical)
import React from 'react';
import {
  Download,
  Printer,
  Wifi,
  Utensils,
  Stethoscope,
  Dumbbell,
  PartyPopper,
  QrCode,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

export function TablePlacard({ table, restaurant, qrDataUrl, targetUrl, onClose }) {
  if (!table || !qrDataUrl) return null;

  const restName = restaurant?.name || table?.restaurant_name || "L'Osteria Gourmet Bistro";
  const bType = restaurant?.business_type || table?.business_type || 'restaurant';

  const getVerticalConfig = () => {
    switch (bType) {
      case 'clinic':
        return {
          icon: Stethoscope,
          badge: 'Certified Medical OPD & Diagnostics',
          tagline: 'Instant Consultation & Lab Booking',
          themeBg: 'bg-emerald-600',
          textColor: 'text-emerald-700',
          wifiSsid: 'ApexClinic-HighSpeed',
          badgeBg: 'bg-emerald-950 text-emerald-300',
          cardSub: 'Instant Token & Service Request',
        };
      case 'gym':
        return {
          icon: Dumbbell,
          badge: 'Performance Training & Recovery Zone',
          tagline: 'Shake Bar & Membership Passes',
          themeBg: 'bg-cyan-600',
          textColor: 'text-cyan-700',
          wifiSsid: 'IronPulse-Guest',
          badgeBg: 'bg-cyan-950 text-cyan-300',
          cardSub: 'Workout Refuel & Session Booking',
        };
      case 'event':
        return {
          icon: PartyPopper,
          badge: 'Festival & Cultural Expo 2026',
          tagline: 'VIP Passes, Merchandise & Food',
          themeBg: 'bg-fuchsia-600',
          textColor: 'text-fuchsia-700',
          wifiSsid: 'NeonWave-Event5G',
          badgeBg: 'bg-purple-950 text-fuchsia-300',
          cardSub: 'Instant Wristband & Order Terminal',
        };
      default:
        return {
          icon: Utensils,
          badge: 'Artisanal Kitchen & Oven',
          tagline: 'Scan to View Menu & Order',
          themeBg: 'bg-amber-500',
          textColor: 'text-amber-700',
          wifiSsid: 'Osteria-Guest',
          badgeBg: 'bg-slate-900 text-amber-300',
          cardSub: 'Dine-In Tabletop Ordering',
        };
    }
  };

  const vConfig = getVerticalConfig();
  const IconComponent = vConfig.icon;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${(table.table_number || 'station').toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls bar (hidden in print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm text-slate-800">Scan & Placard Suite</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card */}
        <div className="p-8 text-center bg-white print-card flex flex-col items-center">
          {/* Header */}
          <div className={`w-14 h-14 rounded-2xl ${vConfig.themeBg} text-white flex items-center justify-center shadow-lg mb-3`}>
            <IconComponent className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight leading-snug">
            {restName}
          </h2>
          <p className={`text-xs ${vConfig.textColor} font-bold mt-0.5 uppercase tracking-wider`}>
            {vConfig.badge}
          </p>

          {/* Table / Station Badge */}
          <div className={`mt-4 px-4 py-1.5 rounded-full ${vConfig.badgeBg} font-black text-sm tracking-wide shadow-xs inline-flex items-center gap-1.5`}>
            <span>{table.table_number || table.name}</span>
            {table.section && <span className="opacity-75 font-normal text-xs">· {table.section}</span>}
          </div>

          {/* High-Contrast Scannable QR Frame */}
          <div className="mt-5 p-4 rounded-3xl border-4 border-slate-900/10 bg-white shadow-xl relative inline-block">
            <img
              src={qrDataUrl}
              alt={`QR code for ${table.table_number || 'table'}`}
              className="w-56 h-56 object-contain"
            />
            <div className="absolute inset-0 border border-slate-200/50 rounded-2xl pointer-events-none"></div>
          </div>

          {/* Instructions with Phone Icon */}
          <div className="mt-4 space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Point Phone Camera to Scan</span>
            </h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
              Open your smartphone camera, Google Lens, or Paytm/GPay scanner. Instant access with no app download.
            </p>
          </div>

          {/* Wi-Fi & Perks Badge */}
          <div className="mt-4 w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-around text-xs text-slate-800">
            <div className="flex items-center gap-1.5 font-medium">
              <Wifi className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-[11px]">Wi-Fi: <b>{vConfig.wifiSsid}</b></span>
            </div>
            <div className="h-3 w-px bg-slate-300"></div>
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">Direct UPI & Razorpay</span>
            </div>
          </div>

          {/* Direct Link (for testing or desktop preview) */}
          <div className="mt-4 no-print">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-600 hover:text-amber-700 font-bold inline-flex items-center gap-1 hover:underline"
            >
              <span>Preview Menu in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
