import type { Game } from '../game/Game';
import { GameState } from '../game/GameState';
import { CONFIG } from '../game/GameConfig';
import type { Effects } from '../effects/Effects';
import type { CanvasViewport } from '../viewport/CanvasViewport';
import { BackgroundRenderer } from './BackgroundRenderer';
import {
  CYAN,
  FAINT,
  INK,
  PAPER,
  crosshair,
  dimension,
  ellipse,
  label,
  sketchLine,
  sketchRect,
} from './BlueprintPrimitives';
import { drawUi } from './UiRenderer';
export class BlueprintRenderer {
  private readonly background: BackgroundRenderer;
  constructor(
    private readonly c: CanvasRenderingContext2D,
    private readonly viewport: CanvasViewport,
    seed: number,
  ) {
    this.background = new BackgroundRenderer(seed);
  }
  draw(game: Game, effects: Effects, best: number, paused: boolean): void {
    const c = this.c;
    this.viewport.begin();
    c.save();
    c.beginPath();
    c.rect(0, 0, CONFIG.width, CONFIG.height);
    c.clip();
    this.background.draw(c);
    c.save();
    c.translate(effects.shake.offset, 0);
    c.lineWidth = 0.9;
    for (const pipe of game.pipes.pipes) {
      const top = pipe.gapY - pipe.gapSize / 2,
        bottom = pipe.gapY + pipe.gapSize / 2;
      this.duct(pipe.x, 0, top, pipe.id, true);
      this.duct(pipe.x, bottom, CONFIG.ground - bottom, pipe.id, false);
      if (pipe.id % 3 === 0) {
        dimension(c, pipe.x + 88, top + 8, bottom - 8);
        label(c, `GAP ${pipe.gapSize}`, pipe.x + 95, pipe.gapY, 9);
      }
    }
    const bird = game.bird,
      idle = game.state === GameState.Ready;
    c.save();
    c.translate(
      idle ? 216 : bird.x,
      bird.y +
        (idle && !effects.reducedMotion ? Math.sin(game.time * 2) * 7 : 0),
    );
    c.rotate(bird.rotation);
    const pulse = Math.max(0, 1 - bird.flapAge / 0.15);
    c.scale(idle ? 1.8 : 1 + pulse * 0.06, idle ? 1.8 : 1 - pulse * 0.05);
    c.fillStyle = PAPER;
    c.beginPath();
    c.ellipse(0, 0, 23, 18, 0, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = INK;
    ellipse(c, 0, 0, 23, 18);
    sketchLine(c, -21, 1, -34, -8, 81);
    sketchLine(c, -34, -8, -30, 8, 82);
    sketchLine(c, -30, 8, -21, 6, 83);
    sketchLine(c, 20, -3, 34, 3, 84);
    sketchLine(c, 34, 3, 22, 7, 85);
    c.save();
    c.translate(-5, 3);
    c.rotate(-0.35 - pulse * 0.9);
    ellipse(c, -3, 3, 13, 6);
    sketchLine(c, -13, 4, 4, 2, 8);
    c.restore();
    c.fillStyle = INK;
    c.beginPath();
    c.arc(11, -6, 2.4, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = CYAN;
    crosshair(c, 0, 0, 3);
    if (pulse > 0) {
      sketchLine(c, -37, 12, -48, 16, 9);
      sketchLine(c, -34, 18, -42, 23, 10);
    }
    c.restore();
    if (idle) {
      c.strokeStyle = FAINT;
      sketchLine(c, 162, 365, 126, 403);
      sketchLine(c, 126, 403, 66, 403);
      label(c, 'FLAP UNIT Mk.II', 58, 420, 11);
      dimension(c, 289, 309, 374);
      label(c, 'R = 24', 301, 344, 10);
      label(c, 'CG', 218, 387, 10);
    } else if (bird.flapAge < 0.28)
      label(c, 'LIFT ↑', bird.x + 34, bird.y - 25, 10);
    for (const p of effects.particles.particles) {
      c.globalAlpha = 1 - p.age / p.lifetime;
      c.strokeStyle = INK;
      sketchLine(
        c,
        p.x,
        p.y,
        p.x + Math.cos(p.rotation) * 4,
        p.y + Math.sin(p.rotation) * 4,
      );
    }
    c.globalAlpha = 1;
    if (effects.scoreAge < 0.6)
      label(c, '+1', bird.x + 38, bird.y - 35 - effects.scoreAge * 35, 22, INK);
    this.ground(game.groundOffset);
    c.restore();
    drawUi(c, game, best, paused, effects.scoreAge);
    c.restore();
  }
  private duct(
    x: number,
    y: number,
    height: number,
    id: number,
    upper: boolean,
  ): void {
    const c = this.c,
      w = CONFIG.pipeWidth;
    c.fillStyle = PAPER;
    c.fillRect(x, y, w, height);
    c.strokeStyle = INK;
    sketchRect(c, x, y, w, height, id + 2);
    c.strokeStyle = CYAN;
    sketchRect(c, x + 5, y + 3, w - 10, Math.max(0, height - 6), id + 3);
    const joint = upper ? y + height - 20 : y + 4;
    c.fillStyle = PAPER;
    c.fillRect(x, joint, w, 15);
    c.strokeStyle = INK;
    sketchRect(c, x, joint, w, 15, id + 13);
    for (const boltX of [x + 10, x + w - 10]) {
      c.beginPath();
      c.arc(boltX, joint + 7, 2, 0, Math.PI * 2);
      c.stroke();
    }
    c.strokeStyle = FAINT;
    c.setLineDash([6, 6]);
    c.beginPath();
    c.moveTo(x + w / 2, y + 24);
    c.lineTo(x + w / 2, y + height - 24);
    c.stroke();
    c.setLineDash([]);
    if (height > 100) {
      c.save();
      c.translate(x + 25, upper ? y + height - 45 : y + 48);
      c.rotate(-Math.PI / 2);
      label(c, `DUCT B-${String(id).padStart(2, '0')}`, 0, 0, 9);
      c.restore();
    }
  }
  private ground(offset: number): void {
    const c = this.c;
    c.fillStyle = PAPER;
    c.fillRect(0, CONFIG.ground, 432, 64);
    c.strokeStyle = CYAN;
    c.lineWidth = 0.6;
    for (let x = -48 - offset; x < 480; x += 16)
      sketchLine(c, x, CONFIG.ground + 24, x + 22, CONFIG.ground + 2, 3);
    c.strokeStyle = INK;
    sketchLine(c, 0, CONFIG.ground, 432, CONFIG.ground, 3);
    sketchLine(c, 0, CONFIG.ground + 27, 432, CONFIG.ground + 27, 4);
    label(c, 'GROUND DATUM ±0.00', 18, 752, 10);
    label(c, 'SHEET 01 / 01', 414, 752, 9, CYAN, 'right');
  }
}
