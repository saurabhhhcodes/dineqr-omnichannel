// src/components/DineQRLogo.jsx - QR-Frame Logo with Integrated Dining Cutlery
import React from 'react';

export function DineQRLogo({ size = 'md', className = '' }) {
  const dims = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-12 h-12' : size === 'xl' ? 'w-16 h-16' : 'w-9 h-9';

  return (
    <div className={`relative ${dims} shrink-0 ${className}`} title="DineQR - Omnichannel QR POS">
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="amberGlowLogo" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        
        {/* QR Outer Square Frame with Rounded Corners & Amber Stroke */}
        <rect
          x="2.5"
          y="2.5"
          width="27"
          height="27"
          rx="6"
          fill="#090d16"
          stroke="url(#amberGlowLogo)"
          strokeWidth="2.5"
        />

        {/* 3 QR Finder Corner Markers */}
        <rect x="5.5" y="5.5" width="5.5" height="5.5" rx="1.5" fill="#f59e0b" />
        <rect x="21" y="5.5" width="5.5" height="5.5" rx="1.5" fill="#f59e0b" />
        <rect x="5.5" y="21" width="5.5" height="5.5" rx="1.5" fill="#f59e0b" />

        {/* QR Data Micro-Bits */}
        <rect x="22.5" y="14" width="2.5" height="2.5" rx="0.6" fill="#fbbf24" />
        <rect x="14" y="22.5" width="2.5" height="2.5" rx="0.6" fill="#fbbf24" />

        {/* Center Circular Dining Badge */}
        <circle cx="16" cy="16" r="5.8" fill="url(#amberGlowLogo)" />

        {/* Fork Prongs & Handle */}
        <path
          d="M14 12.8v2m.8-2v2m.8-2v2m-1.6 2a.8.8 0 0 0 1.6 0v2.4"
          stroke="#090d16"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Knife Blade & Handle */}
        <path
          d="M18 12.8c.7 0 1.1.8 1.1 2s-.4 1.6-1.1 2v2.4"
          stroke="#090d16"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export default DineQRLogo;
