import type { Circle, Rectangle } from '../game/GameConfig';
import { assertFinite, clamp } from '../utils/math';
export function circleIntersectsRect(circle: Circle, rect: Rectangle): boolean {
  assertFinite(
    circle.x,
    circle.y,
    circle.radius,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
  );
  if (circle.radius < 0 || rect.width < 0 || rect.height < 0)
    throw new RangeError('Negative collision dimensions');
  const dx = circle.x - clamp(circle.x, rect.x, rect.x + rect.width);
  const dy = circle.y - clamp(circle.y, rect.y, rect.y + rect.height);
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}
