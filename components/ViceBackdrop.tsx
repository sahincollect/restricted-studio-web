import React from 'react';

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
 * Generates a single compound SVG path for a slender coconut palm trunk,
 * coconut cluster, arched fronds, and tapering gravity-draped leaflets.
 * Uses pure deterministic math so SSR and hydration match byte-for-byte.
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

  // Tapered curved trunk silhouette
  const halfBase = baseWidth * 0.5;
  const halfCrown = crownWidth * 0.5;
  parts.push(
    `M ${r(baseX - halfBase)} ${r(baseY)} ` +
      `C ${r(ctrl1X - halfBase * 0.72)} ${r(ctrl1Y)}, ${r(ctrl2X - halfCrown * 1.15)} ${r(ctrl2Y)}, ${r(crownX - halfCrown)} ${r(crownY)} ` +
      `L ${r(crownX + halfCrown)} ${r(crownY + 1)} ` +
      `C ${r(ctrl2X + halfCrown * 1.15)} ${r(ctrl2Y + 3)}, ${r(ctrl1X + halfBase * 0.72)} ${r(ctrl1Y + 4)}, ${r(baseX + halfBase)} ${r(baseY)} Z`
  );

  // Subtle coconut cluster tucked beneath crown neck
  parts.push(
    `M ${r(crownX - 5)} ${r(crownY + 5)} a 4 4.5 0 1 0 8 0 a 4 4.5 0 1 0 -8 0`,
    `M ${r(crownX + 1)} ${r(crownY + 6)} a 3.8 4.2 0 1 0 7.6 0 a 3.8 4.2 0 1 0 -7.6 0`
  );

  // Arched rachis + pinnate drooping leaflets for each frond
  for (const frond of fronds) {
    const { endX, endY, ctrlX, ctrlY, leafLen, count, droopDir } = frond;

    // Tapered central frond spine
    parts.push(
      `M ${r(crownX - 1.4)} ${r(crownY - 1.2)} ` +
        `Q ${r(ctrlX)} ${r(ctrlY - 2.6)}, ${r(endX)} ${r(endY)} ` +
        `Q ${r(ctrlX)} ${r(ctrlY + 1.4)}, ${r(crownX + 1.4)} ${r(crownY + 1.2)} Z`
    );

    const dx = endX - crownX;
    const horizSign = dx >= 0 ? 1 : -1;

    for (let i = 1; i <= count; i++) {
      const t = 0.1 + (i / (count + 0.6)) * 0.86;
      const omt = 1 - t;

      // Quadratic Bezier point B(t)
      const px = omt * omt * crownX + 2 * omt * t * ctrlX + t * t * endX;
      const py = omt * omt * crownY + 2 * omt * t * ctrlY + t * t * endY;

      // Envelope: leaflets peak near middle of frond and taper near tip & crown
      const envelope = Math.sin(Math.PI * Math.min(0.96, Math.max(0.14, t)));
      const len = leafLen * (0.42 + 0.8 * envelope);
      const bladeW = 2.8 + 1.9 * envelope;

      // Downward-draping leaflet curved gently in frond sweep direction
      const tipX = px + horizSign * len * 0.4 + droopDir * len * 0.14;
      const tipY = py + len * 0.96;
      const midCtrlX = px + horizSign * len * 0.3 + droopDir * len * 0.1;
      const midCtrlY = py + len * 0.35;

      parts.push(
        `M ${r(px - bladeW * 0.55)} ${r(py)} ` +
          `Q ${r(midCtrlX - bladeW * 0.45)} ${r(midCtrlY)}, ${r(tipX)} ${r(tipY)} ` +
          `Q ${r(midCtrlX + bladeW * 0.6)} ${r(midCtrlY)}, ${r(px + bladeW * 0.55)} ${r(py)} Z`
      );
    }
  }

  return parts.join(' ');
}

export const HERO_LEFT_PALM_PATH = buildPalmSilhouettePath({
  baseX: 62,
  baseY: 360,
  baseWidth: 16,
  ctrl1X: 78,
  ctrl1Y: 270,
  ctrl2X: 112,
  ctrl2Y: 184,
  crownX: 142,
  crownY: 122,
  crownWidth: 6.5,
  fronds: [
    { endX: 46, endY: 74, ctrlX: 98, ctrlY: 66, leafLen: 34, count: 10, droopDir: -0.6 },
    { endX: 28, endY: 126, ctrlX: 84, ctrlY: 96, leafLen: 38, count: 11, droopDir: -0.8 },
    { endX: 42, endY: 186, ctrlX: 92, ctrlY: 132, leafLen: 32, count: 9, droopDir: -0.5 },
    { endX: 114, endY: 36, ctrlX: 116, ctrlY: 74, leafLen: 28, count: 8, droopDir: -0.2 },
    { endX: 188, endY: 34, ctrlX: 162, ctrlY: 68, leafLen: 27, count: 8, droopDir: 0.25 },
    { endX: 244, endY: 74, ctrlX: 196, ctrlY: 64, leafLen: 36, count: 10, droopDir: 0.55 },
    { endX: 256, endY: 134, ctrlX: 204, ctrlY: 98, leafLen: 38, count: 11, droopDir: 0.7 },
    { endX: 232, endY: 192, ctrlX: 188, ctrlY: 136, leafLen: 31, count: 9, droopDir: 0.45 },
    { endX: 148, endY: 202, ctrlX: 152, ctrlY: 154, leafLen: 26, count: 7, droopDir: 0.1 },
  ],
});

