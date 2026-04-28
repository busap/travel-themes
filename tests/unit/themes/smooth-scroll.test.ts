import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "paris-romance";

describe("SmoothScroll theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.SmoothScroll).component).toBe(
				"smooth-scroll-theme"
			);
		});

		it("has a high scrub value for slow parallax feel", () => {
			const { scrollTrigger } = getThemeConfig(Theme.SmoothScroll).animation;
			expect(scrollTrigger?.scrub).toBe(5);
		});

		it("covers the full viewport height", () => {
			const { scrollTrigger } = getThemeConfig(Theme.SmoothScroll).animation;
			expect(scrollTrigger?.start).toBe("top top");
			expect(scrollTrigger?.end).toBe("bottom top");
		});

		it("uses a linear ease for uniform motion", () => {
			const { timeline } = getThemeConfig(Theme.SmoothScroll).animation;
			expect(timeline?.ease).toBe("none");
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Paris Romance trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.SmoothScroll);
		});

		it("getTripThemeConfig returns the smooth-scroll-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"smooth-scroll-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
