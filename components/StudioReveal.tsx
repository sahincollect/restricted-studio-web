'use client';

import React, { useEffect, useRef } from 'react';

/**
 * Ambient Vetra-style vertical ribbed light & orange horizon planet arc controller.
 * Respects reduced-motion and coarse pointers.
 */
export function HeroPrismBackdrop({
  interactive = true,
  variant = 'vetra',
}: {
  interactive?: boolean;
  variant?: 'vetra' | 'gtavi';
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!interactive) return;
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
      const nx = (e.clientX / Math.max(window.innerWidth, 1) - 0.5) * 20;
      const ny = (e.clientY / Math.max(window.innerHeight, 1) - 0.5) * 14;
      tx = nx;
      ty = ny;
      if (!rafId) rafId = window.requestAnimationFrame(flush);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
    };
  }, [interactive]);

  return (
    <div
      ref={wrapRef}
      className={`st-hero-prism-wrap ${interactive ? '' : 'is-static'} ${
        variant === 'gtavi' ? 'is-gtavi' : 'is-vetra'
      }`.trim()}
      aria-hidden="true"
    >
      <div className="st-hero-top-glow" />
      {interactive && variant === 'vetra' && (
        <div className="st-vetra-planet-stage">
          <div className="st-vetra-planet-aura" />
          <div className="st-vetra-planet-arc" />
        </div>
      )}
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
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const delayClass = delay === 1 ? 'st-delay-1' : delay === 2 ? 'st-delay-2' : delay >= 3 ? 'st-delay-3' : '';

  return (
    <div ref={ref} className={`st-reveal ${delayClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
