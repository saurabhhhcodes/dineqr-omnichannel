// scripts/test-record.js - Prototype screen recording of live website flow
import puppeteer from 'puppeteer-core';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

async function testRecord() {
  const tmpDir = path.resolve('/tmp/record_test');
  if (fs.existsSync(tmpDir)) fs.rmSync(tmpDir, { recursive: true, force: true });
  fs.mkdirSync(tmpDir, { recursive: true });

  console.log('Launching Chrome to record real website interaction...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1280,720']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 1 });

  // Navigate to Alexandria Library Desk QR
  await page.goto('http://localhost:3005/menu?restaurant=alexandria-library&table=tbl_lib_1', {
    waitUntil: 'networkidle2'
  });

  // Inject mouse cursor helper
  await page.evaluate(() => {
    const cursor = document.createElement('div');
    cursor.id = 'virtual-cursor';
    cursor.style.position = 'fixed';
    cursor.style.width = '20px';
    cursor.style.height = '20px';
    cursor.style.borderRadius = '50%';
    cursor.style.backgroundColor = 'rgba(245, 158, 11, 0.85)';
    cursor.style.border = '2px solid #ffffff';
    cursor.style.boxShadow = '0 0 10px rgba(0,0,0,0.4)';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '999999';
    cursor.style.transition = 'transform 0.08s ease-out, background-color 0.1s ease';
    cursor.style.left = '640px';
    cursor.style.top = '360px';
    document.body.appendChild(cursor);

    window.moveCursorTo = (x, y) => {
      cursor.style.left = `${x}px`;
      cursor.style.top = `${y}px`;
    };

    window.pulseCursor = () => {
      cursor.style.transform = 'scale(0.7)';
      cursor.style.backgroundColor = 'rgba(239, 68, 68, 0.9)';
      setTimeout(() => {
        cursor.style.transform = 'scale(1)';
        cursor.style.backgroundColor = 'rgba(245, 158, 11, 0.85)';
      }, 150);
    };
  });

  let frameIndex = 0;
  const captureFrame = async () => {
    const file = path.join(tmpDir, `frame_${String(frameIndex++).padStart(4, '0')}.jpg`);
    await page.screenshot({ path: file, type: 'jpeg', quality: 85 });
  };

  // Capture initial frames
  for (let i = 0; i < 10; i++) await captureFrame();

  // Scroll down smoothly
  for (let i = 0; i < 15; i++) {
    await page.evaluate((step) => {
      window.scrollBy(0, 15);
      window.moveCursorTo(640 + step * 5, 300 + step * 8);
    }, i);
    await captureFrame();
  }

  // Click on "Add" button of the first item
  const addButton = await page.$('button');
  if (addButton) {
    const box = await addButton.boundingBox();
    if (box) {
      await page.evaluate((x, y) => {
        window.moveCursorTo(x + 10, y + 10);
        window.pulseCursor();
      }, box.x, box.y);
      for (let i = 0; i < 5; i++) await captureFrame();
      await addButton.click();
      for (let i = 0; i < 10; i++) await captureFrame();
    }
  }

  await browser.close();
  console.log(`Captured ${frameIndex} frames in ${tmpDir}. Encoding to MP4...`);

  const outVideo = '/tmp/record_test/test.mp4';
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -framerate 15 -i "${tmpDir}/frame_%04d.jpg" -c:v libx264 -pix_fmt yuv420p -preset fast "${outVideo}"`,
    { stdio: 'inherit' }
  );

  const stats = fs.statSync(outVideo);
  console.log(`🎉 SUCCESS! Output video created: ${outVideo} (${stats.size} bytes)`);
}

testRecord().catch(console.error);