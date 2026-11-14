export type PixelLoadProfile = 'idle' | '128p' | '256p';

export interface PixelCoreProfile {
  tps: string;
  tick: string;
  sql: string;
  peak: number;
  stepPath: string;
  areaPath: string;
  apexX: number;
  apexY: number;
}

const CHART_HEIGHT = 140;

const PROFILE_SERIES: Record<
  PixelLoadProfile,
  {
    tps: string;
    tick: string;
    sql: string;
    peak: number;
    apexX: number;
    apexY: number;
    points: ReadonlyArray<readonly [number, number]>;
  }
> = {
  idle: {
    tps: '60.0 TPS',
    tick: '0.00 ms',
    sql: '0.4 ms',
    peak: 42,
    apexX: 280,
    apexY: 96,
    points: [
      [0, 122],
      [48, 120],
      [96, 114],
      [144, 112],
      [192, 108],
      [240, 104],
      [280, 96],
      [336, 100],
      [384, 102],
      [432, 98],
      [480, 96],
    ],
  },
  '128p': {
    tps: '60.0 TPS',
    tick: '0.04 ms',
    sql: '1.1 ms',
    peak: 91,
    apexX: 240,
    apexY: 28,
    points: [
      [0, 122],
      [48, 112],
      [96, 88],
      [144, 68],
      [192, 46],
      [240, 28],
      [288, 48],
      [336, 58],
      [384, 38],
      [432, 24],
      [480, 18],
    ],
  },
  '256p': {
    tps: '59.8 TPS',
    tick: '0.07 ms',
    sql: '1.8 ms',
    peak: 97,
    apexX: 384,
    apexY: 18,
    points: [
      [0, 114],
      [48, 86],
      [96, 62],
      [144, 42],
      [192, 26],
      [240, 38],
      [288, 46],
      [336, 28],
      [384, 18],
      [432, 22],
      [480, 14],
    ],
  },
};

export function quantizeGridCoord(coord: number, step: number): number {
  const safeStep = Math.max(1, step);
  return Math.floor(coord / safeStep) * safeStep;
}

export function buildPixelStepPaths(
  points: ReadonlyArray<readonly [number, number]>,
  chartHeight = CHART_HEIGHT
): { stepPath: string; areaPath: string } {
  if (points.length === 0) {
    return { stepPath: '', areaPath: '' };
  }

  const first = points[0];
  const segments = [`M ${first[0]} ${first[1]}`];

  for (let i = 1; i < points.length; i += 1) {
    const [x, y] = points[i];
    segments.push(`H ${x}`, `V ${y}`);
  }

  const last = points[points.length - 1];
  const stepPath = segments.join(' ');
  const areaPath = `${stepPath} L ${last[0]} ${chartHeight} L ${first[0]} ${chartHeight} Z`;

  return { stepPath, areaPath };
}

export function getPixelCoreProfile(profile: PixelLoadProfile): PixelCoreProfile {
  const spec = PROFILE_SERIES[profile];
  const { stepPath, areaPath } = buildPixelStepPaths(spec.points, CHART_HEIGHT);

  return {
    tps: spec.tps,
    tick: spec.tick,
    sql: spec.sql,
    peak: spec.peak,
    apexX: spec.apexX,
    apexY: spec.apexY,
    stepPath,
    areaPath,
  };
}
