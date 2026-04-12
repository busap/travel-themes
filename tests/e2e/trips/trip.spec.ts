import { test, expect } from "@playwright/test";
import { getHomeRoute, getTripRoute } from "@/utils/route";

test.describe("Trip Detail Page", () => {
	test("displays trip name", async ({ page }) => {
		await page.goto(getTripRoute("japan-2023"));

		await expect(
			page.getByRole("heading", { name: /Japan Adventures/i })
		).toBeVisible();
	});

	test("displays trip metadata (country code and year)", async ({ page }) => {
		await page.goto(getTripRoute("japan-2023"));

		// Country code badge
		await expect(page.getByText("JP")).toBeVisible();
		// Year badge
		await expect(page.getByText("2023")).toBeVisible();
	});

	test("can navigate back to home via back button", async ({ page }) => {
		await page.goto(getTripRoute("japan-2023")); // Collage theme — has back button

		await page.getByRole("button", { name: "Go back" }).click();

		await expect(page).toHaveURL(getHomeRoute());
		await expect(
			page.getByRole("heading", { name: "TravelThemes" })
		).toBeVisible();
	});

	test("different trips load different content", async ({ page }) => {
		await page.goto(getTripRoute("japan-2023"));
		await expect(
			page.getByRole("heading", { name: /Japan Adventures/i })
		).toBeVisible();

		await page.goto(getTripRoute("morocco-markets"));
		await expect(
			page.getByRole("heading", { name: /Colors of Morocco/i })
		).toBeVisible();

		await page.goto(getTripRoute("nordic-winter"));
		await expect(
			page.getByRole("heading", { name: /Nordic Winter/i })
		).toBeVisible();
	});

	test("handles invalid trip id with 404", async ({ page }) => {
		const response = await page.goto(getTripRoute("invalid-trip-id"));

		expect(response?.status()).toBe(404);
	});
});
