import { SeededRandom } from '../random/SeededRandom';
import { clamp, finiteOr } from '../utils/math';
import {
  STANDARD_CHALLENGE,
  type ChallengeKind,
  type ChallengeSpec,
} from './Challenge';

export class EventDirector {
  private previous: ChallengeKind = 'standard';
  private recoveryPipes = 0;

  constructor(private readonly random: SeededRandom) {}

  next(clearances: number): ChallengeSpec {
    const progress = Math.floor(clamp(finiteOr(clearances, 0), 0, 10_000));
    if (progress < 8 || this.consumeRecovery()) return STANDARD_CHALLENGE;

    const budget = clamp(1 + Math.floor(progress / 20), 1, 3);
    const candidates: ChallengeKind[] = ['updraft', 'downdraft'];
    if (progress >= 14) candidates.push('risk', 'risk');
    if (progress >= 24 && budget >= 2) candidates.push('valve');

    const challengeChance = clamp(0.38 + progress * 0.004, 0.38, 0.7);
    if (this.random.next() > challengeChance) {
      this.previous = 'standard';
      return STANDARD_CHALLENGE;
    }

    const alternatives = candidates.filter((kind) => kind !== this.previous);
    const pool = alternatives.length ? alternatives : candidates;
    const kind =
      pool[Math.floor(this.random.next() * pool.length)] ?? 'updraft';
    this.previous = kind;
    if (kind === 'valve') this.recoveryPipes = 1;
    return this.create(kind);
  }

  private consumeRecovery(): boolean {
    if (this.recoveryPipes <= 0) return false;
    this.recoveryPipes--;
    this.previous = 'standard';
    return true;
  }

  private create(kind: ChallengeKind): ChallengeSpec {
    if (kind === 'updraft' || kind === 'downdraft') {
      const direction = kind === 'updraft' ? -1 : 1;
      return {
        ...STANDARD_CHALLENGE,
        kind,
        label: kind === 'updraft' ? 'UPDRAFT // ↑' : 'DOWNDRAFT // ↓',
        cost: 1,
        windForce: direction * this.random.range(220, 320),
      };
    }
    if (kind === 'valve')
      return {
        ...STANDARD_CHALLENGE,
        kind,
        label: 'OSCILLATING VALVE //',
        cost: 2,
        valveAmplitude: this.random.range(12, 18),
        valveAngularSpeed: this.random.range(1.15, 1.55),
      };
    if (kind === 'risk') {
      const high = this.random.next() < 0.5;
      return {
        ...STANDARD_CHALLENGE,
        kind,
        label: high ? 'PRECISION ROUTE // HIGH' : 'PRECISION ROUTE // LOW',
        cost: 1,
        targetOffset: high ? -30 : 30,
        perfectHalfHeight: 18,
      };
    }
    return STANDARD_CHALLENGE;
  }
}
