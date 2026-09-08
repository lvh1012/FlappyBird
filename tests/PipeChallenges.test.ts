import { describe, expect, it } from 'vitest';
import { PipeManager } from '../src/entities/PipeManager';
import { STANDARD_CHALLENGE, type ChallengeSpec } from '../src/game/Challenge';
import { SeededRandom } from '../src/random/SeededRandom';

const downdraft: ChallengeSpec = {
  ...STANDARD_CHALLENGE,
  kind: 'downdraft',
  label: 'DOWNDRAFT // ↓',
  cost: 1,
  windForce: 280,
};

describe('pipe challenges', () => {
  it('applies wind only while the bird is inside the telegraphed zone', () => {
    const pipes = new PipeManager(new SeededRandom(1));
    pipes.pipes.push({
      id: 0,
      x: 180,
      gapY: 340,
      baseGapY: 340,
      gapSize: 172,
      challenge: downdraft,
      phase: 0,
      age: 0,
      scored: false,
    });
    expect(pipes.windForceAt(120)).toBe(280);
    expect(pipes.windForceAt(20)).toBe(0);
  });

  it('awards the risk bonus only inside its precision target', () => {
    const risk: ChallengeSpec = {
      ...STANDARD_CHALLENGE,
      kind: 'risk',
      label: 'PRECISION ROUTE // HIGH',
      cost: 1,
      targetOffset: -30,
      perfectHalfHeight: 18,
    };
    const pipes = new PipeManager(new SeededRandom(2));
    pipes.pipes.push({
      id: 0,
      x: 40,
      gapY: 340,
      baseGapY: 340,
      gapSize: 172,
      challenge: risk,
      phase: 0,
      age: 0,
      scored: false,
    });
    expect(pipes.collectClearances(120, 310)).toEqual([
      { pipeId: 0, perfect: true, risk: true },
    ]);
    expect(pipes.collectClearances(120, 310)).toEqual([]);
  });
});
