import { describe, it, expect } from "vitest";
import {
	clampRange,
	clampProgress,
	computeVirtualRange,
	isInRange,
	progressToIndex,
	rangeToSet,
} from "@/utils/virtualization";

describe("clampRange", () => {
	it("passes through a valid range unchanged", () => {
		expect(clampRange({ start: 2, end: 7 }, 10)).toEqual({ start: 2, end: 7 });
	});

	it("clamps start to 0 when negative", () => {
		expect(clampRange({ start: -3, end: 2 }, 10)).toEqual({ start: 0, end: 2 });
	});

	it("clamps end to count - 1", () => {
		expect(clampRange({ start: 0, end: 15 }, 10)).toEqual({ start: 0, end: 9 });
	});

	it("clamps both sides simultaneously", () => {
		expect(clampRange({ start: -5, end: 50 }, 10)).toEqual({ start: 0, end: 9 });
	});

	it("handles count = 1", () => {
		expect(clampRange({ start: -1, end: 5 }, 1)).toEqual({ start: 0, end: 0 });
	});

	it("clamps a range starting exactly at 0", () => {
		expect(clampRange({ start: 0, end: 3 }, 5)).toEqual({ start: 0, end: 3 });
	});

	it("clamps a range ending exactly at count - 1", () => {
		expect(clampRange({ start: 2, end: 9 }, 10)).toEqual({ start: 2, end: 9 });
	});
});

describe("computeVirtualRange", () => {
	it("expands from focus with given overscan", () => {
		expect(computeVirtualRange(5, 2, 3, 10)).toEqual({ start: 3, end: 8 });
	});

	it("clamps at the start of the list", () => {
		expect(computeVirtualRange(0, 2, 3, 10)).toEqual({ start: 0, end: 3 });
	});

	it("clamps at the end of the list", () => {
		expect(computeVirtualRange(9, 2, 3, 10)).toEqual({ start: 7, end: 9 });
	});

	it("covers the entire list when overscan exceeds bounds", () => {
		expect(computeVirtualRange(5, 10, 10, 10)).toEqual({ start: 0, end: 9 });
	});

	it("handles a single-item list", () => {
		expect(computeVirtualRange(0, 2, 2, 1)).toEqual({ start: 0, end: 0 });
	});

	it("handles a fast index jump to the last item", () => {
		expect(computeVirtualRange(99, 1, 2, 100)).toEqual({ start: 98, end: 99 });
	});

	it("handles a fast index jump to the first item", () => {
		expect(computeVirtualRange(0, 1, 2, 100)).toEqual({ start: 0, end: 2 });
	});

	it("works with zero overscan (focus only)", () => {
		expect(computeVirtualRange(5, 0, 0, 10)).toEqual({ start: 5, end: 5 });
	});
});

describe("progressToIndex", () => {
	it("returns 0 for progress = 0", () => {
		expect(progressToIndex(0, 10)).toBe(0);
	});

	it("returns last index for progress = 1", () => {
		expect(progressToIndex(1, 10)).toBe(9);
	});

	it("rounds to nearest index at midpoint", () => {
		// 0.5 * 9 = 4.5 → rounds to 5
		expect(progressToIndex(0.5, 10)).toBe(5);
	});

	it("clamps negative progress to index 0", () => {
		expect(progressToIndex(-0.5, 10)).toBe(0);
	});

	it("clamps progress > 1 to last index", () => {
		expect(progressToIndex(1.5, 10)).toBe(9);
	});

	it("returns 0 for a single-item list regardless of progress", () => {
		expect(progressToIndex(0, 1)).toBe(0);
		expect(progressToIndex(0.5, 1)).toBe(0);
		expect(progressToIndex(1, 1)).toBe(0);
	});

	it("handles a large list at boundaries", () => {
		expect(progressToIndex(0, 1000)).toBe(0);
		expect(progressToIndex(1, 1000)).toBe(999);
	});

	it("handles a two-item list", () => {
		expect(progressToIndex(0, 2)).toBe(0);
		expect(progressToIndex(0.5, 2)).toBe(1);
		expect(progressToIndex(1, 2)).toBe(1);
	});
});

describe("clampProgress", () => {
	it("returns the value unchanged when in [0, 1]", () => {
		expect(clampProgress(0.5)).toBe(0.5);
	});

	it("clamps to 0 for negative values", () => {
		expect(clampProgress(-0.1)).toBe(0);
	});

	it("clamps to 1 for values above 1", () => {
		expect(clampProgress(1.5)).toBe(1);
	});

	it("returns 0 exactly", () => {
		expect(clampProgress(0)).toBe(0);
	});

	it("returns 1 exactly", () => {
		expect(clampProgress(1)).toBe(1);
	});
});

describe("isInRange", () => {
	it("returns true for an index strictly inside the range", () => {
		expect(isInRange(3, { start: 1, end: 5 })).toBe(true);
	});

	it("returns true at the start boundary (inclusive)", () => {
		expect(isInRange(1, { start: 1, end: 5 })).toBe(true);
	});

	it("returns true at the end boundary (inclusive)", () => {
		expect(isInRange(5, { start: 1, end: 5 })).toBe(true);
	});

	it("returns false for an index below the range", () => {
		expect(isInRange(0, { start: 1, end: 5 })).toBe(false);
	});

	it("returns false for an index above the range", () => {
		expect(isInRange(6, { start: 1, end: 5 })).toBe(false);
	});

	it("handles a single-element range", () => {
		expect(isInRange(3, { start: 3, end: 3 })).toBe(true);
		expect(isInRange(4, { start: 3, end: 3 })).toBe(false);
	});
});

describe("rangeToSet", () => {
	it("builds a set containing all indices in the range", () => {
		expect(rangeToSet({ start: 2, end: 5 })).toEqual(new Set([2, 3, 4, 5]));
	});

	it("handles a single-element range", () => {
		expect(rangeToSet({ start: 3, end: 3 })).toEqual(new Set([3]));
	});

	it("handles a range starting at 0", () => {
		expect(rangeToSet({ start: 0, end: 2 })).toEqual(new Set([0, 1, 2]));
	});

	it("produces a set whose size equals end - start + 1", () => {
		const range = { start: 4, end: 9 };
		expect(rangeToSet(range).size).toBe(range.end - range.start + 1);
	});
});
