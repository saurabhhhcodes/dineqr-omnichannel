// src/components/TablePlacard.jsx - High-resolution printable table tent & QR stand card
import React from 'react';
import { Download, Printer, Wifi, Utensils, QrCode, X, ExternalLink } from 'lucide-react';

export function TablePlacard({ table, qrDataUrl, targetUrl, onClose }) {
  if (!table || !qrDataUrl) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `table-qr-${table.table_number.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls bar (hidden in print) */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-600" />
            <span className="font-bold text-sm text-slate-800">Table QR Placard</span>
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
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
            L'Osteria Bistro
          </h2>
          <p className="text-xs text-amber-700 font-semibold mt-0.5 uppercase tracking-wider">
            Artisanal Kitchen & Oven
          </p>

          {/* Table Badge */}
          <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-900 text-amber-300 font-black text-sm tracking-wide shadow-xs inline-block">
            {table.table_number || table.name}
            {table.section && <span className="text-white font-normal text-xs ml-1.5">· {table.section}</span>}
          </div>

          {/* QR Code Container with Frame */}
          <div className="mt-6 p-4 rounded-3xl border-4 border-slate-950/10 bg-white shadow-xl relative inline-block">
            <img
              src={qrDataUrl}
              alt={`QR for ${table.table_number}`}
              className="w-56 h-56 object-contain"
            />
            <div className="absolute inset-0 border border-slate-200/50 rounded-2xl pointer-events-none"></div>
          </div>

          {/* Instructions */}
          <div className="mt-5 space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm">
              Scan to View Menu & Order
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Open your smartphone camera or Google Lens and point it at the code. No app download needed!
            </p>
          </div>

          {/* Wi-Fi & Perks Badge */}
          <div className="mt-5 w-full p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-around text-xs text-amber-950">
            <div className="flex items-center gap-1.5 font-medium">
              <Wifi className="w-4 h-4 text-amber-700" />
              <span>Wi-Fi: <b>Osteria-Guest</b></span>
            </div>
            <div className="h-3 w-px bg-amber-300"></div>
            <div>
              <span>Pass: <b>gourmet2026</b></span>
            </div>
          </div>

          {/* Direct Link (no-print) */}
          <div className="mt-4 no-print">
            <a
              href={targetUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1 hover:underline"
            >
              <span>Test Menu Link in New Tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
