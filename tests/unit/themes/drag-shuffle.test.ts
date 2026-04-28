import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "swiss-alps";

describe("DragShuffle theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.DragShuffle).component).toBe(
				"drag-shuffle-theme"
			);
		});

		it("has no scroll trigger (interaction-driven, not scroll-driven)", () => {
			const { scrollTrigger } = getThemeConfig(Theme.DragShuffle).animation;
			expect(scrollTrigger).toBeUndefined();
		});

		it("has a snappy timeline for drag response", () => {
			const { timeline } = getThemeConfig(Theme.DragShuffle).animation;
			expect(timeline?.duration).toBe(0.45);
			expect(timeline?.ease).toBe("power3.out");
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Swiss Alps trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.DragShuffle);
		});

		it("getTripThemeConfig returns the drag-shuffle-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"drag-shuffle-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
