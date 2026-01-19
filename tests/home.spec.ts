import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('displays header with title and tagline', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'TravelThemes' })).toBeVisible();
    await expect(page.getByText('Adventures through the lens')).toBeVisible();
  });

  test('displays all trip cards', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: /Japan Adventures/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Colors of Morocco/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Nordic Winter/i })).toBeVisible();
  });

  test('trip card navigates to trip detail page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /Japan Adventures/i }).click();

    await expect(page).toHaveURL('/trips/japan-2023');
  });
});
