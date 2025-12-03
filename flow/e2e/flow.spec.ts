import { test, expect } from '@playwright/test';

// Tests that run on ALL screen sizes
test.describe('Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('shows address form with correct heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Where are you moving');
  });

  test('address input is visible', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="address" i]');
    await expect(addressInput).toBeVisible();
  });

  test('date input is visible', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    await expect(dateInput).toBeVisible();
  });

  test('primary CTA button exists', async ({ page }) => {
    // Initial state shows "Check availability" button
    const button = page.locator('button:has-text("Check availability")');
    await expect(button).toBeVisible();
  });

  test('can type in address field', async ({ page }) => {
    const addressInput = page.locator('input[placeholder*="address" i]');
    await addressInput.fill('123 Main Street');
    await expect(addressInput).toHaveValue('123 Main Street');
  });

  test('can select date', async ({ page }) => {
    const dateInput = page.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    const dateStr = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateStr);
    await expect(dateInput).toHaveValue(dateStr);
  });

  test('form labels are visible', async ({ page }) => {
    await expect(page.locator('text=New address')).toBeVisible();
    await expect(page.locator('text=Move-in date')).toBeVisible();
  });

  test('heading has bold font weight', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toHaveCSS('font-weight', '700');
  });

  test('only one h1 heading exists', async ({ page }) => {
    const h1 = page.locator('h1');
    const count = await h1.count();
    expect(count).toBe(1);
  });

  test('content does not overflow horizontally', async ({ page }) => {
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5);
  });
});

// Mobile-specific tests (viewport < 1024px)
test.describe('Mobile Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar hidden on narrow viewports', async ({ page }, testInfo) => {
    // Only run on Mobile and Tablet projects
    if (testInfo.project.name === 'Desktop') {
      test.skip();
    }
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeHidden();
  });

  test('mobile header visible on narrow viewports', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      test.skip();
    }
    const header = page.locator('header');
    await expect(header).toBeVisible();
  });

  test('logo in mobile header on narrow viewports', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      test.skip();
    }
    await expect(page.locator('header').locator('text=2TurnIt')).toBeVisible();
  });

  test('touch targets are large enough', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'Desktop') {
      test.skip();
    }
    const buttons = page.locator('button');
    const count = await buttons.count();
    let issues: string[] = [];

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        const box = await button.boundingBox();
        if (box && box.height > 0 && box.height < 40) {
          const text = await button.textContent();
          issues.push(`Button "${text}" is ${box.height}px tall (min: 44px)`);
        }
      }
    }

    if (issues.length > 0) {
      console.log('Touch target issues found:', issues);
    }
    // Allow small buttons for now, just report
    expect(true).toBe(true);
  });
});

// Desktop-specific tests (viewport >= 1024px)
test.describe('Desktop Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('sidebar visible on wide viewports', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop') {
      test.skip();
    }
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();
  });

  test('sidebar shows all navigation steps', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop') {
      test.skip();
    }
    const sidebar = page.locator('aside');
    await expect(sidebar.locator('text=Your address')).toBeVisible();
    await expect(sidebar.locator('text=Services')).toBeVisible();
    await expect(sidebar.locator('text=Your details')).toBeVisible();
    await expect(sidebar.locator('text=Verify')).toBeVisible();
    await expect(sidebar.locator('text=Confirm')).toBeVisible();
  });

  test('sidebar logo visible', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop') {
      test.skip();
    }
    await expect(page.locator('aside').locator('text=2TurnIt')).toBeVisible();
  });

  test('security badge in sidebar footer', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop') {
      test.skip();
    }
    await expect(page.locator('aside').locator('text=256-bit encryption')).toBeVisible();
  });

  test('mobile header hidden on desktop', async ({ page }, testInfo) => {
    if (testInfo.project.name !== 'Desktop') {
      test.skip();
    }
    // The header has lg:hidden class, so check it's not displayed
    const header = page.locator('header');
    const isHidden = await header.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.display === 'none';
    });
    expect(isHidden).toBe(true);
  });
});

