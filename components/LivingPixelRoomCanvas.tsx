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

      {/* Layer 2: Midground Noir Towers */}
      <div className="px-parallax-layer px-layer-mid" aria-hidden="true" />

      {/* Overpass Bridge Traffic (Locked to Foreground Bridge Deck so cars never float on mouse tilt) */}
      <div className="px-bridge-traffic" aria-hidden="true">
        {/* Eastbound Lane (Left -> Right): Modern Crimson Sport Coupe */}
        <div className="px-traffic-car px-traffic-car--east" />

        {/* Westbound Lane (Right -> Left, opposite direction): Modern Smoked-Amber SUV */}
        <div className="px-traffic-car px-traffic-car--west" />
      </div>

      {/* Layer 3: Foreground Cyber-Noir Street */}
      <div className="px-parallax-layer px-layer-fg" aria-hidden="true" />

      {/* Foreground Street Props (Rich Homeless Alley / Noir Street Details) & Citizens */}
      <div className="px-street-actors">
        {/* Background Far-Sidewalk Commuters Walking Straight Home & Exiting Frame */}
        <div className="px-bg-walkers" aria-hidden="true">
          <div className="px-bg-walker px-bg-walker--1" />
          <div className="px-bg-walker px-bg-walker--2" />
          <div className="px-bg-walker px-bg-walker--3" />
          <div className="px-bg-walker px-bg-walker--4" />
        </div>

        {/* 1. Far-Left Alley: Overflowing Street Dumpster + Trash Bags + Cardboard Boxes + Bottles */}
        <div className="px-prop-dumpster" aria-hidden="true" />

        {/* 2. Left-Center Curb: Burning 55-Gallon Fire Barrel + Milk Crate + Beer Bottles */}
        <div className="px-prop-fire-barrel" aria-hidden="true">
          <span className="px-fire-light" />
        </div>

        {/* 3. Center-Left Asphalt: Steaming Manhole Grate + Wet Neon Puddle + Crushed Cans */}
        <div className="px-prop-steam-grate" aria-hidden="true" />

        {/* 4. Right-Center Asphalt: Road Barricade + Traffic Cone + Scattered Beer Bottles */}
        <div className="px-prop-barricade" aria-hidden="true" />

        {/* 5. Right Storefront Curb: Sleeping Drifter on Cardboard Mat + Boombox + Bottles */}
        <div className="px-prop-drifter-sleep" aria-hidden="true" />

        {/* 6. Far-Right Sidewalk: Second Burning Fire Barrel warming the two chatting men */}
        <div className="px-prop-fire-barrel px-prop-fire-barrel--right" aria-hidden="true">
          <span className="px-fire-light" />
        </div>

        {/* CITIZEN 1: Left Bar Patron — Stationary animated jacket citizen with thought bubble */}
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

        {/* CITIZEN 2: Center Crosswalk Citizen — Stationary animated red-beanie citizen with thought bubble */}
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

        {/* CITIZEN 3: Right-Center Storefront Citizen — Stationary animated backpack citizen */}
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

        {/* CITIZENS 4 & 5: Far-Right Sidewalk — Two Men Chatting Face-to-Face (Casual Daily Street Banter) */}
        <div className="px-chat-duo" aria-label="Sokakta sohbet eden iki kişi">
          {/* Left Man (Facing Right, holding bottle & smoking) */}
          <div className="px-chat-person px-chat-person--left">
            <Link
              href="/katalog"
              className="px-thought-bubble px-thought-bubble--amber px-chat-bubble-left"
              aria-label="Sohbet: Kanka şu ateşin başına geçelim, gece bayağı soğudu..."
            >
              <span className="px-thought-text">
                &ldquo;kanka şu ateşin başına geçelim, bu gece sokak bayağı ayaz yaptı...&rdquo;
              </span>
              <span className="px-thought-dots" aria-hidden="true">
                <i className="px-dot-lg" />
                <i className="px-dot-sm" />
              </span>
            </Link>
            <div className="px-actor px-actor-chat-left" aria-hidden="true" />
          </div>

          {/* Right Man (Facing Left, gesturing in conversation) */}
          <div className="px-chat-person px-chat-person--right">
            <Link
              href="/katalog"
              className="px-thought-bubble px-chat-bubble-right"
              aria-label="Sohbet: Vallahi öyle, biraları da aldık sabaha kadar muhabbet ederiz."
            >
              <span className="px-thought-text">
                &ldquo;vallahi öyle, kasadaki biraları da aldık sabaha kadar muhabbet ederiz.&rdquo;
              </span>
              <span className="px-thought-dots" aria-hidden="true">
                <i className="px-dot-lg" />
                <i className="px-dot-sm" />
              </span>
            </Link>
            <div className="px-actor px-actor-chat-right" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Layer 4: Atmospheric Nocturnal Rain & Vignette */}
      <canvas ref={rainCanvasRef} className="px-rain-canvas" aria-hidden="true" />
      <div className="px-parallax-atmosphere" aria-hidden="true" />
    </div>
  );
}
