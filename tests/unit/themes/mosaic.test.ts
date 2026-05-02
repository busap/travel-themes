import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "morocco-markets";

describe("Mosaic theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Mosaic).component).toBe("mosaic-theme");
		});

		it("has the correct scroll trigger positions", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Mosaic).animation;
			expect(scrollTrigger?.start).toBe("top 85%");
			expect(scrollTrigger?.end).toBe("top 60%");
		});

		it("has a fast staggered timeline", () => {
			const { timeline } = getThemeConfig(Theme.Mosaic).animation;
			expect(timeline?.duration).toBe(0.4);
			expect(timeline?.ease).toBe("power2.out");
			expect(timeline?.stagger).toBe(0.1);
		});

		it("does not pin the scroll trigger", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Mosaic).animation;
			expect(scrollTrigger?.pin).toBeUndefined();
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Morocco Markets trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Mosaic);
		});

		it("getTripThemeConfig returns the mosaic-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("mosaic-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
