import { describe, it, expect } from "vitest";
import { seededRandom } from "@/utils/random";

describe("seededRandom", () => {
	it("should return a number between 0 and 1", () => {
		const result = seededRandom(42);
		expect(result).toBeGreaterThanOrEqual(0);
		expect(result).toBeLessThan(1);
	});

	it("should return the same value for the same seed", () => {
		expect(seededRandom(1)).toBe(seededRandom(1));
		expect(seededRandom(99)).toBe(seededRandom(99));
		expect(seededRandom(0)).toBe(seededRandom(0));
	});

	it("should return different values for different seeds", () => {
		const a = seededRandom(1);
		const b = seededRandom(2);
		expect(a).not.toBe(b);
	});

	it("should produce consistent values across calls", () => {
		const sequence = [1, 2, 3, 4, 5].map(seededRandom);
		const repeated = [1, 2, 3, 4, 5].map(seededRandom);
		expect(sequence).toEqual(repeated);
	});
});
