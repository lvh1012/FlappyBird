import './style.css';
import { Game } from './game/Game';
import { GameLoop } from './game/GameLoop';
import { GameState } from './game/GameState';
import { parseSeed } from './random/SeededRandom';
import { ScoreStorage } from './storage/ScoreStorage';
import { AudioManager } from './audio/AudioManager';
import { InputManager } from './input/InputManager';
import { CanvasViewport } from './viewport/CanvasViewport';
import { Effects } from './effects/Effects';
import { BlueprintRenderer } from './rendering/BlueprintRenderer';
function element<T extends HTMLElement>(id: string, type: { new (): T }): T {
  const item = document.getElementById(id);
  if (!(item instanceof type)) throw new Error(`Missing element: ${id}`);
  return item;
}
try {
  const canvas = element('game', HTMLCanvasElement),
    c = canvas.getContext('2d');
  if (!c)
    throw new Error(
      'This browser does not support Canvas 2D. Please use a current browser.',
    );
  const status = element('status', HTMLParagraphElement),
    restart = element('restart', HTMLButtonElement),
    mute = element('mute', HTMLButtonElement),
    pause = element('pause', HTMLButtonElement);
  const abort = new AbortController(),
    options = { signal: abort.signal };
  const storage = new ScoreStorage(),
    audio = new AudioManager(storage.isMuted());
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)'),
    effects = new Effects(motion.matches);
  motion.addEventListener(
    'change',
    (event) => {
      effects.reducedMotion = event.matches;
    },
    options,
  );
  const seed = parseSeed(
    new URLSearchParams(location.search).get('seed'),
    crypto.getRandomValues(new Uint32Array(1))[0] ?? Date.now(),
  );
  let manualPause = false;
  const game = new Game(seed, (event) => {
    effects.handle(event, game.bird.x, game.bird.y);
    audio.play(event);
    if (event === 'score' || event === 'collision')
      storage.saveBest(game.score);
    if (event === 'collision') {
      status.textContent = `Test failed. Score ${game.score}. Best ${storage.getBest()}. Press Space to retry.`;
      restart.textContent = '↗ RETRY TEST';
    }
    if (event === 'restart') {
      status.textContent = 'Ready for a new test.';
      restart.textContent = '↗ START TEST';
    }
    if (event === 'flap') restart.textContent = '↗ RESTART';
  });
  const viewport = new CanvasViewport(canvas, c),
    renderer = new BlueprintRenderer(c, viewport, seed);
  // Vite removes this development-only dynamic import from production builds.
  let debug: import('./debug/DebugOverlay').DebugOverlay | undefined;
  if (import.meta.env.DEV)
    void import('./debug/DebugOverlay').then((module) => {
      debug = new module.DebugOverlay();
    });
  const draw = (dt: number): void => {
    renderer.draw(game, effects, storage.getBest(), manualPause);
    debug?.draw(c, game, dt, viewport.dpr);
  };
  const loop = new GameLoop((dt) => {
    game.update(dt);
    effects.update(dt);
  }, draw);
  const syncPause = (): void => {
    if (manualPause || document.hidden) loop.pause();
    else loop.resume();
    pause.textContent = manualPause ? '▶ RESUME' : 'Ⅱ PAUSE';
    pause.setAttribute('aria-pressed', String(manualPause));
    draw(0);
  };
  const togglePause = (): void => {
    manualPause = !manualPause;
    syncPause();
  };
  const gesture = (): void => {
    void audio.unlock();
  };
  const input = new InputManager(
    canvas,
    () => {
      gesture();
      if (!manualPause) game.action();
    },
    togglePause,
    () => debug?.toggle(),
  );
  restart.addEventListener(
    'click',
    () => {
      gesture();
      manualPause = false;
      if (game.state === GameState.Ready) game.action();
      else game.restart();
      syncPause();
      canvas.focus();
    },
    options,
  );
  pause.addEventListener(
    'click',
    () => {
      togglePause();
      canvas.focus();
    },
    options,
  );
  const syncMute = (): void => {
    mute.textContent = audio.muted ? '♪ SOUND OFF' : '♪ SOUND ON';
    mute.setAttribute('aria-pressed', String(audio.muted));
  };
  mute.addEventListener(
    'click',
    () => {
      gesture();
      audio.muted = !audio.muted;
      storage.setMuted(audio.muted);
      syncMute();
    },
    options,
  );
  document.addEventListener('visibilitychange', syncPause, options);
  window.addEventListener('pagehide', () => loop.pause(), options);
  window.addEventListener('pageshow', syncPause, options);
  window.addEventListener(
    'resize',
    () => {
      if (manualPause) draw(0);
    },
    options,
  );
  const dispose = (): void => {
    loop.stop();
    input.dispose();
    viewport.dispose();
    audio.dispose();
    abort.abort();
  };
  if (import.meta.hot) import.meta.hot.dispose(dispose);
  syncMute();
  syncPause();
} catch (error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : 'Unable to initialize the flight experiment.';
  const fatal = document.getElementById('fatal');
  if (fatal) {
    fatal.hidden = false;
    fatal.textContent = message;
  }
  console.error(error);
}
