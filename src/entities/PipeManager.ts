import { CONFIG } from '../game/GameConfig';
import type { Difficulty } from '../game/Difficulty';
import type { ChallengeSpec } from '../game/Challenge';
import { EventDirector } from '../game/EventDirector';
import { SeededRandom } from '../random/SeededRandom';
import { clamp } from '../utils/math';
export interface PipePair {
  readonly id: number;
  x: number;
  gapY: number;
  readonly baseGapY: number;
  readonly gapSize: number;
  readonly challenge: ChallengeSpec;
  readonly phase: number;
  age: number;
  scored: boolean;
}
export interface ClearanceResult {
  readonly pipeId: number;
  readonly perfect: boolean;
  readonly risk: boolean;
}
export class PipeManager {
  readonly pipes: PipePair[] = [];
  private nextId = 0;
  private viewportLeft: number = 0;
  private viewportRight: number = CONFIG.width;
  constructor(
    private readonly random: SeededRandom,
    private readonly director = new EventDirector(random),
  ) {}
  setViewportBounds(left: number, right: number): void {
    if (!Number.isFinite(left) || !Number.isFinite(right) || right <= left)
      return;
    this.viewportLeft = Math.min(0, left);
    this.viewportRight = Math.max(CONFIG.width, right);
  }
  update(dt: number, difficulty: Difficulty, clearances = 0): void {
    for (const pipe of this.pipes) {
      pipe.x -= difficulty.speed * dt;
      pipe.age += dt;
      if (pipe.challenge.valveAmplitude > 0) {
        const half = pipe.gapSize / 2;
        pipe.gapY = clamp(
          pipe.baseGapY +
            Math.sin(pipe.age * pipe.challenge.valveAngularSpeed + pipe.phase) *
              pipe.challenge.valveAmplitude,
          95 + half,
          CONFIG.ground - 95 - half,
        );
      }
    }
    while (
      this.pipes[0] &&
      this.pipes[0].x + CONFIG.pipeWidth < this.viewportLeft - 30
    )
      this.pipes.shift();
    const last = this.pipes.at(-1);
    if (!last || last.x <= this.viewportRight - difficulty.spacing) {
      const half = difficulty.gap / 2;
      const previousY = last?.baseGapY ?? 340;
      const min = Math.max(125 + half, previousY - difficulty.maxGapDelta);
      const max = Math.min(
        CONFIG.ground - 95 - half,
        previousY + difficulty.maxGapDelta,
      );
      const gapY = this.random.range(min, max);
      this.pipes.push({
        id: this.nextId++,
        x: last ? last.x + difficulty.spacing : CONFIG.initialPipeX,
        gapY,
        baseGapY: gapY,
        gapSize: difficulty.gap,
        challenge: this.director.next(clearances),
        phase: this.random.range(0, Math.PI * 2),
        age: 0,
        scored: false,
      });
    }
  }
  collectClearances(birdX: number, birdY: number): ClearanceResult[] {
    const results: ClearanceResult[] = [];
    for (const pipe of this.pipes)
      if (!pipe.scored && pipe.x + CONFIG.pipeWidth < birdX) {
        pipe.scored = true;
        const targetY = pipe.gapY + pipe.challenge.targetOffset;
        results.push({
          pipeId: pipe.id,
          perfect:
            Math.abs(birdY - targetY) <= pipe.challenge.perfectHalfHeight,
          risk: pipe.challenge.kind === 'risk',
        });
      }
    return results;
  }
  windForceAt(x: number): number {
    const active = this.pipes
      .filter(
        (pipe) =>
          pipe.challenge.windForce !== 0 &&
          x >= pipe.x - 145 &&
          x <= pipe.x + CONFIG.pipeWidth,
      )
      .sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))[0];
    return active?.challenge.windForce ?? 0;
  }
  upcomingChallenge(x: number): PipePair | undefined {
    return this.pipes
      .filter(
        (pipe) =>
          pipe.challenge.kind !== 'standard' &&
          pipe.x + CONFIG.pipeWidth >= x &&
          pipe.x - x <= 260,
      )
      .sort((a, b) => a.x - b.x)[0];
  }
}