export const HERO_RIGHT_PALM_PATH = buildPalmSilhouettePath({
  baseX: 258,
  baseY: 360,
  baseWidth: 16,
  ctrl1X: 242,
  ctrl1Y: 266,
  ctrl2X: 206,
  ctrl2Y: 176,
  crownX: 174,
  crownY: 114,
  crownWidth: 6.5,
  fronds: [
    { endX: 272, endY: 66, ctrlX: 218, ctrlY: 60, leafLen: 35, count: 10, droopDir: 0.65 },
    { endX: 292, endY: 122, ctrlX: 236, ctrlY: 90, leafLen: 38, count: 11, droopDir: 0.8 },
    { endX: 276, endY: 184, ctrlX: 224, ctrlY: 126, leafLen: 31, count: 9, droopDir: 0.5 },
    { endX: 202, endY: 30, ctrlX: 198, ctrlY: 68, leafLen: 28, count: 8, droopDir: 0.2 },
    { endX: 128, endY: 30, ctrlX: 154, ctrlY: 64, leafLen: 27, count: 8, droopDir: -0.25 },
    { endX: 70, endY: 70, ctrlX: 118, ctrlY: 60, leafLen: 36, count: 10, droopDir: -0.55 },
    { endX: 56, endY: 130, ctrlX: 108, ctrlY: 94, leafLen: 38, count: 11, droopDir: -0.7 },
    { endX: 80, endY: 188, ctrlX: 126, ctrlY: 132, leafLen: 31, count: 9, droopDir: -0.45 },
    { endX: 168, endY: 196, ctrlX: 164, ctrlY: 150, leafLen: 26, count: 7, droopDir: -0.1 },
  ],
});

const LEFT_TALL_PALM_PATH = buildPalmSilhouettePath({
  baseX: 46,
  baseY: 680,
  baseWidth: 22,
  ctrl1X: 56,
  ctrl1Y: 500,
  ctrl2X: 114,
  ctrl2Y: 305,
  crownX: 168,
  crownY: 156,
  crownWidth: 8,
  fronds: [
    { endX: 44, endY: 94, ctrlX: 112, ctrlY: 88, leafLen: 44, count: 11, droopDir: -0.65 },
    { endX: 16, endY: 162, ctrlX: 88, ctrlY: 122, leafLen: 48, count: 12, droopDir: -0.85 },
    { endX: 34, endY: 238, ctrlX: 98, ctrlY: 168, leafLen: 40, count: 10, droopDir: -0.55 },
    { endX: 126, endY: 42, ctrlX: 134, ctrlY: 94, leafLen: 34, count: 9, droopDir: -0.2 },
    { endX: 218, endY: 44, ctrlX: 188, ctrlY: 90, leafLen: 34, count: 9, droopDir: 0.25 },
    { endX: 296, endY: 96, ctrlX: 232, ctrlY: 84, leafLen: 46, count: 12, droopDir: 0.65 },
    { endX: 314, endY: 172, ctrlX: 244, ctrlY: 128, leafLen: 48, count: 12, droopDir: 0.82 },
    { endX: 278, endY: 248, ctrlX: 224, ctrlY: 176, leafLen: 38, count: 10, droopDir: 0.5 },
    { endX: 174, endY: 256, ctrlX: 176, ctrlY: 194, leafLen: 32, count: 8, droopDir: 0.1 },
  ],
});

const LEFT_COMPANION_PALM_PATH = buildPalmSilhouettePath({
  baseX: 28,
  baseY: 680,
  baseWidth: 16,
  ctrl1X: 48,
  ctrl1Y: 560,
  ctrl2X: 84,
  ctrl2Y: 455,
  crownX: 118,
  crownY: 368,
  crownWidth: 6,
  fronds: [
    { endX: 24, endY: 326, ctrlX: 72, ctrlY: 318, leafLen: 30, count: 9, droopDir: -0.55 },
    { endX: 14, endY: 388, ctrlX: 60, ctrlY: 350, leafLen: 34, count: 10, droopDir: -0.75 },
    { endX: 98, endY: 288, ctrlX: 100, ctrlY: 322, leafLen: 26, count: 7, droopDir: -0.2 },
    { endX: 178, endY: 298, ctrlX: 146, ctrlY: 316, leafLen: 28, count: 8, droopDir: 0.35 },
    { endX: 220, endY: 352, ctrlX: 174, ctrlY: 332, leafLen: 34, count: 10, droopDir: 0.65 },
    { endX: 214, endY: 416, ctrlX: 170, ctrlY: 368, leafLen: 32, count: 9, droopDir: 0.55 },
  ],
});

