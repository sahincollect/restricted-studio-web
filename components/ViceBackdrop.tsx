'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface FrondSpec {
  endX: number;
  endY: number;
  ctrlX: number;
  ctrlY: number;
  leafLen: number;
  count: number;
  droopDir: number;
}

/**
 * Generates a natural, detailed botanical coconut palm silhouette path:
 * curved segmented trunk, dense crown nexus, sweeping curved rachis ribs,
 * and overlapping wind-feathered pinnae leaflets.
 * Pure deterministic math ensures byte-identical SSR and client hydration.
 */
export function buildPalmSilhouettePath(opts: {
  baseX: number;
  baseY: number;
  baseWidth: number;
  ctrl1X: number;
  ctrl1Y: number;
  ctrl2X: number;
  ctrl2Y: number;
  crownX: number;
  crownY: number;
  crownWidth: number;
  fronds: FrondSpec[];
}): string {
  const {
    baseX,
    baseY,
    baseWidth,
    ctrl1X,
    ctrl1Y,
    ctrl2X,
    ctrl2Y,
    crownX,
    crownY,
    crownWidth,
    fronds,
  } = opts;

  const r = (n: number) => n.toFixed(1);
  const parts: string[] = [];

  // Tapered organic curved trunk silhouette
  const halfBase = baseWidth * 0.5;
  const halfCrown = crownWidth * 0.5;
  parts.push(
    `M ${r(baseX - halfBase)} ${r(baseY)} ` +
      `C ${r(ctrl1X - halfBase * 0.7)} ${r(ctrl1Y)}, ${r(ctrl2X - halfCrown * 1.12)} ${r(ctrl2Y)}, ${r(crownX - halfCrown)} ${r(crownY)} ` +
      `L ${r(crownX + halfCrown)} ${r(crownY + 1)} ` +
      `C ${r(ctrl2X + halfCrown * 1.12)} ${r(ctrl2Y + 3)}, ${r(ctrl1X + halfBase * 0.7)} ${r(ctrl1Y + 4)}, ${r(baseX + halfBase)} ${r(baseY)} Z`
  );

  // Dense crown heart & coconut clusters
  parts.push(
    `M ${r(crownX - 8)} ${r(crownY + 3)} a 8 6.5 0 1 0 16 0 a 8 6.5 0 1 0 -16 0`,
    `M ${r(crownX - 5)} ${r(crownY + 8)} a 4.8 5 0 1 0 9.6 0 a 4.8 5 0 1 0 -9.6 0`,
    `M ${r(crownX + 1.5)} ${r(crownY + 8.5)} a 4.4 4.8 0 1 0 8.8 0 a 4.4 4.8 0 1 0 -8.8 0`
  );

  for (const frond of fronds) {
    const { endX, endY, ctrlX, ctrlY, leafLen, count, droopDir } = frond;

    // Graceful arched frond spine (rachis)
    parts.push(
      `M ${r(crownX - 1.8)} ${r(crownY - 1.5)} ` +
        `Q ${r(ctrlX)} ${r(ctrlY - 3.2)}, ${r(endX)} ${r(endY)} ` +
        `Q ${r(ctrlX)} ${r(ctrlY + 1.5)}, ${r(crownX + 1.8)} ${r(crownY + 1.5)} Z`
    );

    const dx = endX - crownX;
    const dy = endY - crownY;
    const horizSign = dx >= 0 ? 1 : -1;

    for (let i = 1; i <= count; i++) {
      const t = 0.07 + (i / (count + 0.45)) * 0.89;
      const omt = 1 - t;

      const px = omt * omt * crownX + 2 * omt * t * ctrlX + t * t * endX;
      const py = omt * omt * crownY + 2 * omt * t * ctrlY + t * t * endY;

      // Natural botanical leaflet profile: full in midsection, tapered at base & tip
      const envelope = Math.pow(Math.sin(Math.PI * Math.min(0.97, Math.max(0.08, t))), 0.82);
      const len = leafLen * (0.34 + 0.84 * envelope);
      const bladeW = 2.4 + 2.1 * envelope;

      // Primary lower gravity-draped pinna blade
      const sweepX = horizSign * len * (0.32 + t * 0.16) + droopDir * len * 0.16;
      const sweepY = len * (0.88 + t * 0.14);
      const tipX = px + sweepX;
      const tipY = py + sweepY;
      const midX = px + sweepX * 0.56;
      const midY = py + sweepY * 0.36;

      parts.push(
        `M ${r(px - bladeW * 0.55)} ${r(py)} ` +
          `Q ${r(midX - bladeW * 0.48)} ${r(midY)}, ${r(tipX)} ${r(tipY)} ` +
          `Q ${r(midX + bladeW * 0.58)} ${r(midY)}, ${r(px + bladeW * 0.55)} ${r(py)} Z`
      );

      // Upper counter-pinna feathering for lush, realistic 3D palm volume
      if (i % 2 === 0 && t < 0.84) {
        const upLen = len * 0.52;
        const upW = bladeW * 0.72;
        const upTipX = px + horizSign * upLen * 0.58;
        const upTipY = py - upLen * 0.48 + (dy < 0 ? -upLen * 0.18 : upLen * 0.12);
        const upMidX = px + horizSign * upLen * 0.3;
        const upMidY = py - upLen * 0.28;

        parts.push(
          `M ${r(px - upW * 0.45)} ${r(py)} ` +
            `Q ${r(upMidX)} ${r(upMidY - upW * 0.4)}, ${r(upTipX)} ${r(upTipY)} ` +
            `Q ${r(upMidX + upW * 0.3)} ${r(upMidY + upW * 0.3)}, ${r(px + upW * 0.45)} ${r(py)} Z`
        );
      }
    }
  }

  return parts.join(' ');
}

