import { test, expect } from "@playwright/test";
import { getTripRoute } from "@/utils/route";

const TRIP_ID = "spain-fiesta";

test.describe("Showcase Theme", () => {
	test("renders the trip page", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(page).not.toHaveURL(/error/);
	});

	test("renders the active photo area", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		// Showcase renders a full-bleed active photo with a thumbnail strip.
		// The trip title inside the active area confirms the layout mounted.
		await expect(
			page.getByRole("heading", { name: /spain/i })
		).toBeVisible();
	});

	test("renders photo counter when photos are available", async ({
		page,
	}) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		// Counter text is either "1 / N" or the empty state message
		await expect(
			page
				.getByText(/\d+ \/ \d+/)
				.or(page.getByText("No photos available"))
		).toBeVisible();
	});
});
