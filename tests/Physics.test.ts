import { describe, it, expect } from 'vitest';
import { Bird } from '../src/entities/Bird';
import { flap, integrate } from '../src/physics/Physics';
import { CONFIG } from '../src/game/GameConfig';
describe('physics', () => {
  it('integrates velocity before position', () => {
    const b = new Bird();
    integrate(b, 0.01);
    expect(b.velocityY).toBe(15);
    expect(b.y).toBeCloseTo(340.15);
  });
  it('flap resets velocity instead of accumulating impulse', () => {
    const b = new Bird();
    flap(b);
    flap(b);
    expect(b.velocityY).toBe(CONFIG.flapVelocity);
  });
  it('clamps long frames and rejects nonfinite input', () => {
    const a = new Bird(),
      b = new Bird();
    integrate(a, 1000);
    integrate(b, 0.05);
    expect(a).toEqual(b);
    expect(() => integrate(a, NaN)).toThrow();
    a.y = Infinity;
    expect(() => integrate(a, 0.01)).toThrow();
  });
  it('caps falling speed and ceiling', () => {
    const b = new Bird();
    for (let i = 0; i < 500; i++) integrate(b, 1 / 120);
    expect(b.velocityY).toBe(CONFIG.maxFallVelocity);
    expect(Number.isFinite(b.y)).toBe(true);
    b.y = 0;
    flap(b);
    integrate(b, 1 / 120);
    expect(b.y).toBe(b.radius);
    expect(b.velocityY).toBe(0);
  });
});
