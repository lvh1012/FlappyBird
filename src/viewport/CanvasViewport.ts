import { CONFIG } from '../game/GameConfig';
import { finiteOr } from '../utils/math';
import { fitViewport } from './fitViewport';
export class CanvasViewport {
  private observer: ResizeObserver | undefined;
  private scale = 1;
  private offsetX = 0;
  private offsetY = 0;
  private rawDpr = 0;
  onResize: (() => void) | undefined;
  dpr = 1;
  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly context: CanvasRenderingContext2D,
    private readonly stage: HTMLElement,
  ) {
    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(this.resize);
      this.observer.observe(canvas);
      this.observer.observe(stage);
    }
    window.addEventListener('resize', this.resize);
    this.resize();
  }
  resize = (): void => {
    const rect = this.canvas.getBoundingClientRect(),
      area = this.stage.getBoundingClientRect();
    if (!(
      rect.width > 0 &&
      rect.height > 0 &&
      area.width > 0 &&
      area.height > 0
    ))
      return;
    this.rawDpr = Math.max(1, finiteOr(window.devicePixelRatio, 1));
    const size = fitViewport(rect.width, rect.height, this.rawDpr);
    if (
      this.canvas.width !== size.width ||
      this.canvas.height !== size.height
    ) {
      this.canvas.width = size.width;
      this.canvas.height = size.height;
    }
    this.dpr = Math.min(size.width / rect.width, size.height / rect.height);
    this.scale =
      Math.min(area.width / CONFIG.width, area.height / CONFIG.height) *
      this.dpr;
    this.offsetX =
      (area.left - rect.left) * this.dpr +
      (area.width * this.dpr - CONFIG.width * this.scale) / 2;
    this.offsetY =
      (area.top - rect.top) * this.dpr +
      (area.height * this.dpr - CONFIG.height * this.scale) / 2;
    this.onResize?.();
  };
  begin(): void {
    if (this.rawDpr !== Math.max(1, finiteOr(window.devicePixelRatio, 1)))
      this.resize();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.setTransform(
      this.scale,
      0,
      0,
      this.scale,
      this.offsetX,
      this.offsetY,
    );
  }
  dispose(): void {
    this.onResize = undefined;
    this.observer?.disconnect();
    window.removeEventListener('resize', this.resize);
  }
}
