const { chromium } = require('playwright');

// ১. কনফিগারেশন সেটআপ
const TARGET_URL = process.env.TARGET_URL || 'https://educationpointbd24.blogspot.com/2024/11/update-methods.html?m=1';
const REPEAT_COUNT = parseInt(process.env.REPEAT_COUNT || '5000', 25);

/**
 * ১০টি আধুনিক ও রিয়েল ইউজার এজেন্ট (User-Agents)
 */
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:122.0) Gecko/20100101 Firefox/122.0'
];

/**
 * জিও-লোকেশন সেটিংস (USA, UK, Canada, Australia)
 */
const GEO_PROFILES = [
  { country: 'USA (New York)', locale: 'en-US', timezoneId: 'America/New_York' },
  { country: 'USA (California)', locale: 'en-US', timezoneId: 'America/Los_Angeles' },
  { country: 'UK (London)', locale: 'en-GB', timezoneId: 'Europe/London' },
  { country: 'Canada (Toronto)', locale: 'en-CA', timezoneId: 'America/Toronto' },
  { country: 'Australia (Sydney)', locale: 'en-AU', timezoneId: 'Australia/Sydney' }
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * মানুষের মতো পেজ স্ক্রল করার ফাংশন (Human-like Scrolling)
 */
async function humanScroll(page) {
  console.log('--- Simulating Human Scrolling Behavior ---');
  const scrollSteps = Math.floor(Math.random() * 4) + 3;
  
  for (let i = 0; i < scrollSteps; i++) {
    const scrollAmount = Math.floor(Math.random() * 400) + 200;
    await page.evaluate((y) => window.scrollBy({ top: y, behavior: 'smooth' }), scrollAmount);
    await delay(Math.floor(Math.random() * 1500) + 1000);

    if (Math.random() < 0.2) {
      await page.evaluate((y) => window.scrollBy({ top: -y, behavior: 'smooth' }), scrollAmount / 2);
      await delay(1000);
    }
  }
}

/**
 * বিজ্ঞাপনে (Ads) সরাসরি ক্লিক করার ফাংশন
 */
async function handleAdsClick(page) {
  console.log('--- Checking and Clicking on Advertisements ---');
  
  const adSelectors = [
    'iframe[src*="googleads"]',
    'iframe[id*="google_ads"]',
    'div[id*="ad"] a',
    'div[class*="ad"] a',
    'ins.adsbygoogle',
    'a[href*="doubleclick.net"]',
    'a[href*="adsterra"]',
    'a[href*="popads"]',
    'div[class*="sponsor"] a'
  ];

  try {
    for (const selector of adSelectors) {
      const adElement = page.locator(selector).first();
      
      const exists = await adElement.count();
      if (exists > 0) {
        console.log(`[AD DETECTED] Found ad matching selector: "${selector}"`);

        await adElement.scrollIntoViewIfNeeded().catch(() => {});
        await delay(1500);

        const [newPage] = await Promise.all([
          page.context().waitForEvent('page', { timeout: 8000 }).catch(() => null),
          adElement.click({ force: true }).catch((err) => console.log('Ad click attempt note:', err.message))
        ]);

        if (newPage) {
          console.log('--> Ad opened in a NEW TAB! Staying on ad page for 10+ seconds...');
          await newPage.waitForLoadState('domcontentloaded').catch(() => {});
          
          await delay(5000);
          await newPage.evaluate(() => window.scrollBy(0, 300)).catch(() => {});
          await delay(5000);
          
          await newPage.close();
          console.log('--> Ad tab closed successfully.');
        } else {
          console.log('--> Ad clicked on CURRENT PAGE. Waiting 10 seconds...');
          await delay(10000);
        }

        return true;
      }
    }
    console.log('No clickable ads detected on this attempt.');
  } catch (err) {
    console.log('Ad interaction error:', err.message);
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
  });

  console.log(`Starting Advanced Web Automation & Ad Clicker Bot.`);
  console.log(`Target URL: ${TARGET_URL}`);
  console.log(`Total Scheduled Cycles: ${REPEAT_COUNT}`);

  try {
    for (let i = 1; i <= REPEAT_COUNT; i++) {
      console.log(`\n==========================================`);
      console.log(`         RUNNING CYCLE ${i} OF ${REPEAT_COUNT}`);
      console.log(`==========================================`);

      // ১. র্যান্ডম User-Agent সিলেক্ট করা
      const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      
      // ২. র্যান্ডম Country / GEO Profile সিলেক্ট করা
      const randomGeo = GEO_PROFILES[Math.floor(Math.random() * GEO_PROFILES.length)];

      console.log(`[SESSION CONFIG] Country: ${randomGeo.country}`);
      console.log(`[SESSION CONFIG] User-Agent: ${randomUserAgent}`);

      // ৩. র্যান্ডম প্রোফাইলসহ নতুন কনটেক্সট (Context) তৈরি করা
      const context = await browser.newContext({
        userAgent: randomUserAgent,
        locale: randomGeo.locale,
        timezoneId: randomGeo.timezoneId,
        viewport: { width: 1366, height: 768 }
      });

      const page = await context.newPage();

      // ৪. টার্গেট লিংকে প্রবেশ
      await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
      console.log('Opened target URL.');

      // ৫. এলোমেলোভাবে পেজ রিফ্রেশ দেওয়া (৩০% চান্স)
      if (Math.random() < 0.3) {
        console.log('Random Action: Refreshing page for human behavior simulation...');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await delay(2000);
      }

      // ৬. মানুষের মতো স্ক্রলিং
      await humanScroll(page);

      // ৭. বিজ্ঞাপনে (Ads) সরাসরি ক্লিক করার চেষ্টা
      await handleAdsClick(page);

      // ৮. মূল পেজের যেকোনো লিংকে ক্লিক করে নতুন পেজে ঢোকা
      const clickTarget = page.locator('a').first(); 
      if (await clickTarget.isVisible().catch(() => false)) {
        console.log('Clicking target page link...');
        await clickTarget.click({ force: true });
        
        console.log('Waiting minimum 10 seconds on target page...');
        await delay(10000);

        // নতুন পেজে গিয়েও বিজ্ঞাপনে ক্লিক করার চেষ্টা
        await handleAdsClick(page);

        // ৯. আগের পেজে ফিরে আসা (Back Navigation)
        console.log('Navigating back to main target page...');
        await page.goBack({ waitUntil: 'domcontentloaded' }).catch(() => console.log('Could not go back.'));
        await delay(3000);
      } else {
        console.log('No general target link found on page.');
      }

      // সেশন শেষে কনটেক্সট ক্লোজ করা
      await context.close();
    }
  } catch (error) {
    console.error('Fatal execution error:', error);
  } finally {
    await browser.close();
    console.log('\nAutomation script completed all cycles. Browser closed.');
  }
})();
