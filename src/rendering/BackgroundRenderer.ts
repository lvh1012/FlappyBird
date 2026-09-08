import { CONFIG } from '../game/GameConfig';
import { SeededRandom } from '../random/SeededRandom';
import { CYAN, FAINT, NAVY, crosshair, label } from './BlueprintPrimitives';
export class BackgroundRenderer {
  private readonly paper: HTMLCanvasElement;
  constructor(seed: number) {
    this.paper = document.createElement('canvas');
    this.paper.width = CONFIG.width * 2;
    this.paper.height = CONFIG.height * 2;
    const c = this.paper.getContext('2d');
    if (!c) throw new Error('Canvas 2D unavailable');
    c.scale(2, 2);
    c.fillStyle = NAVY;
    c.fillRect(0, 0, CONFIG.width, CONFIG.height);
    for (let x = 0; x <= CONFIG.width; x += 24) {
      c.strokeStyle = x % 120 === 0 ? '#30536f' : '#203f5b';
      c.lineWidth = 0.5;
      c.beginPath();
      c.moveTo(x, 0);
      c.lineTo(x, CONFIG.height);
      c.stroke();
    }
    for (let y = 0; y <= CONFIG.height; y += 24) {
      c.strokeStyle = y % 120 === 0 ? '#30536f' : '#203f5b';
      c.beginPath();
      c.moveTo(0, y);
      c.lineTo(CONFIG.width, y);
      c.stroke();
    }
    const random = new SeededRandom(seed ^ 0xabc123);
    c.strokeStyle = FAINT;
    c.lineWidth = 0.6;
    for (let i = 0; i < 14; i++)
      crosshair(c, random.range(20, 412), random.range(30, 680), 4);
    c.setLineDash([8, 8]);
    c.beginPath();
    c.moveTo(216, 20);
    c.lineTo(216, 690);
    c.stroke();
    c.beginPath();
    c.arc(350, 430, 82, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
    label(c, 'SECTION A—A', 292, 447, 10, FAINT);
    label(c, 'REF 03-B', 18, 145, 10, FAINT);
    label(c, 'FLOW →', 340, 165, 11, FAINT);
    for (let y = 48; y < 690; y += 120) {
      label(c, String(y).padStart(3, '0'), 8, y, 8, CYAN);
    }
  }
  draw(c: CanvasRenderingContext2D): void {
    c.drawImage(this.paper, 0, 0, CONFIG.width, CONFIG.height);
  }
}
