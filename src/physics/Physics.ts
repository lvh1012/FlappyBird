import type { Bird } from '../entities/Bird';
import { CONFIG } from '../game/GameConfig';
import { assertFinite, clamp, lerp } from '../utils/math';
export function flap(bird: Bird): void {
  bird.velocityY = CONFIG.flapVelocity;
  bird.flapAge = 0;
}
export function integrate(bird: Bird, delta: number): void {
  assertFinite(delta, bird.y, bird.velocityY, bird.rotation, bird.flapAge);
  const dt = clamp(delta, 0, CONFIG.maxDelta);
  bird.velocityY = clamp(
    bird.velocityY + CONFIG.gravity * dt,
    CONFIG.flapVelocity,
    CONFIG.maxFallVelocity,
  );
  bird.y += bird.velocityY * dt;
  // The ceiling clamps instead of killing: a forgiving boundary without escaping the world.
  if (bird.y < bird.radius) {
    bird.y = bird.radius;
    bird.velocityY = Math.max(0, bird.velocityY);
  }
  bird.targetRotation = clamp(bird.velocityY / 500, -0.44, Math.PI / 2);
  bird.rotation = lerp(
    bird.rotation,
    bird.targetRotation,
    1 - Math.exp(-10 * dt),
  );
  bird.flapAge += dt;
}
