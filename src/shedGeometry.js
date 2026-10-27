// World units are feet. Roof overhangs are measured horizontally from the walls.
export const FLOOR_HEIGHT = 0.69;
export const OVERHANG = 4 / 12;

export function roofDimensions(width, length, pitch, wallHeight, overhangInches=4) {
  const overhang = overhangInches / 12;
  const angle = Math.atan(pitch / 12);
  const run = width / 2 + overhang;
  const ridgeY = FLOOR_HEIGHT + wallHeight + width / 2 * pitch / 12;
  const eaveY = FLOOR_HEIGHT + wallHeight - overhang * pitch / 12;
  return {angle, run, ridgeY, eaveY, slope: run / Math.cos(angle), roofLength: length + 2 * overhang};
}
