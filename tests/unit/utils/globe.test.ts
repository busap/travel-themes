import { describe, it, expect } from "vitest";
import { computeCentroid, type GeoFeature } from "@/utils/globe";

function polygon(rings: number[][][]): GeoFeature {
	return {
		type: "Feature",
		id: "test",
		properties: {},
		geometry: { type: "Polygon", coordinates: rings },
	};
}

function multiPolygon(polys: number[][][][]): GeoFeature {
	return {
		type: "Feature",
		id: "test",
		properties: {},
		geometry: { type: "MultiPolygon", coordinates: polys },
	};
}

describe("computeCentroid", () => {
	it("returns lat and lng properties", () => {
		const result = computeCentroid(
			polygon([[[0, 0], [4, 0], [4, 4], [0, 4]]])
		);
		expect(result).toHaveProperty("lat");
		expect(result).toHaveProperty("lng");
	});

	it("computes the average of a Polygon ring", () => {
		// Square: lng (x) 0,4,4,0 → avg 2; lat (y) 0,0,4,4 → avg 2
		const { lat, lng } = computeCentroid(
			polygon([[[0, 0], [4, 0], [4, 4], [0, 4]]])
		);
		expect(lng).toBeCloseTo(2);
		expect(lat).toBeCloseTo(2);
	});

	it("uses only the first (outer) ring of a Polygon", () => {
		// Inner ring should be ignored
		const { lat, lng } = computeCentroid(
			polygon([
				[[0, 0], [6, 0], [6, 6], [0, 6]], // outer — avg 3, 3
				[[2, 2], [4, 2], [4, 4], [2, 4]], // hole — should be ignored
			])
		);
		expect(lng).toBeCloseTo(3);
		expect(lat).toBeCloseTo(3);
	});

	it("picks the largest ring from a MultiPolygon", () => {
		// poly A: 2 points (small); poly B: 4 points (large) → B wins
		const { lat, lng } = computeCentroid(
			multiPolygon([
				[[[0, 0], [1, 1]]], // 2 points
				[[[10, 10], [20, 10], [20, 20], [10, 20]]], // 4 points
			])
		);
		expect(lng).toBeCloseTo(15);
		expect(lat).toBeCloseTo(15);
	});

	it("keeps the earlier ring when a later one is smaller", () => {
		// poly A: 4 points (large) → becomes best; poly B: 2 points → does not replace
		const { lat, lng } = computeCentroid(
			multiPolygon([
				[[[10, 10], [20, 10], [20, 20], [10, 20]]], // 4 points — should win
				[[[0, 0], [1, 1]]], // 2 points — should be ignored
			])
		);
		expect(lng).toBeCloseTo(15);
		expect(lat).toBeCloseTo(15);
	});

	it("returns finite numbers", () => {
		const { lat, lng } = computeCentroid(
			polygon([[[130, 30], [140, 30], [140, 40], [130, 40]]])
		);
		expect(Number.isFinite(lat)).toBe(true);
		expect(Number.isFinite(lng)).toBe(true);
	});
});
