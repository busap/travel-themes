import type { VirtualRange } from "@/types/virtualization";

/** Clamp a range so start >= 0 and end <= count - 1. */
export function clampRange(range: VirtualRange, count: number): VirtualRange {
	return {
		start: Math.max(0, range.start),
		end: Math.min(count - 1, range.end),
	};
}

/**
 * Compute a virtual mount window centered on focusIndex.
 * The window extends overscanBehind items before and overscanAhead items after,
 * clamped to [0, count - 1].
 */
export function computeVirtualRange(
	focusIndex: number,
	overscanBehind: number,
	overscanAhead: number,
	count: number
): VirtualRange {
	return clampRange(
		{ start: focusIndex - overscanBehind, end: focusIndex + overscanAhead },
		count
	);
}

/** Convert a scroll progress value (0–1) to the nearest item index. */
export function progressToIndex(progress: number, count: number): number {
	if (count <= 1) return 0;
	return Math.round(Math.min(1, Math.max(0, progress)) * (count - 1));
}

/** Clamp a raw scroll progress value to [0, 1]. */
export function clampProgress(rawProgress: number): number {
	return Math.min(1, Math.max(0, rawProgress));
}

/** Return true when index falls within range (inclusive on both ends). */
export function isInRange(index: number, range: VirtualRange): boolean {
	return index >= range.start && index <= range.end;
}

/** Build a Set containing every index from range.start to range.end inclusive. */
export function rangeToSet(range: VirtualRange): Set<number> {
	const result = new Set<number>();
	for (let i = range.start; i <= range.end; i++) {
		result.add(i);
	}
	return result;
}
