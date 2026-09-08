import { it, expect } from 'vitest';
import { getDifficulty } from '../src/game/Difficulty';
it('scales monotonically and stays within playable limits', () => {
  let previous = getDifficulty(0);
  for (let score = 0; score < 10000; score++) {
    const d = getDifficulty(score);
    expect(d.speed).toBeGreaterThanOrEqual(previous.speed);
    expect(d.speed).toBeLessThanOrEqual(208);
    expect(d.gap).toBeLessThanOrEqual(previous.gap);
    expect(d.gap).toBeGreaterThanOrEqual(142);
    previous = d;
  }
});
it.each([-10, NaN, Infinity])('normalizes invalid score %s', (score) => {
  expect(getDifficulty(score)).toEqual(getDifficulty(0));
});
