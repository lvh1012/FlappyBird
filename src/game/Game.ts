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
  clearances = 0;
  combo = 0;
  bestCombo = 0;
  lastScoreDelta = 1;
  windForce = 0;
  failureCause = 'STRUCTURAL FAILURE';
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
    this.pipes = this.createPipeManager();
  }
  private createPipeManager(): PipeManager {
    return new PipeManager(new SeededRandom(this.seed));
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
    this.pipes = this.createPipeManager();
    this.score = 0;
    this.clearances = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.lastScoreDelta = 1;
    this.windForce = 0;
    this.failureCause = 'STRUCTURAL FAILURE';
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
    const difficulty = getDifficulty(this.clearances);
    this.pipes.update(dt, difficulty, this.clearances);
    this.windForce = this.pipes.windForceAt(this.bird.x);
    integrate(this.bird, dt, this.windForce);
    this.groundOffset = (this.groundOffset + difficulty.speed * dt) % 48;
    const groundHit = this.bird.y + this.bird.radius >= CONFIG.ground;
    const collisionPipe = this.pipes.pipes.find((pipe) => {
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
    if (groundHit || collisionPipe) {
      this.failureCause = groundHit
        ? this.windForce > 0
          ? 'DOWNDRAFT LOAD'
          : 'GROUND IMPACT'
        : collisionPipe?.challenge.kind === 'valve'
          ? 'MOVING VALVE'
          : 'DUCT COLLISION';
      this.transition(GameState.GameOver);
      this.emit('collision');
      return;
    }
    const results = this.pipes.collectClearances(this.bird.x, this.bird.y);
    if (results.length) {
      this.lastScoreDelta = 0;
      for (const result of results) {
        this.clearances++;
        if (result.perfect) {
          this.combo++;
          this.bestCombo = Math.max(this.bestCombo, this.combo);
        } else this.combo = 0;
        const comboMultiplier = result.perfect
          ? Math.min(1 + Math.floor((this.combo - 1) / 3), 3)
          : 0;
        this.lastScoreDelta +=
          1 + comboMultiplier + (result.risk && result.perfect ? 1 : 0);
      }
      this.score += this.lastScoreDelta;
      this.emit('score');
    }
  }
}
