// scripts/generate_autogram_yc_video.cjs
// Ultra-High Quality Video Producer for AutoGram AI (YC Pitch & Viral Instagram Reels)
// Uses Puppeteer High-DPI Composition + Native macOS Speech (Rishi en_IN) + FFmpeg H.264 / AAC Encoding

const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:3005';
const WORK_DIR = path.resolve(__dirname, '../.autogram_video_build');
const OUTPUT_DIR = path.resolve(__dirname, '../public/videos');

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const SCENES = [
  {
    id: '01_yc_hook',
    badge: 'STOP WASTING 20 HOURS/WEEK',
    title: 'THE $5,000/MO AGENCY KILLER',
    subtitle: 'Still manually editing reels & typing DMs? Meet AutoGram AI! 🛑',
    url: `${BASE_URL}/instagram-automation`,
    speech: 'Are you still spending 20 hours a week editing videos, writing captions, and manually replying to Instagram DMs? Stop wasting time and money on expensive agencies!',
  },
  {
    id: '02_agent_brain',
    badge: 'AUTONOMOUS SOCIAL MEDIA DIRECTOR',
    title: 'AI RUNS YOUR INSTAGRAM 24/7',
    subtitle: 'From viral topic ideation to automatic 9:16 reel dispatch ⚡',
    url: `${BASE_URL}/instagram-automation`,
    speech: 'Meet AutoGram AI! An autonomous AI employee that runs your Instagram growth, content creation, and sales funnels on complete autopilot.',
  },
  {
    id: '03_kinetic_video',
    badge: 'KINETIC SUBTITLE ENGINE',
    title: 'HORMOZI-STYLE VIRAL REELS',
    subtitle: 'Dynamic word-by-word highlighted captions & trending audio 🎬',
    url: `${BASE_URL}/instagram-automation`,
    speech: 'Just enter your product topic or URL. The AI writes high-retention hooks, syncs trending audio, and renders studio-quality reels with animated kinetic subtitles.',
  },
  {
    id: '04_comment_to_dm',
    badge: 'COMMENT-TO-DM SALES BOT',
    title: 'CONVERT COMMENTS INTO LEADS',
    subtitle: 'Viewer comments DEMO → Bot replies & fires instant private DM in 1.2s 💬',
    url: `${BASE_URL}/instagram-automation`,
    speech: 'When a viewer comments DEMO, SCALE, or PRICE, our AI bot replies in public and shoots an instant private DM with a personalized link in just two seconds!',
  },
  {
    id: '05_calendar_autopilot',
    badge: '30-DAY AUTO-PUBLISH QUEUE',
    title: 'PEAK ENGAGEMENT DISPATCH',
    subtitle: 'Automated 30-day content pipeline with live viral scoring 📈',
    url: `${BASE_URL}/instagram-automation`,
    speech: 'AutoGram AI schedules thirty days of viral reels and carousels, automatically posting at peak engagement windows with zero human intervention.',
  },
  {
    id: '06_yc_vision',
    badge: 'Y COMBINATOR S26 SHOWCASE',
    title: 'THE $250B CREATOR REVOLUTION',
    subtitle: 'Experience the live interactive demo at autogram.ai today! 🚀',
    url: `${BASE_URL}/instagram-automation`,
    speech: 'This is the future of the two hundred and fifty billion dollar creator economy. Experience the live interactive AutoGram AI demo today!',
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
    background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #0f0d24 50%, #03020c 100%);
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
    width: 450px;
    height: 450px;
    background: rgba(244, 63, 94, 0.22);
    filter: blur(140px);
    border-radius: 50%;
  }
  .glow-2 {
    position: absolute;
    bottom: 10%;
    right: 10%;
    width: 480px;
    height: 480px;
    background: rgba(245, 158, 11, 0.22);
    filter: blur(140px);
    border-radius: 50%;
  }
  .header {
    text-align: center;
    position: relative;
    z-index: 10;
  }
  .brand-badge {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.25), rgba(245, 158, 11, 0.25));
    border: 1.5px solid rgba(244, 63, 94, 0.6);
    color: #fca5a5;
    padding: 10px 28px;
    border-radius: 9999px;
    font-size: 24px;
    font-weight: 900;
    letter-spacing: 2px;
    text-transform: uppercase;
    box-shadow: 0 4px 25px rgba(244, 63, 94, 0.35);
    margin-bottom: 20px;
  }
  .scene-title {
    font-size: 54px;
    font-weight: 950;
    line-height: 1.15;
    letter-spacing: -1.5px;
    background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 10px 30px rgba(0,0,0,0.6);
  }
  .device-container {
    position: relative;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    margin: 25px 0;
  }
  .phone-frame {
    width: 700px;
    height: 1160px;
    background: #09090b;
    border-radius: 58px;
    padding: 14px;
    border: 4px solid #3f3f46;
    box-shadow: 0 40px 80px -15px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.12);
    position: relative;
    display: flex;
    flex-direction: column;
  }
  .island {
    position: absolute;
    top: 24px;
    left: 50%;
    transform: translateX(-50%);
    width: 150px;
    height: 30px;
    background: #000;
    border-radius: 20px;
    z-index: 20;
    box-shadow: 0 2px 10px rgba(0,0,0,0.7);
  }
  .screen-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top center;
    border-radius: 46px;
  }
  .footer {
    position: relative;
    z-index: 10;
    text-align: center;
  }
  .subtitle-card {
    background: rgba(18, 16, 38, 0.88);
    backdrop-filter: blur(24px);
    border: 1.5px solid rgba(244, 63, 94, 0.4);
    border-radius: 28px;
    padding: 24px 32px;
    margin-bottom: 20px;
    box-shadow: 0 20px 45px rgba(0,0,0,0.7);
  }
  .subtitle-text {
    font-size: 30px;
    font-weight: 800;
    color: #fef08a;
    line-height: 1.35;
  }
  .price-banner {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
    background: linear-gradient(90deg, #e11d48, #f59e0b);
    color: #ffffff;
    padding: 18px 36px;
    border-radius: 9999px;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: 0.5px;
    box-shadow: 0 10px 35px rgba(225, 29, 72, 0.45);
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>
  <div class="header">
    <div class="brand-badge">⚡ ${sc.badge}</div>
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
      <span>🚀 AUTOGRAM AI · YC SUMMER 2026 EDITION · TRY DEMO</span>
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
    background: radial-gradient(circle at 50% 10%, #1e1b4b 0%, #0f0d24 55%, #03020c 100%);
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
    left: 25%;
    width: 700px;
    height: 350px;
    background: rgba(244, 63, 94, 0.16);
    filter: blur(140px);
    border-radius: 50%;
  }
  .top-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 10;
    border-bottom: 1px solid rgba(255,255,255,0.12);
    padding-bottom: 20px;
  }
  .brand-group {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo-box {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: linear-gradient(135deg, #e11d48, #f59e0b);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 950;
    font-size: 26px;
    color: #ffffff;
    box-shadow: 0 4px 20px rgba(225, 29, 72, 0.4);
  }
  .brand-name {
    font-size: 28px;
    font-weight: 950;
    letter-spacing: -0.5px;
    color: #fff;
  }
  .brand-tag {
    font-size: 14px;
    color: #cbd5e1;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .scene-badge {
    background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.2));
    border: 1.5px solid rgba(244, 63, 94, 0.5);
    color: #fca5a5;
    padding: 8px 24px;
    border-radius: 9999px;
    font-size: 18px;
    font-weight: 900;
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
    width: 1620px;
    height: 770px;
    background: #09090b;
    border-radius: 20px;
    border: 2px solid #3f3f46;
    box-shadow: 0 35px 70px -15px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .browser-bar {
    height: 46px;
    background: #18181b;
    border-bottom: 1px solid #3f3f46;
    display: flex;
    align-items: center;
    padding: 0 18px;
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
    max-width: 650px;
    background: #09090b;
    border-radius: 8px;
    padding: 5px 16px;
    font-size: 13px;
    color: #a1a1aa;
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
    background: rgba(18, 16, 38, 0.85);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 18px;
    padding: 16px 30px;
  }
  .subtitle-text {
    font-size: 22px;
    font-weight: 800;
    color: #fef08a;
  }
  .price-cta {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(90deg, #e11d48, #f59e0b);
    color: #fff;
    padding: 10px 26px;
    border-radius: 9999px;
    font-size: 18px;
    font-weight: 900;
    box-shadow: 0 4px 20px rgba(225, 29, 72, 0.4);
  }
</style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="top-bar">
    <div class="brand-group">
      <div class="logo-box">AG</div>
      <div>
        <div class="brand-name">AutoGram AI · Y Combinator S26 Pitch</div>
        <div class="brand-tag">Autonomous Instagram Growth & Short-Form Video Producer</div>
      </div>
    </div>
    <div class="scene-badge">⚡ ${sc.badge}</div>
  </div>
  <div class="window-wrap">
    <div class="browser-window">
      <div class="browser-bar">
        <div class="dots">
          <div class="dot dot-red"></div>
          <div class="dot dot-yellow"></div>
          <div class="dot dot-green"></div>
        </div>
        <div class="url-bar">🔒 https://dineqr-omnichannel.netlify.app/instagram-automation</div>
      </div>
      <div class="screen-viewport">
        <img src="${imgDataUri}" />
      </div>
    </div>
  </div>
  <div class="bottom-bar">
    <div class="subtitle-text">${sc.subtitle}</div>
    <div class="price-cta">
      <span>YC S26 APPLICATION · AUTONOMOUS AGENT REVOLUTION</span>
    </div>
  </div>
</body>
</html>`;
}

async function generateAutoGramVideo() {
  console.log('====================================================');
  console.log('🚀 AutoGram AI YC Pitch & Viral Video Producer');
  console.log('📱 Formats: 9:16 Instagram Reels / Shorts & 16:9 Showcase');
  console.log('====================================================\n');

  console.log('📸 Step 1/4: Capturing Studio & Synthesizing Audio...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    console.log(`  › Processing Scene ${i + 1}/${SCENES.length}: ${sc.id}...`);

    const vertImg = path.join(WORK_DIR, `${sc.id}_vert.png`);
    const landImg = path.join(WORK_DIR, `${sc.id}_land.png`);

    // Capture vertical
    await page.setViewport({ width: 720, height: 1280, deviceScaleFactor: 2 });
    await page.goto(sc.url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: vertImg, fullPage: false });

    // Capture landscape
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(sc.url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise((r) => setTimeout(r, 1200));
    await page.screenshot({ path: landImg, fullPage: false });

    // Speech Audio using Rishi
    const aiffPath = path.join(WORK_DIR, `${sc.id}_voice.aiff`);
    const wavPath = path.join(WORK_DIR, `${sc.id}_voice.wav`);

    execSync(`say -v Rishi -o "${aiffPath}" "${sc.speech.replace(/"/g, '\\"')}"`);
    execSync(`/opt/homebrew/bin/ffmpeg -y -i "${aiffPath}" -ar 44100 -ac 2 "${wavPath}" 2>/dev/null`);

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

  // Step 2: Render Composite Images
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
  console.log('\n🎞️ Step 3/4: Encoding H.264 Video Clips with Synced Voiceover...');

  const vertClips = [];
  const landClips = [];

  for (let i = 0; i < SCENES.length; i++) {
    const sc = SCENES[i];
    console.log(`  › Encoding scene clip ${i + 1}/${SCENES.length} (${sc.duration.toFixed(1)}s)...`);

    const vertClip = path.join(WORK_DIR, `clip_vert_${sc.id}.mp4`);
    const landClip = path.join(WORK_DIR, `clip_land_${sc.id}.mp4`);

    execSync(
      `/opt/homebrew/bin/ffmpeg -y -loop 1 -t ${sc.duration} -i "${sc.compositeVertImg}" -i "${sc.wavPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${vertClip}" 2>/dev/null`
    );
    vertClips.push(vertClip);

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

  const finalVertVideo = path.join(OUTPUT_DIR, 'autogram_yc_vertical_reels.mp4');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${vertListPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k "${finalVertVideo}" 2>/dev/null`
  );

  // Landscape Concat List
  const landListPath = path.join(WORK_DIR, 'land_list.txt');
  fs.writeFileSync(landListPath, landClips.map((c) => `file '${c}'`).join('\n'));

  const finalLandVideo = path.join(OUTPUT_DIR, 'autogram_yc_landscape_showcase.mp4');
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -f concat -safe 0 -i "${landListPath}" -c:v libx264 -preset fast -pix_fmt yuv420p -c:a aac -b:a 192k "${finalLandVideo}" 2>/dev/null`
  );

  console.log('\n====================================================');
  console.log('🎉 AUTOGRAM AI YC PITCH VIDEO COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(`📱 Vertical (Instagram Reels & YouTube Shorts):`);
  console.log(`   Location: ${finalVertVideo}`);
  console.log(`   Dimensions: 1080x1920 (9:16)`);
  console.log(`🖥️ Landscape (YC Application Video & YouTube Showcase):`);
  console.log(`   Location: ${finalLandVideo}`);
  console.log(`   Dimensions: 1920x1080 (16:9)`);
  console.log('====================================================\n');
}

generateAutoGramVideo().catch((err) => {
  console.error('Fatal AutoGram Video Generation Error:', err);
  process.exit(1);
});
