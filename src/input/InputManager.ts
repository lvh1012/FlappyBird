export class InputManager {
  private readonly abort = new AbortController();
  constructor(
    canvas: HTMLCanvasElement,
    action: () => void,
    togglePause: () => void,
    toggleDebug: () => void,
  ) {
    const options = { signal: this.abort.signal };
    canvas.addEventListener(
      'pointerdown',
      (event) => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        canvas.focus({ preventScroll: true });
        action();
      },
      options,
    );
    canvas.addEventListener(
      'keydown',
      (event) => {
        if (event.repeat) return;
        if (event.code === 'Space' || event.code === 'ArrowUp') {
          event.preventDefault();
          action();
        }
        if (event.code === 'KeyP') {
          event.preventDefault();
          togglePause();
        }
        if (event.code === 'KeyD') toggleDebug();
      },
      options,
    );
  }
  dispose(): void {
    this.abort.abort();
  }
}
