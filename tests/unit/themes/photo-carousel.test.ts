import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "australian-outback";

describe("PhotoCarousel theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.PhotoCarousel).component).toBe(
				"photo-carousel-theme"
			);
		});

		it("has no scroll trigger (swipe/click driven)", () => {
			const { scrollTrigger } = getThemeConfig(
				Theme.PhotoCarousel
			).animation;
			expect(scrollTrigger).toBeUndefined();
		});

		it("uses a linear ease for consistent slide speed", () => {
			const { timeline } = getThemeConfig(Theme.PhotoCarousel).animation;
			expect(timeline?.duration).toBe(1.0);
			expect(timeline?.ease).toBe("linear");
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Australian Outback trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.PhotoCarousel);
		});

		it("getTripThemeConfig returns the photo-carousel-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"photo-carousel-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
