import type { Game } from '../game/Game';
import { INK, RED, label } from '../rendering/BlueprintPrimitives';
export class DebugOverlay {
  enabled = new URLSearchParams(location.search).get('debug') === '1';
  private frameTime = 16.7;
  toggle(): void {
    this.enabled = !this.enabled;
  }
  draw(
    c: CanvasRenderingContext2D,
    game: Game,
    delta: number,
    dpr: number,
  ): void {
    if (!this.enabled) return;
    if (delta > 0) this.frameTime = this.frameTime * 0.9 + delta * 1000;
    c.fillStyle = 'rgba(236,230,210,0.97)';
    c.fillRect(8, 112, 300, 118);
    const rows = [
      `${(1000 / this.frameTime).toFixed(0)} FPS | ${this.frameTime.toFixed(1)} ms | ${game.state}`,
      `Y ${game.bird.y.toFixed(1)} V ${game.bird.velocityY.toFixed(1)}`,
      `PIPES ${game.pipes.pipes.length} SCORE ${game.score} COMBO ${game.combo}`,
      `WIND ${game.windForce.toFixed(0)} CLEAR ${game.clearances}`,
      `SEED ${game.seed}`,
      `WORLD 432×768 | DPR ${dpr}`,
    ];
    rows.forEach((row, i) => label(c, row, 15, 129 + i * 17, 11, INK));
    c.strokeStyle = RED;
    c.beginPath();
    c.arc(game.bird.x, game.bird.y, game.bird.radius, 0, Math.PI * 2);
    c.stroke();
  }
}
