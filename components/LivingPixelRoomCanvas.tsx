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
    <div className="px-parallax-stage">
      {/* Layer 1: Far Horizon Skyline (Moves slowest) */}
      <div className="px-parallax-layer px-layer-far" aria-hidden="true" />

      {/* Layer 2: Midground Noir Towers + Overpass Highway with Modern Everyday Cars in Opposite Lanes */}
      <div className="px-parallax-layer px-layer-mid" aria-hidden="true">
        {/* Eastbound Lane (Left -> Right): Modern Crimson Sport Coupe */}
        <div className="px-traffic-car px-traffic-car--east" />

        {/* Westbound Lane (Right -> Left, opposite direction): Modern Smoked-Amber SUV */}
        <div className="px-traffic-car px-traffic-car--west" />
      </div>

      {/* Layer 3: Foreground Cyber-Noir Street */}
      <div className="px-parallax-layer px-layer-fg" aria-hidden="true" />

      {/* Foreground Street Citizens + Pixel Thought Bubbles (Synced with Foreground Layer-3 Parallax) */}
      <div className="px-street-actors">
        {/* 1. Left Bar Patron — Stationary animated jacket citizen with thought bubble */}
        <div className="px-citizen-slot px-citizen-left">
          <Link
            href="/katalog"
            className="px-thought-bubble"
            aria-label="Kataloğu İncele: Bu adamlar bu kadar ürünü nasıl 100 liraya veriyor?"
          >
            <span className="px-thought-text">
              &ldquo;bu adamlar bu kadar ürünü nasıl 100 liraya veriyor&rdquo;
            </span>
            <span className="px-thought-dots" aria-hidden="true">
              <i className="px-dot-lg" />
              <i className="px-dot-sm" />
            </span>
          </Link>
          <div className="px-actor px-actor-jacket-idle" aria-hidden="true" />
        </div>

        {/* 2. Center-Left Crosswalk Citizen — Stationary animated red-beanie citizen with thought bubble */}
        <div className="px-citizen-slot px-citizen-mid">
          <Link
            href="/katalog"
            className="px-thought-bubble px-thought-bubble--amber"
            aria-label="Kataloğu İncele: 15 paket seçince sepette yarısı direkt düştü"
          >
            <span className="px-thought-text">
              &ldquo;15 paket seçince sepette yarısı direkt düştü, tanesi 50 liraya geldi...&rdquo;
            </span>
            <span className="px-thought-dots" aria-hidden="true">
              <i className="px-dot-lg" />
              <i className="px-dot-sm" />
            </span>
          </Link>
          <div className="px-actor px-actor-red-idle" aria-hidden="true" />
        </div>

        {/* 3. Right Storefront Citizen — Stationary animated backpack citizen */}
        <div className="px-citizen-slot px-citizen-right">
          <Link
            href="/katalog"
            className="px-thought-bubble px-thought-bubble--slate"
            aria-label="Kataloğu İncele: 6.400'den fazla açık kaynak paket var"
          >
            <span className="px-thought-text">
              &ldquo;şifreleme yok, 6.400+ paketin tamamı açık kaynak teslim ediliyor.&rdquo;
            </span>
            <span className="px-thought-dots" aria-hidden="true">
              <i className="px-dot-lg" />
              <i className="px-dot-sm" />
            </span>
          </Link>
          <div className="px-actor px-actor-backpack-idle" aria-hidden="true" />
        </div>
      </div>

      {/* Layer 4: Atmospheric Nocturnal Rain & Vignette */}
      <canvas ref={rainCanvasRef} className="px-rain-canvas" aria-hidden="true" />
      <div className="px-parallax-atmosphere" aria-hidden="true" />
    </div>
  );
}
