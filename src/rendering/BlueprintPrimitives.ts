import { SeededRandom } from '../random/SeededRandom';
export const INK = '#1E4F9A',
  CYAN = '#5576A8',
  FAINT = '#AAB8C9',
  PAPER = '#ECE6D2',
  RED = '#B04F48';
// Geometry is a pure function of the primitive seed; no per-frame random jitter.
export function sketchLine(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  xx: number,
  yy: number,
  seed = 1,
): void {
  const random = new SeededRandom(seed);
  for (let pass = 0; pass < 2; pass++) {
    c.beginPath();
    c.moveTo(x + random.range(-0.7, 0.7), y + random.range(-0.7, 0.7));
    c.lineTo(xx + random.range(-0.7, 0.7), yy + random.range(-0.7, 0.7));
    c.stroke();
  }
}
export function sketchRect(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  seed = 1,
): void {
  sketchLine(c, x, y, x + w, y, seed);
  sketchLine(c, x + w, y, x + w, y + h, seed + 1);
  sketchLine(c, x + w, y + h, x, y + h, seed + 2);
  sketchLine(c, x, y + h, x, y, seed + 3);
}
export function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
): void {
  c.beginPath();
  c.ellipse(x, y, rx, ry, -0.05, 0, Math.PI * 2);
  c.stroke();
  c.beginPath();
  c.ellipse(x + 0.6, y - 0.4, rx + 0.5, ry - 0.3, 0.03, 0, Math.PI * 2);
  c.stroke();
}
export function label(
  c: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  size = 11,
  color = CYAN,
  align: CanvasTextAlign = 'left',
): void {
  c.fillStyle = color;
  c.font = `${size}px "Courier New", monospace`;
  c.textAlign = align;
  c.fillText(text, x, y);
}
export function crosshair(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size = 5,
): void {
  sketchLine(c, x - size, y, x + size, y);
  sketchLine(c, x, y - size, x, y + size);
}
export function dimension(
  c: CanvasRenderingContext2D,
  x: number,
  top: number,
  bottom: number,
): void {
  c.strokeStyle = CYAN;
  sketchLine(c, x, top, x, bottom);
  sketchLine(c, x - 4, top + 6, x, top);
  sketchLine(c, x + 4, top + 6, x, top);
  sketchLine(c, x - 4, bottom - 6, x, bottom);
  sketchLine(c, x + 4, bottom - 6, x, bottom);
}
