import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "japan-2023";

describe("Collage theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Collage).component).toBe(
				"collage-theme"
			);
		});

		it("has an empty animation config (no scroll trigger or timeline)", () => {
			const { animation } = getThemeConfig(Theme.Collage);
			expect(animation.scrollTrigger).toBeUndefined();
			expect(animation.timeline).toBeUndefined();
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Japan trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Collage);
		});

		it("getTripThemeConfig returns the collage-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("collage-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
