/**
 * Console Log Capture Test
 *
 * Captures browser console output to diagnose the loading issue
 */

import { test } from '@playwright/test';

test('capture console logs to diagnose issue', async ({ page }) => {
  const logs: string[] = [];
  const errors: string[] = [];

  // Capture console messages
  page.on('console', (msg) => {
    const text = `[${msg.type()}] ${msg.text()}`;
    logs.push(text);
    console.log(text);
  });

  // Capture page errors
  page.on('pageerror', (error) => {
    const text = `[PAGE ERROR] ${error.message}`;
    errors.push(text);
    console.log(text);
  });

  // Navigate to app
  await page.goto('http://localhost:8081');

  // Wait for app to attempt to load
  await page.waitForTimeout(10000);

  // Take screenshot
  await page.screenshot({
    path: '/mnt/d/activity/mobile/test-results/console-capture-screenshot.png',
    fullPage: true
  });

  // Output summary
  console.log('\n=== CONSOLE LOG SUMMARY ===');
  console.log(`Total logs: ${logs.length}`);
  console.log(`Total errors: ${errors.length}`);

  console.log('\n=== ALL LOGS ===');
  logs.forEach(log => console.log(log));

  console.log('\n=== ALL ERRORS ===');
  errors.forEach(error => console.log(error));
});
