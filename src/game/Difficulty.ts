import { clamp, finiteOr } from '../utils/math';
export interface Difficulty {
  readonly speed: number;
  readonly gap: number;
  readonly spacing: number;
}
export function getDifficulty(score: number): Difficulty {
  const level = clamp(Math.floor(finiteOr(score, 0) / 10), 0, 6);
  return { speed: 160 + level * 8, gap: 172 - level * 5, spacing: 245 };
}
