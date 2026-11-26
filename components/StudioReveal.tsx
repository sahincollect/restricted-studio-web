'use client';

import React, { useEffect, useRef } from 'react';
import { HERO_LEFT_PALM_PATH, HERO_RIGHT_PALM_PATH } from '@/components/ViceBackdrop';

/**
 * Ambient mouse-reactive parallax controller for Hero volumetric prism ribs.
 * Respects reduced-motion and coarse pointers.
 */
export function HeroPrismBackdrop() {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    let rafId = 0;
    let tx = 0;
    let ty = 0;

    const flush = () => {
      rafId = 0;
      el.style.setProperty('--prism-x', `${tx.toFixed(1)}px`);
      el.style.setProperty('--prism-y', `${ty.toFixed(1)}px`);
    };

    const onMove = (e: PointerEvent) => {
      const nx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 24;
      const ny = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 16;
      tx = nx;
      ty = ny;
      if (!rafId) rafId = window.requestAnimationFrame(flush);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} className="st-hero-prism-wrap" aria-hidden="true">
      <div className="st-hero-top-glow" />
      <div className="st-vice-sun" />
      <div className="st-prism-cluster">
        <span className="st-prism-bar st-prism-1" />
        <span className="st-prism-bar st-prism-2" />
        <span className="st-prism-bar st-prism-3" />
        <span className="st-prism-bar st-prism-4" />
        <span className="st-prism-bar st-prism-5" />
      </div>
      <div className="st-hero-palms-layer">
        <svg
          className="st-hero-palm is-left"
          viewBox="0 0 320 360"
          preserveAspectRatio="xMinYMax meet"
        >
          <path d={HERO_LEFT_PALM_PATH} fill="#06020e" />
        </svg>
        <svg
          className="st-hero-palm is-right"
          viewBox="0 0 320 360"
          preserveAspectRatio="xMaxYMax meet"
        >
          <path d={HERO_RIGHT_PALM_PATH} fill="#06020e" />
        </svg>
      </div>
    </div>
  );
}

/**
 * Scroll-reveal entrance wrapper using IntersectionObserver.
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
    const node = ref.current;
    if (!node || typeof window === 'undefined') return;

    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      node.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('is-revealed');
            observer.unobserve(node);
          }
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`st-reveal st-delay-${delay} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
