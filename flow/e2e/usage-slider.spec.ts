import { test, expect } from '@playwright/test';

test.describe('Usage Slider Functionality', () => {
  test('plans should update when usage slider changes', async ({ page }) => {
    // Increase timeout for this test
    test.setTimeout(90000);

    // Listen to console logs
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      if (msg.text().includes('[') && (msg.text().includes('Plan') || msg.text().includes('fetchElectricity') || msg.text().includes('updateMonthlyUsage'))) {
        consoleLogs.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Enter an apartment address
    await page.getByPlaceholder('Start typing your address').fill('1801 Lavaca St');
    await page.waitForTimeout(1500);

    // Select first autocomplete suggestion
    const suggestion = page.locator('button[role="option"]').first();
    if (await suggestion.isVisible({ timeout: 3000 })) {
      await suggestion.click();
    }

    // Set a future move-in date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 14);
    await page.locator('input[type="date"]').fill(futureDate.toISOString().split('T')[0]);

    // Click check availability
    await page.getByRole('button', { name: /check availability/i }).click();
    await page.waitForTimeout(5000);

    // Handle ESIID selection if needed
    const confirmBtn = page.getByRole('button', { name: /confirm this address/i });
    if (await confirmBtn.isVisible({ timeout: 2000 })) {
      const firstOption = page.locator('button[role="radio"]').first();
      if (await firstOption.isVisible()) await firstOption.click();
      await confirmBtn.click();
      await page.waitForTimeout(2000);
    }

    // Continue to services
    const chooseServicesBtn = page.getByRole('button', { name: /choose my services/i });
    if (await chooseServicesBtn.isVisible({ timeout: 5000 })) {
      await chooseServicesBtn.click();
    }
    await page.waitForTimeout(2000);

    // Add electricity if not already added
    const addElectricityBtn = page.locator('button:has-text("Add")').first();
    if (await addElectricityBtn.isVisible({ timeout: 2000 })) {
      await addElectricityBtn.click();
      await page.waitForTimeout(3000);
    }

    // Wait for plans to load
    await page.waitForSelector('text=Choose your plan', { timeout: 10000 });

    // Get initial plan data
    const getFirstPlanRate = async () => {
      const rateElement = page.locator('[class*="coral"]').first();
      const rateText = await rateElement.textContent();
      return rateText;
    };

    const getFirstPlanMonthly = async () => {
      const monthlyElement = page.locator('text=/~\\$\\d+\\/mo/').first();
      const monthlyText = await monthlyElement.textContent();
      return monthlyText;
    };

    // Record initial values
    const initialRate = await getFirstPlanRate();
    const initialMonthly = await getFirstPlanMonthly();
    console.log('Initial rate:', initialRate);
    console.log('Initial monthly:', initialMonthly);

    // Take screenshot of initial state
    await page.screenshot({ path: 'e2e/debug/usage-slider-initial.png', fullPage: true });

    // Find and click the "Small" preset button
    const smallButton = page.locator('button:has-text("Small")');
    if (await smallButton.isVisible({ timeout: 2000 })) {
      await smallButton.click();
      console.log('Clicked Small preset');
      await page.waitForTimeout(3000);
    }

    // Get values after clicking Small
    const afterSmallRate = await getFirstPlanRate();
    const afterSmallMonthly = await getFirstPlanMonthly();
    console.log('After Small - rate:', afterSmallRate);
    console.log('After Small - monthly:', afterSmallMonthly);

    await page.screenshot({ path: 'e2e/debug/usage-slider-small.png', fullPage: true });

    // Click Large preset
    const largeButton = page.locator('button:has-text("Large")');
    if (await largeButton.isVisible({ timeout: 2000 })) {
      await largeButton.click();
      console.log('Clicked Large preset');
      await page.waitForTimeout(3000);
    }

    // Get values after clicking Large
    const afterLargeRate = await getFirstPlanRate();
    const afterLargeMonthly = await getFirstPlanMonthly();
    console.log('After Large - rate:', afterLargeRate);
    console.log('After Large - monthly:', afterLargeMonthly);

    await page.screenshot({ path: 'e2e/debug/usage-slider-large.png', fullPage: true });

    // Print all console logs
    console.log('\n=== Console Logs ===');
    consoleLogs.forEach(log => console.log(log));

    // Verify monthly costs changed (they should be different for Small vs Large)
    expect(afterSmallMonthly).not.toBe(afterLargeMonthly);

    // Check rate is reasonable (should be < 100 cents, not 900+)
    const rateMatch = afterLargeRate?.match(/(\d+\.?\d*)/);
    if (rateMatch) {
      const rateValue = parseFloat(rateMatch[1]);
      console.log('Parsed rate value:', rateValue);
      expect(rateValue).toBeLessThan(100); // Rate should be under 100 cents
    }
  });
});
