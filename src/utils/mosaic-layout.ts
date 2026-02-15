import { Photo } from '@/types/photo';
import { seededRandom } from './random';

export type GridSize = '3x3' | '3x4' | '4x3' | '6x3' | '6x4';

export interface GridCellAssignment {
  gridColumn: string; // e.g., 'span 3'
  gridRow: string;
  size: GridSize;
}

// Seed multipliers for deterministic randomness
const INDEX_SEED_MULTIPLIER = 1000; // Ensures each index gets unique seed range
const SIZE_SEED_OFFSET = 999; // Separates aspect ratio randomness from size randomness

/**
 * Simple hash function to convert a string to a number.
 * Used to create deterministic randomness based on photo src.
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Assigns grid cell sizes for a 12-column masonry layout.
 * Uses the photo's src and index for deterministic assignments (SSR-safe).
 * Simulates aspect ratio detection to match grid cells to image orientation.
 *
 * Grid sizes (12-column grid):
 * - 3x3: Small square (25% width)
 * - 3x4: Tall rectangle (25% width - for portrait images)
 * - 4x3: Medium square (33% width)
 * - 6x3: Wide rectangle (50% width - for landscape images)
 * - 6x4: Large rectangle (50% width - for landscape images)
 */
export function getGridCellSize(photo: Photo, index: number): GridCellAssignment {
  const srcHash = hashString(photo.src);
  const combinedSeed = srcHash + index * INDEX_SEED_MULTIPLIER;
  const aspectRatioRandom = seededRandom(combinedSeed);
  const sizeRandom = seededRandom(combinedSeed + SIZE_SEED_OFFSET);

  let size: GridSize;
  let gridColumn: string;
  let gridRow: string;

  if (aspectRatioRandom < 0.25) {
    // PORTRAIT orientation - prefer tall cells
    if (sizeRandom < 0.6) {
      // Tall rectangle (3x4) - 60%
      size = '3x4';
      gridColumn = 'span 3';
      gridRow = 'span 4';
    } else if (sizeRandom < 0.9) {
      // Small square (3x3) - 30%
      size = '3x3';
      gridColumn = 'span 3';
      gridRow = 'span 3';
    } else {
      // Medium square (4x3) - 10%
      size = '4x3';
      gridColumn = 'span 4';
      gridRow = 'span 3';
    }
  } else if (aspectRatioRandom < 0.65) {
    // SQUARE orientation - prefer square cells
    if (sizeRandom < 0.5) {
      // Small square (3x3) - 50%
      size = '3x3';
      gridColumn = 'span 3';
      gridRow = 'span 3';
    } else if (sizeRandom < 0.85) {
      // Medium square (4x3) - 35%
      size = '4x3';
      gridColumn = 'span 4';
      gridRow = 'span 3';
    } else {
      // Tall rectangle (3x4) - 15%
      size = '3x4';
      gridColumn = 'span 3';
      gridRow = 'span 4';
    }
  } else {
    // LANDSCAPE orientation - prefer wide cells
    if (sizeRandom < 0.45) {
      // Wide rectangle (6x3) - 45%
      size = '6x3';
      gridColumn = 'span 6';
      gridRow = 'span 3';
    } else if (sizeRandom < 0.7) {
      // Large rectangle (6x4) - 25%
      size = '6x4';
      gridColumn = 'span 6';
      gridRow = 'span 4';
    } else if (sizeRandom < 0.9) {
      // Medium square (4x3) - 20%
      size = '4x3';
      gridColumn = 'span 4';
      gridRow = 'span 3';
    } else {
      // Small square (3x3) - 10%
      size = '3x3';
      gridColumn = 'span 3';
      gridRow = 'span 3';
    }
  }

  return {
    gridColumn,
    gridRow,
    size,
  };
}
