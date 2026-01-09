import { test, expect } from '@playwright/test';

test.describe('App Loading', () => {
  test('should load the app', async ({ page }) => {
    await page.goto('/');

    // App should load within 10 seconds
    await expect(page).toHaveTitle(/IA Rimas/i, { timeout: 10000 });
  });

  test('should show login page when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Should show login form or auth UI
    const loginText = page.getByText(/entrar|login|email/i);
    await expect(loginText.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('PWA Features', () => {
  test('should have manifest file', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);

    const manifest = await response?.json();
    expect(manifest.name).toBeTruthy();
    expect(manifest.icons).toBeTruthy();
  });

  test('should have service worker registration script', async ({ page }) => {
    await page.goto('/');

    // Check for service worker script in page
    const swScript = await page.$('script[src*="registerSW"]');
    expect(swScript).toBeTruthy();
  });
});

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should have at least one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('should have accessible buttons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Get all buttons
    const buttons = page.locator('button');
    const count = await buttons.count();

    // Each button should have accessible text
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      // Button should have text content or aria-label
      expect(text || ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should be usable on mobile viewport', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Page should not have horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 10); // Allow 10px tolerance
  });
});

test.describe('Error Handling', () => {
  test('should show 404 for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');

    // Should show 404 content or redirect to home
    const notFoundText = page.getByText(/404|não encontrad|voltar/i);
    const homeButton = page.getByRole('button', { name: /home|início/i });

    // Either show 404 message or have home button
    const has404 = await notFoundText.first().isVisible().catch(() => false);
    const hasHomeButton = await homeButton.first().isVisible().catch(() => false);

    expect(has404 || hasHomeButton).toBeTruthy();
  });
});
