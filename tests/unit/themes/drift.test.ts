import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "italian-escape";

describe("Drift theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Drift).component).toBe("drift-theme");
		});

		it("has a scroll trigger that starts at top 60%", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Drift).animation;
			expect(scrollTrigger?.start).toBe("top 60%");
		});

		it("has a smooth staggered timeline", () => {
			const { timeline } = getThemeConfig(Theme.Drift).animation;
			expect(timeline?.duration).toBe(0.8);
			expect(timeline?.ease).toBe("power3.out");
			expect(timeline?.stagger).toBe(0.12);
		});

		it("does not use scrub or pin", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Drift).animation;
			expect(scrollTrigger?.scrub).toBeUndefined();
			expect(scrollTrigger?.pin).toBeUndefined();
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Italian Escape trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Drift);
		});

		it("getTripThemeConfig returns the drift-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("drift-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
