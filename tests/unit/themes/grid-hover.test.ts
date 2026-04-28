import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "portugal-coastline";

describe("GridHover theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.GridHover).component).toBe(
				"grid-hover-theme"
			);
		});

		it("has an empty animation config (CSS hover-driven)", () => {
			const { animation } = getThemeConfig(Theme.GridHover);
			expect(animation.scrollTrigger).toBeUndefined();
			expect(animation.timeline).toBeUndefined();
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Portugal Coastline trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.GridHover);
		});

		it("getTripThemeConfig returns the grid-hover-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe(
				"grid-hover-theme"
			);
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
