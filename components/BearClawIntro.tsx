'use client';

import React, { useEffect, useState } from 'react';

const INTRO_STORAGE_KEY = 'rs_bear_claw_intro_ts';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

type IntroPhase = 'idle' | 'slash' | 'dive';

export default function BearClawIntro() {
  const [phase, setPhase] = useState<IntroPhase>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let forcePreview = false;
    try {
      const params = new URLSearchParams(window.location.search);
      forcePreview = params.get('intro') === '1';
    } catch {
      forcePreview = false;
    }

    let shouldPlay = forcePreview;
    if (!forcePreview) {
      try {
        const rawTs = window.localStorage.getItem(INTRO_STORAGE_KEY);
        const lastTs = rawTs ? Number(rawTs) : 0;
        const now = Date.now();
        if (!Number.isFinite(lastTs) || lastTs <= 0 || now - lastTs >= SIX_HOURS_MS) {
          shouldPlay = true;
        }
      } catch {
        shouldPlay = true;
      }
    }

    if (!shouldPlay) return;

    try {
      window.localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now()));
    } catch {
      // Safe fallback under restricted browser storage
    }

    setPhase('slash');

    const diveTimer = window.setTimeout(() => {
      setPhase('dive');
    }, 1150);

    const doneTimer = window.setTimeout(() => {
      setPhase('idle');
    }, 1920);

    return () => {
      window.clearTimeout(diveTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  if (phase === 'idle') return null;

  return (
    <div
      className={`rs-claw-intro ${phase === 'dive' ? 'is-diving' : 'is-slashing'}`}
      role="presentation"
      aria-hidden="true"
      onClick={() => setPhase('idle')}
    >
      <div className="rs-claw-backdrop-glow" />

      <div className="rs-claw-stage">
        <svg
          className="rs-claw-svg"
          viewBox="0 0 420 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rsClawEmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="28%" stopColor="#ff8b66" />
              <stop offset="68%" stopColor="#ef5b38" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="rsPawFill" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(239, 91, 56, 0.34)" />
              <stop offset="100%" stopColor="rgba(165, 24, 16, 0.14)" />
            </linearGradient>
            <filter id="rsClawGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Subtle diagonal ember prism ribs */}
          <g opacity="0.2">
            <rect
              x="166"
              y="32"
              width="48"
              height="350"
              rx="14"
              transform="rotate(28 210 210)"
              fill="#ef5b38"
            />
            <rect
              x="224"
              y="48"
              width="38"
              height="320"
              rx="12"
              transform="rotate(28 210 210)"
              fill="#c83918"
            />
          </g>

          {/* Anatomical Bear Paw (Toes + Metacarpal Pad) */}
          <g className="rs-claw-paw-pad" filter="url(#rsClawGlow)">
            {/* Main paw pad */}
            <path
              d="M142 276C142 238 171 212 210 212C249 212 278 238 278 276C278 304 256 322 236 318C222 315 216 310 210 310C204 310 198 315 184 318C164 322 142 304 142 276Z"
              fill="url(#rsPawFill)"
              stroke="url(#rsClawEmber)"
              strokeWidth="2.4"
            />
            {/* 4 Bear Paw Toe Pads */}
            <ellipse cx="136" cy="186" rx="17" ry="23" transform="rotate(-18 136 186)" fill="url(#rsPawFill)" stroke="url(#rsClawEmber)" strokeWidth="2.2" />
            <ellipse cx="183" cy="158" rx="18" ry="25" transform="rotate(-6 183 158)" fill="url(#rsPawFill)" stroke="url(#rsClawEmber)" strokeWidth="2.2" />
            <ellipse cx="237" cy="158" rx="18" ry="25" transform="rotate(6 237 158)" fill="url(#rsPawFill)" stroke="url(#rsClawEmber)" strokeWidth="2.2" />
            <ellipse cx="284" cy="186" rx="17" ry="23" transform="rotate(18 284 186)" fill="url(#rsPawFill)" stroke="url(#rsClawEmber)" strokeWidth="2.2" />

            {/* 4 Sharp Bear Claws arching above toes */}
            <path d="M126 154L114 118C124 128 132 140 137 153Z" fill="#ffffff" />
            <path d="M178 124L172 82C182 95 188 109 191 124Z" fill="#ffffff" />
            <path d="M234 124L246 82C246 97 244 111 240 125Z" fill="#ffffff" />
            <path d="M286 154L304 118C299 132 293 144 285 156Z" fill="#ffffff" />
          </g>

          {/* 4 Diagonal Bear Claw Slash Streaks */}
          <path
            className="rs-claw-stroke rs-claw-s1"
            pathLength="100"
            filter="url(#rsClawGlow)"
            d="M126 108C116 176 104 248 92 332"
            stroke="url(#rsClawEmber)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            className="rs-claw-stroke rs-claw-s2"
            pathLength="100"
            filter="url(#rsClawGlow)"
            d="M188 74C174 156 158 248 144 358"
            stroke="url(#rsClawEmber)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            className="rs-claw-stroke rs-claw-s3"
            pathLength="100"
            filter="url(#rsClawGlow)"
            d="M254 78C236 160 218 250 198 358"
            stroke="url(#rsClawEmber)"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            className="rs-claw-stroke rs-claw-s4"
            pathLength="100"
            filter="url(#rsClawGlow)"
            d="M312 114C296 184 280 252 262 330"
            stroke="url(#rsClawEmber)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>

        <div className="rs-claw-brand-lockup">
          <img
            src="/assets/newlogo.png"
            alt="Restricted Studio"
            width={44}
            height={44}
            className="rs-claw-logo-badge"
          />
          <span className="rs-claw-brand-title">RESTRICTED STUDIO</span>
        </div>
      </div>

      <button
        type="button"
        className="rs-claw-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          setPhase('idle');
        }}
      >
        Geç →
      </button>
    </div>
  );
}
