import { describe, it, expect } from "vitest";
import {
	buildPhotosAnimations,
	getLayoutScrollHeight,
	MIN_LAYOUT_SCROLL_HEIGHT,
	type PhotoAnimation,
} from "@/utils/smooth-scroll-layout";
import type { Photo } from "@/types/photo";

const photo = (src: string): Photo => ({ src });

const photos = (n: number): Photo[] =>
	Array.from({ length: n }, (_, i) => photo(`https://example.com/${i}.jpg`));

describe("buildPhotosAnimations", () => {
	it("returns an empty array for empty input", () => {
		expect(buildPhotosAnimations([])).toEqual([]);
	});

	it("returns the same number of items as photos", () => {
		expect(buildPhotosAnimations(photos(5))).toHaveLength(5);
	});

	it("each item holds a reference to its source photo", () => {
		const input = photos(3);
		const animations = buildPhotosAnimations(input);
		input.forEach((p, i) => expect(animations[i].photo).toBe(p));
	});

	it("each item has all required animation properties", () => {
		const [a] = buildPhotosAnimations([photo("test.jpg")]);
		expect(typeof a.layoutIndex).toBe("number");
		expect(typeof a.revealFrom).toBe("string");
		expect(typeof a.revealTo).toBe("string");
		expect(typeof a.startScale).toBe("number");
		expect(typeof a.holdScale).toBe("number");
		expect(typeof a.endScale).toBe("number");
		expect(typeof a.scrubOffset).toBe("number");
		expect(typeof a.startRatio).toBe("number");
		expect(typeof a.scrollSpan).toBe("number");
		expect(typeof a.entryPortion).toBe("number");
		expect(typeof a.holdPortion).toBe("number");
		expect(typeof a.exitPortion).toBe("number");
	});

	it("layoutIndex cycles 0–4", () => {
		const animations = buildPhotosAnimations(photos(11));
		expect(animations[0].layoutIndex).toBe(0);
		expect(animations[4].layoutIndex).toBe(4);
		expect(animations[5].layoutIndex).toBe(0);
		expect(animations[10].layoutIndex).toBe(0);
	});

	it("revealFrom and revealTo are CSS polygon() strings", () => {
		const animations = buildPhotosAnimations(photos(5));
		for (const a of animations) {
			expect(a.revealFrom).toMatch(/^polygon\(/);
			expect(a.revealTo).toMatch(/^polygon\(/);
		}
	});

	it("scrubOffset strictly increases with each photo", () => {
		const animations = buildPhotosAnimations(photos(6));
		for (let i = 1; i < animations.length; i++) {
			expect(animations[i].scrubOffset).toBeGreaterThan(
				animations[i - 1].scrubOffset
			);
		}
	});

	it("entryPortion + holdPortion + exitPortion equals 1 for each item", () => {
		const animations = buildPhotosAnimations(photos(8));
		for (const a of animations) {
			expect(a.entryPortion + a.holdPortion + a.exitPortion).toBeCloseTo(1);
		}
	});
});

describe("getLayoutScrollHeight", () => {
	it("returns MIN_LAYOUT_SCROLL_HEIGHT for an empty array", () => {
		expect(getLayoutScrollHeight([])).toBe(MIN_LAYOUT_SCROLL_HEIGHT);
	});

	it("returns a value >= MIN_LAYOUT_SCROLL_HEIGHT for any input", () => {
		const animations = buildPhotosAnimations(photos(5));
		expect(getLayoutScrollHeight(animations)).toBeGreaterThanOrEqual(
			MIN_LAYOUT_SCROLL_HEIGHT
		);
	});

	it("returns a larger value for more animation items", () => {
		const few = buildPhotosAnimations(photos(3));
		const many = buildPhotosAnimations(photos(8));
		expect(getLayoutScrollHeight(many)).toBeGreaterThan(
			getLayoutScrollHeight(few)
		);
	});

	it("uses MIN_LAYOUT_SCROLL_HEIGHT as a floor when computed value is smaller", () => {
		// A single item with a tiny scrollSpan won't exceed the minimum
		const tiny: PhotoAnimation[] = [
			{
				photo: photo("x.jpg"),
				layoutIndex: 0,
				revealFrom: "",
				revealTo: "",
				startScale: 1,
				holdScale: 1,
				endScale: 1,
				scrubOffset: 0,
				startRatio: 0.01,
				scrollSpan: 1,
				entryPortion: 0.33,
				holdPortion: 0.33,
				exitPortion: 0.34,
			},
		];
		expect(getLayoutScrollHeight(tiny)).toBe(MIN_LAYOUT_SCROLL_HEIGHT);
	});

	it("is deterministic — same input returns the same height", () => {
		const animations = buildPhotosAnimations(photos(4));
		expect(getLayoutScrollHeight(animations)).toBe(
			getLayoutScrollHeight(animations)
		);
	});
});
