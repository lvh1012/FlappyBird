import { it, expect } from 'vitest';
import { circleIntersectsRect } from '../src/physics/Collision';
const rect = { x: 0, y: 0, width: 10, height: 10 };
it.each([
  [20, 5, 2, false],
  [12, 5, 2, true],
  [11.9, 5, 2, true],
  [5, 5, 1, true],
  [-2, 5, 2, true],
  [-5, -5, 1, false],
  [12, 12, 2, false],
])('circle (%s,%s), r=%s intersects=%s', (x, y, radius, result) => {
  expect(circleIntersectsRect({ x, y, radius }, rect)).toBe(result);
});
it('rejects corrupt geometry', () => {
  expect(() =>
    circleIntersectsRect({ x: NaN, y: 0, radius: 2 }, rect),
  ).toThrow();
});
