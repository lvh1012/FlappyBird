import { CONFIG } from '../game/GameConfig';
import { SeededRandom } from '../random/SeededRandom';
import { PAPER } from './BlueprintPrimitives';
export class BackgroundRenderer {
  private readonly paper: HTMLCanvasElement;
  constructor(seed: number) {
    this.paper = document.createElement('canvas');
    this.paper.width = CONFIG.width * 2;
    this.paper.height = CONFIG.height * 2;
    const c = this.paper.getContext('2d');
    if (!c) throw new Error('Canvas 2D unavailable');
    c.scale(2, 2);
    c.fillStyle = PAPER;
    c.fillRect(0, 0, CONFIG.width, CONFIG.height);
    for (let x = 0; x <= CONFIG.width; x += 24) {
      c.strokeStyle = x % 120 === 0 ? '#B9C8D3' : '#D3DBDF';
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, CONFIG.height);
      c.stroke();
    }
    for (let y = 0; y <= CONFIG.height; y += 24) {
      c.strokeStyle = y % 120 === 0 ? '#B9C8D3' : '#D3DBDF';
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(CONFIG.width, y);
      c.stroke();
    }
    const random = new SeededRandom(seed ^ 0xabc123);
    // Stable paper grain is generated once and never changes gameplay RNG.
    c.fillStyle = 'rgba(83,72,48,0.055)';
    for (let i = 0; i < 1800; i++)
      c.fillRect(
        random.range(0, CONFIG.width),
        random.range(0, CONFIG.height),
        0.7,
        0.7,
      );
  }
  draw(c: CanvasRenderingContext2D, left: number, right: number): void {
    const firstTile = Math.floor(left / CONFIG.width) * CONFIG.width;
    for (let x = firstTile; x < right; x += CONFIG.width)
      c.drawImage(this.paper, x, 0, CONFIG.width, CONFIG.height);
  }
}
