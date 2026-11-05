// scripts/record-all-walkthroughs.js - Automated real website screen recorder
import puppeteer from 'puppeteer-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const publicVideos = path.resolve('./public/videos');
const distVideos = path.resolve('./dist/videos');
if (!fs.existsSync(publicVideos)) fs.mkdirSync(publicVideos, { recursive: true });
if (!fs.existsSync(distVideos)) fs.mkdirSync(distVideos, { recursive: true });

async function injectVirtualCursor(page) {
  await page.evaluate(() => {
    if (document.getElementById('virtual-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '24px';
    cursor.style.height = '24px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
    cursor.style.border = '2.5px solid #ffffff';
    cursor.style.boxShadow = '0 0 12px rgba(0,0,0,0.45)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999999';
    cursor.style.transition = 'transform 0.08s ease-out, background-color 0.1s ease, left 0.08s ease-out, top 0.08s ease-out';
    cursor.style.left = '640px';
    cursor.style.top = '360px';

    const ripple = document.createElement('div');
    ripple.id = 'cursor-ripple';
    ripple.style.position = 'fixed';
    ripple.style.width = '48px';
    ripple.style.height = '48px';
    ripple.style.borderRadius = '50%';
    ripple.style.border = '3px solid rgba(245, 158, 11, 0.8)';
    ripple.style.pointerEvents = 'none';
    ripple.style.zIndex = '9999998';
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '0';
    ripple.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';

    document.body.appendChild(cursor);
    document.body.appendChild(ripple);

    window.moveCursorTo = (x, y) => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
      ripple.style.left = `${x - 12}px`;
      ripple.style.top = `${y - 12}px`;
    };

    window.pulseCursor = () => {
      cursor.style.transform = 'scale(0.7)';
      cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.95)';
      ripple.style.transform = 'scale(1.4)';
      ripple.style.opacity = '1';
      setTimeout(() => {
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'rgba(245, 158, 11, 0.9)';
        ripple.style.transform = 'scale(2)';
        ripple.style.opacity = '0';
      }, 250);
    };
  });
}

