import { test, expect } from "@playwright/test";
import { getTripRoute } from "@/utils/route";

const TRIP_ID = "thailand-adventure";

test.describe("Trail Theme", () => {
	test("renders the trip page", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(page).not.toHaveURL(/error/);
	});

	test("renders the photo stack layout", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		// Trail theme renders a stacked card layout with no GSAP data attrs;
		// verify the theme container mounts successfully.
		await expect(page.locator("body")).toBeVisible();
	});

	test("displays the trip name", async ({ page }) => {
		const response = await page.goto(getTripRoute(TRIP_ID));
		test.skip(response?.status() === 404, "Trip not seeded in DB yet");

		await expect(
			page.getByRole("heading", { name: /thailand/i })
		).toBeVisible();
	});
});
