import test from 'node:test';
import assert from 'node:assert/strict';
import {FLOOR_HEIGHT, OVERHANG, roofDimensions} from './shedGeometry.js';

test('roof endpoints meet at the ridge and extend four inches beyond each wall', () => {
  for (const width of [8, 10, 12, 14, 16]) {
    for (const length of [10, 12, 16, 20]) {
      for (const pitch of [5, 6, 7, 8]) {
        for (const wall of [6.5, 83 / 12, 92 / 12]) {
          const d = roofDimensions(width, length, pitch, wall);
          const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-10);
          close(d.slope * Math.cos(d.angle), width / 2 + OVERHANG);
          close(d.roofLength - length, 8 / 12);
          close(d.ridgeY - d.eaveY, d.run * pitch / 12);
          close(d.eaveY + OVERHANG * pitch / 12, FLOOR_HEIGHT + wall);
          close(d.ridgeY, FLOOR_HEIGHT + wall + width / 2 * pitch / 12);
        }
      }
    }
  }
});
