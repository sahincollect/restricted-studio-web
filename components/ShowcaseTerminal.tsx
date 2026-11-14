'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useI18n } from './I18nProvider';
import { INTERACTIVE_I18N } from '@/lib/interactive-i18n';

export type ShowcaseTab = 'arcade' | 'core' | 'f8';
type LoadProfile = 'idle' | '128p' | '256p';

// Classic wrapped 13x11 corridor grid:
// 1 = obsidian wall, 0 = chalk pellet, 3 = 0% Escrow power pellet, 2 = empty/gate corridor
const INITIAL_MAZE: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 3, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 2, 1, 1, 0, 1, 0, 1],
  [0, 0, 0, 0, 1, 2, 2, 2, 1, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const COLS = 13;
const ROWS = 11;

interface Dir {
  dx: number;
  dy: number;
}

const DIRS: Dir[] = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
];

interface Ghost {
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
}

function cloneMaze(): { grid: number[][]; pellets: number } {
  let pellets = 0;
  const grid = INITIAL_MAZE.map((row) =>
    row.map((cell) => {
      if (cell === 0 || cell === 3) pellets++;
      return cell;
    })
  );
  return { grid, pellets };
}

function isWalkable(grid: number[][], x: number, y: number): boolean {
  if (y < 0 || y >= ROWS) return false;
  const wrappedX = ((x % COLS) + COLS) % COLS;
  return grid[y][wrappedX] !== 1;
}

