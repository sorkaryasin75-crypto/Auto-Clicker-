const { chromium } = require('playwright');

(async () => {
  // ১. ব্রাউজার ওপেন করা (Headless মোডে)
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // আপনার টার্গেট লিংকটি এখানে প্রদান করুন
  const TARGET_URL = 'https://www.profitableratecpmnetwork.com/arv0c39syb?key=f12896aeee9e20af115026dcd5d25809'; 
  
  // আপনি কতবার ক্লিক ও ব্যাক করতে চান (পুনরাবৃত্তি)
  const REPEAT_COUNT = 5; 

  console.log(`Starting Automation on: ${TARGET_URL}`);

  try {
    for (let i = 1; i <= REPEAT_COUNT; i++) {
      console.log(`--- Loop ${i} of ${REPEAT_COUNT} ---`);

      // ওয়েবসাইটে প্রবেশ
      await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
      console.log('Successfully opened target URL.');

      // নির্দিষ্ট এলিমেন্ট বা লিংকে ক্লিক (এখানে a বা button ক্লিক করার জন্য সাধারণ সিলেক্টর ব্যবহার করা হয়েছে)
      // আপনার প্রয়োজন অনুযায়ী 'a' এর জায়গায় নির্দিষ্ট CSS Selector বা XPath বসাতে পারেন
      const clickTarget = page.locator('a').first(); 
      
      if (await clickTarget.isVisible()) {
        await clickTarget.click();
        console.log('Clicked on target element/link.');
        
        // পেজে কিছুক্ষণ অপেক্ষা করা (৩ সেকেন্ড)
        await page.waitForTimeout(3000);

        // ব্যাকে আসা
        await page.goBack();
        console.log('Navigated back to original page.');
        
        // আবার ৩ সেকেন্ড অপেক্ষা করা
        await page.waitForTimeout(3000);
      } else {
        console.log('Click target element not found.');
      }
    }
  } catch (error) {
    console.error('An error occurred during automation:', error);
  } finally {
    await browser.close();
    console.log('Automation process finished successfully.');
  }
})();
