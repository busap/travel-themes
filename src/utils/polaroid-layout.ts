function getPolaroidRotation(index: number): number {
  const rotations = [-4, 2, -5, 3.5, -2, 6, -3, 4, -6, 2.5, -1, 5, -4.5, 3, -2.5, 5.5];
  return rotations[index % rotations.length];
}

function getPolaroidScale(index: number): number {
  const scales = [1, 0.98, 1.03, 0.96, 1.02, 0.97, 1.05, 0.99, 1.01, 0.95, 1.04];
  return scales[index % scales.length];
}

function getPolaroidOffset(index: number): { x: number; y: number } {
  const xOffsets = [0, 12, -8, 16, -12, 8, -16, 10, -6, 14, -10, 6];
  const yOffsets = [0, -8, 12, -12, 10, -14, 8, -6, 16, -10, 6, -16];

  return {
    x: xOffsets[index % xOffsets.length],
    y: yOffsets[index % yOffsets.length],
  };
}

export function getPolaroidTransform(index: number): {
  rotation: number;
  scale: number;
  offset: { x: number; y: number };
} {
  return {
    rotation: getPolaroidRotation(index),
    scale: getPolaroidScale(index),
    offset: getPolaroidOffset(index),
  };
}
