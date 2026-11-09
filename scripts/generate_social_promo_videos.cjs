// scripts/generate_social_promo_videos.cjs
// Automated Social Media Video Producer for Instagram Reels, YouTube Shorts, & YouTube Showcase
// Uses Puppeteer High-DPI Composition + Native macOS Speech (Rishi en_IN) + FFmpeg H.264 / AAC Encoding

const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3005';
const WORK_DIR = path.resolve(__dirname, '../.video_build');
const OUTPUT_DIR = path.resolve(__dirname, '../public/videos');

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const SCENES = [
  {
    id: '01_hook',
    title: 'STOP OVERPAYING FOR POS',
    subtitle: '50k POS Hardware & Heavy Cloud Bills? STOP! 🛑',
    url: `${BASE_URL}/`,
    speech: 'Are you running a restaurant, cafe, gym, or clinic? Stop paying 50,000 rupees for expensive POS hardware and heavy recurring cloud bills!',
    waitForSelector: 'h1',
  },
  {
    id: '02_customer',
    title: 'DYNAMIC TABLE QR ORDERING',
    subtitle: '1. 📱 Table QR Digital Menu & Instant UPI (0% Commission)',
    url: `${BASE_URL}/menu?restaurant=rest_losteria&table=tbl_1`,
    speech: 'Meet DineQR! Guests scan the table QR code, browse digital menus with dietary filters, and pay instantly via UPI with zero percent commission.',
    waitForSelector: 'button',
  },
  {
    id: '03_captain',
    title: 'CAPTAIN WAITER MOBILE APP',
    subtitle: '2. 👨‍💼 Mobile Floor Captain App & Table KOT Punching',
    url: `${BASE_URL}/captain`,
    speech: 'Floor captains take orders on their own phones, select tables, add cooking instructions, and punch KOTs in two seconds straight to the kitchen.',
    waitForSelector: 'header',
  },
  {
    id: '04_kitchen',
    title: 'LIVE KITCHEN KDS & TIMERS',
    subtitle: '3. 👨‍🍳 Kitchen Display System with Live Timers & Audio Alarms',
    url: `${BASE_URL}/admin/kitchen`,
    speech: 'Chefs receive live order tickets with audible alarms, color-coded status, and elapsed cooking timers, eliminating kitchen chaos completely.',
    waitForSelector: 'header',
    auth: true,
  },
  {
    id: '05_tokentv',
    title: 'FOOD COURT TOKEN TV ANNOUNCER',
    subtitle: '4. 📺 Token TV Screen & Automatic Voice Callouts',
    url: `${BASE_URL}/tokens`,
    speech: 'Ready orders are automatically announced on the overhead food court TV display with loud, crystal-clear voice callouts.',
    waitForSelector: 'h1',
  },
  {
    id: '06_aggregators',
    title: 'ZOMATO & SWIGGY INTEGRATION',
    subtitle: '5. 🛵 Direct Two-Way Zomato & Swiggy Order Ingestion',
    url: `${BASE_URL}/admin/settings`,
    speech: 'Direct integration streams online delivery orders from Zomato, Swiggy, Magicpin, and ONDC straight into your kitchen display without extra tablets.',
    waitForSelector: 'h1',
    auth: true,
  },
  {
    id: '07_gym_clinic',
    title: 'GYM ATTENDANCE & CLINIC QUEUES',
    subtitle: '6. 🏋️ Paperless Gym Register, Attendance & Consultation Rooms',
    url: `${BASE_URL}/gym-register`,
    speech: 'Running a fitness club or healthcare clinic? Manage paperless member check-ins, doctor consultation rooms, and fee collections in one unified platform.',
    waitForSelector: 'h1',
  },
  {
    id: '08_pricing_cta',
    title: 'FLAT ₹1,500/MO · ZERO CLOUD BILLS',
    subtitle: '7. ⚡ Flat ₹1,500/Month · 100% Offline SQLite · Try Demo Now!',
    url: `${BASE_URL}/pricing`,
    speech: 'Everything runs on your local computer using 100% offline SQLite. Flat 1,500 rupees per month with zero cloud database costs! Try the live demo today!',
    waitForSelector: 'h1',
  },
];

