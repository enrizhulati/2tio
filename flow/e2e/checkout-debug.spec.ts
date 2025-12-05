import { test, expect } from '@playwright/test';

test('capture checkout API response', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes

  // Capture ALL console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    // Print important logs immediately
    if (text.includes('[submitOrder]') || text.includes('cpOrderUrl') || text.includes('[Step5Review]') || text.includes('API response')) {
      console.log('>>> CAPTURED:', text);
    }
  });

  // Run against local dev server
  await page.goto('http://127.0.0.1:3001');
  await page.waitForLoadState('networkidle');
  console.log('Page loaded');

  // Step 1: Enter address
  console.log('=== Step 1: Entering address ===');

  // Type address and wait for dropdown
  const addressInput = page.getByPlaceholder('Start typing your address');
  await addressInput.click();
  await addressInput.fill('3031 Oliver St');
  console.log('Typed address, waiting for dropdown...');

  // Wait for dropdown to appear
  await page.waitForTimeout(3000);

  // Click directly on the first dropdown option using keyboard
  await addressInput.press('ArrowDown');
  await page.waitForTimeout(500);
  await addressInput.press('Enter');
  console.log('Selected address with keyboard');

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/debug-screenshots/step1-after-select.png', fullPage: true });

  // Set move-in date (14 days from now) - BE CAREFUL with date input
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  const dateStr = futureDate.toISOString().split('T')[0];

  // Find the date input specifically by its label/context
  const dateInput = page.locator('input[type="date"]').first();
  await dateInput.click();
  await dateInput.fill(dateStr);
  console.log(`Set move-in date to: ${dateStr}`);
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'e2e/debug-screenshots/step1-with-date.png', fullPage: true });

  // Click Check availability
  const checkBtn = page.getByRole('button', { name: /check availability/i });
  await checkBtn.click({ force: true });
  console.log('Clicked Check availability');

  // Wait for API response
  await page.waitForTimeout(8000);
  await page.screenshot({ path: 'e2e/debug-screenshots/step1-after-check.png', fullPage: true });

  // Handle ESIID selection if needed
  const confirmBtn = page.getByRole('button', { name: /confirm/i });
  if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('ESIID selection visible');
    // Select first ESIID option
    const firstEsiid = page.locator('[data-testid="esiid-option"], button[role="radio"]').first();
    if (await firstEsiid.isVisible({ timeout: 2000 }).catch(() => false)) {
      await firstEsiid.click();
      console.log('Selected first ESIID');
    }
    await confirmBtn.click();
    console.log('Confirmed address');
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'e2e/debug-screenshots/step1-complete.png', fullPage: true });

  // Check if we're still on step 1 (address error)
  const addressError = page.locator('text=Select an address from the suggestions');
  if (await addressError.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log('ERROR: Address not properly selected. Trying alternative method...');
    // Try clicking directly on a visible dropdown option
    const visibleOption = page.locator('li').filter({ hasText: 'Dallas' }).first();
    if (await visibleOption.isVisible({ timeout: 2000 }).catch(() => false)) {
      await visibleOption.click({ force: true });
      await page.waitForTimeout(1000);
      await checkBtn.click({ force: true });
      await page.waitForTimeout(5000);
    }
  }

  // Step 2: Should be on Services page now
  console.log('=== Checking current page ===');
  const currentUrl = page.url();
  console.log('Current URL:', currentUrl);
  await page.screenshot({ path: 'e2e/debug-screenshots/current-state.png', fullPage: true });

  // Look for Services or Profile page elements
  const servicesHeading = page.locator('h1, h2').filter({ hasText: /services|choose|utilities/i });
  const profileHeading = page.locator('h1, h2').filter({ hasText: /profile|details|about you/i });

  if (await servicesHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('=== Step 2: Services page ===');
    await page.screenshot({ path: 'e2e/debug-screenshots/step2-services.png', fullPage: true });

    // Click continue/next
    const nextBtn = page.getByRole('button', { name: /next|continue/i }).first();
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      console.log('Clicked next on Services');
      await page.waitForTimeout(3000);
    }
  }

  // Step 3: Profile
  if (await profileHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('=== Step 3: Profile page ===');
    await page.screenshot({ path: 'e2e/debug-screenshots/step3-profile.png', fullPage: true });

    // Fill profile
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/phone/i).fill('5551234567');
    console.log('Filled profile');

    const nextBtn = page.getByRole('button', { name: /save|continue|next/i }).first();
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      console.log('Clicked next on Profile');
      await page.waitForTimeout(5000);
    }
  }

  // Step 4: Verify
  const verifyHeading = page.locator('h1, h2').filter({ hasText: /verify|identity|security/i });
  if (await verifyHeading.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('=== Step 4: Verify page ===');
    await page.screenshot({ path: 'e2e/debug-screenshots/step4-verify.png', fullPage: true });

    // Fill verification fields
    const ssnInput = page.locator('input[type="password"], input[inputmode="numeric"]').first();
    if (await ssnInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await ssnInput.fill('123456789');
      console.log('Filled SSN');
    }

    // DOB - find the second date input (first is move-in date)
    const dobInputs = page.locator('input[type="date"]');
    const dobCount = await dobInputs.count();
    if (dobCount > 1) {
      await dobInputs.nth(1).fill('1990-01-15');
      console.log('Filled DOB');
    }

    await page.screenshot({ path: 'e2e/debug-screenshots/step4-filled.png', fullPage: true });

    const nextBtn = page.getByRole('button', { name: /continue|next|review/i }).first();
    if (await nextBtn.isVisible({ timeout: 3000 })) {
      await nextBtn.click();
      console.log('Clicked next on Verify');
      await page.waitForTimeout(3000);
    }
  }

  // Step 5: Review & Submit
  const reviewHeading = page.locator('h1, h2').filter({ hasText: /review|confirm|summary/i });
  if (await reviewHeading.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('=== Step 5: Review page ===');
    await page.screenshot({ path: 'e2e/debug-screenshots/step5-review.png', fullPage: true });

    // Check terms checkbox
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await checkbox.check();
      console.log('Checked terms');
    }

    // Click submit
    const submitBtn = page.getByRole('button', { name: /set up|submit|place order|complete/i });
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Clicking submit button...');
      await submitBtn.click();

      // Wait for API response - this is where we capture the cpOrderUrl!
      console.log('Waiting for checkout API response...');
      await page.waitForTimeout(20000);

      await page.screenshot({ path: 'e2e/debug-screenshots/step5-after-submit.png', fullPage: true });
    }
  }

  // Print all captured logs
  console.log('\n========================================');
  console.log('=== ALL CAPTURED CONSOLE LOGS ===');
  console.log('========================================');
  consoleLogs.forEach(log => console.log(log));
  console.log('========================================');
  console.log('=== END LOGS ===');
  console.log('========================================\n');

  // Take final screenshot
  await page.screenshot({ path: 'e2e/debug-screenshots/final-state.png', fullPage: true });
});
