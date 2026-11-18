'use client';

import { useEffect } from 'react';

/**
 * Tracks cursor movement with requestAnimationFrame throttling to power
 * optical spotlight hairlines strictly on the currently hovered `.spotlight-surface`.
 */
export default function CursorSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    let rafId = 0;
    let lastX = -9999;
    let lastY = -9999;
    let pendingTarget: HTMLElement | null = null;
    let activeSurface: HTMLElement | null = null;

    const clearActive = () => {
      if (activeSurface) {
        activeSurface.style.setProperty('--spot-active', '0');
        activeSurface = null;
      }
    };

    const flush = () => {
      rafId = 0;
      const surface = pendingTarget;

      if (activeSurface && activeSurface !== surface) {
        activeSurface.style.setProperty('--spot-active', '0');
      }

      if (!surface || !surface.isConnected) {
        activeSurface = null;
        return;
      }

      const rect = surface.getBoundingClientRect();
      surface.style.setProperty('--spot-x', `${(lastX - rect.left).toFixed(1)}px`);
      surface.style.setProperty('--spot-y', `${(lastY - rect.top).toFixed(1)}px`);
      surface.style.setProperty('--spot-active', '1');
      activeSurface = surface;
    };

    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      pendingTarget =
        e.target instanceof Element
          ? e.target.closest<HTMLElement>('.spotlight-surface')
          : null;
      if (!rafId) {
        rafId = window.requestAnimationFrame(flush);
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', clearActive, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', clearActive);
      clearActive();
    };
  }, []);

  return null;
}
