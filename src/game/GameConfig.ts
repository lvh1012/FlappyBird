export const CONFIG = Object.freeze({
  width: 432,
  height: 768,
  ground: 704,
  step: 1 / 120,
  maxDelta: 0.05,
  birdX: 120,
  radius: 13,
  gravity: 1500,
  flapVelocity: -430,
  maxFallVelocity: 850,
  pipeWidth: 72,
  spacing: 245,
  initialPipeX: 500,
});
export interface Vector2 {
  x: number;
  y: number;
}
export interface Rectangle extends Vector2 {
  width: number;
  height: number;
}
export interface Circle extends Vector2 {
  radius: number;
}
