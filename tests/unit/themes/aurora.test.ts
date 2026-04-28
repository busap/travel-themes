import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "nordic-winter";

describe("Aurora theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Aurora).component).toBe("aurora-theme");
		});

		it("uses a pinned scroll trigger", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Aurora).animation;
			expect(scrollTrigger?.pin).toBe(true);
			expect(scrollTrigger?.scrub).toBe(2);
		});

		it("has the correct scroll trigger start and end positions", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Aurora).animation;
			expect(scrollTrigger?.start).toBe("center center");
			expect(scrollTrigger?.end).toBe("+=100%");
		});

		it("has a staggered timeline", () => {
			const { timeline } = getThemeConfig(Theme.Aurora).animation;
			expect(timeline?.duration).toBe(2);
			expect(timeline?.ease).toBe("power2.out");
			expect(timeline?.stagger).toBe(0.3);
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Nordic Winter trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Aurora);
		});

		it("getTripThemeConfig returns the aurora-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("aurora-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
