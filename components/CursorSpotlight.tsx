'use client';

import { useEffect } from 'react';

/**
 * Tracks cursor movement with requestAnimationFrame throttling to power
 * Triadic Noir crimson optical spotlight hairlines across `.spotlight-surface` cards.
 */
export default function CursorSpotlight() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;

    let rafId = 0;
    let lastX = -9999;
    let lastY = -9999;
    let needsUpdate = false;
    const touched = new Set<HTMLElement>();

    const updateSurfaces = () => {
      rafId = 0;
      if (!needsUpdate) return;
      needsUpdate = false;

      const elements = document.querySelectorAll<HTMLElement>('.spotlight-surface');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const pad = 160;
        const near =
          lastX >= rect.left - pad &&
          lastX <= rect.right + pad &&
          lastY >= rect.top - pad &&
          lastY <= rect.bottom + pad;

        if (near) {
          const lx = lastX - rect.left;
          const ly = lastY - rect.top;
          el.style.setProperty('--spot-x', `${lx.toFixed(1)}px`);
          el.style.setProperty('--spot-y', `${ly.toFixed(1)}px`);
          el.style.setProperty('--spot-active', '1');
          touched.add(el);
        } else if (touched.has(el)) {
          el.style.setProperty('--spot-active', '0');
          touched.delete(el);
        }
      });
    };

    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
      needsUpdate = true;
      if (!rafId) {
        rafId = window.requestAnimationFrame(updateSurfaces);
      }
    };

    const onPointerLeaveWindow = () => {
      touched.forEach((el) => el.style.setProperty('--spot-active', '0'));
      touched.clear();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('mouseleave', onPointerLeaveWindow, { passive: true });

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('mouseleave', onPointerLeaveWindow);
      touched.forEach((el) => el.style.setProperty('--spot-active', '0'));
    };
  }, []);

  return null;
}
