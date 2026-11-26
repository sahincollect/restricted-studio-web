'use client';

import React, { useEffect, useState } from 'react';
import { CLAW_SLASH_PATHS, CLAW_VIEWBOX } from '@/lib/claw-paths';

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

    if (!forcePreview && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
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
    }, 680);

    const doneTimer = window.setTimeout(() => {
      setPhase('idle');
    }, 1280);

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
      <div className="rs-claw-stage">
        <div className="rs-claw-aura" />

        <div className="rs-claw-stack">
          {CLAW_SLASH_PATHS.map((d, idx) => (
            <svg
              key={`claw-layer-${idx}`}
              className={`rs-claw-svg rs-claw-layer rs-claw-delay-${idx}`}
              viewBox={CLAW_VIEWBOX}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id={`rsClawGrad${idx}`} x1="88%" y1="6%" x2="14%" y2="94%">
                  <stop offset="0%" stopColor="#FED7AA" />
                  <stop offset="32%" stopColor="#FB923C" />
                  <stop offset="68%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#C2410C" />
                </linearGradient>
              </defs>

              <path
                d={d}
                fill="none"
                stroke="rgba(249, 115, 22, 0.24)"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <path
                d={d}
                fill={`url(#rsClawGrad${idx})`}
                fillRule="evenodd"
                stroke="rgba(255, 180, 88, 0.5)"
                strokeWidth="0.65"
                strokeLinejoin="round"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  );
}
