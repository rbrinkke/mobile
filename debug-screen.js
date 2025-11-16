/**
 * Debug test to see what's on screen
 */

const { chromium } = require('playwright');

async function debugScreen() {
  console.log('🔍 Debug: Checking what\'s on screen...');

  const browser = await chromium.launch({
    headless: false,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    await page.goto('http://localhost:8081');
    console.log('✅ Navigated to app');

    // Wait for app to load
    await page.waitForTimeout(5000);

    // Get all text content
    const bodyText = await page.textContent('body');
    console.log('\n📄 All text on page:');
    console.log(bodyText);

    // Take screenshot
    await page.screenshot({ path: 'screenshot-debug.png', fullPage: true });
    console.log('\n📸 Screenshot saved: screenshot-debug.png');

    // Get HTML
    const html = await page.content();
    console.log('\n🔤 Page HTML (first 1000 chars):');
    console.log(html.substring(0, 1000));

    // Keep browser open for manual inspection
    console.log('\n⏸️  Browser will stay open for 10 seconds for manual inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

debugScreen();