export const HERO_LEFT_PALM_PATH = buildPalmSilhouettePath({
  baseX: 54,
  baseY: 360,
  baseWidth: 18,
  ctrl1X: 74,
  ctrl1Y: 266,
  ctrl2X: 112,
  ctrl2Y: 180,
  crownX: 146,
  crownY: 118,
  crownWidth: 7.5,
  fronds: [
    { endX: 34, endY: 64, ctrlX: 94, ctrlY: 56, leafLen: 38, count: 14, droopDir: -0.65 },
    { endX: 18, endY: 118, ctrlX: 78, ctrlY: 84, leafLen: 42, count: 15, droopDir: -0.85 },
    { endX: 28, endY: 176, ctrlX: 84, ctrlY: 122, leafLen: 36, count: 13, droopDir: -0.6 },
    { endX: 64, endY: 212, ctrlX: 104, ctrlY: 152, leafLen: 30, count: 11, droopDir: -0.4 },
    { endX: 102, endY: 28, ctrlX: 114, ctrlY: 66, leafLen: 32, count: 12, droopDir: -0.25 },
    { endX: 162, endY: 22, ctrlX: 152, ctrlY: 60, leafLen: 30, count: 12, droopDir: 0.15 },
    { endX: 218, endY: 38, ctrlX: 182, ctrlY: 58, leafLen: 34, count: 13, droopDir: 0.4 },
    { endX: 262, endY: 78, ctrlX: 204, ctrlY: 64, leafLen: 40, count: 15, droopDir: 0.65 },
    { endX: 274, endY: 138, ctrlX: 212, ctrlY: 96, leafLen: 42, count: 15, droopDir: 0.8 },
    { endX: 248, endY: 196, ctrlX: 196, ctrlY: 136, leafLen: 35, count: 13, droopDir: 0.5 },
    { endX: 182, endY: 214, ctrlX: 166, ctrlY: 158, leafLen: 29, count: 10, droopDir: 0.2 },
  ],
});

