import { test, expect } from "@playwright/test";
import { getTripRoute } from "@/utils/route";

const TRIP_ID = "bali-dreams";

test.describe("Trippy Theme", () => {
	test("renders the trip page", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(page).not.toHaveURL(/error/);
	});

	test("renders photo layers or shows empty state", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(
			page
				.locator("[data-photo-layer]")
				.first()
				.or(page.getByText("No photos available"))
		).toBeVisible();
	});

	test("displays the trip name", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(
			page.getByRole("heading", { name: /bali/i })
		).toBeVisible();
	});
});
