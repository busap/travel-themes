import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "spain-fiesta";

describe("Showcase theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Showcase).component).toBe(
				"showcase-theme"
			);
		});

		it("has no scroll trigger (UI-interaction driven)", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Showcase).animation;
			expect(scrollTrigger).toBeUndefined();
		});

		it("has a quick timeline for thumbnail transitions", () => {
			const { timeline } = getThemeConfig(Theme.Showcase).animation;
			expect(timeline?.duration).toBe(0.4);
			expect(timeline?.ease).toBe("ease");
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Spain Fiesta trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Showcase);
		});

		it("getTripThemeConfig returns the showcase-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"showcase-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
