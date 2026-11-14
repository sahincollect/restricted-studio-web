'use client';

import React, { useEffect, useRef } from 'react';
import { quantizeGridCoord } from '@/lib/pixel-core-telemetry';

interface PixelFlake {
  x: number;
  y: number;
  vy: number;
  vx: number;
  size: 2 | 3;
  color: '#F0F0F0' | '#B8E1FF';
  alpha: number;
  phase: number;
}

interface PixelSpark {
  x: number;
  y: number;
  color: '#FFB84D' | '#A50000';
  phase: number;
  speed: number;
}

const GRID_CELL = 16;

export default function PixelWinterCanvas(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarseQuery = window.matchMedia('(pointer: coarse)');

    let width = 0;
    let height = 0;
    let flakes: PixelFlake[] = [];
    let sparks: PixelSpark[] = [];
    let pointerX = -9999;
    let pointerY = -9999;
    let pointerActive = false;
    let rafId: number | null = null;
    let lastTime = performance.now();

    const seedParticles = () => {
      const flakeCount = Math.min(84, Math.max(36, Math.round((width * height) / 18000)));
      flakes = Array.from({ length: flakeCount }, (_, idx) => {
        const isBig = idx % 4 === 0;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vy: isBig ? 24 + Math.random() * 14 : 16 + Math.random() * 14,
          vx: (Math.random() - 0.5) * 6,
          size: isBig ? 3 : 2,
          color: idx % 3 === 0 ? '#B8E1FF' : '#F0F0F0',
          alpha: isBig ? 0.52 : 0.32 + Math.random() * 0.25,
          phase: Math.random() * Math.PI * 2,
        };
      });

      const sparkCount = Math.min(18, Math.max(8, Math.round(width / 90)));
      sparks = Array.from({ length: sparkCount }, (_, idx) => ({
        x: quantizeGridCoord(Math.random() * width, 4),
        y: quantizeGridCoord(Math.random() * Math.max(80, height * 0.48), 4),
        color: idx % 3 === 0 ? '#A50000' : '#FFB84D',
        phase: Math.random() * Math.PI * 2,
        speed: 1.4 + Math.random() * 1.4,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      const nextW = parent ? parent.clientWidth : window.innerWidth;
      const nextH = parent ? parent.clientHeight : window.innerHeight;
      if (nextW <= 0 || nextH <= 0) return;

      width = nextW;
      height = nextH;
      canvas.width = width;
      canvas.height = height;
      ctx.imageSmoothingEnabled = false;
      seedParticles();
    };

    const drawFrame = (now: number, stepSeconds: number) => {
      ctx.clearRect(0, 0, width, height);

      if (pointerActive && !coarseQuery.matches && !motionQuery.matches) {
        const originX = quantizeGridCoord(pointerX, GRID_CELL);
        const originY = quantizeGridCoord(pointerY, GRID_CELL);

        for (let dx = -2; dx <= 2; dx += 1) {
          for (let dy = -2; dy <= 2; dy += 1) {
            const manhattan = Math.abs(dx) + Math.abs(dy);
            if (manhattan > 2) continue;

            const cellX = originX + dx * GRID_CELL;
            const cellY = originY + dy * GRID_CELL;
            if (manhattan === 0) {
              ctx.fillStyle = 'rgba(255, 184, 77, 0.09)';
              ctx.fillRect(cellX, cellY, GRID_CELL, GRID_CELL);
              ctx.fillStyle = 'rgba(165, 0, 0, 0.22)';
              ctx.fillRect(cellX + 2, cellY + 2, GRID_CELL - 4, GRID_CELL - 4);
            } else if (manhattan === 1) {
              ctx.fillStyle = 'rgba(165, 0, 0, 0.075)';
              ctx.fillRect(cellX, cellY, GRID_CELL, GRID_CELL);
            } else {
              ctx.fillStyle = 'rgba(184, 225, 255, 0.03)';
              ctx.fillRect(cellX, cellY, GRID_CELL, GRID_CELL);
            }
          }
        }
      }

      const tSec = now * 0.001;

      for (let i = 0; i < sparks.length; i += 1) {
        const s = sparks[i];
        const pulse = 0.5 + 0.5 * Math.sin(tSec * s.speed + s.phase);
        if (pulse < 0.25) continue;
        ctx.globalAlpha = 0.14 + pulse * 0.34;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, 2, 2);
      }

      for (let i = 0; i < flakes.length; i += 1) {
        const f = flakes[i];
        if (!motionQuery.matches) {
          f.y += f.vy * stepSeconds;
          f.x += (f.vx + Math.sin(tSec * 1.1 + f.phase) * 3.5) * stepSeconds;

          if (f.y > height + 4) {
            f.y = -4;
            f.x = Math.random() * width;
          }
          if (f.x < -4) f.x = width + 2;
          if (f.x > width + 4) f.x = -2;
        }

        const drawX = quantizeGridCoord(f.x, 2);
        const drawY = quantizeGridCoord(f.y, 2);
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = f.color;
        ctx.fillRect(drawX, drawY, f.size, f.size);
      }

      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      if (document.visibilityState !== 'visible') {
        rafId = null;
        return;
      }

      const dt = Math.min(0.05, Math.max(0, (now - lastTime) * 0.001));
      lastTime = now;
      drawFrame(now, dt);

      if (!motionQuery.matches) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      lastTime = performance.now();
      if (motionQuery.matches) {
        drawFrame(lastTime, 0);
        return;
      }
      if (document.visibilityState === 'visible') {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (coarseQuery.matches || motionQuery.matches) return;
      const rect = canvas.getBoundingClientRect();
      pointerX = e.clientX - rect.left;
      pointerY = e.clientY - rect.top;
      pointerActive =
        pointerX >= 0 && pointerY >= 0 && pointerX <= rect.width && pointerY <= rect.height;
    };

    const handlePointerLeave = () => {
      pointerActive = false;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startLoop();
      } else if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    resize();
    startLoop();

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    if (resizeObserver && canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    motionQuery.addEventListener('change', startLoop);

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', startLoop);
    };
  }, []);

  return <canvas ref={canvasRef} className="px-snow-canvas" aria-hidden="true" />;
}
