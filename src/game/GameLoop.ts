import { CONFIG } from './GameConfig';
import { clamp } from '../utils/math';
export class GameLoop {
  private id: number | null = null;
  private last: number | null = null;
  private accumulator = 0;
  private running = false;
  constructor(
    private readonly update: (dt: number) => void,
    private readonly render: (delta: number) => void,
  ) {}
  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = null;
    this.id = requestAnimationFrame(this.frame);
  }
  private frame = (timestamp: number): void => {
    if (!this.running) return;
    const delta =
      this.last === null
        ? 0
        : clamp((timestamp - this.last) / 1000, 0, CONFIG.maxDelta);
    this.last = timestamp;
    this.accumulator = Math.min(this.accumulator + delta, CONFIG.maxDelta);
    while (this.accumulator + 1e-10 >= CONFIG.step) {
      this.update(CONFIG.step);
      this.accumulator -= CONFIG.step;
    }
    this.render(delta);
    this.id = requestAnimationFrame(this.frame);
  };
  pause(): void {
    this.running = false;
    if (this.id !== null) cancelAnimationFrame(this.id);
    this.id = null;
    this.last = null;
    this.accumulator = 0;
  }
  resume(): void {
    this.start();
  }
  stop(): void {
    this.pause();
  }
}
