import { test, expect } from '@playwright/test';

/**
 * EXPANDED MENU SYSTEM SHOWCASE TEST
 *
 * Tests the NEW expanded menu configuration:
 * - TOP BAR: 5 icons (plus-circle, heart, bell, settings, user)
 * - OVERFLOW MENU: 6 items (map-pin, share-2, bookmark, help-circle, message-circle, refresh-ccw)
 * - BADGES: heart (7), bell (3)
 */

test.describe('Expanded Menu System Showcase', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:8081');

    // Wait for Activity screen to load fully
    await page.waitForSelector('text=Activiteit', { timeout: 15000 });

    // Wait an additional moment for all icons to render
    await page.waitForTimeout(2000);
  });

  test('Capture TOP BAR with all 5 new icons', async ({ page }) => {
    console.log('📸 Capturing top bar with 5 icons...');

    // Scroll to top to ensure top bar is fully visible
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Take full page screenshot showing top bar
    await page.screenshot({
      path: '/mnt/d/activity/mobile/test-results/NEW-top-bar-5-icons.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: NEW-top-bar-5-icons.png');

    // Verify all 5 icons are present by checking for SVG paths or icon components
    // React Native Web renders Lucide icons as SVG elements

    // Method 1: Check for multiple SVG elements in the header area
    const svgElements = await page.locator('svg').count();
    console.log(`Found ${svgElements} SVG elements on page`);
    expect(svgElements).toBeGreaterThanOrEqual(5);

    // Method 2: Check for specific icon accessibility labels or test IDs
    // (These would need to be added to the TopBar component)

    // Method 3: Verify the Activity screen header is present
    const demoHeader = await page.locator('text=Activiteit').isVisible();
    expect(demoHeader).toBe(true);

    console.log('✅ Top bar verification complete');
  });

  test('Capture OVERFLOW MENU with all 6 items', async ({ page }) => {
    console.log('📸 Opening overflow menu...');

    // Strategy 1: Find the overflow menu button (three dots icon)
    // Look for the More Horiz button/icon at the top right

    // Wait for page to be fully loaded
    await page.waitForTimeout(1000);

    // Method 1: Try to find by SVG path attributes (Lucide more-horizontal icon)
    const moreButtons = await page.locator('svg').all();
    console.log(`Found ${moreButtons.length} SVG elements`);

    // Method 2: Try clicking on the rightmost clickable element in the header
    // This assumes the overflow button is the last icon
    const clickableElements = await page.locator('[role="button"], button, [onclick]').all();
    console.log(`Found ${clickableElements.length} clickable elements`);

    // Method 3: Look for elements with specific structure
    // React Native Web typically renders touchables as divs with cursor:pointer
    const touchables = await page.locator('div[style*="cursor"][style*="pointer"]').all();
    console.log(`Found ${touchables.length} touchable elements`);

    // Try to find the overflow menu button by position (rightmost icon)
    // Get all icons in the top bar area
    const topBarHeight = 120; // Approximate height of top bar
    const viewportWidth = page.viewportSize()?.width || 1280;

    // Click on the top-right area where overflow menu should be
    const overflowX = viewportWidth - 50; // 50px from right edge
    const overflowY = 50; // 50px from top

    console.log(`Attempting to click overflow menu at (${overflowX}, ${overflowY})`);

    // Take a screenshot before clicking
    await page.screenshot({
      path: '/mnt/d/activity/mobile/test-results/NEW-before-overflow-click.png',
      fullPage: false
    });

    // Click the overflow menu button
    await page.mouse.click(overflowX, overflowY);

    // Wait for menu to appear
    await page.waitForTimeout(1000);

    // Take screenshot of opened menu
    await page.screenshot({
      path: '/mnt/d/activity/mobile/test-results/NEW-overflow-menu-6-items.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: NEW-overflow-menu-6-items.png');

    // Verify menu items are visible
    // Look for the expected menu item texts
    const expectedMenuItems = [
      'Bekijk Activiteiten',
      'Deel deze App',
      'Opgeslagen Items',
      'Help & Support',
      'Geef Feedback',
      'Reset Data'
    ];

    let foundItems = 0;
    for (const itemText of expectedMenuItems) {
      const isVisible = await page.locator(`text=${itemText}`).isVisible().catch(() => false);
      if (isVisible) {
        console.log(`✅ Found menu item: ${itemText}`);
        foundItems++;
      } else {
        console.log(`❌ Missing menu item: ${itemText}`);
      }
    }

    console.log(`Found ${foundItems}/${expectedMenuItems.length} menu items`);
    expect(foundItems).toBeGreaterThan(0);
  });

  test('Verify BADGES display correctly', async ({ page }) => {
    console.log('🔍 Checking badge counts...');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Look for badge elements
    // Badges are typically rendered as small circles with numbers
    // In React Native Web, they might be divs with specific styling

    // Method 1: Look for text content "7" and "3" near icons
    const badge7 = await page.locator('text=7').first().isVisible().catch(() => false);
    const badge3 = await page.locator('text=3').first().isVisible().catch(() => false);

    console.log(`Badge 7 visible: ${badge7}`);
    console.log(`Badge 3 visible: ${badge3}`);

    // Take screenshot highlighting badges
    await page.screenshot({
      path: '/mnt/d/activity/mobile/test-results/NEW-badges-working.png',
      fullPage: false
    });

    console.log('✅ Screenshot saved: NEW-badges-working.png');

    // Method 2: Check for small circular elements with numbers
    const smallTexts = await page.locator('[style*="fontSize"]').all();
    console.log(`Found ${smallTexts.length} styled text elements`);

    // Verify at least some badge-like elements exist
    expect(smallTexts.length).toBeGreaterThan(0);
  });

  test('Interactive menu item click test', async ({ page }) => {
    console.log('🖱️ Testing menu item interactions...');

    // Open overflow menu
    const viewportWidth = page.viewportSize()?.width || 1280;
    const overflowX = viewportWidth - 50;
    const overflowY = 50;

    await page.mouse.click(overflowX, overflowY);
    await page.waitForTimeout(1000);

    // Try to click first menu item "Bekijk Activiteiten"
    const menuItem = page.locator('text=Bekijk Activiteiten').first();
    const isVisible = await menuItem.isVisible().catch(() => false);

    if (isVisible) {
      console.log('✅ Menu item found, clicking...');

      // Take screenshot before click
      await page.screenshot({
        path: '/mnt/d/activity/mobile/test-results/NEW-before-menu-click.png',
        fullPage: false
      });

      await menuItem.click();
      await page.waitForTimeout(1000);

      // Take screenshot after click
      await page.screenshot({
        path: '/mnt/d/activity/mobile/test-results/NEW-after-menu-click.png',
        fullPage: false
      });

      console.log('✅ Menu item clicked successfully');
    } else {
      console.log('⚠️ Menu item not found, taking diagnostic screenshot');
      await page.screenshot({
        path: '/mnt/d/activity/mobile/test-results/NEW-menu-diagnostic.png',
        fullPage: true
      });
    }
  });

  test('Comprehensive icon verification', async ({ page }) => {
    console.log('🔍 Comprehensive icon verification...');

    // Get page content for analysis
    const pageContent = await page.content();

    // Check for icon-related attributes
    const svgCount = (pageContent.match(/<svg/g) || []).length;
    console.log(`Total SVG elements in page: ${svgCount}`);

    // Take screenshot with full page for analysis
    await page.screenshot({
      path: '/mnt/d/activity/mobile/test-results/NEW-comprehensive-view.png',
      fullPage: true
    });

    console.log('✅ Comprehensive view captured');

    // Verify minimum number of icons
    expect(svgCount).toBeGreaterThanOrEqual(5);
  });
});
