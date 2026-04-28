import { describe, it, expect } from "vitest";
import { getThemeConfig } from "@/config/theme-config";
import { Theme } from "@/enums/theme";
import { getThemeForTrip, getTripThemeConfig } from "@/utils/trip";

const TRIP_ID = "greek-islands";

describe("Feed theme", () => {
	describe("config", () => {
		it("has the correct component name", () => {
			expect(getThemeConfig(Theme.Feed).component).toBe("feed-theme");
		});

		it("has no scroll trigger (timeline-only animation)", () => {
			const { scrollTrigger } = getThemeConfig(Theme.Feed).animation;
			expect(scrollTrigger).toBeUndefined();
		});

		it("has a staggered timeline", () => {
			const { timeline } = getThemeConfig(Theme.Feed).animation;
			expect(timeline?.duration).toBe(0.5);
			expect(timeline?.ease).toBe("power2.out");
			expect(timeline?.stagger).toBe(0.1);
		});
	});

	describe("trip mapping", () => {
		it("is assigned to the Greek Islands trip", () => {
			expect(getThemeForTrip(TRIP_ID)).toBe(Theme.Feed);
		});

		it("getTripThemeConfig returns the feed-theme component", () => {
			expect(getTripThemeConfig(TRIP_ID).component).toBe("feed-theme");
		});

		it("getTripThemeConfig returns a valid animation object", () => {
			expect(getTripThemeConfig(TRIP_ID).animation).toBeDefined();
		});
	});
});
