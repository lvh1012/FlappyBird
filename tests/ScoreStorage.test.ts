import { it, expect } from 'vitest';
import { ScoreStorage } from '../src/storage/ScoreStorage';
it.each([
  null,
  '',
  'abc',
  '-4',
  'Infinity',
  'NaN',
  '{}',
  '3.5',
  '9007199254740992',
])('rejects malformed storage %s', (raw) => {
  expect(
    new ScoreStorage(() => ({
      getItem: () => raw,
      setItem: () => {},
    })).getBest(),
  ).toBe(0);
});
it('loads valid data and never decreases best', () => {
  const values = new Map([
    ['fb.best', '42'],
    ['fb.muted', 'true'],
  ]);
  const store = new ScoreStorage(() => ({
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => {
      values.set(k, v);
    },
  }));
  expect(store.getBest()).toBe(42);
  expect(store.isMuted()).toBe(true);
  store.saveBest(3);
  store.saveBest(55);
  expect(values.get('fb.best')).toBe('55');
  store.setMuted(false);
  expect(values.get('fb.muted')).toBe('false');
});
it('survives access and write exceptions using memory', () => {
  const store = new ScoreStorage(() => {
    throw new Error('blocked');
  });
  expect(store.saveBest(8)).toBe(8);
  store.setMuted(true);
  expect(store.isMuted()).toBe(true);
  const readonly = new ScoreStorage(() => ({
    getItem: () => null,
    setItem: () => {
      throw new Error('quota');
    },
  }));
  expect(readonly.saveBest(9)).toBe(9);
});
