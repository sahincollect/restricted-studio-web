import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPixelStepPaths,
  getPixelCoreProfile,
  quantizeGridCoord,
} from '../lib/pixel-core-telemetry.ts';

describe('pixel-core-telemetry', () => {
  it('builds orthogonal stair-step line and closed area paths with zero bezier curves', () => {
    const { stepPath, areaPath } = buildPixelStepPaths(
      [
        [0, 120],
        [120, 90],
        [240, 30],
        [480, 18],
      ],
      140
    );

    assert.match(stepPath, /^M 0 120 H 120 V 90 H 240 V 30 H 480 V 18$/);
    assert.ok(!/[QTCqtc]/.test(stepPath), `Expected strictly stepped orthogonal path, got: ${stepPath}`);
    assert.ok(areaPath.startsWith(stepPath));
    assert.ok(areaPath.endsWith('L 480 140 L 0 140 Z'));
  });

  it('returns distinct telemetry KPIs and stepped apex coordinates for idle, 128p, and 256p', () => {
    const idle = getPixelCoreProfile('idle');
    const prod = getPixelCoreProfile('128p');
    const stress = getPixelCoreProfile('256p');

    assert.equal(idle.tps, '60.0 TPS');
    assert.equal(idle.tick, '0.00 ms');
    assert.equal(idle.peak, 42);

    assert.equal(prod.tps, '60.0 TPS');
    assert.equal(prod.tick, '0.04 ms');
    assert.equal(prod.peak, 91);

    assert.equal(stress.tps, '59.8 TPS');
    assert.equal(stress.tick, '0.07 ms');
    assert.equal(stress.peak, 97);

    assert.ok(Number.isInteger(prod.apexX) && Number.isInteger(prod.apexY));
    assert.ok(!/[QTCqtc]/.test(prod.stepPath));
  });

  it('quantizes pointer coordinates to discrete pixel illumination cells', () => {
    assert.equal(quantizeGridCoord(31.7, 16), 16);
    assert.equal(quantizeGridCoord(32.0, 16), 32);
    assert.equal(quantizeGridCoord(-1, 16), -16);
  });
});
