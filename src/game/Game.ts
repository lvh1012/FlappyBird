import { Bird } from '../entities/Bird';
import { PipeManager } from '../entities/PipeManager';
import { circleIntersectsRect } from '../physics/Collision';
import { flap, integrate } from '../physics/Physics';
import { SeededRandom } from '../random/SeededRandom';
import { assertFinite, clamp } from '../utils/math';
import { CONFIG } from './GameConfig';
import { getDifficulty } from './Difficulty';
import { GameState } from './GameState';
export type GameEvent = 'flap' | 'score' | 'collision' | 'restart';
export class Game {
  private currentState = GameState.Ready;
  bird = new Bird();
  pipes: PipeManager;
  score = 0;
  time = 0;
  groundOffset = 0;
  overAge = 0;
  get state(): GameState {
    return this.currentState;
  }
  constructor(
    readonly seed: number,
    private readonly emit: (event: GameEvent) => void = () => {},
  ) {
    this.pipes = new PipeManager(new SeededRandom(seed));
  }
  private transition(next: GameState): void {
    const valid =
      (this.state === GameState.Ready && next === GameState.Playing) ||
      (this.state === GameState.Playing && next === GameState.GameOver) ||
      (this.state === GameState.GameOver && next === GameState.Ready);
    if (!valid) throw new Error(`Invalid transition: ${this.state} -> ${next}`);
    this.currentState = next;
  }
  action(): void {
    if (this.state === GameState.GameOver) {
      if (this.overAge >= 0.4) this.restart();
      return;
    }
    if (this.state === GameState.Ready) this.transition(GameState.Playing);
    flap(this.bird);
    this.emit('flap');
  }
  restart(): void {
    // Explicit reset also supports the persistent HTML restart control mid-flight.
    if (this.state === GameState.Playing) this.transition(GameState.GameOver);
    if (this.state === GameState.GameOver) this.transition(GameState.Ready);
    this.bird = new Bird();
    this.pipes = new PipeManager(new SeededRandom(this.seed));
    this.score = 0;
    this.time = 0;
    this.groundOffset = 0;
    this.overAge = 0;
    this.emit('restart');
  }
  update(delta: number): void {
    assertFinite(delta);
    const dt = clamp(delta, 0, CONFIG.maxDelta);
    this.time += dt;
    if (this.state === GameState.Ready) return;
    if (this.state === GameState.GameOver) {
      this.overAge += dt;
      if (this.bird.y < CONFIG.ground - this.bird.radius)
        integrate(this.bird, dt);
      this.bird.y = Math.min(this.bird.y, CONFIG.ground - this.bird.radius);
      return;
    }
    integrate(this.bird, dt);
    const difficulty = getDifficulty(this.score);
    this.pipes.update(dt, difficulty);
    this.groundOffset = (this.groundOffset + difficulty.speed * dt) % 48;
    const hit =
      this.bird.y + this.bird.radius >= CONFIG.ground ||
      this.pipes.pipes.some((pipe) => {
        const top = pipe.gapY - pipe.gapSize / 2,
          bottom = pipe.gapY + pipe.gapSize / 2;
        return (
          circleIntersectsRect(this.bird, {
            x: pipe.x,
            y: 0,
            width: CONFIG.pipeWidth,
            height: top,
          }) ||
          circleIntersectsRect(this.bird, {
            x: pipe.x,
            y: bottom,
            width: CONFIG.pipeWidth,
            height: CONFIG.ground - bottom,
          })
        );
      });
    if (hit) {
      this.transition(GameState.GameOver);
      this.emit('collision');
      return;
    }
    const gained = this.pipes.collectScore(this.bird.x);
    if (gained) {
      this.score += gained;
      this.emit('score');
    }
  }
}
