import { describe, expect, it } from 'vitest';
import {
  CYAN,
  FAINT,
  INK,
  PAPER,
  RED,
} from '../src/rendering/BlueprintPrimitives';

const NORMAL_TEXT_RATIO = 4.5;
const NON_TEXT_RATIO = 3;

function relativeLuminance(hex: string): number {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((channel) => Number.parseInt(channel, 16) / 255);

  if (!channels || channels.length !== 3) {
    throw new Error(`Expected a six-digit hex color, received ${hex}`);
  }

  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4),
  );

  return 0.2126 * red! + 0.7152 * green! + 0.0722 * blue!;
}

function contrastRatio(foreground: string, background: string): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

describe('WCAG AA color contrast', () => {
  it.each([
    ['primary ink', INK],
    ['secondary ink', CYAN],
    ['faint informational ink', FAINT],
    ['critical ink', RED],
  ])('%s reaches 4.5:1 against paper', (_name, color) => {
    expect(contrastRatio(color, PAPER)).toBeGreaterThanOrEqual(
      NORMAL_TEXT_RATIO,
    );
  });

  it('keeps interactive boundaries above the non-text threshold', () => {
    expect(contrastRatio(CYAN, PAPER)).toBeGreaterThanOrEqual(NON_TEXT_RATIO);
  });
});
