import { it, expect, vi, afterEach } from 'vitest';
import { GameLoop } from '../src/game/GameLoop';
afterEach(() => vi.unstubAllGlobals());
it('owns one RAF, clamps suspension, and resets timestamps on resume', () => {
  let callback: FrameRequestCallback = () => {};
  const request = vi.fn((fn: FrameRequestCallback) => {
    callback = fn;
    return 1;
  });
  const cancel = vi.fn();
  vi.stubGlobal('requestAnimationFrame', request);
  vi.stubGlobal('cancelAnimationFrame', cancel);
  const update = vi.fn();
  const loop = new GameLoop(update, () => {});
  loop.start();
  loop.start();
  expect(request).toHaveBeenCalledTimes(1);
  callback(0);
  callback(100000);
  expect(update).toHaveBeenCalledTimes(6);
  loop.pause();
  expect(cancel).toHaveBeenCalled();
  loop.resume();
  callback(500000);
  expect(update).toHaveBeenCalledTimes(6);
  loop.stop();
});
