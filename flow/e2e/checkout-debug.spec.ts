import { test, expect } from '@playwright/test';

test('capture checkout API response', async ({ page }) => {
  // Capture console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[submitOrder]') || text.includes('cpOrderUrl') || text.includes('API response')) {
      consoleLogs.push(text);
      console.log('CAPTURED:', text);
    }
  });

  await page.goto('https://2tion-flow.netlify.app');

  // Step 1: Enter address
  const addressInput = page.locator('input').first();
  await addressInput.fill('3031 Oliver St');
  await page.waitForTimeout(2000);

  // Select first address suggestion from dropdown
  const dropdownOption = page.locator('li').filter({ hasText: '3031 Oliver St' }).first();
  await dropdownOption.click();
  await page.waitForTimeout(1500);

  // Select tomorrow's date
  const dateInput = page.locator('input[type="date"]');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 14);
  const dateStr = tomorrow.toISOString().split('T')[0];
  await dateInput.fill(dateStr);

  // Click Continue
  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(2000);

  // If ESIID selection appears, select first one
  const esiidOption = page.locator('[data-testid="esiid-option"]').first();
  if (await esiidOption.isVisible({ timeout: 3000 }).catch(() => false)) {
    await esiidOption.click();
    await page.getByRole('button', { name: /confirm/i }).click();
  }
  await page.waitForTimeout(2000);

  // Step 2: Enter profile
  await page.locator('input[name="firstName"]').fill('Test');
  await page.locator('input[name="lastName"]').fill('User');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('input[name="phone"]').fill('5551234567');

  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(2000);

  // Step 3: Select services - electricity should be auto-selected
  // Look for electricity plan and select first one
  const electricitySection = page.locator('text=Electricity').first();
  if (await electricitySection.isVisible()) {
    await electricitySection.click();
  }
  await page.waitForTimeout(1000);

  // Select first electricity plan
  const planCard = page.locator('[data-testid="plan-card"]').first();
  if (await planCard.isVisible({ timeout: 3000 }).catch(() => false)) {
    await planCard.click();
  }

  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(2000);

  // Step 4: Verification - enter SSN and DOB
  const ssnInput = page.locator('input[name="ssn"], input[placeholder*="SSN"]').first();
  if (await ssnInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await ssnInput.fill('123456789');
  }

  const dobInput = page.locator('input[name="dob"], input[type="date"]').last();
  if (await dobInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dobInput.fill('1990-01-15');
  }

  await page.getByRole('button', { name: /continue/i }).click();
  await page.waitForTimeout(2000);

  // Step 5: Review and submit
  // Check terms checkbox
  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  if (await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await termsCheckbox.check();
  }

  // Click submit
  const submitButton = page.getByRole('button', { name: /set up my utilities/i });
  if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await submitButton.click();

    // Wait for API response
    await page.waitForTimeout(10000);
  }

  // Print all captured logs
  console.log('\n=== CAPTURED CONSOLE LOGS ===');
  consoleLogs.forEach(log => console.log(log));
  console.log('=== END LOGS ===\n');

  // Take screenshot of final state
  await page.screenshot({ path: 'checkout-result.png', fullPage: true });
});
