import type { Game } from '../game/Game';
import { GameState } from '../game/GameState';
import { CONFIG } from '../game/GameConfig';
import type { Effects } from '../effects/Effects';
import type { PipePair } from '../entities/PipeManager';
import type { CanvasViewport } from '../viewport/CanvasViewport';
import { BackgroundRenderer } from './BackgroundRenderer';
import {
  CYAN,
  INK,
  PAPER,
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
      this.challengeField(pipe);
      const top = pipe.gapY - pipe.gapSize / 2,
        bottom = pipe.gapY + pipe.gapSize / 2;
      this.duct(pipe.x, 0, top, pipe.id, true);
      this.duct(pipe.x, bottom, CONFIG.ground - bottom, pipe.id, false);
      this.challengeMarker(pipe);
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
    if (pulse > 0) {
      sketchLine(c, -37, 12, -48, 16, 9);
      sketchLine(c, -34, 18, -42, 23, 10);
    }
    c.restore();
    if (!idle && bird.flapAge < 0.28)
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
      label(
        c,
        `+${game.lastScoreDelta}`,
        bird.x + 38,
        bird.y - 35 - effects.scoreAge * 35,
        22,
        INK,
      );
    this.ground(game.groundOffset);
    c.restore();
    drawUi(c, game, best, paused, effects.scoreAge);
    c.restore();
  }
  private challengeField(pipe: PipePair): void {
    const c = this.c,
      challenge = pipe.challenge;
    if (challenge.windForce === 0) return;
    const left = pipe.x - 145,
      width = CONFIG.pipeWidth + 145,
      up = challenge.windForce < 0;
    c.save();
    c.fillStyle = 'rgba(64,95,141,0.045)';
    c.fillRect(left, 96, width, CONFIG.ground - 112);
    c.strokeStyle = CYAN;
    c.setLineDash([7, 7]);
    c.strokeRect(left, 96, width, CONFIG.ground - 112);
    c.setLineDash([]);
    for (let x = left + 24; x < left + width; x += 44) {
      const from = up ? 570 : 170,
        to = up ? 500 : 240;
      sketchLine(c, x, from, x, to, pipe.id + Math.round(x));
      sketchLine(c, x, to, x - 5, to + (up ? 8 : -8), pipe.id + 31);
      sketchLine(c, x, to, x + 5, to + (up ? 8 : -8), pipe.id + 32);
    }
    label(c, challenge.label, left + width / 2, 121, 10, CYAN, 'center');
    c.restore();
  }
  private challengeMarker(pipe: PipePair): void {
    const c = this.c,
      challenge = pipe.challenge;
    if (challenge.kind === 'risk') {
      const targetY = pipe.gapY + challenge.targetOffset;
      c.save();
      c.strokeStyle = INK;
      c.setLineDash([5, 4]);
      c.strokeRect(
        pipe.x + 7,
        targetY - challenge.perfectHalfHeight,
        CONFIG.pipeWidth - 14,
        challenge.perfectHalfHeight * 2,
      );
      c.setLineDash([]);
      ellipse(c, pipe.x + CONFIG.pipeWidth / 2, targetY, 5, 5);
      label(
        c,
        'BONUS +2',
        pipe.x + CONFIG.pipeWidth / 2,
        targetY - 24,
        9,
        INK,
        'center',
      );
      c.restore();
    }
    if (challenge.kind === 'valve') {
      const top = pipe.gapY - pipe.gapSize / 2;
      c.save();
      c.strokeStyle = CYAN;
      const valveX = pipe.x + CONFIG.pipeWidth / 2;
      ellipse(c, valveX, top - 28, 13, 13);
      sketchLine(c, valveX - 9, top - 28, valveX + 9, top - 28, pipe.id + 72);
      sketchLine(c, valveX, top - 37, valveX, top - 19, pipe.id + 73);
      label(
        c,
        'VALVE',
        pipe.x + CONFIG.pipeWidth / 2,
        top - 47,
        9,
        CYAN,
        'center',
      );
      c.restore();
    }
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
  }
}
