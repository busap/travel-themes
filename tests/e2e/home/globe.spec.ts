import { test, expect } from "@playwright/test";
import { getHomeRoute } from "@/utils/route";

test.describe("Globe", () => {
	// globe.gl is a dynamic import (ssr: false) that fetches topojson from
	// unpkg before creating the canvas — allow extra time to resolve
	const GLOBE_TIMEOUT = 15_000;

	test("canvas is mounted", async ({ page }) => {
		await page.goto(getHomeRoute());

		// globe.gl appends a <canvas> to its container div once initialized
		await expect(page.locator("canvas").first()).toBeAttached({
			timeout: GLOBE_TIMEOUT,
		});
	});

	test("becomes visible after loading", async ({ page }) => {
		await page.goto(getHomeRoute());

		// Globe container starts at opacity 0 and transitions to 1 once
		// isLoaded is set — toBeVisible() fails while opacity is still 0
		await expect(page.locator("canvas").first()).toBeVisible({
			timeout: GLOBE_TIMEOUT,
		});
	});
});
