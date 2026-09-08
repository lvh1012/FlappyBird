import { assertFinite } from '../utils/math';
export class SeededRandom {
  private state: number;
  constructor(seed: number) {
    assertFinite(seed);
    this.state = seed >>> 0;
  }
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let n = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  }
  range(min: number, max: number): number {
    assertFinite(min, max);
    if (min > max) throw new RangeError('Invalid random range');
    return min + this.next() * (max - min);
  }
}
export function parseSeed(value: string | null, fallback: number): number {
  if (value !== null && /^\d+$/.test(value)) {
    const n = Number(value);
    if (Number.isSafeInteger(n) && n <= 0xffffffff) return n;
  }
  return fallback >>> 0;
}
