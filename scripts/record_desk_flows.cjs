// scripts/record_desk_flows.cjs
const puppeteer = require('puppeteer-core');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const RECORDINGS_DIR = path.resolve(__dirname, '../recordings');
const BASE_URL = 'http://localhost:3005';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function recordSession(url, outputPath, interactionFn, viewport = { width: 1440, height: 900, deviceScaleFactor: 1.5 }) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', `--window-size=${viewport.width},${viewport.height}`],
    defaultViewport: viewport,
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2' });
  await sleep(1500);

  const client = await page.target().createCDPSession();
  const ffmpeg = spawn('/opt/homebrew/bin/ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-r', '20',
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
    await interactionFn(page);
  } catch (err) {
    console.error('Interaction error:', err);
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
    setTimeout(resolve, 3000);
  });
  try {
    await client.detach();
  } catch {}
  await browser.close();

  console.log(`✓ Saved: ${outputPath} (${fs.statSync(outputPath).size} bytes)`);
}

async function run() {
  console.log('Recording High-Definition System Flows (3, 4, 5)...');

  // FLOW 3: INVENTORY & STOCK LEDGER
  await recordSession(
    `${BASE_URL}/admin/inventory`,
    path.join(RECORDINGS_DIR, '03_inventory_and_stock_logs.mp4'),
    async (page) => {
      await sleep(1500);
      // Hover and scroll through inventory items
      await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
      await sleep(1500);

      // Click "Record Stock Movement" button
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const moveBtn = btns.find((b) => b.textContent.includes('Record Stock') || b.textContent.includes('Stock Movement'));
        if (moveBtn) moveBtn.click();
      });
      await sleep(2000);

      // Select Item dropdown
      await page.evaluate(() => {
        const selects = document.querySelectorAll('select');
        if (selects.length > 0 && selects[0].options.length > 1) {
          selects[0].selectedIndex = 1;
          selects[0].dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
      await sleep(1000);

      // Fill Quantity
      const numInput = await page.$('input[type="number"]');
      if (numInput) {
        await numInput.click({ clickCount: 3 });
        await numInput.type('30', { delay: 100 });
        await sleep(1000);
      }

      // Fill Vendor Name
      const textInputs = await page.$$('input[type="text"]');
      if (textInputs.length > 0) {
        await textInputs[0].type('MilkyMist Organic Dairy Farm', { delay: 60 });
        await sleep(1000);
      }

      // Save Stock Movement
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find((b) => b.textContent.includes('Save') || b.textContent.includes('Update Stock'));
        if (saveBtn) saveBtn.click();
      });
      await sleep(2500);

      // Scroll to view updated audit ledger table
      await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
      await sleep(3000);
    }
  );

  // FLOW 4: CATALOG MENU EDITOR & PRESETS
  await recordSession(
    `${BASE_URL}/admin/menu`,
    path.join(RECORDINGS_DIR, '04_admin_menu_catalog_management.mp4'),
    async (page) => {
      await sleep(1500);

      // Toggle stock on/off
      await page.evaluate(() => {
        const stockBtn = document.querySelector('button.bg-emerald-500, button.bg-rose-600');
        if (stockBtn) stockBtn.click();
      });
      await sleep(1500);

      await page.evaluate(() => {
        const stockBtn = document.querySelector('button.bg-rose-600, button.bg-emerald-500');
        if (stockBtn) stockBtn.click();
      });
      await sleep(1500);

      // Open Edit Dish Modal
      await page.evaluate(() => {
        const editBtn = document.querySelector('button[title="Edit Dish"]');
        if (editBtn) editBtn.click();
      });
      await sleep(2000);

      // Pick a verified photography preset
      await page.evaluate(() => {
        const presetButtons = document.querySelectorAll('.grid.grid-cols-4 button, .grid.grid-cols-7 button');
        if (presetButtons.length > 1) presetButtons[1].click();
      });
      await sleep(1500);

      // Edit description
      const descArea = await page.$('textarea');
      if (descArea) {
        await descArea.click({ clickCount: 3 });
        await descArea.type('Artisanal burrata cheese, slow-roasted heirloom cherry tomatoes, and cold-pressed basil pesto glaze.', { delay: 40 });
        await sleep(1000);
      }

      // Save changes
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const saveBtn = btns.find((b) => b.textContent.includes('Save Changes'));
        if (saveBtn) saveBtn.click();
      });
      await sleep(2500);
    }
  );

  // FLOW 5: FLOOR PLAN, TABLE QR & QUICK RESERVATIONS
  await recordSession(
    `${BASE_URL}/admin/tables`,
    path.join(RECORDINGS_DIR, '05_floor_plan_and_tables.mp4'),
    async (page) => {
      await sleep(1500);

      // Click "Cloud Live QR"
      await page.evaluate(() => {
        const qrBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Cloud Live QR') || b.textContent.includes('QR'));
        if (qrBtn) qrBtn.click();
      });
      await sleep(2500);

      // Close QR Modal
      await page.evaluate(() => {
        const closeBtn = document.querySelector('.fixed.inset-0 button:has(svg)');
        if (closeBtn) closeBtn.click();
      });
      await sleep(1500);

      // Click "Quick Reserve"
      await page.evaluate(() => {
        const reserveBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Quick Reserve'));
        if (reserveBtn) reserveBtn.click();
      });
      await sleep(2000);

      // Fill Guest Name
      const guestInp = await page.$('.fixed.inset-0 input[type="text"]');
      if (guestInp) {
        await guestInp.type('Vikram Singhania (VIP Table 03)', { delay: 50 });
        await sleep(1000);
      }

      // Confirm Reservation
      await page.evaluate(() => {
        const confirmBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Confirm Reservation'));
        if (confirmBtn) confirmBtn.click();
      });
      await sleep(2500);

      // Release Table
      await page.evaluate(() => {
        const releaseBtn = Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('Release Table'));
        if (releaseBtn) releaseBtn.click();
      });
      await sleep(2500);
    }
  );

  console.log('🎉 Flows 3, 4, 5 successfully recorded!');
}

run().catch(console.error);
