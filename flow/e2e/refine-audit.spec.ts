import { test } from '@playwright/test';

test('Capture all screens for refinement audit', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('http://127.0.0.1:3002');
  await page.waitForLoadState('networkidle');

  // Step 1: Initial
  await page.screenshot({ path: 'e2e/audit/step1-initial.png', fullPage: true });

  // Enter address
  await page.getByPlaceholder('Start typing your address').fill('3031 Oliver');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'e2e/audit/step1-autocomplete.png', fullPage: true });

  // Select suggestion
  const suggestion = page.locator('button[role="option"]').first();
  if (await suggestion.isVisible({ timeout: 3000 })) {
    await suggestion.click();
  }
  await page.waitForTimeout(500);

  // Set date
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  await page.locator('input[type="date"]').fill(futureDate.toISOString().split('T')[0]);
  await page.screenshot({ path: 'e2e/audit/step1-filled.png', fullPage: true });

  // Check availability
  await page.getByRole('button', { name: /check availability/i }).click();
  await page.waitForTimeout(5000);
  await page.screenshot({ path: 'e2e/audit/step1-results.png', fullPage: true });

  // Handle ESIID if needed
  const confirmBtn = page.getByRole('button', { name: /confirm this address/i });
  if (await confirmBtn.isVisible({ timeout: 2000 })) {
    const firstOption = page.locator('button[role="radio"]').first();
    if (await firstOption.isVisible()) await firstOption.click();
    await confirmBtn.click();
    await page.waitForTimeout(2000);
  }

  // Continue to services
  await page.getByRole('button', { name: /choose my services/i }).click();
  await page.waitForTimeout(1000);

  // Step 2: Services
  await page.screenshot({ path: 'e2e/audit/step2-services.png', fullPage: true });

  // Add electricity
  const addBtn = page.locator('button:has-text("Add")').first();
  if (await addBtn.isVisible({ timeout: 2000 })) await addBtn.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'e2e/audit/step2-electricity-added.png', fullPage: true });

  // Expand electricity plans
  const expandBtn = page.locator('button:has-text("Choose your plan")').first();
  if (await expandBtn.isVisible({ timeout: 2000 })) {
    await expandBtn.click();
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: 'e2e/audit/step2-plans-expanded.png', fullPage: true });

  // Continue to profile
  await page.getByRole('button', { name: /continue with/i }).click();
  await page.waitForTimeout(1000);

  // Step 3: Profile
  await page.screenshot({ path: 'e2e/audit/step3-profile.png', fullPage: true });

  // Fill profile
  await page.getByLabel(/first name/i).fill('Jane');
  await page.getByLabel(/last name/i).fill('Smith');
  await page.getByLabel(/email/i).fill('jane.smith@example.com');
  await page.getByLabel(/phone/i).fill('5551234567');
  await page.screenshot({ path: 'e2e/audit/step3-filled.png', fullPage: true });

  // Continue to verify
  await page.getByRole('button', { name: /save and continue/i }).click();
  await page.waitForTimeout(2000);

  // Step 4: Verify
  await page.screenshot({ path: 'e2e/audit/step4-verify.png', fullPage: true });

  // Scroll to see all
  await page.evaluate(() => window.scrollBy(0, 300));
  await page.screenshot({ path: 'e2e/audit/step4-verify-scrolled.png', fullPage: true });

  console.log('Audit screenshots captured!');
});
