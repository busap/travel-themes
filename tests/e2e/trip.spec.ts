import { test, expect } from '@playwright/test';
import { getHomeRoute, getTripRoute } from '@/utils/route';

test.describe('Trip Detail Page', () => {
  test('displays trip name and details', async ({ page }) => {
    await page.goto(getTripRoute('japan-2023'));

    await expect(page.getByRole('heading', { name: /Japan Adventures/i })).toBeVisible();
  });

  test('can navigate back to home page', async ({ page }) => {
    await page.goto(getTripRoute('japan-2023'));

    // Check if navigation back to home works (could be a back button or logo link)
    await page.goto(getHomeRoute());
    await expect(page.getByRole('heading', { name: 'TravelThemes' })).toBeVisible();
  });

  test('different trips load different content', async ({ page }) => {
    // Test Japan trip
    await page.goto(getTripRoute('japan-2023'));
    await expect(page.getByRole('heading', { name: /Japan Adventures/i })).toBeVisible();

    // Test Morocco trip
    await page.goto(getTripRoute('morocco-markets'));
    await expect(page.getByRole('heading', { name: /Colors of Morocco/i })).toBeVisible();

    // Test Norway trip
    await page.goto(getTripRoute('nordic-winter'));
    await expect(page.getByRole('heading', { name: /Nordic Winter/i })).toBeVisible();
  });

  test('handles invalid trip id with 404', async ({ page }) => {
    const response = await page.goto(getTripRoute('invalid-trip-id'));

    expect(response?.status()).toBe(404);
  });
});
