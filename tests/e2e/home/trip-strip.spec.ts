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

		// At least one trip card link should be visible
		await expect(page.locator('a[href^="/trip/"]').first()).toBeVisible();
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
		await page.locator('a[href^="/trip/"]').first().click();

		await expect(page).toHaveURL(/\/trip\/.+/);
	});
});
