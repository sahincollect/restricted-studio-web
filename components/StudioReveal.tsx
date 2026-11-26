'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Ambient Vetra-style orange horizon arc & top glow.
 * Uses a lightweight, zero-filter SVG arc (no 2040x2040 blurred box-shadow)
 * so Chrome, Safari, Edge, and Firefox composite at locked 60-120fps.
 * Only renders the horizon arc when `showArc` is true (homepage hero).
 */
export function HeroPrismBackdrop({
  interactive = true,
  showArc = false,
  variant = 'vetra',
}: {
  interactive?: boolean;
  showArc?: boolean;
  variant?: 'vetra' | 'gtavi';
}) {
  return (
    <div
      className={`st-hero-prism-wrap ${interactive ? '' : 'is-static'} ${
        variant === 'gtavi' ? 'is-gtavi' : 'is-vetra'
      }`.trim()}
      aria-hidden="true"
    >
      <div className="st-hero-top-glow" />
      {interactive && showArc && variant === 'vetra' && (
        <div className="st-vetra-planet-stage">
          <svg
            className="st-vetra-arc-svg"
            viewBox="0 0 1600 380"
            preserveAspectRatio="none"
            focusable="false"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="vetraHorizonAura" cx="50%" cy="62%" r="54%" fx="50%" fy="58%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.48" />
                <stop offset="30%" stopColor="#EA580C" stopOpacity="0.24" />
                <stop offset="62%" stopColor="#9A3412" stopOpacity="0.09" />
                <stop offset="100%" stopColor="#060608" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="vetraRimCorona" cx="50%" cy="60%" r="42%" fx="50%" fy="58%">
                <stop offset="0%" stopColor="#FDBA74" stopOpacity="0.42" />
                <stop offset="32%" stopColor="#F97316" stopOpacity="0.22" />
                <stop offset="68%" stopColor="#EA580C" stopOpacity="0.06" />
                <stop offset="100%" stopColor="#060608" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="vetraArcRim" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#EA580C" stopOpacity="0.14" />
                <stop offset="20%" stopColor="#F97316" stopOpacity="0.76" />
                <stop offset="50%" stopColor="#FED7AA" stopOpacity="0.96" />
                <stop offset="80%" stopColor="#F97316" stopOpacity="0.76" />
                <stop offset="100%" stopColor="#EA580C" stopOpacity="0.14" />
              </linearGradient>
              <linearGradient id="vetraArcGlowBand" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F97316" stopOpacity="0.26" />
                <stop offset="18%" stopColor="#C2410C" stopOpacity="0.12" />
                <stop offset="48%" stopColor="#080708" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#060608" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Smooth atmospheric orange corona naturally eclipsed by the curved horizon body */}
            <ellipse cx="800" cy="220" rx="790" ry="188" fill="url(#vetraHorizonAura)" />
            <ellipse cx="800" cy="210" rx="540" ry="96" fill="url(#vetraRimCorona)" />

            {/* Dark planet silhouette with warm inner rim */}
            <path
              d="M -120 340 Q 800 50 1720 340 L 1720 385 L -120 385 Z"
              fill="url(#vetraArcGlowBand)"
            />

            {/* Single crisp luminous horizon rim line */}
            <path
              d="M -120 340 Q 800 50 1720 340"
              fill="none"
              stroke="url(#vetraArcRim)"
              strokeWidth="2.2"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

// Single shared IntersectionObserver for all StudioReveal blocks across the page
let sharedObserver: IntersectionObserver | null = null;
const observedElements = new WeakSet<Element>();

function getSharedRevealObserver(): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries, observer) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
            observedElements.delete(entry.target);
          }
        }
      },
      { threshold: 0.01, rootMargin: '0px 0px 48px 0px' }
    );
  }
  return sharedObserver;
}

/**
 * Scroll-reveal entrance wrapper using a single shared IntersectionObserver.
 */
export function StudioReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-revealed');
      return;
    }

    const observer = getSharedRevealObserver();
    if (!observer) {
      el.classList.add('is-revealed');
      return;
    }

    observedElements.add(el);
    observer.observe(el);

    return () => {
      if (observedElements.has(el)) {
        observer.unobserve(el);
        observedElements.delete(el);
      }
    };
  }, []);

  const delayClass = delay === 1 ? 'st-delay-1' : delay === 2 ? 'st-delay-2' : delay >= 3 ? 'st-delay-3' : '';

  return (
    <div ref={ref} className={`st-reveal ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