async function recordScenario(browser, { name, url, viewport = { width: 1280, height: 720 }, actions }) {
  console.log(`\n======================================================`);
  console.log(`🎬 Recording Real Website Scenario: ${name}`);
  console.log(`🌐 URL: ${url}`);
  console.log(`======================================================`);

  const tmpDir = path.resolve(`/tmp/rec_${name}`);
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  const page = await browser.newPage();
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('dineqr_super_auth', 'true');
    sessionStorage.setItem('dineqr_staff_auth_default', 'true');
    sessionStorage.setItem('dineqr_staff_auth_rest_losteria', 'true');
    sessionStorage.setItem('dineqr_staff_auth_rest_alexandria_library', 'true');
  });
  await page.setViewport({ ...viewport, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
  await injectVirtualCursor(page);

  let frameIdx = 0;
  const captureFrame = async (count = 1) => {
    for (let c = 0; c < count; c++) {
      const file = path.join(tmpDir, `frame_${String(frameIdx++).padStart(4, '0')}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
    }
  };

  const smoothMove = async (startX, startY, endX, endY, steps = 12) => {
    for (let i = 1; i <= steps; i++) {
      const x = Math.round(startX + (endX - startX) * (i / steps));
      const y = Math.round(startY + (endY - startY) * (i / steps));
      await page.evaluate((cx, cy) => window.moveCursorTo(cx, cy), x, y);
      await captureFrame(1);
    }
  };

  const clickAt = async (target) => {
    let x, y, elToClick = null;
    if (typeof target === 'string') {
      const el = await page.$(target);
      if (!el) return;
      const box = await el.boundingBox();
      if (!box) return;
      x = Math.round(box.x + box.width / 2);
      y = Math.round(box.y + box.height / 2);
      elToClick = el;
    } else if (target && typeof target === 'object') {
      if (typeof target.boundingBox === 'function') {
        const box = await target.boundingBox();
        if (!box) return;
        x = Math.round(box.x + box.width / 2);
        y = Math.round(box.y + box.height / 2);
        elToClick = target;
      } else if (typeof target.x === 'number' && typeof target.y === 'number') {
        x = Math.round(target.x);
        y = Math.round(target.y);
      }
    }

    if (x === undefined || y === undefined || isNaN(x) || isNaN(y)) return;

    await page.evaluate((cx, cy) => {
      window.moveCursorTo(cx, cy);
      window.pulseCursor();
    }, x, y);
    await captureFrame(3);

    if (elToClick) {
      await elToClick.click().catch(() => page.mouse.click(x, y));
    } else {
      await page.mouse.click(x, y);
    }
    await captureFrame(5);
  };

  // Run scenario specific actions
  await actions({ page, captureFrame, smoothMove, clickAt });

  await page.close();

  // Encode with FFmpeg
  const outputPublic = path.join(publicVideos, `${name}.mp4`);
  const outputDist = path.join(distVideos, `${name}.mp4`);

  console.log(`Encoding ${frameIdx} frames to H.264 MP4: ${outputPublic}...`);
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -framerate 15 -i "${tmpDir}/frame_%04d.jpg" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 -movflags +faststart "${outputPublic}"`,
    { stdio: 'ignore' }
  );
  fs.copyFileSync(outputPublic, outputDist);

  const stat = fs.statSync(outputPublic);
  console.log(`✅ Saved: ${outputPublic} (${(stat.size / 1024).toFixed(1)} KB)`);

  // Clean tmp frames
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

async function main() {
  console.log('🚀 Starting Automated Full-Platform Real Video Recorder...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,720']
  });

  try {
    // 1. Library Desk QR Pass Recharge
    await recordScenario(browser, {
      name: 'walkthrough_library',
      url: 'http://localhost:3005/menu?restaurant=alexandria-library&table=tbl_lib_1',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(10);
        // Scroll down to passes
        await smoothMove(640, 360, 450, 480, 10);
        for (let i = 0; i < 8; i++) {
          await page.evaluate(() => window.scrollBy(0, 30));
          await captureFrame(1);
        }

        // Add 6-hour deep work pass
        const addButtons = await page.$$('button');
        let targetAdd = null;
        for (const btn of addButtons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Add')) {
            targetAdd = btn;
            break;
          }
        }
        if (targetAdd) {
          const box = await targetAdd.boundingBox();
          if (box) {
            await smoothMove(450, 480, box.x + box.width / 2, box.y + box.height / 2, 8);
            await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
          }
        }
        await captureFrame(10);

        // Open Cart Drawer
        const cartBtn = await page.$('button[class*="from-sky-600"]');
        if (cartBtn) {
          const box = await cartBtn.boundingBox();
          if (box) {
            await smoothMove(600, 400, box.x + box.width / 2, box.y + box.height / 2, 8);
            await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
          }
        }
        await captureFrame(15);

        // Type student name in CartDrawer
        const nameInput = await page.$('input[placeholder*="name" i], input[type="text"]');
        if (nameInput) {
          await nameInput.type('Aarav Sharma (Desk 01)', { delay: 50 });
          await captureFrame(10);
        }

        // Click Cash / Reception pay or Place Order
        const placeOrderBtn = await page.$('button[class*="from-sky-600"]');
        if (placeOrderBtn) {
          await clickAt(placeOrderBtn);
        }
        await captureFrame(25);
      }
    });

    // 2. Restaurant Table QR Live Ordering & Bill
    await recordScenario(browser, {
      name: 'walkthrough_restaurant',
      url: 'http://localhost:3005/menu?restaurant=losteria&table=tbl_1',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(10);
        // Scroll through menu
        for (let i = 0; i < 10; i++) {
          await page.evaluate(() => window.scrollBy(0, 35));
          await captureFrame(1);
        }
        // Add item to cart
        const addButtons = await page.$$('button');
        let targetAdd = null;
        for (const btn of addButtons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Add')) {
            targetAdd = btn;
            break;
          }
        }
        if (targetAdd) {
          const box = await targetAdd.boundingBox();
          if (box) {
            await smoothMove(640, 360, box.x + box.width / 2, box.y + box.height / 2, 8);
            await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
          }
        }
        await captureFrame(12);

        // Open Cart Drawer
        const cartBtn = await page.$('button[class*="from-sky-600"]');
        if (cartBtn) {
          const box = await cartBtn.boundingBox();
          if (box) {
            await smoothMove(640, 360, box.x + box.width / 2, box.y + box.height / 2, 8);
            await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
          }
        }
        await captureFrame(20);
      }
    });

    // 3. Kitchen KDS Live Queue & Chime
    await recordScenario(browser, {
      name: 'walkthrough_kds',
      url: 'http://localhost:3005/admin/kitchen',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(15);
        // Find ticket action button
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Accept') || txt.includes('Start Prep') || txt.includes('Mark Ready') || txt.includes('Print KOT')) {
            const box = await btn.boundingBox();
            if (box) {
              await smoothMove(640, 360, box.x + box.width / 2, box.y + box.height / 2, 10);
              await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
              await captureFrame(15);
              break;
            }
          }
        }
        await captureFrame(20);
      }
    });

    // 4. Visual Floor Plan Management
    await recordScenario(browser, {
      name: 'walkthrough_floorplan',
      url: 'http://localhost:3005/admin/floor-plan',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(15);
        // Hover over a table on the floor plan
        await smoothMove(640, 360, 480, 320, 12);
        await clickAt({ x: 480, y: 320 });
        await captureFrame(15);

        // Hover over add table button
        const addBtn = await page.$('button[class*="amber"], button[class*="Add"]');
        if (addBtn) {
          const box = await addBtn.boundingBox();
          if (box) {
            await smoothMove(480, 320, box.x + box.width / 2, box.y + box.height / 2, 10);
            await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
          }
        }
        await captureFrame(20);
      }
    });

    // 5. Apronto Hyperlocal Trades & Porter Truck Dispatch
    await recordScenario(browser, {
      name: 'walkthrough_trades',
      url: 'http://localhost:3005/services',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(15);
        // Click on Cement & Building Supplies filter
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Cement') || txt.includes('Carpenters')) {
            const box = await btn.boundingBox();
            if (box) {
              await smoothMove(640, 360, box.x + box.width / 2, box.y + box.height / 2, 10);
              await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
              await captureFrame(10);
              break;
            }
          }
        }

        // Scroll down to Porter Delivery Fare Calculator
        for (let i = 0; i < 12; i++) {
          await page.evaluate(() => window.scrollBy(0, 45));
          await captureFrame(1);
        }

        // Click Tata Ace Mini-Truck option
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Tata Ace') || txt.includes('Truck')) {
            const box = await btn.boundingBox();
            if (box) {
              await smoothMove(500, 400, box.x + box.width / 2, box.y + box.height / 2, 8);
              await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
              await captureFrame(10);
              break;
            }
          }
        }

        // Click Dispatch Porter Driver
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Dispatch') || txt.includes('Book')) {
            const box = await btn.boundingBox();
            if (box) {
              await smoothMove(500, 400, box.x + box.width / 2, box.y + box.height / 2, 8);
              await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
              await captureFrame(20);
              break;
            }
          }
        }
        await captureFrame(15);
      }
    });

    // 6. Mobile Phone Profit & Loss Margin Estimator
    await recordScenario(browser, {
      name: 'walkthrough_pnl',
      url: 'http://localhost:3005/admin',
      viewport: { width: 412, height: 860 },
      actions: async ({ page, captureFrame, smoothMove }) => {
        await captureFrame(15);
        // Scroll down to Profit Estimator card
        for (let i = 0; i < 18; i++) {
          await page.evaluate(() => window.scrollBy(0, 40));
          await captureFrame(1);
        }

        // Slide the sliders
        const sliders = await page.$$('input[type="range"]');
        if (sliders.length >= 2) {
          // Adjust rent slider
          await page.evaluate(s => {
            s.value = 85000;
            s.dispatchEvent(new Event('input', { bubbles: true }));
            s.dispatchEvent(new Event('change', { bubbles: true }));
          }, sliders[0]);
          await captureFrame(12);

          // Adjust electricity slider
          await page.evaluate(s => {
            s.value = 28000;
            s.dispatchEvent(new Event('input', { bubbles: true }));
            s.dispatchEvent(new Event('change', { bubbles: true }));
          }, sliders[1]);
          await captureFrame(12);

          if (sliders[2]) {
            await page.evaluate(s => {
              s.value = 65000;
              s.dispatchEvent(new Event('input', { bubbles: true }));
              s.dispatchEvent(new Event('change', { bubbles: true }));
            }, sliders[2]);
            await captureFrame(15);
          }
        }
        await captureFrame(15);
      }
    });

    // 7. Local SQLite Webhook & Cryptographic Verification
    await recordScenario(browser, {
      name: 'walkthrough_sqlite',
      url: 'http://localhost:3005/admin',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(15);
        // Scroll to Webhook Sync card
        for (let i = 0; i < 20; i++) {
          await page.evaluate(() => window.scrollBy(0, 35));
          await captureFrame(1);
        }

        // Click "Verify Database Webhook Now"
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Verify Database Webhook') || txt.includes('Verify')) {
            const box = await btn.boundingBox();
            if (box) {
              await smoothMove(640, 360, box.x + box.width / 2, box.y + box.height / 2, 10);
              await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
              await captureFrame(25);
              break;
            }
          }
        }
        await captureFrame(15);
      }
    });

    // 8. Flat ₹1,000/mo SaaS Subscription
    await recordScenario(browser, {
      name: 'walkthrough_subscription',
      url: 'http://localhost:3005/pricing',
      actions: async ({ page, captureFrame, smoothMove, clickAt }) => {
        await captureFrame(15);
        for (let i = 0; i < 8; i++) {
          await page.evaluate(() => window.scrollBy(0, 25));
          await captureFrame(1);
        }
        const buttons = await page.$$('button');
        for (const btn of buttons) {
          const txt = await page.evaluate(el => el.innerText, btn);
          if (txt.includes('Subscribe') || txt.includes('Activate') || txt.includes('Get Started')) {
            const box = await btn.boundingBox();
            if (box) {
              await smoothMove(640, 360, box.x + box.width / 2, box.y + box.height / 2, 10);
              await clickAt({ x: box.x + box.width / 2, y: box.y + box.height / 2 });
              await captureFrame(20);
              break;
            }
          }
        }
        await captureFrame(15);
      }
    });

  } finally {
    await browser.close();
  }

  console.log('\n🎉 ALL REAL PLATFORM VIDEOS RECORDED AND READY!');
}

main().catch(err => {
  console.error('Fatal error in video recording:', err);
  process.exit(1);
});
