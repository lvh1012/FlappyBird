import type { GameEvent } from '../game/Game';
import { ParticleSystem } from './ParticleSystem';
import { ScreenShake } from './ScreenShake';
export class Effects {
  readonly particles = new ParticleSystem();
  readonly shake = new ScreenShake();
  scoreAge = 1;
  constructor(public reducedMotion: boolean) {}
  handle(event: GameEvent, x: number, y: number): void {
    if (event === 'restart') {
      this.particles.clear();
      this.shake.clear();
      this.scoreAge = 1;
      return;
    }
    this.particles.emit(
      x,
      y,
      this.reducedMotion ? 1 : event === 'collision' ? 18 : 5,
    );
    if (event === 'collision' && !this.reducedMotion) this.shake.trigger();
    if (event === 'score') this.scoreAge = 0;
  }
  update(dt: number): void {
    this.particles.update(dt);
    this.shake.update(dt);
    this.scoreAge += dt;
  }
}
