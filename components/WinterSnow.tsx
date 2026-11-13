'use client';

import React, { useEffect, useRef } from 'react';

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speedY: number;
  angle: number;
  angleSpeed: number;
  driftAmp: number;
  opacity: number;
  crystal: boolean;
  rotation: number;
  rotationSpeed: number;
}

/**
 * Minimalist Triadic Noir snowfall overlay across all routes.
 * Renders soft archival-chalk (#E6E3DC) particles mixed with subtle
 * 6-point geometric frost hairlines without UI clutter or pointer interference.
 */
export default function WinterSnow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const syncDimensions = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncDimensions();
    window.addEventListener('resize', syncDimensions, { passive: true });

    const count = width < 640 ? 24 : Math.min(Math.max(Math.floor(width / 34), 32), 52);
    const flakes: Snowflake[] = Array.from({ length: count }, (_, idx) => {
      const crystal = idx % 7 === 0;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: crystal ? Math.random() * 1.4 + 2.4 : Math.random() * 1.4 + 0.8,
        speedY: crystal ? Math.random() * 0.35 + 0.28 : Math.random() * 0.48 + 0.24,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: Math.random() * 0.012 + 0.004,
        driftAmp: Math.random() * 0.28 + 0.12,
        opacity: crystal ? Math.random() * 0.14 + 0.22 : Math.random() * 0.28 + 0.16,
        crystal,
        rotation: Math.random() * Math.PI,
        rotationSpeed: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.005 + 0.002),
      };
    });

    let isVisible = document.visibilityState === 'visible';
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const drawCrystal = (f: Snowflake) => {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation);
      ctx.strokeStyle = `rgba(230, 227, 220, ${f.opacity})`;
      ctx.lineWidth = 0.85;
      ctx.lineCap = 'round';
      for (let arm = 0; arm < 3; arm++) {
        ctx.beginPath();
        ctx.moveTo(-f.r, 0);
        ctx.lineTo(f.r, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 3);
      }
      ctx.restore();
    };

    const render = () => {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          f.angle += f.angleSpeed;
          f.rotation += f.rotationSpeed;
          f.y += f.speedY;
          f.x += Math.sin(f.angle) * f.driftAmp;

          if (f.y > height + 8) {
            f.y = -8;
            f.x = Math.random() * width;
          }
          if (f.x > width + 8) {
            f.x = -8;
          } else if (f.x < -8) {
            f.x = width + 8;
          }

          if (f.crystal) {
            drawCrystal(f);
          } else {
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(230, 227, 220, ${f.opacity})`;
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', syncDimensions);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 45,
      }}
    />
  );
}