export const HERO_RIGHT_PALM_PATH = buildPalmSilhouettePath({
  baseX: 266,
  baseY: 360,
  baseWidth: 18,
  ctrl1X: 246,
  ctrl1Y: 264,
  ctrl2X: 208,
  ctrl2Y: 174,
  crownX: 174,
  crownY: 112,
  crownWidth: 7.5,
  fronds: [
    { endX: 286, endY: 58, ctrlX: 226, ctrlY: 52, leafLen: 38, count: 14, droopDir: 0.65 },
    { endX: 302, endY: 114, ctrlX: 242, ctrlY: 80, leafLen: 42, count: 15, droopDir: 0.85 },
    { endX: 292, endY: 172, ctrlX: 236, ctrlY: 118, leafLen: 36, count: 13, droopDir: 0.6 },
    { endX: 254, endY: 208, ctrlX: 214, ctrlY: 148, leafLen: 30, count: 11, droopDir: 0.4 },
    { endX: 218, endY: 24, ctrlX: 206, ctrlY: 62, leafLen: 32, count: 12, droopDir: 0.25 },
    { endX: 158, endY: 18, ctrlX: 168, ctrlY: 56, leafLen: 30, count: 12, droopDir: -0.15 },
    { endX: 102, endY: 34, ctrlX: 138, ctrlY: 54, leafLen: 34, count: 13, droopDir: -0.4 },
    { endX: 58, endY: 74, ctrlX: 116, ctrlY: 60, leafLen: 40, count: 15, droopDir: -0.65 },
    { endX: 46, endY: 134, ctrlX: 108, ctrlY: 92, leafLen: 42, count: 15, droopDir: -0.8 },
    { endX: 72, endY: 192, ctrlX: 124, ctrlY: 132, leafLen: 35, count: 13, droopDir: -0.5 },
    { endX: 138, endY: 210, ctrlX: 154, ctrlY: 154, leafLen: 29, count: 10, droopDir: -0.2 },
  ],
});

const LEFT_TALL_PALM_PATH = buildPalmSilhouettePath({
  baseX: 38,
  baseY: 680,
  baseWidth: 24,
  ctrl1X: 54,
  ctrl1Y: 492,
  ctrl2X: 114,
  ctrl2Y: 298,
  crownX: 172,
  crownY: 148,
  crownWidth: 9,
  fronds: [
    { endX: 36, endY: 82, ctrlX: 108, ctrlY: 76, leafLen: 48, count: 15, droopDir: -0.65 },
    { endX: 8, endY: 152, ctrlX: 84, ctrlY: 112, leafLen: 52, count: 16, droopDir: -0.88 },
    { endX: 24, endY: 228, ctrlX: 94, ctrlY: 158, leafLen: 44, count: 14, droopDir: -0.6 },
    { endX: 74, endY: 268, ctrlX: 124, ctrlY: 194, leafLen: 36, count: 12, droopDir: -0.35 },
    { endX: 116, endY: 32, ctrlX: 132, ctrlY: 82, leafLen: 38, count: 13, droopDir: -0.25 },
    { endX: 186, endY: 24, ctrlX: 176, ctrlY: 76, leafLen: 36, count: 13, droopDir: 0.15 },
    { endX: 256, endY: 44, ctrlX: 212, ctrlY: 74, leafLen: 42, count: 14, droopDir: 0.45 },
    { endX: 312, endY: 92, ctrlX: 242, ctrlY: 80, leafLen: 50, count: 16, droopDir: 0.7 },
    { endX: 332, endY: 166, ctrlX: 252, ctrlY: 122, leafLen: 52, count: 16, droopDir: 0.85 },
    { endX: 296, endY: 242, ctrlX: 232, ctrlY: 170, leafLen: 44, count: 14, droopDir: 0.55 },
    { endX: 214, endY: 268, ctrlX: 194, ctrlY: 198, leafLen: 36, count: 12, droopDir: 0.2 },
  ],
});

const LEFT_COMPANION_PALM_PATH = buildPalmSilhouettePath({
  baseX: 18,
  baseY: 680,
  baseWidth: 18,
  ctrl1X: 42,
  ctrl1Y: 556,
  ctrl2X: 82,
  ctrl2Y: 448,
  crownX: 122,
  crownY: 356,
  crownWidth: 7,
  fronds: [
    { endX: 18, endY: 308, ctrlX: 72, ctrlY: 300, leafLen: 36, count: 13, droopDir: -0.6 },
    { endX: 6, endY: 374, ctrlX: 58, ctrlY: 336, leafLen: 40, count: 14, droopDir: -0.8 },
    { endX: 32, endY: 432, ctrlX: 74, ctrlY: 374, leafLen: 32, count: 11, droopDir: -0.5 },
    { endX: 94, endY: 268, ctrlX: 102, ctrlY: 308, leafLen: 30, count: 11, droopDir: -0.2 },
    { endX: 168, endY: 274, ctrlX: 142, ctrlY: 304, leafLen: 32, count: 12, droopDir: 0.3 },
    { endX: 226, endY: 318, ctrlX: 178, ctrlY: 314, leafLen: 38, count: 14, droopDir: 0.65 },
    { endX: 236, endY: 386, ctrlX: 182, ctrlY: 348, leafLen: 38, count: 14, droopDir: 0.75 },
    { endX: 198, endY: 438, ctrlX: 162, ctrlY: 384, leafLen: 32, count: 11, droopDir: 0.45 },
  ],
});

