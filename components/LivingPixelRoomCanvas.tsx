'use client';

import React, { useEffect, useRef } from 'react';

interface RainStreak {
  x: number;
  y: number;
  speed: number;
  len: number;
  alpha: number;
}

export default function LivingPixelRoomCanvas() {
  const rainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = rainCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 480;
    const H = 270;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    const streaks: RainStreak[] = Array.from({ length: 58 }, (_, i) => ({
      x: (i * 23) % W,
      y: (i * 17) % H,
      speed: 2.2 + (i % 4) * 0.65,
      len: 4 + (i % 4) * 2,
      alpha: 0.12 + (i % 3) * 0.08,
    }));

    let animId = 0;

    const renderRain = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of streaks) {
        s.y += s.speed;
        s.x -= s.speed * 0.15;
        if (s.y > H) {
          s.y = -s.len;
          s.x = (s.x + W) % W;
        }
        ctx.fillStyle = `rgba(185, 200, 230, ${s.alpha})`;
        ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, s.len);
      }
      animId = window.requestAnimationFrame(renderRain);
    };

    animId = window.requestAnimationFrame(renderRain);
    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="px-parallax-stage" aria-hidden="true">
      {/* Layer 1: Far Horizon Skyline (Moves slowest) */}
      <div className="px-parallax-layer px-layer-far" />

      {/* Layer 2: Midground Noir Towers & Highway (Moves medium) */}
      <div className="px-parallax-layer px-layer-mid" />

      {/* Layer 3: Foreground Cyber-Noir Street & Storefronts (Moves fastest) */}
      <div className="px-parallax-layer px-layer-fg" />

      {/* Layer 4: Atmospheric Nocturnal Rain & Vignette */}
      <canvas ref={rainCanvasRef} className="px-rain-canvas" />
      <div className="px-parallax-atmosphere" />
    </div>
  );
}