const RIGHT_TALL_PALM_PATH = buildPalmSilhouettePath({
  baseX: 354,
  baseY: 680,
  baseWidth: 22,
  ctrl1X: 342,
  ctrl1Y: 492,
  ctrl2X: 282,
  ctrl2Y: 296,
  crownX: 224,
  crownY: 146,
  crownWidth: 8,
  fronds: [
    { endX: 352, endY: 84, ctrlX: 282, ctrlY: 80, leafLen: 45, count: 11, droopDir: 0.65 },
    { endX: 380, endY: 156, ctrlX: 306, ctrlY: 114, leafLen: 48, count: 12, droopDir: 0.85 },
    { endX: 362, endY: 232, ctrlX: 296, ctrlY: 162, leafLen: 40, count: 10, droopDir: 0.55 },
    { endX: 268, endY: 34, ctrlX: 258, ctrlY: 86, leafLen: 34, count: 9, droopDir: 0.2 },
    { endX: 174, endY: 38, ctrlX: 204, ctrlY: 82, leafLen: 34, count: 9, droopDir: -0.25 },
    { endX: 94, endY: 90, ctrlX: 158, ctrlY: 76, leafLen: 46, count: 12, droopDir: -0.65 },
    { endX: 74, endY: 168, ctrlX: 146, ctrlY: 122, leafLen: 48, count: 12, droopDir: -0.82 },
    { endX: 110, endY: 244, ctrlX: 168, ctrlY: 170, leafLen: 38, count: 10, droopDir: -0.5 },
    { endX: 218, endY: 250, ctrlX: 216, ctrlY: 188, leafLen: 32, count: 8, droopDir: -0.1 },
  ],
});

const RIGHT_COMPANION_PALM_PATH = buildPalmSilhouettePath({
  baseX: 372,
  baseY: 680,
  baseWidth: 16,
  ctrl1X: 352,
  ctrl1Y: 562,
  ctrl2X: 316,
  ctrl2Y: 452,
  crownX: 280,
  crownY: 360,
  crownWidth: 6,
  fronds: [
    { endX: 374, endY: 318, ctrlX: 328, ctrlY: 310, leafLen: 30, count: 9, droopDir: 0.55 },
    { endX: 384, endY: 382, ctrlX: 340, ctrlY: 344, leafLen: 34, count: 10, droopDir: 0.75 },
    { endX: 300, endY: 280, ctrlX: 298, ctrlY: 314, leafLen: 26, count: 7, droopDir: 0.2 },
    { endX: 218, endY: 290, ctrlX: 252, ctrlY: 308, leafLen: 28, count: 8, droopDir: -0.35 },
    { endX: 176, endY: 344, ctrlX: 222, ctrlY: 324, leafLen: 34, count: 10, droopDir: -0.65 },
    { endX: 184, endY: 410, ctrlX: 226, ctrlY: 360, leafLen: 32, count: 9, droopDir: -0.55 },
  ],
});

export default function ViceBackdrop() {
  return (
    <div className="vice-backdrop" aria-hidden="true">
      {/* Upper Vice dusk violet-magenta aura & lower sunset coastal horizon wash */}
      <div className="vice-sky-wash" />
      <div className="vice-horizon-glow" />

      {/* Distant dark Art Deco coastal skyline silhouette ridge along bottom horizon */}
      <svg
        className="vice-horizon-ridge"
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
      >
        <path
          d="M 0 120 L 0 88 L 48 88 L 48 64 L 74 64 L 74 78 L 122 78 L 122 52 L 154 52 L 154 70 L 210 70 L 210 86 L 340 86 L 340 72 L 368 62 L 396 72 L 396 88 L 540 88 L 540 74 L 574 74 L 574 60 L 604 60 L 604 82 L 730 82 L 730 70 L 762 70 L 762 88 L 910 88 L 910 64 L 944 54 L 976 64 L 976 82 L 1110 82 L 1110 58 L 1142 58 L 1142 74 L 1245 74 L 1245 50 L 1278 50 L 1278 72 L 1368 72 L 1368 84 L 1440 84 L 1440 120 Z"
          fill="#06020d"
        />
      </svg>

      {/* Left viewport framing palm tree silhouettes */}
      <svg
        className="vice-palm-cluster is-left"
        viewBox="0 0 400 680"
        preserveAspectRatio="xMinYMax meet"
      >
        <g className="vice-palm-sway-a">
          <path d={LEFT_TALL_PALM_PATH} fill="#05020b" />
        </g>
        <g className="vice-palm-sway-b">
          <path d={LEFT_COMPANION_PALM_PATH} fill="#080312" />
        </g>
      </svg>

      {/* Right viewport framing palm tree silhouettes */}
      <svg
        className="vice-palm-cluster is-right"
        viewBox="0 0 400 680"
        preserveAspectRatio="xMaxYMax meet"
      >
        <g className="vice-palm-sway-b">
          <path d={RIGHT_TALL_PALM_PATH} fill="#05020b" />
        </g>
        <g className="vice-palm-sway-a">
          <path d={RIGHT_COMPANION_PALM_PATH} fill="#080312" />
        </g>
      </svg>
    </div>
  );
}
