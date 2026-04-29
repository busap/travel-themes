import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "new-zealand";

describe("ImageGridHero theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.ImageGridHero).component).toBe(
				"image-grid-hero-theme"
			);
		});

		it("uses a pinned scroll trigger for the hero animation", () => {
			const { scrollTrigger } = getThemeConfig(
				Theme.ImageGridHero
			).animation;
			expect(scrollTrigger?.pin).toBe(true);
			expect(scrollTrigger?.scrub).toBe(1.2);
		});

		it("has an extended scroll distance for the reveal", () => {
			const { scrollTrigger } = getThemeConfig(
				Theme.ImageGridHero
			).animation;
			expect(scrollTrigger?.start).toBe("top top");
			expect(scrollTrigger?.end).toBe("+=180%");
		});

		it("has a fast timeline with no stagger between items", () => {
			const { timeline } = getThemeConfig(Theme.ImageGridHero).animation;
			expect(timeline?.duration).toBe(0.8);
			expect(timeline?.ease).toBe("power3.out");
			expect(timeline?.stagger).toBe(0);
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the New Zealand trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.ImageGridHero);
		});

		it("getTripThemeConfig returns the image-grid-hero-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"image-grid-hero-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
