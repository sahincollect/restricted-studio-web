'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { PIXEL_ROOM_HOTSPOTS, type RoomHotspotAction } from '../lib/pixel-room-config';

interface RainStreak {
  x: number;
  y: number;
  speed: number;
  len: number;
  alpha: number;
}

interface LivingPixelRoomCanvasProps {
  onSelectAction?: (action: RoomHotspotAction) => void;
}

export default function LivingPixelRoomCanvas({ onSelectAction }: LivingPixelRoomCanvasProps) {
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

  const signHotspots = PIXEL_ROOM_HOTSPOTS.filter((h) => h.signBox);

  return (
    <div className="px-parallax-stage">
      {/* Layer 1: Far Horizon Skyline (Moves slowest) */}
      <div className="px-parallax-layer px-layer-far" aria-hidden="true" />

      {/* Layer 2: Midground Noir Towers + Cruising Red Cyberpunk Hovercar */}
      <div className="px-parallax-layer px-layer-mid" aria-hidden="true">
        <div className="px-actor-hovercar" title="Restricted Red Interceptor" />
      </div>

      {/* Layer 3: Foreground Cyber-Noir Street */}
      <div className="px-parallax-layer px-layer-fg" aria-hidden="true" />

      {/* Layer 3B: Interactive White-Light Selectable Artwork Sign Hitboxes (Exact 352x192 coordinate plane) */}
      <div className="px-fg-hitplane-wrap">
        <div className="px-fg-hitplane">
          {signHotspots.map((spot) => {
            const box = spot.signBox!;
            const style: React.CSSProperties = {
              left: `${(box.px / 352) * 100}%`,
              top: `${(box.py / 192) * 100}%`,
              width: `${(box.pw / 352) * 100}%`,
              height: `${(box.ph / 192) * 100}%`,
            };

            if (spot.action.type === 'route') {
              return (
                <Link
                  key={`sign-${spot.id}`}
                  href={spot.action.href}
                  className="px-sign-hitbox"
                  style={style}
                  aria-label={`${spot.label} - ${spot.badge}`}
                >
                  <span className="px-sign-tooltip">{spot.badge}</span>
                </Link>
              );
            }

            return (
              <button
                key={`sign-${spot.id}`}
                type="button"
                className="px-sign-hitbox"
                style={style}
                aria-label={`${spot.label} - ${spot.badge}`}
                onClick={() => onSelectAction?.(spot.action)}
              >
                <span className="px-sign-tooltip">{spot.badge}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Foreground Street Actors Layer (Synced with Foreground Layer-3 Parallax) */}
      <div className="px-street-actors" aria-hidden="true">
        {/* 1. Left Bar Patron (Idle animated jacket citizen) */}
        <div className="px-actor px-actor-jacket-idle" />

        {/* 2. Patrolling Red-Beanie Citizen walking along the crosswalk */}
        <div className="px-actor px-actor-red-walker" />

        {/* 3. Patrolling Crimson-Jacket Woman on the right restaurant sidewalk */}
        <div className="px-actor px-actor-woman-walker" />
      </div>

      {/* Layer 4: Atmospheric Nocturnal Rain & Vignette */}
      <canvas ref={rainCanvasRef} className="px-rain-canvas" aria-hidden="true" />
      <div className="px-parallax-atmosphere" aria-hidden="true" />
    </div>
  );
}
