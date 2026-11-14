'use client';

import React, { useEffect, useRef } from 'react';
import {
  PIXEL_ROOM_WIDTH,
  PIXEL_ROOM_HEIGHT,
  PIXEL_ROOM_PALETTE,
  PIXEL_ROOM_INDICES_B64,
} from '../lib/pixel-room-tilemap';

interface Raindrop {
  x: number;
  y: number;
  speed: number;
  len: number;
}

interface Bubble {
  x: number;
  y: number;
  speed: number;
}

interface DustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
}

export default function LivingPixelRoomCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const W = PIXEL_ROOM_WIDTH;
    const H = PIXEL_ROOM_HEIGHT;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = false;

    // 1. Decode the 320x180 indexed pixel art tilemap into an offscreen base canvas once
    const baseCanvas = document.createElement('canvas');
    baseCanvas.width = W;
    baseCanvas.height = H;
    const baseCtx = baseCanvas.getContext('2d', { alpha: false });
    if (!baseCtx) return;

    const imgData = baseCtx.createImageData(W, H);
    const rawBin = window.atob(PIXEL_ROOM_INDICES_B64);
    const data = imgData.data;

    for (let i = 0; i < W * H; i++) {
      const palIdx = rawBin.charCodeAt(i);
      const rgb = PIXEL_ROOM_PALETTE[palIdx] || [10, 10, 14];
      const p4 = i * 4;
      data[p4] = rgb[0];
      data[p4 + 1] = rgb[1];
      data[p4 + 2] = rgb[2];
      data[p4 + 3] = 255;
    }
    baseCtx.putImageData(imgData, 0, 0);

    // 2. Seed living pixel animations:
    // - Raindrops falling outside Left Window (x: 10..68, y: 12..54) & Center Window (x: 124..186, y: 12..54)
    const raindrops: Raindrop[] = Array.from({ length: 34 }, (_, i) => ({
      x: i % 2 === 0 ? 11 + ((i * 7) % 55) : 125 + ((i * 9) % 59),
      y: (i * 13) % 40,
      speed: 0.45 + (i % 3) * 0.22,
      len: 2 + (i % 2),
    }));

    // - Rising bubbles inside the glass aquarium tank (x: 204..224, y: 50..74)
    const bubbles: Bubble[] = Array.from({ length: 9 }, (_, i) => ({
      x: 205 + ((i * 3) % 19),
      y: (i * 5) % 22,
      speed: 0.12 + (i % 3) * 0.05,
    }));

    // - Floating warm dust motes in the floor lamp & TV light cones
    const motes: DustMote[] = Array.from({ length: 14 }, (_, i) => ({
      x: 88 + ((i * 11) % 96),
      y: 42 + ((i * 9) % 86),
      vx: (i % 2 === 0 ? 1 : -1) * 0.04,
      vy: -0.03 - (i % 3) * 0.015,
      phase: i * 0.8,
    }));

    let animId = 0;
    let tick = 0;

    const renderFrame = () => {
      tick += 1;
      const breathOffset = Math.floor(tick / 36) % 2; // subtle 1px breathing every ~0.6s
      const fanStep = Math.floor(tick / 7) % 4;
      const lampPulse = Math.sin(tick * 0.04) * 0.035;
      const tvPulse = Math.cos(tick * 0.09) * 0.03;

      // Draw crisp base pixel room
      ctx.drawImage(baseCanvas, 0, 0);

      // ---------------------------------------------------------
      // A. SUBTLE 1PX BREATHING SPRITE SHIFT ON SOFA BLANKET & SEATED CHARACTER
      // ---------------------------------------------------------
      if (breathOffset === 1) {
        // Shift crimson blanket & sleeping torso 1px up to simulate breathing
        ctx.drawImage(baseCanvas, 138, 66, 56, 30, 138, 65, 56, 30);
        // Shift seated character chest/shoulders 1px up
        ctx.drawImage(baseCanvas, 204, 96, 26, 26, 204, 95, 26, 26);
      }

      // ---------------------------------------------------------
      // B. ANIMATED PIXEL RAIN OUTSIDE BOTH WINDOWS
      // ---------------------------------------------------------
      ctx.fillStyle = 'rgba(130, 165, 210, 0.38)';
      for (const r of raindrops) {
        const wy = 14 + ((r.y + tick * r.speed) % 38);
        ctx.fillRect(Math.round(r.x), Math.round(wy), 1, r.len);
      }

      // ---------------------------------------------------------
      // C. ANIMATED CEILING FAN PIXEL HIGHLIGHTS (Top Center Window)
      // ---------------------------------------------------------
      ctx.fillStyle = 'rgba(16, 14, 20, 0.55)';
      if (fanStep === 0 || fanStep === 2) {
        ctx.fillRect(136, 28, 18, 2);
        ctx.fillRect(162, 28, 18, 2);
      } else {
        ctx.fillRect(140, 24, 14, 2);
        ctx.fillRect(160, 32, 14, 2);
      }

      // ---------------------------------------------------------
      // D. RISING PIXEL BUBBLES + SHIMMER IN AQUARIUM TANK
      // ---------------------------------------------------------
      ctx.fillStyle = 'rgba(145, 215, 255, 0.65)';
      for (const b of bubbles) {
        const by = 72 - ((b.y + tick * b.speed) % 21);
        ctx.fillRect(Math.round(b.x), Math.round(by), 1, 1);
      }
      // Subtle water surface shimmer line
      if (Math.floor(tick / 12) % 2 === 0) {
        ctx.fillStyle = 'rgba(126, 196, 242, 0.35)';
        ctx.fillRect(204, 51, 16, 1);
      }

      // ---------------------------------------------------------
      // E. NEON CRIMSON WALL CLOCK PULSE & TICKING SECOND INDICATOR
      // ---------------------------------------------------------
      const clockGlow = 0.22 + Math.sin(tick * 0.06) * 0.08;
      const clkGrad = ctx.createRadialGradient(237, 20, 1, 237, 20, 16);
      clkGrad.addColorStop(0, `rgba(255, 55, 70, ${clockGlow})`);
      clkGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = clkGrad;
      ctx.fillRect(220, 4, 34, 34);
      if (Math.floor(tick / 30) % 2 === 0) {
        ctx.fillStyle = '#ff9aa2';
        ctx.fillRect(237, 19, 1, 2);
      }

      // ---------------------------------------------------------
      // F. LAPTOP SCREEN ACTIVE CODE & CRT TV FLOOR SPILL
      // ---------------------------------------------------------
      // Laptop screen active pixel lines (around x=175..181, y=118..125)
      ctx.fillStyle = tick % 18 < 9 ? 'rgba(126, 196, 242, 0.55)' : 'rgba(255, 90, 102, 0.55)';
      ctx.fillRect(175, 119 + (Math.floor(tick / 10) % 4), 3, 1);

      // CRT TV screen edge flicker & dynamic floor light cone
      const tvGrad = ctx.createRadialGradient(136, 118, 2, 146, 124, 38);
      tvGrad.addColorStop(0, `rgba(235, 220, 245, ${0.14 + tvPulse})`);
      tvGrad.addColorStop(0.5, `rgba(212, 28, 44, ${0.07 + tvPulse})`);
      tvGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = tvGrad;
      ctx.fillRect(106, 86, 82, 74);

      // ---------------------------------------------------------
      // G. WARM AMBER FLOOR LAMP BREATHING GLOW + ROTARY PHONE LED
      // ---------------------------------------------------------
      const lampGrad = ctx.createRadialGradient(100, 48, 2, 100, 56, 42);
      lampGrad.addColorStop(0, `rgba(255, 195, 75, ${0.22 + lampPulse})`);
      lampGrad.addColorStop(0.55, `rgba(212, 90, 30, ${0.08 + lampPulse})`);
      lampGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lampGrad;
      ctx.fillRect(56, 12, 88, 88);

      // Kitchen bar telephone blinking crimson status LED (x=68, y=64)
      if (Math.floor(tick / 20) % 2 === 0) {
        ctx.fillStyle = '#ff3b4b';
        ctx.fillRect(68, 63, 1, 1);
      }

      // ---------------------------------------------------------
      // H. FLOATING PIXEL DUST MOTES IN LIGHT BEAMS
      // ---------------------------------------------------------
      for (const m of motes) {
        const mx = m.x + Math.sin(tick * 0.02 + m.phase) * 4;
        const my = 40 + ((m.y + tick * m.vy + 90) % 85);
        const alpha = 0.25 + 0.2 * Math.sin(tick * 0.05 + m.phase);
        ctx.fillStyle = `rgba(255, 220, 160, ${alpha})`;
        ctx.fillRect(Math.round(mx), Math.round(my), 1, 1);
      }

      animId = window.requestAnimationFrame(renderFrame);
    };

    animId = window.requestAnimationFrame(renderFrame);
    return () => {
      window.cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="living-room-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="living-room-canvas" />
    </div>
  );
}
