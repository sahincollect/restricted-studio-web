'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';

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

      {/* Layer 2: Midground Noir Towers + Cruising Red Cyberpunk Hovercar */}
      <div className="px-parallax-layer px-layer-mid">
        <div className="px-actor-hovercar" title="Restricted Red Interceptor" />
      </div>

      {/* Layer 3: Foreground Cyber-Noir Street + Living Citizens & Crimson Mascot */}
      <div className="px-parallax-layer px-layer-fg" />

      {/* Foreground Street Actors Layer (Synced with Foreground Layer-3 Parallax) */}
      <div className="px-street-actors">
        {/* 1. Left Bar Patron (Idle animated jacket citizen) */}
        <div className="px-actor px-actor-jacket-idle" />

        {/* 2. Patrolling Red-Beanie Citizen walking along the crosswalk */}
        <div className="px-actor px-actor-red-walker" />

        {/* 3. Patrolling Crimson Cyber-Guard on the right sidewalk */}
        <div className="px-actor px-actor-cyber-guard" />

        {/* 4. RESTRICTED STUDIO CRIMSON MASCOT (Animated 5-frame pixel beast + nameplate) */}
        <Link
          href="/katalog"
          className="px-actor px-actor-crimson-mascot"
          aria-label="Restricted Studio Kırmızı Maskot - Kataloğu Aç"
        >
          <span className="px-mascot-tag">RS // MASKOT</span>
          <span className="px-mascot-sprite" />
        </Link>
      </div>

      {/* Layer 4: Atmospheric Nocturnal Rain & Vignette */}
      <canvas ref={rainCanvasRef} className="px-rain-canvas" />
      <div className="px-parallax-atmosphere" />
    </div>
  );
}
