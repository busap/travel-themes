import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "thailand-adventure";

describe("Trail theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Trail).component).toBe("trail-theme");
		});

		it("has an empty animation config (cursor-driven, not scroll-driven)", () => {
			const { animation } = getThemeConfig(Theme.Trail);
			expect(animation.scrollTrigger).toBeUndefined();
			expect(animation.timeline).toBeUndefined();
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Thailand Adventure trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Trail);
		});

		it("getTripThemeConfig returns the trail-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("trail-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
