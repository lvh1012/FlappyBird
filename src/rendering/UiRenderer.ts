import { GameState } from '../game/GameState';
import type { Game } from '../game/Game';
import {
  CYAN,
  INK,
  PAPER,
  RED,
  label,
  sketchRect,
} from './BlueprintPrimitives';
export function drawUi(
  c: CanvasRenderingContext2D,
  game: Game,
  best: number,
  paused: boolean,
  scoreAge: number,
): void {
  c.fillStyle = PAPER;
  c.fillRect(45, 20, 342, 70);
  label(c, 'SCORE //', 216, 40, 11, CYAN, 'center');
  label(
    c,
    String(game.score).padStart(3, '0'),
    216,
    77,
    scoreAge < 0.18 ? 36 : 32,
    INK,
    'center',
  );
  label(
    c,
    `BEST // ${String(best).padStart(3, '0')}`,
    405,
    111,
    11,
    CYAN,
    'right',
  );
  if (game.state === GameState.Playing) {
    if (game.combo > 0) label(c, `COMBO // ${game.combo}`, 27, 111, 11, INK);
    const upcoming = game.pipes.upcomingChallenge(game.bird.x);
    if (upcoming)
      label(c, upcoming.challenge.label, 216, 132, 11, INK, 'center');
  }
  if (game.state === GameState.Ready) {
    label(c, 'FLIGHT TEST', 216, 204, 13, CYAN, 'center');
    label(c, 'LET IT FLY.', 216, 244, 35, INK, 'center');
    label(
      c,
      'A little lift. A lot of uncertainty.',
      216,
      269,
      12,
      CYAN,
      'center',
    );
    c.strokeStyle = CYAN;
    sketchRect(c, 85, 470, 262, 53, 19);
    label(c, 'SPACE / CLICK / TAP', 216, 501, 15, INK, 'center');
    label(c, 'WARNING: PROTOTYPE MAY HAVE', 216, 571, 10, CYAN, 'center');
    label(c, 'QUESTIONABLE AERODYNAMICS', 216, 587, 10, CYAN, 'center');
    label(c, 'CALCULATIONS PROBABLY CORRECT', 216, 645, 9, CYAN, 'center');
  }
  if (game.state === GameState.GameOver) {
    c.fillStyle = 'rgba(236,230,210,0.97)';
    c.fillRect(44, 215, 344, 340);
    c.strokeStyle = INK;
    sketchRect(c, 44, 215, 344, 340, 11);
    label(c, 'TEST REPORT // FAILED', 216, 254, 19, RED, 'center');
    c.strokeStyle = CYAN;
    c.beginPath();
    c.moveTo(65, 274);
    c.lineTo(367, 274);
    c.stroke();
    for (const [i, name, value] of [
      [0, 'SCORE', game.score],
      [1, 'BEST', best],
      [2, 'CLEARANCES', game.clearances],
      [3, 'BEST COMBO', game.bestCombo],
    ] as const) {
      label(c, name, 70, 307 + i * 30, 13, INK);
      label(
        c,
        String(value).padStart(3, '0'),
        360,
        307 + i * 30,
        16,
        INK,
        'right',
      );
    }
    label(c, `FAILURE // ${game.failureCause}`, 216, 434, 11, RED, 'center');
    c.strokeStyle = CYAN;
    sketchRect(c, 102, 468, 228, 50, 34);
    label(c, '↗ RETRY TEST', 216, 499, 17, INK, 'center');
  }
  if (paused) {
    c.fillStyle = 'rgba(236,230,210,0.94)';
    c.fillRect(0, 0, 432, 768);
    label(c, 'TEST SUSPENDED', 216, 365, 24, INK, 'center');
    label(c, 'PRESS P OR RESUME', 216, 398, 13, CYAN, 'center');
  }
}
