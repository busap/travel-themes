import { test, expect } from "@playwright/test";
import { getHomeRoute } from "@/utils/route";

test.describe("Home Page", () => {
	test("has correct page title", async ({ page }) => {
		await page.goto(getHomeRoute());

		await expect(page).toHaveTitle("TravelThemes");
	});

	test("displays header with title and tagline", async ({ page }) => {
		await page.goto(getHomeRoute());

		await expect(
			page.getByRole("heading", { name: "TravelThemes" })
		).toBeVisible();
		await expect(
			page.getByText("Adventures through the lens")
		).toBeVisible();
	});
});
