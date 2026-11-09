// src/components/QRFlowLogo.jsx - Dynamic Universal QR Flow Logo (Multi-Activity & Universal Workflows)
import React from 'react';

export function QRFlowLogo({ size = 'md', className = '' }) {
  const dims = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : size === 'xl' ? 'w-16 h-16' : 'w-9 h-9';

  return (
    <div className={`relative ${dims} shrink-0 ${className}`} title="QR Flow - Universal Multi-Activity QR Workflow & POS Platform">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="qrFlowGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="qrFlowWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        
        {/* QR Outer Frame with Smooth Gradient Accent */}
        <rect
          x="2.5"
          y="2.5"
          width="27"
          height="27"
          rx="6.5"
          fill="#090d16"
          stroke="url(#qrFlowGlow)"
          strokeWidth="2.5"
        />

        {/* 3 Corner Markers for QR Code Structure */}
        <rect x="5.5" y="5.5" width="5.5" height="5.5" rx="1.5" fill="#f59e0b" />
        <rect x="21" y="5.5" width="5.5" height="5.5" rx="1.5" fill="#10b981" />
        <rect x="5.5" y="21" width="5.5" height="5.5" rx="1.5" fill="#06b6d4" />

        {/* Dynamic Activity Flow Indicator (Center S-Wave Flow Stream) */}
        <path
          d="M13 19.5 C13 16, 19 16, 19 12.5 C19 10.5, 17.5 9.5, 15.5 10.2"
          stroke="url(#qrFlowWave)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="13" cy="20" r="1.5" fill="#f59e0b" />
        <circle cx="19" cy="12" r="1.5" fill="#10b981" />

        {/* Micro Flow Dots */}
        <circle cx="23.5" cy="16" r="1.2" fill="#34d399" />
        <circle cx="16" cy="23.5" r="1.2" fill="#38bdf8" />
      </svg>
    </div>
  );
}

// Backward-compatible alias
export const DineQRLogo = QRFlowLogo;
export default QRFlowLogo;
