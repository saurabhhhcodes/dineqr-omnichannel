// scripts/record_platform_suite.cjs - Automated Real High-Resolution Video Capturer
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RECORDINGS_DIR = path.resolve(__dirname, '../recordings');
const BASE_URL = 'http://localhost:3005';

if (!fs.existsSync(RECORDINGS_DIR)) {
  fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// Helper to record a page session via CDP Screencast with robust error handling
async function startRecorder(page, outputPath, framerate = 15) {
  const client = await page.target().createCDPSession();
  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', String(framerate),
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '22',
    '-pix_fmt', 'yuv420p',
    outputPath,
  ]);

  ffmpeg.stdin.on('error', () => {});
  ffmpeg.stderr.on('data', () => {}); // swallow logs

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

  await client.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 85,
    everyNthFrame: 1,
  });

  return {
    async stop() {
      isStopping = true;
      try {
        await client.send('Page.stopScreencast');
      } catch {}
      try {
        ffmpeg.stdin.end();
      } catch {}
      await new Promise((resolve) => {
        ffmpeg.on('close', resolve);
        ffmpeg.on('error', resolve);
        setTimeout(resolve, 3000);
      });
      try {
        await client.detach();
      } catch {}
    },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function recordAll() {
  console.log('====================================================');
  console.log('🎬 DineQR Production Screen Recording Generator');
  console.log(`📁 Target Directory: ${RECORDINGS_DIR}`);
  console.log('====================================================\n');

  // ============================================================
  // VIDEO 1: CUSTOMER MOBILE ORDERING (PHONE SCREEN - 390x844)
  // ============================================================
  console.log('📱 [1/5] Recording Customer Mobile Ordering Flow (Phone Screen 390x844)...');
  const mobileBrowser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=390,844'],
    defaultViewport: { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 },
  });

  const mobilePage = await mobileBrowser.newPage();
  const video1Path = path.join(RECORDINGS_DIR, '01_customer_phone_ordering_flow.mp4');
  const recorder1 = await startRecorder(mobilePage, video1Path, 15);

  try {
    await mobilePage.goto(`${BASE_URL}/menu?restaurant=losteria&table=tbl_1`, { waitUntil: 'networkidle2' });
    await sleep(2000);

    // Scroll down to showcase categories
    await mobilePage.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
    await sleep(1500);

    // Click Category filter (Wood-Fired Pizzas)
    await mobilePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const pizzaBtn = btns.find(b => b.textContent.includes('Pizza'));
      if (pizzaBtn) pizzaBtn.click();
    });
    await sleep(1500);

    // Search for Burrata
    const searchInput = await mobilePage.$('input[type="text"]');
    if (searchInput) {
      await searchInput.type('Burrata', { delay: 100 });
      await sleep(1200);
    }

    // Click on item card to open Item Detail Modal
    await mobilePage.evaluate(() => {
      const cards = document.querySelectorAll('.group.relative.flex.flex-col');
      if (cards.length > 0) cards[0].click();
    });
    await sleep(1800);

    // Increment quantity in modal
    await mobilePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const incBtn = btns.find(b => b.title && b.title.includes('Increase')) || btns.find(b => b.innerHTML.includes('lucide-plus'));
      if (incBtn) incBtn.click();
    });
    await sleep(800);

    // Add cooking notes in modal
    const notesTextarea = await mobilePage.$('textarea');
    if (notesTextarea) {
      await notesTextarea.type('Crispy wood-fired crust with extra fresh basil please', { delay: 50 });
      await sleep(1000);
    }

    // Click Add to Order in modal
    await mobilePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent.includes('Add') || b.textContent.includes('Order'));
      if (addBtn) addBtn.click();
    });
    await sleep(1500);

    // Open Cart Drawer
    await mobilePage.evaluate(() => {
      const cartBtn = document.querySelector('button.bg-amber-500.text-slate-950') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('View Order') || b.textContent.includes('Cart'));
      if (cartBtn) cartBtn.click();
    });
    await sleep(1800);

    // Fill customer dining details in cart drawer
    const inputs = await mobilePage.$$('input');
    for (const inp of inputs) {
      const placeholder = await (await inp.getProperty('placeholder')).jsonValue();
      if (placeholder && placeholder.toLowerCase().includes('name')) {
        await inp.type('Arjun Mehta', { delay: 80 });
      }
      if (placeholder && placeholder.toLowerCase().includes('phone')) {
        await inp.type('9876543210', { delay: 80 });
      }
    }
    await sleep(1200);

    // Place Order
    await mobilePage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const placeBtn = btns.find(b => b.textContent.includes('Place Order') || b.textContent.includes('Confirm'));
      if (placeBtn) placeBtn.click();
    });
    await sleep(3500);
  } catch (err) {
    console.error('Error in Video 1:', err);
  } finally {
    await recorder1.stop();
    await mobileBrowser.close();
    console.log(`  ✓ Video 1 saved: ${video1Path} (${fs.statSync(video1Path).size} bytes)\n`);
  }

  // ============================================================
  // VIDEO 2: KITCHEN KDS & TOKEN TV (SYSTEM / LAPTOP - 1440x900)
  // ============================================================
  console.log('💻 [2/5] Recording Kitchen KDS & Order Lifecycle (Laptop 1440x900)...');
  const desktopBrowser1 = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const kdsPage = await desktopBrowser1.newPage();
  const video2Path = path.join(RECORDINGS_DIR, '02_kitchen_kds_operations.mp4');
  const recorder2 = await startRecorder(kdsPage, video2Path, 15);

  try {
    await kdsPage.goto(`${BASE_URL}/admin/kitchen`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    // Click "Start Preparing" on first active order card
    await kdsPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const prepBtn = btns.find(b => b.textContent.includes('Start Preparing') || b.textContent.includes('Prepare'));
      if (prepBtn) prepBtn.click();
    });
    await sleep(2000);

    // Click "Mark Ready" on order card
    await kdsPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const readyBtn = btns.find(b => b.textContent.includes('Mark Ready') || b.textContent.includes('Ready'));
      if (readyBtn) readyBtn.click();
    });
    await sleep(2000);

    // Navigate to Token TV Display
    await kdsPage.goto(`${BASE_URL}/tokens`, { waitUntil: 'networkidle2' });
    await sleep(3000);
  } catch (err) {
    console.error('Error in Video 2:', err);
  } finally {
    await recorder2.stop();
    await desktopBrowser1.close();
    console.log(`  ✓ Video 2 saved: ${video2Path} (${fs.statSync(video2Path).size} bytes)\n`);
  }

  // ============================================================
  // VIDEO 3: INVENTORY MANAGEMENT & LOGS (SYSTEM / LAPTOP - 1440x900)
  // ============================================================
  console.log('💻 [3/5] Recording Inventory & Stock Logs (Laptop 1440x900)...');
  const desktopBrowser2 = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const invPage = await desktopBrowser2.newPage();
  const video3Path = path.join(RECORDINGS_DIR, '03_inventory_and_stock_logs.mp4');
  const recorder3 = await startRecorder(invPage, video3Path, 15);

  try {
    await invPage.goto(`${BASE_URL}/admin/inventory`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    // Open "Record Stock Movement" Modal
    await invPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const moveBtn = btns.find(b => b.textContent.includes('Record Stock') || b.textContent.includes('Stock Movement'));
      if (moveBtn) moveBtn.click();
    });
    await sleep(2000);

    // Fill movement form
    const qtyInput = await invPage.$('input[type="number"]');
    if (qtyInput) {
      await qtyInput.click({ clickCount: 3 });
      await qtyInput.type('25', { delay: 100 });
      await sleep(800);
    }

    const textInputs = await invPage.$$('input[type="text"]');
    if (textInputs.length > 0) {
      await textInputs[0].type('MilkyMist Dairy Farms Ltd', { delay: 60 });
      await sleep(800);
    }

    // Submit movement
    await invPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent.includes('Save') || b.textContent.includes('Update Stock'));
      if (saveBtn) saveBtn.click();
    });
    await sleep(2500);

    // Scroll down to examine Audit Ledger
    await invPage.evaluate(() => window.scrollBy({ top: 380, behavior: 'smooth' }));
    await sleep(2500);
  } catch (err) {
    console.error('Error in Video 3:', err);
  } finally {
    await recorder3.stop();
    await desktopBrowser2.close();
    console.log(`  ✓ Video 3 saved: ${video3Path} (${fs.statSync(video3Path).size} bytes)\n`);
  }

  // ============================================================
  // VIDEO 4: BACK-OFFICE MENU CATALOG EDITOR (SYSTEM / LAPTOP - 1440x900)
  // ============================================================
  console.log('💻 [4/5] Recording Menu Catalog & Photography Presets (Laptop 1440x900)...');
  const desktopBrowser3 = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const menuPage = await desktopBrowser3.newPage();
  const video4Path = path.join(RECORDINGS_DIR, '04_admin_menu_catalog_management.mp4');
  const recorder4 = await startRecorder(menuPage, video4Path, 15);

  try {
    await menuPage.goto(`${BASE_URL}/admin/menu`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    // Toggle In Stock / Sold Out on first item
    await menuPage.evaluate(() => {
      const stockBtn = document.querySelector('button.bg-emerald-500, button.bg-rose-600');
      if (stockBtn) stockBtn.click();
    });
    await sleep(1500);

    // Toggle it back to In Stock
    await menuPage.evaluate(() => {
      const stockBtn = document.querySelector('button.bg-rose-600, button.bg-emerald-500');
      if (stockBtn) stockBtn.click();
    });
    await sleep(1500);

    // Click Edit Dish Modal
    await menuPage.evaluate(() => {
      const editBtn = document.querySelector('button[title="Edit Dish"]');
      if (editBtn) editBtn.click();
    });
    await sleep(2000);

    // Pick a verified photography preset
    await menuPage.evaluate(() => {
      const presetButtons = document.querySelectorAll('.grid.grid-cols-4 button, .grid.grid-cols-7 button');
      if (presetButtons.length > 1) presetButtons[1].click();
    });
    await sleep(1500);

    // Save dish changes
    await menuPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const saveBtn = btns.find(b => b.textContent.includes('Save Changes'));
      if (saveBtn) saveBtn.click();
    });
    await sleep(2500);
  } catch (err) {
    console.error('Error in Video 4:', err);
  } finally {
    await recorder4.stop();
    await desktopBrowser3.close();
    console.log(`  ✓ Video 4 saved: ${video4Path} (${fs.statSync(video4Path).size} bytes)\n`);
  }

  // ============================================================
  // VIDEO 5: FLOOR PLAN, TABLE QR & RESERVATIONS (SYSTEM / LAPTOP - 1440x900)
  // ============================================================
  console.log('💻 [5/5] Recording Floor Plan & Table Reservations (Laptop 1440x900)...');
  const desktopBrowser4 = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
  });

  const tablePage = await desktopBrowser4.newPage();
  const video5Path = path.join(RECORDINGS_DIR, '05_floor_plan_and_tables.mp4');
  const recorder5 = await startRecorder(tablePage, video5Path, 15);

  try {
    await tablePage.goto(`${BASE_URL}/admin/tables`, { waitUntil: 'networkidle2' });
    await sleep(2500);

    // Open Table QR code modal
    await tablePage.evaluate(() => {
      const qrBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Cloud Live QR') || b.textContent.includes('QR'));
      if (qrBtn) qrBtn.click();
    });
    await sleep(2000);

    // Close QR modal
    await tablePage.evaluate(() => {
      const closeBtn = document.querySelector('button:has(svg.lucide-x)') || Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('lucide-x'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(1500);

    // Click Quick Reserve on Table 03
    await tablePage.evaluate(() => {
      const reserveBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Quick Reserve'));
      if (reserveBtn) reserveBtn.click();
    });
    await sleep(2000);

    // Fill reservation modal
    const guestInput = await tablePage.$('input[placeholder*="Singhania"], input[type="text"]');
    if (guestInput) {
      await guestInput.type('Vikram Singhania', { delay: 70 });
      await sleep(800);
    }

    // Confirm reservation
    await tablePage.evaluate(() => {
      const confirmBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Confirm Reservation'));
      if (confirmBtn) confirmBtn.click();
    });
    await sleep(2500);

    // Release table
    await tablePage.evaluate(() => {
      const releaseBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Release Table'));
      if (releaseBtn) releaseBtn.click();
    });
    await sleep(2500);
  } catch (err) {
    console.error('Error in Video 5:', err);
  } finally {
    await recorder5.stop();
    await desktopBrowser4.close();
    console.log(`  ✓ Video 5 saved: ${video5Path} (${fs.statSync(video5Path).size} bytes)\n`);
  }

  console.log('====================================================');
  console.log('🎉 ALL 5 PRODUCTION VIDEOS GENERATED SUCCESSFULLY!');
  console.log('====================================================');
}

recordAll().catch((err) => {
  console.error('Fatal recording failure:', err);
  process.exit(1);
});
