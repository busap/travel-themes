import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "world-in-frames";

describe("Parallax theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Parallax).component).toBe(
				"parallax-theme"
			);
		});

		it("scrubs across the full page with a slow drift", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Parallax).animation;
			expect(scrollTrigger?.scrub).toBe(1.5);
			expect(scrollTrigger?.start).toBe("top top");
			expect(scrollTrigger?.end).toBe("bottom bottom");
		});

		it("has a fine-grained stagger between photo layers", () => {
			const { timeline } = getThemeConfig(Theme.Parallax).animation;
			expect(timeline?.duration).toBe(0.75);
			expect(timeline?.ease).toBe("power3.out");
			expect(timeline?.stagger).toBe(0.09);
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the World in Frames trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Parallax);
		});

		it("getTripThemeConfig returns the parallax-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"parallax-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
