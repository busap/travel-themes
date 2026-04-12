import { test, expect, type Page } from "@playwright/test";
import { getHomeRoute, getTripRoute } from "@/utils/route";

async function openTripStrip(page: Page) {
	await page.getByRole("button", { name: "Open all trips" }).click();
	// Wait for the strip to fully open (aria-hidden is removed when open)
	await expect(
		page.getByRole("button", { name: "Close trips panel" })
	).toBeVisible();
}

test.describe("Home Page", () => {
	test("displays header with title and tagline", async ({ page }) => {
		await page.goto(getHomeRoute());

		await expect(
			page.getByRole("heading", { name: "TravelThemes" })
		).toBeVisible();
		await expect(
			page.getByText("Adventures through the lens")
		).toBeVisible();
	});

	test("displays trip strip opener button", async ({ page }) => {
		await page.goto(getHomeRoute());

		await expect(
			page.getByRole("button", { name: "Open all trips" })
		).toBeVisible();
	});

	test("trip strip opens and shows trip cards", async ({ page }) => {
		await page.goto(getHomeRoute());

		await openTripStrip(page);

		await expect(
			page.getByRole("link", { name: /Japan Adventures/i })
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /Colors of Morocco/i })
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /Nordic Winter/i })
		).toBeVisible();
	});

	test("trip strip can be closed after opening", async ({ page }) => {
		await page.goto(getHomeRoute());

		await openTripStrip(page);
		await page.getByRole("button", { name: "Close trips panel" }).click();

		// Strip should close — open button becomes enabled again
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
		await page.getByRole("link", { name: /Japan Adventures/i }).click();

		await expect(page).toHaveURL(getTripRoute("japan-2023"));
	});
});