function getVerticalHtml(sc, imgDataUri) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1080px;
    height: 1920px;
    background: radial-gradient(circle at 50% 20%, #1e293b 0%, #090d16 60%, #020617 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 48px;
  }
  .glow-1 {
    position: absolute;
    top: 5%;
    left: 10%;
    width: 400px;
    height: 400px;
    background: rgba(245, 158, 11, 0.15);
    filter: blur(120px);
    border-radius: 50%;
    pointer-events: none;
  }
  .glow-2 {
    position: absolute;
    bottom: 10%;
    right: 10%;
    width: 450px;
    height: 450px;
    background: rgba(56, 189, 248, 0.15);
    filter: blur(140px);
    border-radius: 50%;
    pointer-events: none;
  }
  .header {
    text-align: center;
    position: relative;
    z-index: 10;
  }
  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(245, 158, 11, 0.18);
    border: 1px solid rgba(245, 158, 11, 0.5);
    color: #fbbf24;
    padding: 10px 24px;
    border-radius: 9999px;
    font-size: 24px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.25);
    margin-bottom: 20px;
  }
  .scene-title {
    font-size: 52px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -1px;
    background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,0.5);
  }
  .device-container {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    margin: 30px 0;
  }
  .phone-frame {
    width: 680px;
    height: 1140px;
    background: #0f172a;
    border-radius: 56px;
    padding: 14px;
    border: 4px solid #334155;
    box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1);
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .island {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: 140px;
    height: 28px;
    background: #000;
    border-radius: 20px;
    z-index: 20;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  }
  .screen-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    border-radius: 44px;
  }
  .footer {
    position: relative;
    z-index: 10;
    text-align: center;
  }
  .subtitle-card {
    background: rgba(15, 23, 42, 0.85);
    backdrop-filter: blur(20px);
    border: 1.5px solid rgba(56, 189, 248, 0.35);
    border-radius: 28px;
    padding: 24px 32px;
    margin-bottom: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  }
  .subtitle-text {
    font-size: 30px;
    font-weight: 700;
    color: #e0f2fe;
    line-height: 1.35;
  }
  .price-banner {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    background: linear-gradient(90deg, #15803d, #16a34a, #22c55e);
    color: #ffffff;
    padding: 18px 36px;
    border-radius: 9999px;
    font-size: 26px;
    font-weight: 900;
    letter-spacing: 0.5px;
    box-shadow: 0 8px 30px rgba(34, 197, 94, 0.4);
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="header">
    <div class="brand-badge">⚡ DINEQR · OMNICHANNEL OS</div>
    <div class="scene-title">${sc.title}</div>
  </div>
  <div class="device-container">
    <div class="phone-frame">
      <div class="island"></div>
      <img class="screen-img" src="${imgDataUri}" />
    </div>
  </div>
  <div class="footer">
    <div class="subtitle-card">
      <div class="subtitle-text">${sc.subtitle}</div>
    </div>
    <div class="price-banner">
      <span>💰 FLAT ₹1,500/MO · ZERO CLOUD BILLS · 0% COMMISSION</span>
    </div>
  </div>
</body>
</html>`;
}

function getLandscapeHtml(sc, imgDataUri) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1920px;
    height: 1080px;
    background: radial-gradient(circle at 50% 10%, #1e293b 0%, #090d16 60%, #020617 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #fff;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 32px 50px;
  }
  .glow-1 {
    position: absolute;
    top: 0;
    left: 20%;
    width: 600px;
    height: 300px;
    background: rgba(245, 158, 11, 0.12);
    filter: blur(120px);
    border-radius: 50%;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 20px;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-box {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f59e0b, #d97706);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 24px;
    color: #020617;
  }
  .brand-name {
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.5px;
    color: #fff;
  }
  .brand-tag {
    font-size: 14px;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .scene-badge {
    background: rgba(245, 158, 11, 0.15);
    border: 1px solid rgba(245, 158, 11, 0.4);
    color: #fbbf24;
    padding: 8px 20px;
    border-radius: 9999px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 1px;
  }
  .window-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
    position: relative;
    z-index: 10;
  }
  .browser-window {
    width: 1600px;
    height: 760px;
    background: #0f172a;
    border-radius: 18px;
    border: 2px solid #334155;
    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .browser-bar {
    height: 44px;
    background: #1e293b;
    border-bottom: 1px solid #334155;
    display: flex;
    align-items: center;
    padding: 0 16px;
    gap: 12px;
  }
  .dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #ef4444; }
  .dot-yellow { background: #f59e0b; }
  .dot-green { background: #22c55e; }
  .url-bar {
    flex: 1;
    max-width: 600px;
    background: #0f172a;
    border-radius: 8px;
    padding: 4px 14px;
    font-size: 13px;
    color: #94a3b8;
    font-family: monospace;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .screen-viewport {
    flex: 1;
    overflow: hidden;
    position: relative;
  }
  .screen-viewport img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
  }
  .bottom-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    background: rgba(15, 23, 42, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 14px 28px;
  }
  .subtitle-text {
    font-size: 22px;
    font-weight: 700;
    color: #e2e8f0;
  }
  .price-cta {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #16a34a;
    color: #fff;
    padding: 10px 24px;
    border-radius: 9999px;
    font-size: 18px;
    font-weight: 800;
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="top-bar">
    <div class="brand-group">
      <div class="logo-box">🍽️</div>
      <div>
        <div class="brand-name">DineQR Omnichannel POS</div>
        <div class="brand-tag">Restaurant · Cafe · Cloud Kitchen · Gym & Clinic</div>
      </div>
    </div>
    <div class="scene-badge">⚡ ${sc.title}</div>
  </div>
  <div class="window-wrap">
    <div class="browser-window">
      <div class="browser-bar">
        <div class="dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="url-bar">🔒 https://dineqr-omnichannel.netlify.app</div>
      </div>
      <div class="screen-viewport">
        <img src="${imgDataUri}" />
      </div>
    </div>
  </div>
  <div class="bottom-bar">
    <div class="subtitle-text">${sc.subtitle}</div>
    <div class="price-cta">
      <span>FLAT ₹1,500/MO · ZERO CLOUD BILLS · 100% OFFLINE</span>
    </div>
  </div>
</body>
</html>`;
}

async function generatePromoVideos() {
  console.log('====================================================');
  console.log('🎬 DineQR Social Media Video Producer');
  console.log('📱 Platforms: Instagram Reels, YouTube Shorts, & YouTube 16:9');
  console.log('====================================================\n');

  console.log('📸 Step 1/4: Preparing Screenshots and Audio Tracks...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Inject staff/admin session credentials
  await page.evaluateOnNewDocument(() => {
    sessionStorage.setItem('dineqr_super_auth', 'true');
    sessionStorage.setItem('dineqr_staff_auth_default', 'true');
    sessionStorage.setItem('dineqr_staff_auth_losteria', 'true');
    sessionStorage.setItem('dineqr_staff_auth_rest_losteria', 'true');
    localStorage.setItem('dineqr_super_auth', 'true');
  });

  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    console.log(`  › Processing Scene ${i + 1}/${SCENES.length}: ${sc.id}...`);

    const vertImg = path.join(WORK_DIR, `${sc.id}_vert.png`);
    const landImg = path.join(WORK_DIR, `${sc.id}_land.png`);

    // Check if raw screenshots already exist, capture if missing
    if (!fs.existsSync(vertImg)) {
      await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 2 });
      await page.goto(sc.url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: vertImg, fullPage: false });
    }

    if (!fs.existsSync(landImg)) {
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
      await page.goto(sc.url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 1200));
      await page.screenshot({ path: landImg, fullPage: false });
    }

    // Step 2: Speech Audio
    const aiffPath = path.join(WORK_DIR, `${sc.id}_voice.aiff`);
    const wavPath = path.join(WORK_DIR, `${sc.id}_voice.wav`);

    if (!fs.existsSync(wavPath)) {
      execSync(`say -v Rishi -o "${aiffPath}" "${sc.speech.replace(/"/g, '\\"')}"`);
      execSync(`/opt/homebrew/bin/ffmpeg -y -i "${aiffPath}" -ar 44100 -ac 2 "${wavPath}" 2>/dev/null`);
    }

    // Probe duration of audio
    const durationStr = execSync(
      `/opt/homebrew/bin/ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${wavPath}"`
    )
      .toString()
      .trim();
    const duration = parseFloat(durationStr) + 0.4;

    sc.duration = duration;
    sc.vertImg = vertImg;
    sc.landImg = landImg;
    sc.wavPath = wavPath;
  }

  // Step 2: Render Composite Images using Puppeteer
  console.log('\n🎨 Step 2/4: Compositing High-DPI Video Frames (1080x1920 & 1920x1080)...');

  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    console.log(`  › Compositing scene ${i + 1}/${SCENES.length}: ${sc.id}...`);

    // 1. Vertical Composite (1080x1920)
    const vertBase64 = fs.readFileSync(sc.vertImg).toString('base64');
    const vertDataUri = `data:image/png;base64,${vertBase64}`;
    const vertHtml = getVerticalHtml(sc, vertDataUri);

    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });
    await page.setContent(vertHtml, { waitUntil: 'load' });
    const compositeVertImg = path.join(WORK_DIR, `composite_vert_${sc.id}.png`);
    await page.screenshot({ path: compositeVertImg, fullPage: false });
    sc.compositeVertImg = compositeVertImg;

    // 2. Landscape Composite (1920x1080)
    const landBase64 = fs.readFileSync(sc.landImg).toString('base64');
    const landDataUri = `data:image/png;base64,${landBase64}`;
    const landHtml = getLandscapeHtml(sc, landDataUri);

    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.setContent(landHtml, { waitUntil: 'load' });
    const compositeLandImg = path.join(WORK_DIR, `composite_land_${sc.id}.png`);
    await page.screenshot({ path: compositeLandImg, fullPage: false });
    sc.compositeLandImg = compositeLandImg;
  }

  await browser.close();

  // Step 3: Render Individual Video Segments with FFmpeg
  console.log('\n🎞️ Step 3/4: Encoding H.264 Video Clips with Synced Audio...');

  const vertClips = [];
  const landClips = [];

  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    console.log(`  › Encoding scene clip ${i + 1}/${SCENES.length} (${sc.duration.toFixed(1)}s)...`);

    const vertClip = path.join(WORK_DIR, `clip_vert_${sc.id}.mp4`);
    const landClip = path.join(WORK_DIR, `clip_land_${sc.id}.mp4`);

    // Vertical 1080x1920 clip
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -loop 1 -t ${sc.duration} -i "${sc.compositeVertImg}" -i "${sc.wavPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${vertClip}" 2>/dev/null`
    );
    vertClips.push(vertClip);

    // Landscape 1920x1080 clip
    execSync(
      `/opt/homebrew/bin/ffmpeg -y -loop 1 -t ${sc.duration} -i "${sc.compositeLandImg}" -i "${sc.wavPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${landClip}" 2>/dev/null`
    );
    landClips.push(landClip);
  }

  // Step 4: Concatenate Scene Clips into Final Master Videos
  console.log('\n🎛️ Step 4/4: Assembling Master Videos & Final Optimization...');

  // Vertical Concat List
  const vertListPath = path.join(WORK_DIR, 'vert_list.txt');
  fs.writeFileSync(vertListPath, vertClips.map((c) => `file '${c}'`).join('\n'));

  const finalVertVideo = path.join(OUTPUT_DIR, 'dineqr_promo_vertical_shorts.mp4');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${vertListPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k "${finalVertVideo}" 2>/dev/null`
  );

  // Landscape Concat List
  const landListPath = path.join(WORK_DIR, 'land_list.txt');
  fs.writeFileSync(landListPath, landClips.map((c) => `file '${c}'`).join('\n'));

  const finalLandVideo = path.join(OUTPUT_DIR, 'dineqr_promo_landscape_youtube.mp4');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${landListPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k "${finalLandVideo}" 2>/dev/null`
  );

  console.log('\n====================================================');
  console.log('🎉 MASTER VIDEO GENERATION COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(`📱 Vertical (Instagram Reels & YouTube Shorts):`);
  console.log(`   Location: ${finalVertVideo}`);
  console.log(`   Dimensions: 1080x1920 (9:16)`);
  console.log(`🖥️ Landscape (YouTube Showcase & Website Hero):`);
  console.log(`   Location: ${finalLandVideo}`);
  console.log(`   Dimensions: 1920x1080 (16:9)`);
  console.log('====================================================\n');
}

generatePromoVideos().catch((err) => {
  console.error('Fatal Video Generation Error:', err);
  process.exit(1);
});
