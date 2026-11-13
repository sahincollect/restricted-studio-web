'use client';

import React, { useEffect, useRef, useState } from 'react';

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speed: number;
  angle: number;
  angleSpeed: number;
  opacity: number;
}

export default function WinterSnow() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [showPill, setShowPill] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rs_winter_snow');
      if (saved === 'false') {
        setSnowEnabled(false);
      }
    } catch {
      // ignore storage errors
    }
    setShowPill(true);
  }, []);

  const toggleSnow = () => {
    setSnowEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rs_winter_snow', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  useEffect(() => {
    if (!snowEnabled) return;

    // Check prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Generate ~50 lightweight, natural snowflakes
    const count = Math.min(Math.max(Math.floor(width / 26), 35), 60);
    const flakes: Snowflake[] = [];

    for (let i = 0; i < count; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2.2 + 1, // radius 1px to 3.2px
        speed: Math.random() * 0.75 + 0.35, // soft realistic fall speed
        angle: Math.random() * Math.PI * 2,
        angleSpeed: Math.random() * 0.015 + 0.005,
        opacity: Math.random() * 0.45 + 0.3,
      });
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];

        f.angle += f.angleSpeed;
        f.y += f.speed;
        f.x += Math.sin(f.angle) * 0.55;

        // Wrap around viewport
        if (f.y > height + 6) {
          f.y = -6;
          f.x = Math.random() * width;
        }
        if (f.x > width + 6) {
          f.x = -6;
        } else if (f.x < -6) {
          f.x = width + 6;
        }

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(220, 240, 255, ${f.opacity})`;
        ctx.shadowColor = 'rgba(160, 215, 255, 0.45)';
        ctx.shadowBlur = f.r > 2 ? 3 : 1;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [snowEnabled]);

  return (
    <>
      {snowEnabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 9995,
          }}
        />
      )}

      {showPill && (
        <aside
          className="winter-season-pill"
          aria-label="Kış Sezonu Teması"
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            zIndex: 9992,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(12, 13, 20, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(140, 210, 255, 0.3)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), 0 0 15px rgba(0, 113, 227, 0.2)',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#e0f2fe',
            userSelect: 'none',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: '13px' }}>❄️</span>
          <span>Kış Sezonu</span>
          <button
            type="button"
            onClick={toggleSnow}
            title={snowEnabled ? 'Kar yağışını kapat' : 'Kar yağışını aç'}
            style={{
              background: snowEnabled ? 'rgba(0, 113, 227, 0.3)' : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid ' + (snowEnabled ? 'rgba(0, 113, 227, 0.6)' : 'rgba(255, 255, 255, 0.15)'),
              borderRadius: '999px',
              padding: '2px 8px',
              fontSize: '11px',
              color: snowEnabled ? '#38bdf8' : '#a1a1aa',
              cursor: 'pointer',
              fontWeight: 700,
              marginLeft: '2px',
              transition: 'all 0.2s',
            }}
          >
            {snowEnabled ? 'Kar: Açık' : 'Kar: Kapalı'}
          </button>
        </aside>
      )}
    </>
  );
}