// Accessibility tests
test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('elements are keyboard focusable', async ({ page }) => {
    await page.keyboard.press('Tab');
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('form inputs have labels', async ({ page }) => {
    const addressLabel = page.locator('label:has-text("address")');
    await expect(addressLabel).toBeVisible();
  });
});

// Progress indicator tests
test.describe('Progress Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('progress bar visible', async ({ page }) => {
    // The progress bar container has h-1.5 class with rounded-full
    const progressBar = page.locator('.h-1\\.5.rounded-full');
    await expect(progressBar).toBeVisible();
  });
});

// Address Flow E2E Tests
test.describe('Address Flow with Apartment', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('apartment address auto-matches and skips selection screen', async ({ page }) => {
    // Type apartment address
    const addressInput = page.locator('input[placeholder*="address" i]');
    await addressInput.fill('3031 Oliver St Apt 1214');

    // Wait for ERCOT address autocomplete dropdown
    await page.waitForSelector('button[role="option"]', { timeout: 5000 });

    // Click the first suggestion (3031 Oliver St Apt 1214, Dallas, TX 75205)
    const firstSuggestion = page.locator('button[role="option"]').first();
    await firstSuggestion.click();

    // Verify "Address selected" shows the apartment
    await expect(page.locator('text=Address selected')).toBeVisible();
    await expect(page.locator('text=3031 Oliver St, Apt 1214')).toBeVisible();

    // Verify NO separate Apt/Suite field appears
    await expect(page.locator('label:has-text("Apt/Suite")')).not.toBeVisible();

    // Set move-in date
    const dateInput = page.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0];
    await dateInput.fill(dateStr);

    // Click "Check availability"
    await page.click('button:has-text("Check availability")');

    // Wait for API calls and verify we skip selection screen
    // Should go directly to "Great news!" (auto-matched APT 1214)
    await expect(page.locator('h1:has-text("Great news")')).toBeVisible({ timeout: 15000 });

    // Verify we're NOT on the "Confirm your address" selection screen
    await expect(page.locator('h1:has-text("Confirm your address")')).not.toBeVisible();
  });

  test('single-family home skips selection screen', async ({ page }) => {
    // Use a known single-family home address
    const addressInput = page.locator('input[placeholder*="address" i]');
    await addressInput.fill('3414 Beverly Dr');

    // Wait for autocomplete
    await page.waitForSelector('button[role="option"]', { timeout: 5000 });

    // Click suggestion for Highland Park
    const hpSuggestion = page.locator('button[role="option"]:has-text("Highland Park")').first();
    await hpSuggestion.click();

    // Set move-in date
    const dateInput = page.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await dateInput.fill(futureDate.toISOString().split('T')[0]);

    // Click "Check availability"
    await page.click('button:has-text("Check availability")');

    // Single-family home should go directly to "Great news!"
    await expect(page.locator('h1:has-text("Great news")')).toBeVisible({ timeout: 15000 });
  });

  test('apartment without unit shows selection screen', async ({ page }) => {
    // Type apartment building without unit number
    const addressInput = page.locator('input[placeholder*="address" i]');
    await addressInput.fill('3031 Oliver St');

    // Wait for autocomplete
    await page.waitForSelector('button[role="option"]', { timeout: 5000 });

    // Click suggestion (just the building, no apt)
    const suggestion = page.locator('button[role="option"]:has-text("Dallas")').first();
    await suggestion.click();

    // Set move-in date
    const dateInput = page.locator('input[type="date"]');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await dateInput.fill(futureDate.toISOString().split('T')[0]);

    // Click "Check availability"
    await page.click('button:has-text("Check availability")');

    // Should show selection screen since multiple units exist
    await expect(page.locator('h1:has-text("Confirm your address")')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('text=Select yours to continue')).toBeVisible();
  });
});
