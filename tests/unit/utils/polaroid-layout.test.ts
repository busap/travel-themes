import { describe, it, expect } from "vitest";
import { getPolaroidTransform } from "@/utils/polaroid-layout";

describe("getPolaroidTransform", () => {
	it("returns rotation, scale, and offset with x and y", () => {
		const result = getPolaroidTransform(0);
		expect(result).toHaveProperty("rotation");
		expect(result).toHaveProperty("scale");
		expect(result).toHaveProperty("offset");
		expect(result.offset).toHaveProperty("x");
		expect(result.offset).toHaveProperty("y");
	});

	it("rotation is a finite number between -10 and 10", () => {
		for (let i = 0; i < 16; i++) {
			const { rotation } = getPolaroidTransform(i);
			expect(typeof rotation).toBe("number");
			expect(rotation).toBeGreaterThanOrEqual(-10);
			expect(rotation).toBeLessThanOrEqual(10);
		}
	});

	it("scale is a finite number close to 1", () => {
		for (let i = 0; i < 11; i++) {
			const { scale } = getPolaroidTransform(i);
			expect(typeof scale).toBe("number");
			expect(scale).toBeGreaterThan(0.9);
			expect(scale).toBeLessThan(1.1);
		}
	});

	it("offset x and y are finite numbers", () => {
		for (let i = 0; i < 12; i++) {
			const { offset } = getPolaroidTransform(i);
			expect(Number.isFinite(offset.x)).toBe(true);
			expect(Number.isFinite(offset.y)).toBe(true);
		}
	});

	it("is deterministic — same index always returns the same values", () => {
		expect(getPolaroidTransform(5)).toEqual(getPolaroidTransform(5));
	});

	it("rotation table cycles every 16 entries", () => {
		for (let i = 0; i < 16; i++) {
			expect(getPolaroidTransform(i).rotation).toBe(
				getPolaroidTransform(i + 16).rotation
			);
		}
	});

	it("scale table cycles every 11 entries", () => {
		for (let i = 0; i < 11; i++) {
			expect(getPolaroidTransform(i).scale).toBe(
				getPolaroidTransform(i + 11).scale
			);
		}
	});

	it("offset x table cycles every 12 entries", () => {
		for (let i = 0; i < 12; i++) {
			expect(getPolaroidTransform(i).offset.x).toBe(
				getPolaroidTransform(i + 12).offset.x
			);
		}
	});

	it("not all rotations are the same — values vary across the table", () => {
		const rotations = Array.from({ length: 16 }, (_, i) =>
			getPolaroidTransform(i).rotation
		);
		const unique = new Set(rotations);
		expect(unique.size).toBeGreaterThan(1);
	});
});
