export function assertFinite(...values: number[]): void {
  if (values.some((value) => !Number.isFinite(value)))
    throw new RangeError('Expected finite simulation values');
}
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
export function finiteOr(value: number, fallback: number): number {
  return Number.isFinite(value) ? value : fallback;
}
export function lerp(from: number, to: number, amount: number): number {
  return from + (to - from) * clamp(amount, 0, 1);
}
