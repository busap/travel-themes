import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "bali-dreams";

describe("Trippy theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Trippy).component).toBe("trippy-theme");
		});

		it("scrubs across the full page length", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Trippy).animation;
			expect(scrollTrigger?.scrub).toBe(1);
			expect(scrollTrigger?.start).toBe("top top");
			expect(scrollTrigger?.end).toBe("bottom bottom");
		});

		it("has a smooth timeline", () => {
			const { timeline } = getThemeConfig(Theme.Trippy).animation;
			expect(timeline?.duration).toBe(1);
			expect(timeline?.ease).toBe("power2.out");
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Bali Dreams trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Trippy);
		});

		it("getTripThemeConfig returns the trippy-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("trippy-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
