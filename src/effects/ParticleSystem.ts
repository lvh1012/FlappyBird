import { SeededRandom } from '../random/SeededRandom';
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  lifetime: number;
  rotation: number;
}
export class ParticleSystem {
  readonly particles: Particle[] = [];
  private readonly random = new SeededRandom(99182);
  emit(x: number, y: number, count: number): void {
    for (let i = 0; i < count && this.particles.length < 128; i++)
      this.particles.push({
        x,
        y,
        vx: this.random.range(-100, 50),
        vy: this.random.range(-70, 70),
        age: 0,
        lifetime: this.random.range(0.2, 0.55),
        rotation: this.random.range(0, 6),
      });
  }
  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p) continue;
      p.age += dt;
      if (p.age >= p.lifetime) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 120 * dt;
    }
  }
  clear(): void {
    this.particles.length = 0;
  }
}
