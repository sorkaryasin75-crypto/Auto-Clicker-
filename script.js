const { chromium } = require('playwright');

// ১. কনফিগারেশন সেটআপ
const TARGET_URL = process.env.TARGET_URL || 'https://example.com'; // টার্গেট লিংক
const REPEAT_COUNT = parseInt(process.env.REPEAT_COUNT || '5', 10); // কতবার ভিজিট করবে (ম্যানুয়ালি সেটেবল)

/**
 * র্যান্ডম সময় অপেক্ষা করার ফাংশন (মিলিসেকেন্ডে)
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * মানুষের মতো পেজ স্ক্রল করার ফাংশন (Human-like Scrolling)
 */
async function humanScroll(page) {
  console.log('--- Simulating Human Scrolling Behavior ---');
  const scrollSteps = Math.floor(Math.random() * 4) + 3; // ৩ থেকে ৬ বার স্ক্রল করবে
  
  for (let i = 0; i < scrollSteps; i++) {
    const scrollAmount = Math.floor(Math.random() * 400) + 200;
    // নিচে স্ক্রল
    await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), scrollAmount);
    await delay(Math.floor(Math.random() * 1500) + 1000);

    // মাঝে মাঝে ১০% ক্ষেত্রে একটু উপরে স্ক্রল করবে (স্বাভাবিক আচরণের মতো)
    if (Math.random() < 0.2) {
      await page.evaluate((y) => window.scrollBy({ top: -y, behavior: 'smooth' }), scrollAmount / 2);
      await delay(1000);
    }
  }
}

/**
 * পেজে থাকা বিজ্ঞাপনে (Ads) ক্লিক করার ফাংশন
 */
async function handleAdsClick(page) {
  console.log('--- Checking for Advertisements ---');
  
  // প্রচলিত এড ট্র্যাকিং ও আইফ্রেমের সিলেক্টর
  const adSelectors = [
    'iframe[src*="googleads"]',
    'iframe[id*="google_ads"]',
    'div[id*="ad"]',
    'div[class*="ad-"]',
    'div[class*="sponsor"]',
    'a[href*="doubleclick.net"]',
    'a[href*="adsterra"]',
    'ins.adsbygoogle'
  ];

  try {
    for (const selector of adSelectors) {
      const adElement = page.locator(selector).first();
      
      if (await adElement.isVisible().catch(() => false)) {
        console.log(`Ad found with selector: ${selector}. Clicking on the ad...`);
        
        // নতুন ট্যাবে এড খুললে তা হ্যান্ডেল করার প্রসেস
        const [newPage] = await Promise.all([
          page.context().waitForEvent('page', { timeout: 5000 }).catch(() => null),
          adElement.click({ force: true }).catch(() => console.log('Click on ad failed or blocked.'))
        ]);

        if (newPage) {
          console.log('Ad opened in a new tab. Staying on ad page for 10+ seconds...');
          await newPage.waitForLoadState('domcontentloaded').catch(() => {});
          await delay(10000); // নতুন এড পেজে অন্তত ১০ সেকেন্ড অপেক্ষা
          await newPage.close();
          console.log('Ad tab closed.');
        } else {
          console.log('Ad clicked on current page. Waiting 10 seconds...');
          await delay(10000);
        }

        return true; // এড পাওয়া গেলে এবং ক্লিক হলে বের হয়ে যাবে
      }
    }
    console.log('No clickable ads detected on this iteration.');
  } catch (err) {
    console.log('Ad handling encounter non-critical issue:', err.message);
  }
  return false;
}

(async () => {
  // প্রক্সি/ব্রাউজার সেটিংস নিরাপদ রাখতে
  const browser = await chromium.launch({
    headless: true, // গেটহাব অ্যাকশনে হেডলেস হিসেবে চলবে
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 720 },
    locale: 'en-US'
  });

  const page = await context.newPage();

  console.log(`Starting Automation Process.`);
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Total Scheduled Loops: ${REPEAT_COUNT}`);

  try {
    for (let i = 1; i <= REPEAT_COUNT; i++) {
      console.log(`\n==========================================`);
      console.log(`         RUNNING LOOP ${i} OF ${REPEAT_COUNT}`);
      console.log(`==========================================`);

      // ১. টার্গেট লিংকে প্রবেশ
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log('Successfully navigated to target URL.');

      // ২. এলোমেলোভাবে পেজ রিফ্রেশ দেওয়া (একউন্ট সিকিউরিটির জন্য)
      if (Math.random() < 0.3) { // ৩০% ক্ষেত্রে পেজ রিফ্রেশ মারবে
        console.log('Random Action: Refreshing page...');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await delay(2000);
      }

      // ৩. মানুষের মতো মাউস মুভ ও স্ক্রলিং
      await humanScroll(page);

      // ৪. পেজের যেকোনো প্রধান লিংক বা আর্টিকেলে ক্লিক
      const clickTarget = page.locator('a').first(); 
      if (await clickTarget.isVisible().catch(() => false)) {
        console.log('Clicking target page link...');
        await clickTarget.click({ force: true });
        
        // ৫. লিংকে ঢোকার পর নুন্যতম ১০ সেকেন্ড অপেক্ষা করা
        console.log('Waiting minimum 10 seconds on target page...');
        await delay(10000);

        // ৬. নতুন পেজে কোনো এড থাকলে সেটিতে ক্লিক
        await handleAdsClick(page);

        // ৭. আগের পেজে ফিরে আসা (Back Navigation)
        console.log('Navigating back to main target page...');
        await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => console.log('Could not go back.'));
        await delay(3000);
      } else {
        console.log('No click target element found on page.');
      }
    }
  } catch (error) {
    console.error('Fatal error in main script execution:', error);
  } finally {
    await browser.close();
    console.log('\nAll automation cycles finished. Browser closed.');
  }
})();
