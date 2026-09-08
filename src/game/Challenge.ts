export type ChallengeKind =
  'standard' | 'updraft' | 'downdraft' | 'valve' | 'risk';

export interface ChallengeSpec {
  readonly kind: ChallengeKind;
  readonly label: string;
  readonly cost: number;
  readonly windForce: number;
  readonly valveAmplitude: number;
  readonly valveAngularSpeed: number;
  readonly targetOffset: number;
  readonly perfectHalfHeight: number;
}

export const STANDARD_CHALLENGE: ChallengeSpec = Object.freeze({
  kind: 'standard',
  label: '',
  cost: 0,
  windForce: 0,
  valveAmplitude: 0,
  valveAngularSpeed: 0,
  targetOffset: 0,
  perfectHalfHeight: 24,
});
