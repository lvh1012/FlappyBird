import { describe, expect, it } from 'vitest';
import { fitViewport } from '../src/viewport/fitViewport';

describe('full-viewport backing buffer', () => {
  it.each([
    [320, 568, 2],
    [390, 844, 3],
    [844, 390, 3],
    [768, 1024, 2],
    [1920, 1080, 2],
    [3440, 1440, 4],
  ])('bounds pixels for %s × %s at DPR %s', (width, height, dpr) => {
    const result = fitViewport(width, height, dpr);
    expect(result.width * result.height).toBeLessThanOrEqual(4_000_000);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
    expect(
      Math.abs(result.width / result.height - width / height),
    ).toBeLessThan(0.01);
  });
  it.each([
    [0, 500, 1],
    [500, 0, 1],
    [500, 500, NaN],
    [Infinity, 500, 1],
    [-1, 500, 1],
  ])('rejects invalid dimensions', (width, height, dpr) => {
    expect(() => fitViewport(width, height, dpr)).toThrow(RangeError);
  });
});