const RIGHT_TALL_PALM_PATH = buildPalmSilhouettePath({
  baseX: 362,
  baseY: 680,
  baseWidth: 24,
  ctrl1X: 346,
  ctrl1Y: 488,
  ctrl2X: 284,
  ctrl2Y: 292,
  crownX: 224,
  crownY: 142,
  crownWidth: 9,
  fronds: [
    { endX: 364, endY: 76, ctrlX: 292, ctrlY: 70, leafLen: 48, count: 15, droopDir: 0.65 },
    { endX: 392, endY: 148, ctrlX: 316, ctrlY: 106, leafLen: 52, count: 16, droopDir: 0.88 },
    { endX: 376, endY: 224, ctrlX: 306, ctrlY: 154, leafLen: 44, count: 14, droopDir: 0.6 },
    { endX: 324, endY: 264, ctrlX: 274, ctrlY: 190, leafLen: 36, count: 12, droopDir: 0.35 },
    { endX: 282, endY: 26, ctrlX: 266, ctrlY: 76, leafLen: 38, count: 13, droopDir: 0.25 },
    { endX: 212, endY: 18, ctrlX: 222, ctrlY: 70, leafLen: 36, count: 13, droopDir: -0.15 },
    { endX: 142, endY: 38, ctrlX: 186, ctrlY: 68, leafLen: 42, count: 14, droopDir: -0.45 },
    { endX: 86, endY: 86, ctrlX: 156, ctrlY: 74, leafLen: 50, count: 16, droopDir: -0.7 },
    { endX: 66, endY: 160, ctrlX: 146, ctrlY: 116, leafLen: 52, count: 16, droopDir: -0.85 },
    { endX: 102, endY: 236, ctrlX: 166, ctrlY: 164, leafLen: 44, count: 14, droopDir: -0.55 },
    { endX: 184, endY: 262, ctrlX: 204, ctrlY: 192, leafLen: 36, count: 12, droopDir: -0.2 },
  ],
});

const RIGHT_COMPANION_PALM_PATH = buildPalmSilhouettePath({
  baseX: 382,
  baseY: 680,
  baseWidth: 18,
  ctrl1X: 358,
  ctrl1Y: 556,
  ctrl2X: 318,
  ctrl2Y: 446,
  crownX: 276,
  crownY: 352,
  crownWidth: 7,
  fronds: [
    { endX: 382, endY: 304, ctrlX: 328, ctrlY: 296, leafLen: 36, count: 13, droopDir: 0.6 },
    { endX: 394, endY: 370, ctrlX: 342, ctrlY: 332, leafLen: 40, count: 14, droopDir: 0.8 },
    { endX: 368, endY: 428, ctrlX: 326, ctrlY: 370, leafLen: 32, count: 11, droopDir: 0.5 },
    { endX: 306, endY: 264, ctrlX: 298, ctrlY: 304, leafLen: 30, count: 11, droopDir: 0.2 },
    { endX: 232, endY: 270, ctrlX: 258, ctrlY: 300, leafLen: 32, count: 12, droopDir: -0.3 },
    { endX: 174, endY: 314, ctrlX: 222, ctrlY: 310, leafLen: 38, count: 14, droopDir: -0.65 },
    { endX: 164, endY: 382, ctrlX: 218, ctrlY: 344, leafLen: 38, count: 14, droopDir: -0.75 },
    { endX: 202, endY: 434, ctrlX: 238, ctrlY: 380, leafLen: 32, count: 11, droopDir: -0.45 },
  ],
});