export default function ShowcaseTerminal({
  godmode = false,
  onOpenFullConsole,
  onTriggerOverdrive,
}: {
  godmode?: boolean;
  onOpenFullConsole?: () => void;
  onTriggerOverdrive?: () => void;
}) {
  const { locale, t, formatPercent } = useI18n();
  const ui = INTERACTIVE_I18N[locale].showcase;

  const [tab, setTab] = useState<ShowcaseTab>('arcade');
  const [loadProfile, setLoadProfile] = useState<LoadProfile>('128p');

  // Arcade state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [demoMode, setDemoMode] = useState(true);
  const [gameState, setGameState] = useState<'playing' | 'over' | 'won'>('playing');

  // Inline F8 console state
  const [inlineInput, setInlineInput] = useState('');
  const [inlineLogs, setInlineLogs] = useState<string[]>([
    'RS-ENGINE v3.4 // 0.00 ms idle · escrow disabled',
    'F8 / Ctrl+K -> komut & easter egg',
  ]);

  const godmodeRef = useRef(godmode);
  godmodeRef.current = godmode;
  const demoRef = useRef(demoMode);
  demoRef.current = demoMode;
  const tabRef = useRef(tab);
  tabRef.current = tab;

  const gameRef = useRef<{
    grid: number[][];
    pelletsLeft: number;
    pac: { x: number; y: number; dx: number; dy: number; nextDx: number; nextDy: number };
    ghosts: Ghost[];
    frightenedTicks: number;
    tick: number;
    score: number;
    status: 'playing' | 'over' | 'won';
  }>({
    ...(() => {
      const m = cloneMaze();
      return { grid: m.grid, pelletsLeft: m.pellets };
    })(),
    pac: { x: 6, y: 7, dx: 1, dy: 0, nextDx: 1, nextDy: 0 },
    ghosts: [
      { x: 5, y: 5, dx: 1, dy: 0, color: '#C62828' },
      { x: 6, y: 5, dx: 0, dy: -1, color: '#8B0000' },
      { x: 7, y: 5, dx: -1, dy: 0, color: '#E85D5D' },
    ],
    frightenedTicks: 0,
    tick: 0,
    score: 0,
    status: 'playing',
  });

  // Load saved high score
  useEffect(() => {
    try {
      const saved = parseInt(localStorage.getItem('rs_pacrun_best') || '0', 10);
      if (Number.isFinite(saved) && saved > 0) setBestScore(saved);
    } catch {
      // ignore
    }
  }, []);

  // Listen for global easter egg events (e.g. from DevTools window.rs or F8 modal)
  useEffect(() => {
    const onSwitchTab = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: ShowcaseTab; takeControl?: boolean }>).detail;
      if (detail?.tab) setTab(detail.tab);
      if (detail?.takeControl) {
        startNewGame(false);
      }
    };
    window.addEventListener('rs:showcase-mode', onSwitchTab);
    return () => window.removeEventListener('rs:showcase-mode', onSwitchTab);
  }, []);

  const persistBest = (nextScore: number) => {
    setBestScore((prev) => {
      const high = Math.max(prev, nextScore);
      if (high > prev) {
        try {
          localStorage.setItem('rs_pacrun_best', String(high));
        } catch {
          // ignore
        }
      }
      return high;
    });
  };

  const startNewGame = (asDemo: boolean) => {
    const m = cloneMaze();
    gameRef.current = {
      grid: m.grid,
      pelletsLeft: m.pellets,
      pac: { x: 6, y: 7, dx: 1, dy: 0, nextDx: 1, nextDy: 0 },
      ghosts: [
        { x: 5, y: 5, dx: 1, dy: 0, color: '#C62828' },
        { x: 6, y: 5, dx: 0, dy: -1, color: '#8B0000' },
        { x: 7, y: 5, dx: -1, dy: 0, color: '#E85D5D' },
      ],
      frightenedTicks: 0,
      tick: 0,
      score: 0,
      status: 'playing',
    };
    setDemoMode(asDemo);
    setGameState('playing');
    setScore(0);
  };

  const steerPac = (dx: number, dy: number) => {
    if (tabRef.current !== 'arcade') setTab('arcade');
    if (demoRef.current) {
      setDemoMode(false);
    }
    if (gameRef.current.status !== 'playing') {
      startNewGame(false);
    }
    gameRef.current.pac.nextDx = dx;
    gameRef.current.pac.nextDy = dy;
  };

  // Keyboard WASD / Arrow steering ONLY when no input/textarea/modal is open
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (tabRef.current !== 'arcade') return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (document.querySelector('[role="dialog"]')) return;

      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') {
        e.preventDefault();
        steerPac(0, -1);
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault();
        steerPac(0, 1);
      } else if (key === 'arrowleft' || key === 'a') {
        e.preventDefault();
        steerPac(-1, 0);
      } else if (key === 'arrowright' || key === 'd') {
        e.preventDefault();
        steerPac(1, 0);
      } else if (key === ' ' && (demoRef.current || gameRef.current.status !== 'playing')) {
        e.preventDefault();
        startNewGame(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Main Pac-Run tick + render loop (strictly pauses when tab != 'arcade' or tab hidden)
  useEffect(() => {
    if (tab !== 'arcade') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const STEP_MS = 165;
    let lastStep = performance.now();
    let rafId = 0;

    const stepGame = () => {
      const g = gameRef.current;
      if (g.status !== 'playing') return;
      g.tick++;

      // Auto-pilot AI direction chooser while in Demo mode
      if (demoRef.current) {
        const valid = DIRS.filter((d) => isWalkable(g.grid, g.pac.x + d.dx, g.pac.y + d.dy));
        const forward = valid.filter((d) => !(d.dx === -g.pac.dx && d.dy === -g.pac.dy));
        const pool = forward.length > 0 ? forward : valid;
        const pelletChoices = pool.filter((d) => {
          const nx = (((g.pac.x + d.dx) % COLS) + COLS) % COLS;
          const ny = g.pac.y + d.dy;
          const cell = g.grid[ny]?.[nx];
          return cell === 0 || cell === 3;
        });
        const pickFrom = pelletChoices.length > 0 ? pelletChoices : pool;
        const chosen = pickFrom[Math.floor(Math.random() * pickFrom.length)];
        if (chosen) {
          g.pac.nextDx = chosen.dx;
          g.pac.nextDy = chosen.dy;
        }
      }

      // Apply next direction if walkable
      if (isWalkable(g.grid, g.pac.x + g.pac.nextDx, g.pac.y + g.pac.nextDy)) {
        g.pac.dx = g.pac.nextDx;
        g.pac.dy = g.pac.nextDy;
      }

      // Move Pac-Man
      if (isWalkable(g.grid, g.pac.x + g.pac.dx, g.pac.y + g.pac.dy)) {
        g.pac.x = (((g.pac.x + g.pac.dx) % COLS) + COLS) % COLS;
        g.pac.y = g.pac.y + g.pac.dy;
      }

      // Check pellet consumption
      const cell = g.grid[g.pac.y][g.pac.x];
      if (cell === 0 || cell === 3) {
        g.grid[g.pac.y][g.pac.x] = 2;
        g.pelletsLeft--;
        g.score += cell === 3 ? 50 : 10;
        if (cell === 3) {
          g.frightenedTicks = 28;
        }
        if (!demoRef.current) {
          setScore(g.score);
          persistBest(g.score);
        } else {
          setScore(g.score);
        }

        if (g.pelletsLeft <= 0) {
          if (demoRef.current) {
            const m = cloneMaze();
            g.grid = m.grid;
            g.pelletsLeft = m.pellets;
          } else {
            g.status = 'won';
            setGameState('won');
            persistBest(g.score + 200);
            return;
          }
        }
      }

      if (g.frightenedTicks > 0) {
        g.frightenedTicks--;
      }

      // Ghost collision check helper
      const resolveCollisions = (): boolean => {
        for (const ghost of g.ghosts) {
          if (ghost.x === g.pac.x && ghost.y === g.pac.y) {
            if (g.frightenedTicks > 0 || godmodeRef.current) {
              ghost.x = 6;
              ghost.y = 5;
              ghost.dx = 0;
              ghost.dy = -1;
              g.score += 100;
              setScore(g.score);
              if (!demoRef.current) persistBest(g.score);
            } else if (!demoRef.current) {
              g.status = 'over';
              setGameState('over');
              return true;
            } else {
              // Demo seamlessly resets position on collision
              g.pac.x = 6;
              g.pac.y = 7;
            }
          }
        }
        return false;
      };

      if (resolveCollisions()) return;

      // Move Ghosts (every tick normally, slower when frightened)
      const moveGhostsThisTick = g.frightenedTicks === 0 || g.tick % 2 === 0;
      if (moveGhostsThisTick) {
        for (const ghost of g.ghosts) {
          const valid = DIRS.filter((d) => isWalkable(g.grid, ghost.x + d.dx, ghost.y + d.dy));
          const nonReverse = valid.filter((d) => !(d.dx === -ghost.dx && d.dy === -ghost.dy));
          const choices = nonReverse.length > 0 ? nonReverse : valid;

          // Bias out of ghost house or loosely toward player
          choices.sort((a, b) => {
            const ax = (((ghost.x + a.dx) % COLS) + COLS) % COLS;
            const ay = ghost.y + a.dy;
            const bx = (((ghost.x + b.dx) % COLS) + COLS) % COLS;
            const by = ghost.y + b.dy;
            const da = Math.abs(ax - g.pac.x) + Math.abs(ay - g.pac.y);
            const db = Math.abs(bx - g.pac.x) + Math.abs(by - g.pac.y);
            const dirMul = g.frightenedTicks > 0 ? -1 : 1;
            return (da - db) * dirMul + (Math.random() - 0.5) * 3.2;
          });

          const chosen = choices[0];
          if (chosen) {
            ghost.dx = chosen.dx;
            ghost.dy = chosen.dy;
            ghost.x = (((ghost.x + chosen.dx) % COLS) + COLS) % COLS;
            ghost.y += chosen.dy;
          }
        }
      }

      resolveCollisions();
    };

    const drawBoard = (now: number) => {
      const g = gameRef.current;
      const cw = canvas.width;
      const ch = canvas.height;
      const cellW = cw / COLS;
      const cellH = ch / ROWS;

      ctx.fillStyle = '#070709';
      ctx.fillRect(0, 0, cw, ch);

      // Subtle scanline background grid
      ctx.strokeStyle = 'rgba(240, 240, 240, 0.03)';
      ctx.lineWidth = 1;
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(c * cellW, 0);
        ctx.lineTo(c * cellW, ch);
        ctx.stroke();
      }

      // Draw walls & pellets
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const val = g.grid[r][c];
          const px = c * cellW;
          const py = r * cellH;
          if (val === 1) {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.14)';
            ctx.fillRect(px + 2, py + 2, cellW - 4, cellH - 4);
            ctx.strokeStyle = godmodeRef.current ? 'rgba(240, 240, 240, 0.52)' : 'rgba(198, 40, 40, 0.62)';
            ctx.lineWidth = 1.25;
            ctx.strokeRect(px + 2, py + 2, cellW - 4, cellH - 4);
          } else if (val === 0) {
            ctx.fillStyle = '#E8E5DE';
            ctx.beginPath();
            ctx.arc(px + cellW / 2, py + cellH / 2, Math.max(1.8, cellW * 0.1), 0, Math.PI * 2);
            ctx.fill();
          } else if (val === 3) {
            const pulse = 0.72 + Math.sin(now * 0.008) * 0.28;
            ctx.fillStyle = `rgba(240, 240, 240, ${pulse})`;
            ctx.save();
            ctx.translate(px + cellW / 2, py + cellH / 2);
            ctx.rotate(Math.PI / 4);
            const sz = cellW * 0.24;
            ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
            ctx.restore();
          }
        }
      }

      // Draw Ghosts ("Escrow Bugs")
      const ghostR = Math.min(cellW, cellH) * 0.34;
      for (const ghost of g.ghosts) {
        const gx = ghost.x * cellW + cellW / 2;
        const gy = ghost.y * cellH + cellH / 2;
        const vulnerable = g.frightenedTicks > 0 || godmodeRef.current;

        ctx.fillStyle = vulnerable
          ? g.frightenedTicks < 8 && Math.floor(now / 120) % 2 === 0
            ? '#A50000'
            : '#E8E5DE'
          : ghost.color;

        ctx.beginPath();
        ctx.arc(gx, gy - 1, ghostR, Math.PI, 0);
        ctx.lineTo(gx + ghostR, gy + ghostR);
        ctx.lineTo(gx + ghostR * 0.35, gy + ghostR * 0.62);
        ctx.lineTo(gx, gy + ghostR);
        ctx.lineTo(gx - ghostR * 0.35, gy + ghostR * 0.62);
        ctx.lineTo(gx - ghostR, gy + ghostR);
        ctx.closePath();
        ctx.fill();

        // Eyes
        ctx.fillStyle = vulnerable ? '#080808' : '#F0F0F0';
        ctx.fillRect(gx - ghostR * 0.42, gy - ghostR * 0.28, 2.5, 2.5);
        ctx.fillRect(gx + ghostR * 0.18, gy - ghostR * 0.28, 2.5, 2.5);
      }

      // Draw Pac-Man ("RS Core")
      const px = g.pac.x * cellW + cellW / 2;
      const py = g.pac.y * cellH + cellH / 2;
      const pacR = Math.min(cellW, cellH) * 0.38;
      const mouth = 0.16 + Math.abs(Math.sin(now * 0.014)) * 0.36;
      const angle = Math.atan2(g.pac.dy, g.pac.dx);

      ctx.fillStyle = godmodeRef.current ? '#FF3B30' : '#F0F0F0';
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.arc(px, py, pacR, angle + mouth, angle + Math.PI * 2 - mouth);
      ctx.closePath();
      ctx.fill();
    };

    const loop = (now: number) => {
      rafId = window.requestAnimationFrame(loop);
      if (document.visibilityState !== 'visible') return;
      if (now - lastStep >= STEP_MS) {
        lastStep = now;
        stepGame();
      }
      drawBoard(now);
    };

    rafId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(rafId);
  }, [tab]);

  // Dynamic simulated Core telemetry by profile
  const coreMetrics = useMemo(() => {
    if (loadProfile === 'idle') {
      return {
        tps: '60.0 TPS',
        tick: '0.00 ms',
        sql: '0.4 ms',
        peak: 42,
        path: 'M 0 100 Q 45 96, 95 92 T 180 86 T 255 88 T 320 84',
        area: 'M 0 100 Q 45 96, 95 92 T 180 86 T 255 88 T 320 84 L 320 110 L 0 110 Z',
        cx: 180,
        cy: 86,
      };
    }
    if (loadProfile === '256p') {
      return {
        tps: '59.8 TPS',
        tick: '0.07 ms',
        sql: '1.8 ms',
        peak: 97,
        path: 'M 0 88 Q 35 66, 70 48 T 135 20 T 195 36 T 260 18 T 320 12',
        area: 'M 0 88 Q 35 66, 70 48 T 135 20 T 195 36 T 260 18 T 320 12 L 320 110 L 0 110 Z',
        cx: 260,
        cy: 18,
      };
    }
    return {
      tps: '60.0 TPS',
      tick: '0.04 ms',
      sql: '1.1 ms',
      peak: 91,
      path: 'M 0 98 Q 35 88, 60 72 T 115 44 T 155 26 T 205 52 T 255 32 T 320 16',
      area: 'M 0 98 Q 35 88, 60 72 T 115 44 T 155 26 T 205 52 T 255 32 T 320 16 L 320 110 L 0 110 Z',
      cx: 155,
      cy: 26,
    };
  }, [loadProfile]);

  const runInlineCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inlineInput.trim();
    if (!raw) return;
    setInlineInput('');
    const cmd = raw.toLowerCase();

    if (cmd === 'clear') {
      setInlineLogs([]);
      return;
    }
    if (cmd === 'help') {
      setInlineLogs((prev) => [
        ...prev.slice(-4),
        '> help: pacman | godmode | noclip | resmon | status | clear',
      ]);
      return;
    }
    if (cmd === 'pacman' || cmd === 'arcade') {
      setTab('arcade');
      startNewGame(false);
      return;
    }
    if (cmd === 'godmode' || cmd === 'matrix' || cmd === 'noclip') {
      onTriggerOverdrive?.();
      setInlineLogs((prev) => [
        ...prev.slice(-4),
        `> ${cmd.toUpperCase()} ENABLED · 0.00ms overdrive`,
      ]);
      return;
    }
    if (cmd === 'resmon') {
      setInlineLogs((prev) => [
        ...prev.slice(-4),
        '> [rs_core] 0.01ms | [ox_bridge] 0.02ms | [escrow] 0.00ms',
      ]);
      return;
    }

    onOpenFullConsole?.();
  };

  return (
    <div className="device-mockup-chassis">
      {/* Top Bar + Segmented Mode Switcher */}
      <div className="device-top-bar">
        <div className="device-user-info">
          <img src="/assets/rslogo.jpg" alt="Restricted Core" className="device-avatar" />
          <div className="device-user-text">
            <span className="dut-greeting">Restricted Core</span>
            <span className="dut-status">
              <span className="dut-dot" />
              {godmode ? ui.arcade.godmode : t.home.telemetry.statusVersion}
            </span>
          </div>
        </div>

        <div className="device-mode-tabs" role="tablist" aria-label={t.home.telemetry.ariaLabel}>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'arcade'}
            className={`dmt-btn ${tab === 'arcade' ? 'is-active' : ''}`}
            onClick={() => setTab('arcade')}
          >
            {ui.tabs.arcade}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'core'}
            className={`dmt-btn ${tab === 'core' ? 'is-active' : ''}`}
            onClick={() => setTab('core')}
          >
            {ui.tabs.core}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'f8'}
            className={`dmt-btn ${tab === 'f8' ? 'is-active' : ''}`}
            onClick={() => setTab('f8')}
          >
            {ui.tabs.console}
          </button>
        </div>
      </div>

      {/* MODE 1: TRIADIC NOIR PAC-MAN ("PAC-RUN") */}
      {tab === 'arcade' && (
        <div className="arcade-shell">
          <div className="arcade-hud-row">
            <span className="arcade-title">◆ {ui.arcade.title}</span>
            <div className="arcade-scores">
              <span>
                {ui.arcade.score}: <strong>{score}</strong>
              </span>
              <span>
                {ui.arcade.best}: <strong>{bestScore}</strong>
              </span>
            </div>
          </div>

          <div
            className="arcade-canvas-frame"
            onClick={() => {
              if (demoMode || gameState !== 'playing') startNewGame(false);
            }}
          >
            <canvas
              ref={canvasRef}
              width={312}
              height={220}
              className="arcade-canvas"
              aria-label={ui.arcade.title}
            />

            {demoMode && gameState === 'playing' && (
              <div className="arcade-overlay-pill">
                <span className="arcade-demo-badge">{ui.arcade.autoDemo}</span>
                <button
                  type="button"
                  className="arcade-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame(false);
                  }}
                >
                  ▶ {ui.arcade.playBtn}
                </button>
              </div>
            )}

            {gameState !== 'playing' && (
              <div className="arcade-state-overlay">
                <strong>{gameState === 'won' ? ui.arcade.victory : ui.arcade.gameOver}</strong>
                <span>
                  {ui.arcade.score}: {score}
                </span>
                <button
                  type="button"
                  className="arcade-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    startNewGame(false);
                  }}
                >
                  ↻ {ui.arcade.retryBtn}
                </button>
              </div>
            )}
          </div>

          <div className="arcade-controls-bar">
            <span className="arcade-hint">{ui.arcade.controls}</span>
            <div className="arcade-dpad" aria-label={ui.arcade.resumeHint}>
              <button type="button" onClick={() => steerPac(-1, 0)} aria-label="Left">
                ◀
              </button>
              <button type="button" onClick={() => steerPac(0, -1)} aria-label="Up">
                ▲
              </button>
              <button type="button" onClick={() => steerPac(0, 1)} aria-label="Down">
                ▼
              </button>
              <button type="button" onClick={() => steerPac(1, 0)} aria-label="Right">
                ▶
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: INTERACTIVE RESTRICTED CORE TELEMETRY */}
      {tab === 'core' && (
        <>
          <div className="device-server-selector">
            <span className="dss-name">◆ Saint Roleplay — Istanbul Engine</span>
            <span className="dss-tag">{coreMetrics.tps}</span>
          </div>

          <div className="core-load-pills" role="group" aria-label={t.home.telemetry.capacityTitle}>
            <button
              type="button"
              className={`clp-btn ${loadProfile === 'idle' ? 'is-active' : ''}`}
              onClick={() => setLoadProfile('idle')}
            >
              {ui.core.idle}
            </button>
            <button
              type="button"
              className={`clp-btn ${loadProfile === '128p' ? 'is-active' : ''}`}
              onClick={() => setLoadProfile('128p')}
            >
              {ui.core.load128}
            </button>
            <button
              type="button"
              className={`clp-btn ${loadProfile === '256p' ? 'is-active' : ''}`}
              onClick={() => setLoadProfile('256p')}
            >
              {ui.core.stress256}
            </button>
          </div>

          <div className="device-metrics-strip">
            <div className="dms-col">
              <span className="dms-v">{coreMetrics.tick}</span>
              <span className="dms-l">{t.home.telemetry.tick}</span>
            </div>
            <span className="dms-sep" aria-hidden="true" />
            <div className="dms-col">
              <span className="dms-v">{coreMetrics.sql}</span>
              <span className="dms-l">{t.home.telemetry.sql}</span>
            </div>
            <span className="dms-sep" aria-hidden="true" />
            <div className="dms-col">
              <span className="dms-v">{formatPercent(0)}</span>
              <span className="dms-l">{t.home.telemetry.escrow}</span>
            </div>
          </div>

          <div className="device-capacity-card">
            <div className="dcc-head">
              <div>
                <span className="dcc-title">{t.home.telemetry.capacityTitle}</span>
                <span className="dcc-sub">{t.home.telemetry.capacitySub}</span>
              </div>
              <span className="dcc-apex-badge">{formatPercent(coreMetrics.peak)} · 60 FPS</span>
            </div>

            <div className="dcc-chart-container">
              <svg viewBox="0 0 320 110" preserveAspectRatio="none" className="capacity-curve-svg">
                <defs>
                  <linearGradient id="crimsonPeakFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#9B1111" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#080808" stopOpacity="0.05" />
                  </linearGradient>
                </defs>
                <path d={coreMetrics.area} fill="url(#crimsonPeakFill)" />
                <path
                  d={coreMetrics.path}
                  fill="none"
                  stroke="#E8E5DE"
                  strokeWidth="1.8"
                  opacity="0.88"
                />
                <circle
                  cx={coreMetrics.cx}
                  cy={coreMetrics.cy}
                  r="3.5"
                  fill="#C83232"
                  stroke="#E8E5DE"
                  strokeWidth="1.5"
                />
              </svg>
            </div>

            <div className="dcc-footer">
              <span>{t.home.telemetry.capacityFooter}</span>
              <Link
                href="/status"
                style={{
                  color: '#F0F0F0',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  fontWeight: 700,
                }}
              >
                {t.home.telemetry.statusLink}
              </Link>
            </div>
          </div>
        </>
      )}

      {/* MODE 3: MINI IN-CARD F8 TERMINAL */}
      {tab === 'f8' && (
        <div className="mini-f8-shell">
          <div className="mini-f8-log" role="log" aria-live="polite">
            {inlineLogs.map((line, i) => (
              <div key={i} className="mini-f8-line">
                {line}
              </div>
            ))}
          </div>

          <form onSubmit={runInlineCommand} className="mini-f8-form">
            <span className="mini-f8-prompt">rs&gt;</span>
            <input
              type="text"
              value={inlineInput}
              onChange={(e) => setInlineInput(e.target.value)}
              placeholder="help | pacman | godmode"
              className="mini-f8-input"
              aria-label="F8 console input"
            />
          </form>

          <button
            type="button"
            className="mini-f8-expand-btn"
            onClick={() => onOpenFullConsole?.()}
          >
            {ui.f8.openFull} ↗
          </button>
        </div>
      )}
    </div>
  );
}
