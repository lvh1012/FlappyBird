import { CONFIG } from '../game/GameConfig';
import type { Difficulty } from '../game/Difficulty';
import { SeededRandom } from '../random/SeededRandom';
export interface PipePair {
  readonly id: number;
  x: number;
  readonly gapY: number;
  readonly gapSize: number;
  scored: boolean;
}
export class PipeManager {
  readonly pipes: PipePair[] = [];
  private nextId = 0;
  constructor(private readonly random: SeededRandom) {}
  update(dt: number, difficulty: Difficulty): void {
    for (const pipe of this.pipes) pipe.x -= difficulty.speed * dt;
    while (this.pipes[0] && this.pipes[0].x + CONFIG.pipeWidth < -30)
      this.pipes.shift();
    const last = this.pipes.at(-1);
    if (!last || last.x <= CONFIG.width - difficulty.spacing) {
      const half = difficulty.gap / 2;
      const min = Math.max(125 + half, (last?.gapY ?? 340) - 115);
      const max = Math.min(
        CONFIG.ground - 95 - half,
        (last?.gapY ?? 340) + 115,
      );
      this.pipes.push({
        id: this.nextId++,
        x: last ? last.x + difficulty.spacing : CONFIG.initialPipeX,
        gapY: this.random.range(min, max),
        gapSize: difficulty.gap,
        scored: false,
      });
    }
  }
  collectScore(birdX: number): number {
    let score = 0;
    for (const pipe of this.pipes)
      if (!pipe.scored && pipe.x + CONFIG.pipeWidth < birdX) {
        pipe.scored = true;
        score++;
      }
    return score;
  }
}
