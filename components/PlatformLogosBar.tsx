'use client';

import React from 'react';

interface PlatformLogosBarProps {
  variant?: 'hero' | 'compact';
}

export default function PlatformLogosBar({ variant = 'hero' }: PlatformLogosBarProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`st-platform-dock ${isCompact ? 'is-compact' : ''}`}
      aria-label="Supported Game Platforms: FiveM, RedM, GTA V, GTA VI"
    >
      {/* 1. FiveM */}
      <div className="st-platform-item">
        <div className="st-platform-icon-box is-fivem" aria-hidden="true">
          <svg viewBox="0 0 40 40" className="st-platform-svg">
            <defs>
              <linearGradient id="pfFivemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F99A60" />
                <stop offset="52%" stopColor="#FC73A9" />
                <stop offset="100%" stopColor="#DC47CA" />
              </linearGradient>
            </defs>
            {/* Geometric FiveM shield & stylized dynamic F / ribbon mark */}
            <path
              d="M20 3.5L33.5 10.2V25.8L20 36.5L6.5 25.8V10.2L20 3.5Z"
              fill="rgba(66, 4, 82, 0.65)"
              stroke="url(#pfFivemGrad)"
              strokeWidth="1.6"
            />
            <path
              d="M14.2 12.2H27.4L25.4 16.4H18.1L17.2 19.2H24.3L22.6 23.2H15.9L14.1 28.5H9.8L14.2 12.2Z"
              fill="url(#pfFivemGrad)"
            />
            <path
              d="M23.5 23.8L28.2 18.2L30.2 21.8L25.2 28.5H21.4L23.5 23.8Z"
              fill="#F99A60"
            />
          </svg>
        </div>
        <div className="st-platform-meta">
          <div className="st-platform-name-row">
            <span className="st-platform-name">FiveM</span>
            <span className="st-platform-pill">CFX.RE</span>
          </div>
          {!isCompact && <span className="st-platform-sub">Qbox · QBCore · ESX</span>}
        </div>
      </div>

      {/* 2. RedM */}
      <div className="st-platform-item">
        <div className="st-platform-icon-box is-redm" aria-hidden="true">
          <svg viewBox="0 0 40 40" className="st-platform-svg">
            <defs>
              <linearGradient id="pfRedmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FC73A9" />
                <stop offset="50%" stopColor="#DC47CA" />
                <stop offset="100%" stopColor="#7256CE" />
              </linearGradient>
            </defs>
            {/* Western octagonal badge & RedM star/R emblem */}
            <polygon
              points="20,3.5 31.5,8.2 36.5,20 31.5,31.8 20,36.5 8.5,31.8 3.5,20 8.5,8.2"
              fill="rgba(66, 4, 82, 0.65)"
              stroke="url(#pfRedmGrad)"
              strokeWidth="1.6"
            />
            <path
              d="M20 7.8L22.6 15.1L30.3 15.1L24.1 19.6L26.5 27L20 22.4L13.5 27L15.9 19.6L9.7 15.1L17.4 15.1Z"
              fill="url(#pfRedmGrad)"
            />
            <circle cx="20" cy="18.8" r="3.2" fill="#23032d" stroke="#F99A60" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="st-platform-meta">
          <div className="st-platform-name-row">
            <span className="st-platform-name">RedM</span>
            <span className="st-platform-pill">RDR2</span>
          </div>
          {!isCompact && <span className="st-platform-sub">VORP · RSG · Open Source</span>}
        </div>
      </div>

      {/* 3. GTA V */}
      <div className="st-platform-item">
        <div className="st-platform-icon-box is-gtav" aria-hidden="true">
          <svg viewBox="0 0 40 40" className="st-platform-svg">
            <defs>
              <linearGradient id="pfGtavGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7256CE" />
                <stop offset="52%" stopColor="#DC47CA" />
                <stop offset="100%" stopColor="#F99A60" />
              </linearGradient>
            </defs>
            {/* Iconic bevelled Roman V with horizontal banner */}
            <path
              d="M6.8 8.5H15.4L20 24.4L24.6 8.5H33.2L23.8 33.2H16.2L6.8 8.5Z"
              fill="url(#pfGtavGrad)"
              stroke="#FFE3C8"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <rect
              x="7.5"
              y="18.2"
              width="25"
              height="5.2"
              rx="2.6"
              fill="#24032F"
              stroke="#F99A60"
              strokeWidth="1.1"
            />
            <text
              x="20"
              y="22.1"
              textAnchor="middle"
              fill="#FFF5EA"
              fontSize="4.3"
              fontWeight="800"
              letterSpacing="1.1"
              fontFamily="var(--font-sans), sans-serif"
            >
              FIVE
            </text>
          </svg>
        </div>
        <div className="st-platform-meta">
          <div className="st-platform-name-row">
            <span className="st-platform-name">GTA V</span>
            <span className="st-platform-pill">RAGE</span>
          </div>
          {!isCompact && <span className="st-platform-sub">Script · MLO · Araç Arşivi</span>}
        </div>
      </div>

      {/* 4. GTA VI */}
      <div className="st-platform-item is-featured">
        <div className="st-platform-icon-box is-gtavi" aria-hidden="true">
          <svg viewBox="0 0 44 40" className="st-platform-svg">
            <defs>
              <linearGradient id="pfGtaviGrad" x1="15%" y1="0%" x2="85%" y2="100%">
                <stop offset="0%" stopColor="#7256CE" />
                <stop offset="36%" stopColor="#DC47CA" />
                <stop offset="70%" stopColor="#FC73A9" />
                <stop offset="100%" stopColor="#F99A60" />
              </linearGradient>
            </defs>
            {/* Bold VI Roman Numerals with Vice Sunset gradient & palm frond silhouette cut */}
            <path
              d="M4.5 8.2H12.2L16.8 24.8L21.4 8.2H28.8L20.4 33.2H13.2L4.5 8.2Z"
              fill="url(#pfGtaviGrad)"
              stroke="#FFE6D0"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <rect
              x="31.2"
              y="8.2"
              width="7.4"
              height="25"
              rx="1.2"
              fill="url(#pfGtaviGrad)"
              stroke="#FFE6D0"
              strokeWidth="1.1"
            />
            {/* Subtle miniature palm silhouette etched across lower VI */}
            <path
              d="M16.2 33.2C16.5 28.4 17.8 24.6 19.6 21.8C17.2 21.2 14.5 22.1 12.6 23.8C14.4 21.2 17.1 19.8 19.9 20.3C18.2 18.2 15.6 17.5 13.2 18.2C16.1 16.4 19.1 16.8 21.1 18.9C22.9 16.8 25.8 16.3 28.6 17.8C26.2 17.3 23.8 18.1 22.2 20.2C25 19.7 27.6 21 29.4 23.4C27.4 21.9 24.8 21.2 22.3 21.8C21 24.6 19.8 28.4 19.4 33.2Z"
              fill="#260331"
              opacity="0.88"
            />
          </svg>
        </div>
        <div className="st-platform-meta">
          <div className="st-platform-name-row">
            <span className="st-platform-name">GTA VI</span>
            <span className="st-platform-pill is-vice">VICE READY</span>
          </div>
          {!isCompact && <span className="st-platform-sub">Yeni Nesil Altyapı Vizyonu</span>}
        </div>
      </div>
    </div>
  );
}
