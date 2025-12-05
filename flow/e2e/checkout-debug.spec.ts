import { test, expect } from '@playwright/test';

test('capture checkout API response', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes

  // Capture ALL console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    // Print important logs immediately
    if (text.includes('[submitOrder]') || text.includes('cpOrderUrl') || text.includes('[Step5Review]')) {
      console.log('CAPTURED:', text);
    }
  });

  // Run against deployed site
  await page.goto('https://2tion-flow.netlify.app');
  await page.waitForLoadState('networkidle');

  // Step 1: Enter address
  console.log('=== Step 1: Entering address ===');
  const addressInput = page.getByPlaceholder('Start typing your address');
  await addressInput.fill('3031 Oliver');
  await page.waitForTimeout(2000);

  // Select first address suggestion - click directly on the li option
  const dropdownOptions = page.locator('ul li').filter({ hasText: /3031 Oliver St.*Dallas/ });
  const firstOption = dropdownOptions.first();
  if (await firstOption.isVisible({ timeout: 5000 }).catch(() => false)) {
    await firstOption.click({ force: true });
    console.log('Selected address from dropdown');
  }
  await page.waitForTimeout(2000);

  // Set move-in date (14 days from now)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 14);
  const dateStr = futureDate.toISOString().split('T')[0];
  await page.locator('input[type="date"]').fill(dateStr);
  console.log(`Set move-in date to: ${dateStr}`);
  await page.waitForTimeout(500);

  // Dismiss dropdown by clicking outside if still visible
  await page.locator('body').click({ position: { x: 100, y: 100 } });
  await page.waitForTimeout(500);

  // Click Check availability
  const checkBtn = page.getByRole('button', { name: /check availability/i });
  if (await checkBtn.isVisible({ timeout: 3000 })) {
    await checkBtn.click({ force: true });
    console.log('Clicked Check availability');
    await page.waitForTimeout(5000);
  }

  // Handle ESIID selection if needed
  const confirmBtn = page.getByRole('button', { name: /confirm this address/i });
  if (await confirmBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('ESIID selection visible');
    const firstOption = page.locator('button[role="radio"]').first();
    if (await firstOption.isVisible({ timeout: 2000 })) {
      await firstOption.click();
      console.log('Selected first ESIID');
    }
    await confirmBtn.click();
    console.log('Confirmed address');
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'e2e/debug-screenshots/step1-complete.png', fullPage: true });

  // Step 2: Services - should auto-navigate here
  console.log('=== Step 2: Services ===');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'e2e/debug-screenshots/step2-services.png', fullPage: true });

  // Water should be required, electricity should be visible
  // Click Continue/Next button
  const servicesNextBtn = page.getByRole('button', { name: /next|continue/i });
  if (await servicesNextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await servicesNextBtn.click();
    console.log('Clicked next on Services page');
    await page.waitForTimeout(3000);
  }

  await page.screenshot({ path: 'e2e/debug-screenshots/step2-complete.png', fullPage: true });

  // Step 3: Profile
  console.log('=== Step 3: Profile ===');
  await page.waitForTimeout(2000);

  // Fill profile form
  const firstName = page.getByLabel(/first name/i);
  if (await firstName.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstName.fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/phone/i).fill('5551234567');
    console.log('Filled profile form');
  }

  await page.screenshot({ path: 'e2e/debug-screenshots/step3-profile.png', fullPage: true });

  // Click Continue/Save
  const profileNextBtn = page.getByRole('button', { name: /save|continue|next/i }).first();
  if (await profileNextBtn.isVisible({ timeout: 3000 })) {
    await profileNextBtn.click();
    console.log('Clicked next on Profile page');
    await page.waitForTimeout(5000);
  }

  // Step 4: Verify
  console.log('=== Step 4: Verify ===');
  await page.screenshot({ path: 'e2e/debug-screenshots/step4-verify.png', fullPage: true });

  // Fill SSN if visible
  const ssnInput = page.locator('input').filter({ hasText: /ssn/i }).first();
  const ssnField = page.locator('[placeholder*="SSN"], input[name="ssn"]');
  if (await ssnField.first().isVisible({ timeout: 3000 }).catch(() => false)) {
    await ssnField.first().fill('123456789');
    console.log('Filled SSN');
  }

  // Fill DOB if visible
  const dobField = page.locator('input[name="dob"], input[type="date"]').last();
  if (await dobField.isVisible({ timeout: 2000 }).catch(() => false)) {
    await dobField.fill('1990-01-15');
    console.log('Filled DOB');
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'e2e/debug-screenshots/step4-filled.png', fullPage: true });

  // Click Continue/Next
  const verifyNextBtn = page.getByRole('button', { name: /continue|next|submit/i }).first();
  if (await verifyNextBtn.isVisible({ timeout: 3000 })) {
    await verifyNextBtn.click();
    console.log('Clicked next on Verify page');
    await page.waitForTimeout(3000);
  }

  // Step 5: Review
  console.log('=== Step 5: Review ===');
  await page.screenshot({ path: 'e2e/debug-screenshots/step5-review.png', fullPage: true });

  // Check terms checkbox
  const termsCheckbox = page.locator('input[type="checkbox"]').first();
  if (await termsCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
    await termsCheckbox.check();
    console.log('Checked terms checkbox');
  }

  // Click submit
  const submitBtn = page.getByRole('button', { name: /set up|submit|place order/i });
  if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    console.log('Clicking submit button...');
    await submitBtn.click();

    // Wait for API response
    console.log('Waiting for API response...');
    await page.waitForTimeout(15000);

    await page.screenshot({ path: 'e2e/debug-screenshots/step5-after-submit.png', fullPage: true });
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
