export function fitViewport(width: number, height: number, dpr: number) {
  if (
    ![width, height, dpr].every(Number.isFinite) ||
    width <= 0 ||
    height <= 0 ||
    dpr <= 0
  )
    throw new RangeError('Invalid viewport dimensions');
  // Bound full-screen backing memory to four million pixels (~16 MB RGBA).
  const density = Math.min(dpr, 4, Math.sqrt(4_000_000 / (width * height)));
  return {
    width: Math.max(1, Math.floor(width * density)),
    height: Math.max(1, Math.floor(height * density)),
  };
}
