import { describe, it, expect } from "vitest";
import { getGridCellSize, type GridSize } from "@/utils/mosaic-layout";

const VALID_SIZES: GridSize[] = ["3x3", "3x4", "4x3", "6x3", "6x4"];

const photo = (src: string) => ({ src });

describe("getGridCellSize", () => {
	it("returns gridColumn, gridRow, and size", () => {
		const result = getGridCellSize(photo("https://example.com/a.jpg"), 0);
		expect(result).toHaveProperty("gridColumn");
		expect(result).toHaveProperty("gridRow");
		expect(result).toHaveProperty("size");
	});

	it("size is always a valid GridSize", () => {
		for (let i = 0; i < 20; i++) {
			const result = getGridCellSize(
				photo(`https://example.com/${i}.jpg`),
				i
			);
			expect(VALID_SIZES).toContain(result.size);
		}
	});

	it("gridColumn is a span string", () => {
		const { gridColumn } = getGridCellSize(photo("https://example.com/a.jpg"), 0);
		expect(gridColumn).toMatch(/^span \d+$/);
	});

	it("gridRow is a span string", () => {
		const { gridRow } = getGridCellSize(photo("https://example.com/a.jpg"), 0);
		expect(gridRow).toMatch(/^span \d+$/);
	});

	it("is deterministic — same inputs always produce the same output", () => {
		const p = photo("https://example.com/stable.jpg");
		expect(getGridCellSize(p, 3)).toEqual(getGridCellSize(p, 3));
	});

	it("all five GridSize values are reachable across varied inputs", () => {
		const seen = new Set<GridSize>();
		// Use enough distinct srcs and indices to cover all code branches
		for (let i = 0; i < 200; i++) {
			const result = getGridCellSize(
				photo(`https://example.com/photo-${i * 7919}.jpg`),
				i
			);
			seen.add(result.size);
		}
		expect(seen).toEqual(new Set(VALID_SIZES));
	});

	it("different src values can produce different sizes at the same index", () => {
		const sizes = new Set(
			Array.from({ length: 10 }, (_, i) =>
				getGridCellSize(photo(`https://example.com/img${i * 137}.jpg`), 0).size
			)
		);
		expect(sizes.size).toBeGreaterThan(1);
	});

	it("same src at different indices can produce different sizes", () => {
		const p = photo("https://example.com/same.jpg");
		const sizes = new Set(
			Array.from({ length: 20 }, (_, i) => getGridCellSize(p, i).size)
		);
		expect(sizes.size).toBeGreaterThan(1);
	});
});
