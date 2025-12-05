import { test, expect } from '@playwright/test';

test('verify Almost there! UI with ?mock_confirmation=1', async ({ page }) => {
  test.setTimeout(30000);

  // Navigate directly to the app with mock_confirmation=1
  // This will show the confirmation page with mock electricity data
  await page.goto('http://127.0.0.1:3001?mock_confirmation=1');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'e2e/debug-screenshots/mock-confirmation.png', fullPage: true });

  // Check for "Almost there!" text (shows when electricity pending)
  const almostThere = page.locator('text=Almost there!');
  const hasAlmostThere = await almostThere.isVisible({ timeout: 5000 }).catch(() => false);

  console.log('\n=== UI CHECK ===');
  console.log('Has "Almost there!": ', hasAlmostThere);

  // Check for electricity CTA
  const electricityCta = page.locator('text=Complete your electricity enrollment');
  const hasElectricityCta = await electricityCta.isVisible({ timeout: 3000 }).catch(() => false);
  console.log('Has electricity CTA: ', hasElectricityCta);

  // Check for action required text
  const actionRequired = page.locator('text=Action Required');
  const hasActionRequired = await actionRequired.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Has "Action Required": ', hasActionRequired);

  // Check for ComparePower enrollment button
  const enrollButton = page.locator('a:has-text("Complete Electricity Enrollment")');
  const hasEnrollButton = await enrollButton.isVisible({ timeout: 2000 }).catch(() => false);
  console.log('Has enrollment button: ', hasEnrollButton);

  // Verify the button links to ComparePower
  if (hasEnrollButton) {
    const href = await enrollButton.getAttribute('href');
    console.log('Enrollment button href: ', href);
    expect(href).toContain('comparepower.com');
  }

  console.log('\nScreenshot saved to: e2e/debug-screenshots/mock-confirmation.png');

  // Assert that the "Almost there!" message is visible
  expect(hasAlmostThere).toBe(true);
  expect(hasElectricityCta).toBe(true);
});
