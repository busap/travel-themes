import { test, expect } from "@playwright/test";
import { getHomeRoute, getTripRoute } from "@/utils/route";

// The only trip currently configured in trips-data.ts
const TEST_TRIP_ID = "barcelona-2021";

test.describe("Trip Detail Page", () => {
	test("displays trip name", async ({ page }) => {
		const response = await page.goto(getTripRoute(TEST_TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(
			page.getByRole("heading", { name: /Barcelona Weekend Trip/i })
		).toBeVisible();
	});

	test("displays trip metadata (country code and year)", async ({ page }) => {
		const response = await page.goto(getTripRoute(TEST_TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		// Country code visible in subtitle
		await expect(page.getByText("ES")).toBeVisible();
		// Year visible in subtitle
		await expect(page.getByText("2021")).toBeVisible();
	});

	test("can navigate back to home via browser navigation", async ({
		page,
	}) => {
		// Navigate home → trip, then use browser back
		await page.goto(getHomeRoute());
		await page.goto(getTripRoute(TEST_TRIP_ID));

		await page.goBack();

		await expect(page).toHaveURL(getHomeRoute());
		await expect(
			page.getByRole("heading", { name: "TravelThemes" })
		).toBeVisible();
	});

	test("handles invalid trip id with 404", async ({ page }) => {
		const response = await page.goto(getTripRoute("invalid-trip-id"));

		expect(response?.status()).toBe(404);
	});
});
