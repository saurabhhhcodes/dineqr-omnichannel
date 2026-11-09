// scripts/generate_qrflow_motion_animation.cjs
// Pure Animated Motion Graphics Video Generator (Zero Humans) for QRFlow
// Generates high-framerate 1080p abstract cybernetic QR loops and workflow particle animations

const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const WORK_DIR = path.resolve(__dirname, '../.motion_build');
const OUTPUT_DIR = path.resolve(__dirname, '../public/videos');

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getMotionGraphicHtml() {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1920px;
    height: 1080px;
    background: radial-gradient(circle at 50% 50%, #0c1222 0%, #060913 60%, #020408 100%);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #fff;
    overflow: hidden;
    position: relative;
  }
  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 1920px;
    height: 1080px;
    z-index: 1;
  }
</style>
</head>
<body>
  <canvas id="motionCanvas" width="1920" height="1080"></canvas>
  <script>
    const canvas = document.getElementById('motionCanvas');
    const ctx = canvas.getContext('2d');
    const W = 1920;
    const H = 1080;

    window.renderFrame = function(timeNorm) {
      ctx.clearRect(0, 0, W, H);

      // 1. Cyber Grid Plane in 3D Perspective
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      const gridY = 820;
      for (let x = -400; x <= W + 400; x += 60) {
        ctx.beginPath();
        ctx.moveTo(W / 2, 400);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 450; y <= H; y += Math.pow((y - 400) / 30, 1.6)) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Central Glowing QR Hologram Cube
      const cx = W / 2;
      const cy = H / 2 - 40;
      const qrSize = 340;

      // Outer Glow Pulse
      const glowGrad = ctx.createRadialGradient(cx, cy, 50, cx, cy, 380);
      glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.15)');
      glowGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - 400, cy - 400, 800, 800);

      // Glassmorphic QR Container
      ctx.save();
      ctx.translate(cx, cy);
      const floatOffset = Math.sin(timeNorm * Math.PI * 2) * 12;
      ctx.translate(0, floatOffset);

      // Backdrop rounded plate
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
      ctx.shadowBlur = 30;

      roundRect(ctx, -qrSize / 2 - 25, -qrSize / 2 - 25, qrSize + 50, qrSize + 50, 32);
      ctx.fill();
      ctx.stroke();

      // Render Matrix QR Code Pattern
      const cols = 15;
      const cellSize = qrSize / cols;
      const pattern = [
        [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
        [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,0,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [1,1,0,1,0,1,1,1,0,1,0,1,1,0,1],
        [1,0,1,0,1,0,0,1,1,0,1,0,1,0,1],
        [1,1,1,1,1,1,1,0,1,0,1,1,0,1,1],
        [1,0,0,0,0,0,1,0,0,1,0,1,0,0,1],
        [1,0,1,1,1,0,1,1,1,0,1,0,1,1,0],
        [1,0,0,0,0,0,1,0,1,1,0,1,0,1,1],
        [1,1,1,1,1,1,1,0,1,0,1,1,1,0,1]
      ];

      for (let r = 0; r < cols; r++) {
        for (let c = 0; c < cols; c++) {
          if (pattern[r][c] === 1) {
            const px = -qrSize / 2 + c * cellSize;
            const py = -qrSize / 2 + r * cellSize;
            
            // Corner targets get amber/emerald color
            if ((r < 7 && c < 7) || (r < 7 && c > 7) || (r > 7 && c < 7)) {
              ctx.fillStyle = '#f59e0b';
            } else {
              ctx.fillStyle = '#38bdf8';
            }
            roundRect(ctx, px + 2, py + 2, cellSize - 4, cellSize - 4, 3);
            ctx.fill();
          }
        }
      }

      // Laser Scan Beam moving up and down
      const scanY = -qrSize / 2 + (timeNorm * qrSize * 1.6) % qrSize;
      const beamGrad = ctx.createLinearGradient(0, scanY - 30, 0, scanY + 15);
      beamGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
      beamGrad.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
      beamGrad.addColorStop(1, 'rgba(52, 211, 153, 0.95)');
      ctx.fillStyle = beamGrad;
      ctx.fillRect(-qrSize / 2 - 15, scanY - 30, qrSize + 30, 30);

      ctx.strokeStyle = '#6ee7b7';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#34d399';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(-qrSize / 2 - 20, scanY);
      ctx.lineTo(qrSize / 2 + 20, scanY);
      ctx.stroke();

      ctx.restore();

      // 3. Floating Workflow Telemetry Nodes Orbiting Around QR
      const nodes = [
        { label: '📱 TABLE QR SCAN', sub: 'Instant UPI 0% Fee', angle: 0 + timeNorm * Math.PI * 2, dist: 520, color: '#f59e0b' },
        { label: '👨‍💼 CAPTAIN APP', sub: '2-Sec KOT Punch', angle: (Math.PI / 2) + timeNorm * Math.PI * 2, dist: 460, color: '#38bdf8' },
        { label: '👨‍🍳 KITCHEN KDS', sub: 'Live Timers & Alarms', angle: Math.PI + timeNorm * Math.PI * 2, dist: 520, color: '#ec4899' },
        { label: '📺 TOKEN TV SCREEN', sub: 'Auto Voice Callout', angle: (3 * Math.PI / 2) + timeNorm * Math.PI * 2, dist: 460, color: '#10b981' }
      ];

      nodes.forEach(node => {
        const nx = cx + Math.cos(node.angle) * node.dist;
        const ny = cy + Math.sin(node.angle) * (node.dist * 0.55);

        // Connecting laser curve to center QR
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -timeNorm * 40;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx, ny, nx, ny);
        ctx.stroke();
        ctx.restore();

        // Node Card
        ctx.save();
        ctx.translate(nx, ny);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 20;
        roundRect(ctx, -120, -35, 240, 70, 16);
        ctx.fill();
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, 0, -6);

        ctx.fillStyle = node.color;
        ctx.font = 'bold 12px monospace';
        ctx.fillText(node.sub, 0, 16);
        ctx.restore();
      });

      // 4. Top Branding Title
      ctx.save();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 42px -apple-system, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 20;
      ctx.fillText('QRFLOW · AUTONOMOUS WORKFLOW & POS ENGINE', cx, 90);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 18px monospace';
      ctx.letterSpacing = '2px';
      ctx.fillText('100% OFFLINE SQLITE · ZERO CLOUD FEES · AUTOGRAM AI GROWTH', cx, 130);
      ctx.restore();
    };

    function roundRect(ctx, x, y, w, h, r) {
      if (w < 2 * r) r = w / 2;
      if (h < 2 * r) r = h / 2;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  </script>
</body>
</html>`;
}

async function generateMotionVideos() {
  console.log('====================================================');
  console.log('✨ QRFlow Pure Animation Video Producer (No Humans)');
  console.log('🎬 1080p Seamless Cybernetic Motion Graphics Loop');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  await page.setContent(getMotionGraphicHtml(), { waitUntil: 'load' });

  const totalFrames = 60; // 60 frames = 2.0s seamless loop at 30fps
  console.log(`📸 Rendering ${totalFrames} high-DPI motion graphic frames...`);

  for (let f = 0; f < totalFrames; f++) {
    const timeNorm = f / totalFrames;
    await page.evaluate((t) => window.renderFrame(t), timeNorm);
    const framePath = path.join(WORK_DIR, `frame_${String(f).padStart(4, '0')}.png`);
    await page.screenshot({ path: framePath, fullPage: false });
    if ((f + 1) % 15 === 0) {
      console.log(`  › Rendered frame ${f + 1}/${totalFrames}...`);
    }
  }

  await browser.close();

  // Step 2: Encode to MP4 with FFmpeg
  console.log('\n🎞️ Encoding into seamless looping H.264 MP4 videos...');
  const animVideoPath = path.join(OUTPUT_DIR, 'qrflow_animated_hero_loop.mp4');

  // Input frame sequence, loop for 10 seconds total seamless playback
  execSync(
    `/opt/homebrew/bin/ffmpeg -y -framerate 30 -i "${path.join(WORK_DIR, 'frame_%04d.png')}" -filter_complex "loop=loop=4:size=${totalFrames}:start=0" -c:v libx264 -preset fast -pix_fmt yuv420p "${animVideoPath}" 2>/dev/null`
  );

  console.log('\n====================================================');
  console.log('🎉 PURE ANIMATION VIDEO GENERATED SUCCESSFULLY!');
  console.log('====================================================');
  console.log(`Location: ${animVideoPath}`);
  console.log(`Resolution: 1920x1080 (1080p Full HD)`);
  console.log(`Content: Cybernetic QR laser beam, floating workflow telemetry, 0 humans.`);
  console.log('====================================================\n');
}

generateMotionVideos().catch((err) => {
  console.error('Motion generation error:', err);
  process.exit(1);
});