export default function ViceBackdrop() {
  const pathname = usePathname();
  const isStaticDark = pathname === '/login' || pathname === '/register';

  return (
    <div
      className={`vice-backdrop ${isStaticDark ? 'is-static-dark' : ''}`.trim()}
      aria-hidden="true"
    >
      {/* Dark plum-violet primary canvas with proportional sunset horizon transition */}
      <div className="vice-sky-wash" />
      <div className="vice-horizon-glow" />

      {/* Layered Vice City coastal skyline & distant causeway silhouette along bottom horizon */}
      <svg
        className="vice-horizon-ridge"
        viewBox="0 0 1440 130"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="viceRidgeBackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#420452" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#7256CE" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#420452" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id="viceRidgeFrontGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2D033B" />
            <stop offset="100%" stopColor="#16021E" />
          </linearGradient>
        </defs>
        {/* Distant midground skyline layer */}
        <path
          d="M 0 130 L 0 92 L 62 92 L 62 66 L 96 66 L 96 84 L 164 84 L 164 56 L 202 56 L 202 78 L 284 78 L 284 94 L 420 94 L 420 72 L 456 58 L 492 72 L 492 92 L 640 92 L 640 74 L 682 74 L 682 54 L 718 54 L 718 86 L 860 86 L 860 68 L 902 68 L 902 90 L 1040 90 L 1040 60 L 1076 48 L 1112 60 L 1112 84 L 1220 84 L 1220 58 L 1262 58 L 1262 80 L 1350 80 L 1350 90 L 1440 90 L 1440 130 Z"
          fill="url(#viceRidgeBackGrad)"
        />
        {/* Foreground crisp dark plum Art Deco skyline silhouette */}
        <path
          d="M 0 130 L 0 98 L 48 98 L 48 74 L 74 74 L 74 88 L 122 88 L 122 62 L 154 62 L 154 80 L 210 80 L 210 96 L 340 96 L 340 82 L 368 72 L 396 82 L 396 98 L 540 98 L 540 84 L 574 84 L 574 70 L 604 70 L 604 92 L 730 92 L 730 80 L 762 80 L 762 98 L 910 98 L 910 74 L 944 64 L 976 74 L 976 92 L 1110 92 L 1110 68 L 1142 68 L 1142 84 L 1245 84 L 1245 60 L 1278 60 L 1278 82 L 1368 82 L 1368 94 L 1440 94 L 1440 130 Z"
          fill="url(#viceRidgeFrontGrad)"
        />
      </svg>

      {/* Left viewport framing botanical palm tree silhouettes */}
      <svg
        className="vice-palm-cluster is-left"
        viewBox="0 0 400 680"
        preserveAspectRatio="xMinYMax meet"
      >
        <defs>
          <linearGradient id="vicePalmGradL" x1="15%" y1="0%" x2="55%" y2="100%">
            <stop offset="0%" stopColor="#420452" />
            <stop offset="48%" stopColor="#280334" />
            <stop offset="100%" stopColor="#15021D" />
          </linearGradient>
          <linearGradient id="vicePalmSubL" x1="0%" y1="0%" x2="65%" y2="100%">
            <stop offset="0%" stopColor="#58176E" />
            <stop offset="100%" stopColor="#24022F" />
          </linearGradient>
        </defs>
        <g className="vice-palm-sway-b">
          <path d={LEFT_COMPANION_PALM_PATH} fill="url(#vicePalmSubL)" opacity="0.88" />
        </g>
        <g className="vice-palm-sway-a">
          <path d={LEFT_TALL_PALM_PATH} fill="url(#vicePalmGradL)" />
        </g>
      </svg>

      {/* Right viewport framing botanical palm tree silhouettes */}
      <svg
        className="vice-palm-cluster is-right"
        viewBox="0 0 400 680"
        preserveAspectRatio="xMaxYMax meet"
      >
        <defs>
          <linearGradient id="vicePalmGradR" x1="85%" y1="0%" x2="45%" y2="100%">
            <stop offset="0%" stopColor="#420452" />
            <stop offset="48%" stopColor="#280334" />
            <stop offset="100%" stopColor="#15021D" />
          </linearGradient>
          <linearGradient id="vicePalmSubR" x1="100%" y1="0%" x2="35%" y2="100%">
            <stop offset="0%" stopColor="#58176E" />
            <stop offset="100%" stopColor="#24022F" />
          </linearGradient>
        </defs>
        <g className="vice-palm-sway-a">
          <path d={RIGHT_COMPANION_PALM_PATH} fill="url(#vicePalmSubR)" opacity="0.88" />
        </g>
        <g className="vice-palm-sway-b">
          <path d={RIGHT_TALL_PALM_PATH} fill="url(#vicePalmGradR)" />
        </g>
      </svg>
    </div>
  );
}
