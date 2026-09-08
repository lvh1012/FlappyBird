import { CONFIG } from '../game/GameConfig';
import { clamp, finiteOr } from '../utils/math';
export class CanvasViewport {
  private observer: ResizeObserver | undefined;
  private scale = 1;
  dpr = 1;
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: CanvasRenderingContext2D,
  ) {
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(this.resize);
      this.observer.observe(canvas);
    }
    window.addEventListener('resize', this.resize);
    this.resize();
  }
  resize = (): void => {
    const rect = this.canvas.getBoundingClientRect();
    if (!(rect.width > 0 && rect.height > 0)) return;
    this.dpr = clamp(finiteOr(window.devicePixelRatio, 1), 1, 4);
    const width = Math.max(1, Math.round(rect.width * this.dpr));
    const height = Math.max(1, Math.round(rect.height * this.dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
    this.scale = Math.min(width / CONFIG.width, height / CONFIG.height);
  };
  begin(): void {
    if (this.dpr !== clamp(finiteOr(window.devicePixelRatio, 1), 1, 4))
      this.resize();
    // setTransform replaces, never compounds, the DPR/logical-world scale.
    this.context.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      (this.canvas.width - CONFIG.width * this.scale) / 2,
      (this.canvas.height - CONFIG.height * this.scale) / 2,
    );
  }
  dispose(): void {
    this.observer?.disconnect();
    window.removeEventListener('resize', this.resize);
  }
}
