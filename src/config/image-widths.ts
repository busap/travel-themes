// Single source of truth for the responsive widths we generate and serve.
//
// next/image only ever requests widths from (deviceSizes ∪ imageSizes), so the
// image pipeline (scripts/process-images.ts) pre-generates exactly these AVIF
// derivatives — every device/DPR combination is covered, and nothing else is
// ever requested. Keep this list in sync by referencing it from both places
// instead of duplicating the numbers.
export const DEVICE_SIZES = [640, 1080, 1920, 2560];
export const IMAGE_SIZES = [256, 384];

// All widths that exist as files in the bucket, smallest first.
export const ALL_WIDTHS = [...IMAGE_SIZES, ...DEVICE_SIZES];
