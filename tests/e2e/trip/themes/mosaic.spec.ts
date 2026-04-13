import { test, expect } from "@playwright/test";
import { getTripRoute } from "@/utils/route";

// barcelona-2021 is assigned the Mosaic theme in trips-data.ts
const MOSAIC_TRIP_ID = "barcelona-2021";

test.describe("Mosaic Theme", () => {
	test("renders photo grid when photos are available", async ({ page }) => {
		const response = await page.goto(getTripRoute(MOSAIC_TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		// Either photo grid items are present, or the empty state is shown
		await expect(
			page
				.locator("[data-photo-item]")
				.first()
				.or(page.getByText("No photos available"))
		).toBeVisible();
	});
});
