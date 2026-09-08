import { CONFIG } from '../game/GameConfig';
export class Bird {
  y = 340;
  velocityY = 0;
  rotation = 0;
  targetRotation = 0;
  flapAge = 1;
  readonly x = CONFIG.birdX;
  readonly radius = CONFIG.radius;
}
