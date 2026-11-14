'use client';

import React, { useEffect, useRef } from 'react';

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function rotatePoint(p: Vec3, yaw: number, pitch: number): Vec3 {
  // Rotate around Y (yaw)
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const x1 = p.x * cy - p.z * sy;
  const z1 = p.x * sy + p.z * cy;

  // Rotate around X (pitch)
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const y2 = p.y * cp - z1 * sp;
  const z2 = p.y * sp + z1 * cp;

  return { x: x1, y: y2, z: z2 };
}

/**
 * Pure Canvas2D 3D perspective wireframe monolith & orbital rings
 * tuned to Triadic Noir (#080808 obsidian, #A50000 crimson, #E8E5DE chalk)
 * with zero runtime dependencies and full strict-CSP compatibility.
 */
export default function MonolithStage({ overdrive = false }: { overdrive?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef({ tx: 0, ty: 0, cx: 0, cy: 0, active: false });
  const overdriveRef = useRef(overdrive);
  overdriveRef.current = overdrive;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = parent.clientWidth || 420;
    let height = parent.clientHeight || 520;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = parent.clientWidth || 420;
      height = parent.clientHeight || 520;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
    ro?.observe(parent);

    const onPointerMove = (e: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointerRef.current.tx = Math.max(-1.2, Math.min(1.2, nx));
      pointerRef.current.ty = Math.max(-1.2, Math.min(1.2, ny));
      pointerRef.current.active = true;
    };

    const onPointerLeave = () => {
      pointerRef.current.tx = 0;
      pointerRef.current.ty = 0;
      pointerRef.current.active = false;
    };

    parent.addEventListener('pointermove', onPointerMove, { passive: true });
    parent.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Faceted 3D Wireframe Obelisk + Inner Core Octahedron
    const outerVerts: Vec3[] = [
      { x: 0, y: -1.78, z: 0 },     // 0: apex
      { x: -0.62, y: -1.1, z: 0.48 },  // 1: upper ring
      { x: 0.62, y: -1.1, z: 0.48 },   // 2
      { x: 0.62, y: -1.1, z: -0.48 },  // 3
      { x: -0.62, y: -1.1, z: -0.48 }, // 4
      { x: -0.78, y: 0.85, z: 0.58 },  // 5: base ring
      { x: 0.78, y: 0.85, z: 0.58 },   // 6
      { x: 0.78, y: 0.85, z: -0.58 },  // 7
      { x: -0.78, y: 0.85, z: -0.58 }, // 8
      { x: 0, y: 1.56, z: 0 },      // 9: bottom keel
    ];

    const outerEdges: Array<[number, number, 'crimson' | 'chalk']> = [
      // Apex crown
      [0, 1, 'chalk'], [0, 2, 'crimson'], [0, 3, 'chalk'], [0, 4, 'crimson'],
      // Upper collar
      [1, 2, 'chalk'], [2, 3, 'chalk'], [3, 4, 'chalk'], [4, 1, 'chalk'],
      // Vertical pillars + diagonal structural bracing
      [1, 5, 'chalk'], [2, 6, 'crimson'], [3, 7, 'chalk'], [4, 8, 'crimson'],
      [1, 6, 'crimson'], [2, 7, 'crimson'], [3, 8, 'crimson'], [4, 5, 'crimson'],
      // Base collar
      [5, 6, 'chalk'], [6, 7, 'chalk'], [7, 8, 'chalk'], [8, 5, 'chalk'],
      // Keel
      [9, 5, 'crimson'], [9, 6, 'chalk'], [9, 7, 'crimson'], [9, 8, 'chalk'],
    ];

    const coreVerts: Vec3[] = [
      { x: 0, y: -0.52, z: 0 },
      { x: 0.36, y: -0.05, z: 0 },
      { x: 0, y: -0.05, z: 0.36 },
      { x: -0.36, y: -0.05, z: 0 },
      { x: 0, y: -0.05, z: -0.36 },
      { x: 0, y: 0.44, z: 0 },
    ];

    const coreEdges: Array<[number, number]> = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [1, 2], [2, 3], [3, 4], [4, 1],
      [5, 1], [5, 2], [5, 3], [5, 4],
    ];

    // Two orbital gyroscope rings
    const ringCount = 28;
    const makeRing = (radius: number, tilt: number): Vec3[] =>
      Array.from({ length: ringCount }, (_, i) => {
        const a = (i / ringCount) * Math.PI * 2;
        const x = Math.cos(a) * radius;
        const y = Math.sin(a) * radius * Math.sin(tilt);
        const z = Math.sin(a) * radius * Math.cos(tilt);
        return { x, y, z };
      });

    const ringA = makeRing(1.38, 0.38);
    const ringB = makeRing(1.62, -0.45);

    let time = 0;
    let rafId = 0;
    let isVisible = document.visibilityState === 'visible';
    const onVis = () => {
      isVisible = document.visibilityState === 'visible';
    };
    document.addEventListener('visibilitychange', onVis);

    const draw = () => {
      rafId = window.requestAnimationFrame(draw);
      if (!isVisible) return;

      const p = pointerRef.current;
      p.cx += (p.tx - p.cx) * 0.08;
      p.cy += (p.ty - p.cy) * 0.08;

      if (!reducedMotion) {
        time += overdriveRef.current ? 0.016 : 0.0075;
      }

      ctx.clearRect(0, 0, width, height);

      // Subtle dynamic crimson cursor halo behind scene
      const haloX = p.active ? width * (0.5 + p.cx * 0.35) : width * 0.5;
      const haloY = p.active ? height * (0.48 + p.cy * 0.35) : height * 0.34;
      const halo = ctx.createRadialGradient(haloX, haloY, 12, haloX, haloY, Math.max(width, height) * 0.55);
      halo.addColorStop(0, overdriveRef.current ? 'rgba(200, 30, 30, 0.34)' : 'rgba(165, 0, 0, 0.22)');
      halo.addColorStop(0.55, 'rgba(92, 10, 10, 0.08)');
      halo.addColorStop(1, 'rgba(8, 8, 8, 0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);

      // Perspective topographic floor grid at lower 34% of stage
      const horizonY = height * 0.68;
      const vpX = width * 0.5 + p.cx * 26;
      const gridAlpha = overdriveRef.current ? 0.26 : 0.14;
      ctx.lineWidth = 1;

      for (let i = -7; i <= 7; i++) {
        const bottomX = width * 0.5 + i * (width * 0.14) - p.cx * 42;
        const topX = vpX + i * (width * 0.025);
        ctx.strokeStyle = i === 0 ? `rgba(198, 40, 40, ${gridAlpha * 2.1})` : `rgba(232, 229, 222, ${gridAlpha * 0.7})`;
        ctx.beginPath();
        ctx.moveTo(topX, horizonY);
        ctx.lineTo(bottomX, height + 6);
        ctx.stroke();
      }

      const depthSteps = 7;
      for (let s = 0; s <= depthSteps; s++) {
        const t = Math.pow(s / depthSteps, 1.8);
        const y = horizonY + t * (height - horizonY);
        ctx.strokeStyle = s === 0 ? 'rgba(232, 229, 222, 0.24)' : `rgba(165, 0, 0, ${0.1 + t * 0.16})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Project & draw 3D Wireframe Monolith framed behind & around chassis
      const fov = Math.min(width, height) * 1.18;
      const camZ = 4.4;
      const originX = width * 0.5 + p.cx * 16;
      const originY = height * 0.47 + p.cy * 12;

      const project = (pt: Vec3) => {
        const z = camZ - pt.z;
        const scale = fov / Math.max(1.2, z);
        return {
          x: originX + pt.x * scale,
          y: originY + pt.y * scale,
          z: pt.z,
        };
      };

      const yaw = time + p.cx * 0.65;
      const pitch = 0.18 + Math.sin(time * 0.7) * 0.06 - p.cy * 0.42;

      const projOuter = outerVerts.map((v) => project(rotatePoint(v, yaw, pitch)));

      // Draw outer monolith edges
      for (const [aIdx, bIdx, tone] of outerEdges) {
        const a = projOuter[aIdx];
        const b = projOuter[bIdx];
        const depth = Math.max(0.26, Math.min(0.98, 0.58 + (a.z + b.z) * 0.26));
        ctx.lineWidth = tone === 'crimson' ? 1.5 : 1.2;
        ctx.strokeStyle =
          tone === 'crimson'
            ? `rgba(214, 44, 44, ${(depth * (overdriveRef.current ? 0.96 : 0.78)).toFixed(2)})`
            : `rgba(232, 229, 222, ${(depth * 0.62).toFixed(2)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw inner crimson diamond core (counter-rotating)
      const projCore = coreVerts.map((v) => project(rotatePoint(v, -yaw * 1.4, -pitch * 0.6)));
      ctx.lineWidth = 1.35;
      for (const [aIdx, bIdx] of coreEdges) {
        const a = projCore[aIdx];
        const b = projCore[bIdx];
        ctx.strokeStyle = overdriveRef.current
          ? 'rgba(240, 240, 240, 0.86)'
          : 'rgba(210, 40, 40, 0.78)';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Draw two orbital rings
      const drawRing = (pts: Vec3[], spin: number, stroke: string) => {
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        for (let i = 0; i <= pts.length; i++) {
          const p3 = rotatePoint(pts[i % pts.length], yaw * spin, pitch + spin * 0.2);
          const p2 = project(p3);
          if (i === 0) ctx.moveTo(p2.x, p2.y);
          else ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
      };

      drawRing(ringA, 1.15, 'rgba(232, 229, 222, 0.34)');
      drawRing(ringB, -0.85, 'rgba(200, 32, 32, 0.44)');

      // Crisp chalk vertices at apex & corners
      for (let i = 0; i < projOuter.length; i++) {
        const pt = projOuter[i];
        ctx.fillStyle = i === 0 || i === 9 ? '#E8E5DE' : 'rgba(200, 44, 44, 0.85)';
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, i === 0 || i === 9 ? 2.4 : 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      window.cancelAnimationFrame(rafId);
      ro?.disconnect();
      parent.removeEventListener('pointermove', onPointerMove);
      parent.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="monolith-stage-canvas"
      aria-hidden="true"
    />
  );
}
