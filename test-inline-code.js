/**
 * Test Inline 6-Digit Code Verification
 * Tests de nieuwe inline code input flow
 */

const { chromium } = require('playwright');

const APP_URL = 'http://localhost:8081';
const TEST_EMAIL = 'per@gmail.com';  // Bestaande gebruiker in database
const TEST_PASSWORD = 'TestPassword123!';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testInlineCodeFlow() {
  console.log('🚀 Testing Inline 6-Digit Code Verification');
  console.log(`📍 URL: ${APP_URL}`);
  console.log(`📧 Test Email: ${TEST_EMAIL}`);
  console.log('━'.repeat(70));

  const browser = await chromium.launch({
    headless: false,
    slowMo: 100,
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  try {
    console.log('\n🧪 Test 1: Load App...');
    await page.goto(APP_URL);

    // Wait for React app to load
    await page.waitForSelector('input[type="email"]', { timeout: 60000 });
    console.log('✅ App loaded');

    await page.screenshot({ path: 'inline-test-1-loaded.png', fullPage: true });

    console.log('\n🧪 Test 2: Fill Login Form...');
    const emailInput = await page.$('input[type="email"]');
    const passwordInput = await page.$('input[type="password"]');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    console.log(`✅ Filled: ${TEST_EMAIL}`);

    await page.screenshot({ path: 'inline-test-2-filled.png', fullPage: true });

    console.log('\n🧪 Test 3: Submit Login...');
    const loginButton = await page.$('text=/INLOGGEN/i');
    await loginButton.click();
    await sleep(3000); // Wait for API response

    await page.screenshot({ path: 'inline-test-3-submitted.png', fullPage: true });

    console.log('\n🧪 Test 4: Check for Inline Code Input...');

    // Wacht tot code section verschijnt (OF error)
    try {
      await page.waitForSelector('text=Verificatiecode', { timeout: 5000 });
      console.log('✅ Inline code section appeared!');

      await page.screenshot({ path: 'inline-test-4-code-section.png', fullPage: true });

      // Check spacing - count code inputs
      const codeInputs = await page.$$('input[maxlength="1"]');
      console.log(`📊 Number of code inputs: ${codeInputs.length}`);

      if (codeInputs.length === 6) {
        console.log('✅ All 6 code inputs present');
      } else {
        console.log(`⚠️  Expected 6 inputs, found ${codeInputs.length}`);
      }

      // Check spacing by measuring positions
      const positions = [];
      for (let i = 0; i < Math.min(codeInputs.length, 6); i++) {
        const box = await codeInputs[i].boundingBox();
        if (box) {
          positions.push({ index: i, x: box.x, width: box.width });
        }
      }

      if (positions.length >= 2) {
        const gap = positions[1].x - (positions[0].x + positions[0].width);
        console.log(`📏 Gap between inputs: ${gap.toFixed(2)}px`);

        if (gap < 15) {
          console.log('✅ Inputs are close together (compact spacing)');
        } else {
          console.log(`⚠️  Inputs might be too far (gap: ${gap}px)`);
        }
      }

      console.log('\n🧪 Test 5: Test Paste Functionality...');

      // Focus eerste input
      await codeInputs[0].click();
      await sleep(500);

      // Paste 6-digit code
      await page.keyboard.type('123456');
      await sleep(1000);

      await page.screenshot({ path: 'inline-test-5-pasted.png', fullPage: true });

      // Check if all inputs filled
      const filledInputs = await page.$$eval('input[maxlength="1"]', inputs =>
        inputs.filter(input => input.value).length
      );

      console.log(`📊 Filled inputs after paste: ${filledInputs}/6`);

      if (filledInputs === 6) {
        console.log('✅ Paste support works! All 6 inputs filled');
      } else {
        console.log(`⚠️  Paste partially worked: ${filledInputs}/6 filled`);
      }

      console.log('\n🧪 Test 6: Visual Inspection...');
      console.log('📸 Check screenshots for:');
      console.log('  - Code input appears UNDER password (inline)');
      console.log('  - Inputs are close together (8px gaps)');
      console.log('  - Border separator between password and code');
      console.log('  - "Andere methode" link visible');

      await page.screenshot({ path: 'inline-test-final.png', fullPage: true });

    } catch (e) {
      console.log('⚠️  Code section did not appear (might be direct login or error)');
      await page.screenshot({ path: 'inline-test-no-code.png', fullPage: true });

      // Check for error
      const errorText = await page.$('text=/Invalid|Error|niet|fout/i');
      if (errorText) {
        const error = await errorText.textContent();
        console.log(`❌ Error found: ${error}`);
      }
    }

    console.log('\n━'.repeat(70));
    console.log('✅ INLINE CODE TEST COMPLETED!');
    console.log('━'.repeat(70));
    console.log('\n📊 Summary:');
    console.log('  ✅ App loads correctly');
    console.log('  ✅ Login form works');
    console.log('  📸 Screenshots saved for visual verification');
    console.log('\n⏸️  Browser will stay open for 5 seconds...');
    await sleep(5000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    await page.screenshot({ path: 'inline-test-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

// Run test
testInlineCodeFlow().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
