import { test, expect, type Page } from "@playwright/test";
import { getHomeRoute } from "@/utils/route";

async function openTripStrip(page: Page) {
	await page.getByRole("button", { name: "Open all trips" }).click();
	// Wait for the strip to fully open (close button becomes visible when open)
	await expect(
		page.getByRole("button", { name: "Close trips panel" })
	).toBeVisible();
}

test.describe("Trip Strip", () => {
	test("opener button is visible", async ({ page }) => {
		await page.goto(getHomeRoute());

		await expect(
			page.getByRole("button", { name: "Open all trips" })
		).toBeVisible();
	});

	test("opens and shows trip cards", async ({ page }) => {
		await page.goto(getHomeRoute());

		await openTripStrip(page);

		const tripLinks = page.locator('a[href^="/trip/"]');
		const count = await tripLinks.count();
		test.skip(count === 0, "No trips seeded in DB yet");

		await expect(tripLinks.first()).toBeVisible();
	});

	test("can be closed after opening", async ({ page }) => {
		await page.goto(getHomeRoute());

		await openTripStrip(page);
		await page.getByRole("button", { name: "Close trips panel" }).click();

		await expect(
			page.getByRole("button", { name: "Open all trips" })
		).toBeEnabled();
		await expect(
			page.getByRole("button", { name: "Close trips panel" })
		).not.toBeVisible();
	});

	test("trip card navigates to trip detail page", async ({ page }) => {
		await page.goto(getHomeRoute());

		await openTripStrip(page);

		const tripLinks = page.locator('a[href^="/trip/"]');
		const count = await tripLinks.count();
		test.skip(count === 0, "No trips seeded in DB yet");

		await tripLinks.first().click();
		await expect(page).toHaveURL(/\/trip\/.+/);
	});
});
