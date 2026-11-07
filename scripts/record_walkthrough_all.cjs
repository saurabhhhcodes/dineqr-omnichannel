// scripts/record_walkthrough_all.cjs - Complete Re-Recording of All Platform Walkthrough Videos
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_DIR = path.resolve(__dirname, '../public/videos');
const BASE_URL = 'http://localhost:3005';

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function recordSession({ url, outputPath, viewport, fps = 20, interactions, auth = true }) {
  console.log(`🎬 Recording ${path.basename(outputPath)} (${viewport.width}x${viewport.height})...`);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${viewport.width},${viewport.height}`],
    defaultViewport: viewport,
  });

  const page = await browser.newPage();

  // If admin auth is needed, inject into sessionStorage before loading
  if (auth) {
    await page.evaluateOnNewDocument(() => {
      sessionStorage.setItem('dineqr_super_auth', 'true');
      sessionStorage.setItem('dineqr_staff_auth_default', 'true');
      sessionStorage.setItem('dineqr_staff_auth_losteria', 'true');
      sessionStorage.setItem('dineqr_staff_auth_rest_losteria', 'true');
      localStorage.setItem('dineqr_super_auth', 'true');
    });
  }

  await page.goto(url, { waitUntil: 'networkidle2' });
  await sleep(1500);

  const client = await page.target().createCDPSession();
  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(fps),
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    outputPath,
  ]);

  ffmpeg.stdin.on('error', () => {});
  ffmpeg.stderr.on('data', () => {});

  let isStopping = false;
  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    if (isStopping) return;
    try {
      if (ffmpeg.stdin.writable) {
        ffmpeg.stdin.write(Buffer.from(data, 'base64'));
      }
      await client.send('Page.screencastFrameAck', { sessionId });
    } catch {}
  });

  await client.send('Page.startScreencast', { format: 'jpeg', quality: 90, everyNthFrame: 1 });

  try {
    await interactions(page);
  } catch (err) {
    console.error('Interaction error during recording:', err);
  }

  isStopping = true;
  try {
    await client.send('Page.stopScreencast');
  } catch {}
  try {
    ffmpeg.stdin.end();
  } catch {}
  await new Promise((resolve) => {
    ffmpeg.on('close', resolve);
    setTimeout(resolve, 4000);
  });
  try {
    await client.detach();
  } catch {}
  await browser.close();

  const size = fs.existsSync(outputPath) ? fs.statSync(outputPath).size : 0;
  console.log(`  ✓ Saved ${path.basename(outputPath)} (${size} bytes)`);
}

async function runAll() {
  console.log('====================================================');
  console.log('🎥 Re-Recording All Walkthrough Production Videos');
  console.log('====================================================\n');

  // 1. WALKTHROUGH RESTAURANT (CUSTOMER FLOW - PHONE SCREEN 390x844)
  await recordSession({
    url: `${BASE_URL}/menu?restaurant=losteria&table=tbl_1`,
    outputPath: path.join(TARGET_DIR, 'walkthrough_restaurant.mp4'),
    viewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
    fps: 20,
    auth: false,
    interactions: async (page) => {
      await sleep(1500);
      await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
      await sleep(1200);

      // Filter category: Pizzas
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const pizzaBtn = btns.find((b) => b.textContent.includes('Pizza'));
        if (pizzaBtn) pizzaBtn.click();
      });
      await sleep(1200);

      // Open first item detail modal
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.group.relative.flex.flex-col');
        if (cards.length > 0) cards[0].click();
      });
      await sleep(1800);

      // Increase quantity with plus button
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
        const plusBtn = btns.find((b) => b.querySelector('svg.lucide-plus') || b.innerHTML.includes('lucide-plus'));
        if (plusBtn) plusBtn.click();
      });
      await sleep(1000);

      // Type special cooking instructions
      const textarea = await page.$('.fixed.inset-0 textarea');
      if (textarea) {
        await textarea.type('Wood-fired crispy crust, extra fresh basil leaves', { delay: 35 });
        await sleep(800);
      }

      // Add to Order
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
        const addBtn = btns.find((b) => b.textContent.includes('Add') || b.textContent.includes('Order'));
        if (addBtn) addBtn.click();
      });
      await sleep(1400);

      // Open Cart Drawer
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const cartBtn = btns.find((b) => b.textContent.includes('View Order') || b.textContent.includes('Cart'));
        if (cartBtn) cartBtn.click();
      });
      await sleep(1600);

      // Fill Name and Phone
      const inputs = await page.$$('.fixed.inset-0 input');
      for (const inp of inputs) {
        const ph = await (await inp.getProperty('placeholder')).jsonValue();
        if (ph && ph.toLowerCase().includes('name')) {
          await inp.type('Vikram Malhotra', { delay: 45 });
        }
        if (ph && ph.toLowerCase().includes('phone')) {
          await inp.type('9876543210', { delay: 45 });
        }
      }
      await sleep(1200);

      // Place Order
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
        const placeBtn = btns.find((b) => b.textContent.includes('Place Order') || b.textContent.includes('Confirm'));
        if (placeBtn) placeBtn.click();
      });
      await sleep(4000);
    },
  });

  // 2. WALKTHROUGH KDS (KITCHEN CHEF & TOKEN TV - LAPTOP SCREEN 1440x900)
  await recordSession({
    url: `${BASE_URL}/admin/kitchen`,
    outputPath: path.join(TARGET_DIR, 'walkthrough_kds.mp4'),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    fps: 20,
    auth: true,
    interactions: async (page) => {
      await sleep(2000);

      // Start Preparing
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const prepBtn = btns.find((b) => b.textContent.includes('Start Preparing') || b.textContent.includes('Prepare'));
        if (prepBtn) prepBtn.click();
      });
      await sleep(2500);

      // Mark Ready
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const readyBtn = btns.find((b) => b.textContent.includes('Mark Ready') || b.textContent.includes('Ready'));
        if (readyBtn) readyBtn.click();
      });
      await sleep(2500);

      // Navigate to Token TV Display
      await page.goto(`${BASE_URL}/tokens`, { waitUntil: 'networkidle2' });
      await sleep(4000);
    },
  });

  // 3. WALKTHROUGH FLOORPLAN & TABLES (LAPTOP SCREEN 1440x900)
  await recordSession({
    url: `${BASE_URL}/admin/tables`,
    outputPath: path.join(TARGET_DIR, 'walkthrough_floorplan.mp4'),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    fps: 20,
    auth: true,
    interactions: async (page) => {
      await sleep(2000);

      // Scroll to view floor plan tables
      await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
      await sleep(1500);

      // Open View & Print Placard
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const placardBtn = btns.find((b) => b.textContent.includes('View & Print Placard') || b.textContent.includes('Placard'));
        if (placardBtn) placardBtn.click();
      });
      await sleep(2500);

      // Close Placard modal
      await page.evaluate(() => {
        const modal = document.querySelector('.fixed.inset-0');
        if (modal) {
          const btns = Array.from(modal.querySelectorAll('button'));
          const closeBtn = btns.find((b) => b.textContent.includes('Close') || b.querySelector('svg'));
          if (closeBtn) closeBtn.click();
        }
      });
      await sleep(1500);

      // Reserve Table
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const reserveBtn = btns.find((b) => b.textContent.includes('Reserve'));
        if (reserveBtn) reserveBtn.click();
      });
      await sleep(2000);

      // Type guest name in reservation modal if prompt appears
      const nameInput = await page.$('.fixed.inset-0 input[type="text"]');
      if (nameInput) {
        await nameInput.type('Vikram Singhania (VIP Table 03)', { delay: 40 });
        await sleep(1000);

        await page.evaluate(() => {
          const modal = document.querySelector('.fixed.inset-0');
          if (modal) {
            const btns = Array.from(modal.querySelectorAll('button'));
            const confirmBtn = btns.find((b) => b.textContent.includes('Confirm') || b.textContent.includes('Reserve') || b.textContent.includes('Save'));
            if (confirmBtn) confirmBtn.click();
          }
        });
        await sleep(2500);
      } else {
        await sleep(2000);
      }

      // Scroll across floor plan to view all dining bays
      await page.evaluate(() => window.scrollBy({ top: 250, behavior: 'smooth' }));
      await sleep(2500);
    },
  });

  // 4. WALKTHROUGH PNL & INVENTORY (LAPTOP SCREEN 1440x900)
  await recordSession({
    url: `${BASE_URL}/admin/inventory`,
    outputPath: path.join(TARGET_DIR, 'walkthrough_pnl.mp4'),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    fps: 20,
    auth: true,
    interactions: async (page) => {
      await sleep(2000);

      // Filter category
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const catBtn = btns.find((b) => b.textContent.includes('Dairy & Cheese'));
        if (catBtn) catBtn.click();
      });
      await sleep(1800);

      // Open New Stock Item modal
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const newBtn = btns.find((b) => b.textContent.includes('New Stock Item') || b.textContent.includes('Add Item') || b.textContent.includes('Record Stock'));
        if (newBtn) newBtn.click();
      });
      await sleep(2000);

      // Fill in modal details
      const modal = await page.$('.fixed.inset-0');
      if (modal) {
        const textInputs = await modal.$$('input[type="text"]');
        if (textInputs.length > 0) {
          await textInputs[0].type('Organic Buffalo Mozzarella', { delay: 40 });
          await sleep(600);
        }

        const numInputs = await modal.$$('input[type="number"]');
        if (numInputs.length > 0) {
          await numInputs[0].type('35', { delay: 60 });
          await sleep(600);
        }
        if (numInputs.length > 1) {
          await numInputs[1].type('480', { delay: 60 });
          await sleep(600);
        }

        // Save
        await page.evaluate(() => {
          const m = document.querySelector('.fixed.inset-0');
          if (m) {
            const btns = Array.from(m.querySelectorAll('button'));
            const saveBtn = btns.find((b) => b.textContent.includes('Save') || b.textContent.includes('Add') || b.textContent.includes('Create'));
            if (saveBtn) saveBtn.click();
          }
        });
        await sleep(2500);
      }

      // Scroll down to view ledger
      await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
      await sleep(3000);
    },
  });

  // 5. WALKTHROUGH SQLITE / MENU CATALOG (LAPTOP SCREEN 1440x900)
  await recordSession({
    url: `${BASE_URL}/admin/menu`,
    outputPath: path.join(TARGET_DIR, 'walkthrough_sqlite.mp4'),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    fps: 20,
    auth: true,
    interactions: async (page) => {
      await sleep(2000);

      // Filter category: Wood-Fired Pizzas
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const catBtn = btns.find((b) => b.textContent.includes('Wood-Fired Pizzas') || b.textContent.includes('Pizza'));
        if (catBtn) catBtn.click();
      });
      await sleep(1500);

      // Open Edit Dish Modal
      await page.evaluate(() => {
        const editBtn = document.querySelector('button[title="Edit Dish"]') || Array.from(document.querySelectorAll('button')).find((b) => b.querySelector('svg.lucide-pencil') || b.innerHTML.includes('lucide-pencil'));
        if (editBtn) editBtn.click();
      });
      await sleep(2000);

      // Select high-res photo preset
      await page.evaluate(() => {
        const presets = document.querySelectorAll('.fixed.inset-0 .grid button');
        if (presets.length > 2) presets[2].click();
      });
      await sleep(1200);

      // Adjust price
      const priceInput = await page.$('.fixed.inset-0 input[type="number"]');
      if (priceInput) {
        await priceInput.click({ clickCount: 3 });
        await priceInput.type('480', { delay: 60 });
        await sleep(800);
      }

      // Save changes
      await page.evaluate(() => {
        const m = document.querySelector('.fixed.inset-0');
        if (m) {
          const btns = Array.from(m.querySelectorAll('button'));
          const saveBtn = btns.find((b) => b.textContent.includes('Save'));
          if (saveBtn) saveBtn.click();
        }
      });
      await sleep(2500);

      // Scroll through catalog
      await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
      await sleep(2000);
    },
  });

  // 6. WALKTHROUGH SUBSCRIPTION & PRICING (LAPTOP SCREEN 1440x900)
  await recordSession({
    url: `${BASE_URL}/pricing`,
    outputPath: path.join(TARGET_DIR, 'walkthrough_subscription.mp4'),
    viewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    fps: 20,
    auth: false,
    interactions: async (page) => {
      await sleep(2000);

      // Scroll through plans
      await page.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
      await sleep(2500);

      // Click "Get Started" on the ₹1,500/mo Starter Plan
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const planBtn = btns.find((b) => b.textContent.includes('Get Started') || b.textContent.includes('Choose'));
        if (planBtn) planBtn.click();
      });
      await sleep(3500);
    },
  });

  console.log('\n🎉 ALL WALKTHROUGH VIDEOS SUCCESSFULLY RE-RECORDED!');
}

runAll().catch((err) => {
  console.error('Recording suite failed:', err);
  process.exit(1);
});
