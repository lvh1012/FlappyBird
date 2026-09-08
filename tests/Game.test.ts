import { it, expect } from 'vitest';
import { Game } from '../src/game/Game';
import { GameState } from '../src/game/GameState';
import { PipeManager } from '../src/entities/PipeManager';
import { SeededRandom } from '../src/random/SeededRandom';
import { getDifficulty } from '../src/game/Difficulty';
import { STANDARD_CHALLENGE } from '../src/game/Challenge';
it('starts with immediate flap, dies once, and restarts cleanly', () => {
  const events: string[] = [];
  const game = new Game(12, (event) => events.push(event));
  expect(game.state).toBe(GameState.Ready);
  game.action();
  expect(game.state).toBe(GameState.Playing);
  expect(game.bird.velocityY).toBeLessThan(0);
  for (let i = 0; i < 300; i++) game.update(1 / 120);
  expect(game.state).toBe(GameState.GameOver);
  expect(events.filter((e) => e === 'collision')).toHaveLength(1);
  game.action();
  expect(game.state).toBe(GameState.Ready);
  expect(game.score).toBe(0);
  expect(game.pipes.pipes).toHaveLength(0);
});
it('reproduces identical seed and tick-indexed inputs', () => {
  const a = new Game(44),
    b = new Game(44);
  for (let i = 0; i < 1200; i++) {
    if (i % 46 === 0) {
      a.action();
      b.action();
    }
    a.update(1 / 120);
    b.update(1 / 120);
    expect(a.bird).toEqual(b.bird);
    expect(a.pipes.pipes).toEqual(b.pipes.pipes);
    expect(a.score).toBe(b.score);
  }
});
it('scores each pair exactly once and keeps bounded unique pipes', () => {
  const pipes = new PipeManager(new SeededRandom(6));
  let total = 0;
  const ids = new Set<number>();
  for (let i = 0; i < 12000; i++) {
    pipes.update(1 / 120, getDifficulty(0));
    const scored = pipes.collectClearances(120, 340).length;
    total += scored;
    expect(pipes.collectClearances(120, 340)).toEqual([]);
    for (const pipe of pipes.pipes) ids.add(pipe.id);
    expect(pipes.pipes.length).toBeLessThanOrEqual(4);
  }
  expect(total).toBeGreaterThan(50);
  expect(ids.size).toBeGreaterThan(total);
});
it('collision wins over scoring on the same tick', () => {
  const game = new Game(1);
  game.action();
  game.pipes.pipes.push({
    id: 0,
    x: 40,
    gapY: 340,
    baseGapY: 340,
    gapSize: 172,
    challenge: STANDARD_CHALLENGE,
    phase: 0,
    age: 0,
    scored: false,
  });
  game.bird.y = 703;
  game.update(1 / 120);
  expect(game.state).toBe(GameState.GameOver);
  expect(game.score).toBe(0);
});
it('rewards precise clearance without accelerating difficulty progress', () => {
  const game = new Game(2);
  game.action();
  game.bird.y = 340;
  game.bird.velocityY = 0;
  game.pipes.pipes.push({
    id: 0,
    x: 40,
    gapY: 340,
    baseGapY: 340,
    gapSize: 172,
    challenge: STANDARD_CHALLENGE,
    phase: 0,
    age: 0,
    scored: false,
  });
  game.update(1 / 120);
  expect(game.clearances).toBe(1);
  expect(game.combo).toBe(1);
  expect(game.score).toBe(2);
  expect(game.lastScoreDelta).toBe(2);
});
