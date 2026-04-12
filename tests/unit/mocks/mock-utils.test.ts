import { describe, it, expect } from "vitest";
import { pickRandom, pickMultiple, randomInt, randomBoolean } from "@/mocks/mock-utils";

describe("mock utilities", () => {
	describe("pickRandom", () => {
		it("should return an element from the array", () => {
			const arr = [1, 2, 3, 4, 5];
			const result = pickRandom(arr);
			expect(arr).toContain(result);
		});

		it("should work with string arrays", () => {
			const arr = ["a", "b", "c"];
			expect(arr).toContain(pickRandom(arr));
		});

		it("should return the only element when array has one item", () => {
			expect(pickRandom(["only"])).toBe("only");
		});
	});

	describe("pickMultiple", () => {
		it("should return the requested number of items", () => {
			const arr = [1, 2, 3, 4, 5];
			expect(pickMultiple(arr, 3)).toHaveLength(3);
		});

		it("should return all items when count equals array length", () => {
			const arr = [1, 2, 3];
			expect(pickMultiple(arr, 3)).toHaveLength(3);
		});

		it("should not exceed array length when count is larger", () => {
			const arr = [1, 2];
			expect(pickMultiple(arr, 10)).toHaveLength(2);
		});

		it("should return items from the original array", () => {
			const arr = ["a", "b", "c", "d"];
			const result = pickMultiple(arr, 2);
			result.forEach((item) => expect(arr).toContain(item));
		});

		it("should not return duplicates", () => {
			const arr = [1, 2, 3, 4, 5];
			const result = pickMultiple(arr, 5);
			expect(new Set(result).size).toBe(result.length);
		});
	});

	describe("randomInt", () => {
		it("should return a number within the given range", () => {
			for (let i = 0; i < 50; i++) {
				const result = randomInt(3, 7);
				expect(result).toBeGreaterThanOrEqual(3);
				expect(result).toBeLessThanOrEqual(7);
			}
		});

		it("should return an integer", () => {
			const result = randomInt(1, 10);
			expect(Number.isInteger(result)).toBe(true);
		});

		it("should return the exact value when min equals max", () => {
			expect(randomInt(5, 5)).toBe(5);
		});
	});

	describe("randomBoolean", () => {
		it("should return a boolean", () => {
			expect(typeof randomBoolean()).toBe("boolean");
		});

		it("should always return true with probability 1", () => {
			for (let i = 0; i < 20; i++) {
				expect(randomBoolean(1)).toBe(true);
			}
		});

		it("should always return false with probability 0", () => {
			for (let i = 0; i < 20; i++) {
				expect(randomBoolean(0)).toBe(false);
			}
		});
	});
});
