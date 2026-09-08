import { describe, expect, it } from 'vitest';
import { EventDirector } from '../src/game/EventDirector';
import { SeededRandom } from '../src/random/SeededRandom';

describe('EventDirector', () => {
  it('keeps the onboarding section free of hazards', () => {
    const director = new EventDirector(new SeededRandom(10));
    for (let clearances = 0; clearances < 8; clearances++)
      expect(director.next(clearances).kind).toBe('standard');
  });

  it('is deterministic and unlocks a varied challenge deck', () => {
    const a = new EventDirector(new SeededRandom(44)),
      b = new EventDirector(new SeededRandom(44));
    const first = Array.from({ length: 120 }, (_, index) => a.next(index + 8));
    const second = Array.from({ length: 120 }, (_, index) => b.next(index + 8));
    expect(first).toEqual(second);
    const kinds = new Set(first.map((challenge) => challenge.kind));
    expect(kinds).toEqual(
      new Set(['standard', 'updraft', 'downdraft', 'risk', 'valve']),
    );
  });

  it('inserts a recovery pipe after every moving valve', () => {
    const director = new EventDirector(new SeededRandom(81));
    const sequence = Array.from({ length: 160 }, () => director.next(80));
    const valveIndexes = sequence
      .map((challenge, index) => (challenge.kind === 'valve' ? index : -1))
      .filter((index) => index >= 0 && index < sequence.length - 1);
    expect(valveIndexes.length).toBeGreaterThan(0);
    for (const index of valveIndexes)
      expect(sequence[index + 1]?.kind).toBe('standard');
  });
});
