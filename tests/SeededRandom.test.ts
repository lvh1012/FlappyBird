import { it, expect } from 'vitest';
import { SeededRandom, parseSeed } from '../src/random/SeededRandom';
it('reproduces sequences including seed zero', () => {
  for (const seed of [0, 12, 4294967295]) {
    const a = new SeededRandom(seed),
      b = new SeededRandom(seed);
    for (let i = 0; i < 1000; i++) {
      const n = a.next();
      expect(n).toBe(b.next());
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  }
});
it('changes the sequence with seed', () => {
  expect(new SeededRandom(1).next()).not.toBe(new SeededRandom(2).next());
});
it('validates seed query', () => {
  expect(parseSeed('0', 5)).toBe(0);
  for (const raw of [null, '', '-1', 'NaN', 'Infinity', '4294967296', '3.2'])
    expect(parseSeed(raw, 5)).toBe(5);
});
