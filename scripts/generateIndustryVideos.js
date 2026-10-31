// scripts/generateIndustryVideos.js - Generate distinct authentic video loops for Clinic, Gym & Event items
import { execute, queryAll } from '../server/db.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const publicVideos = path.resolve('./public/videos');
const distVideos = path.resolve('./dist/videos');
if (!fs.existsSync(publicVideos)) fs.mkdirSync(publicVideos, { recursive: true });
if (!fs.existsSync(distVideos)) fs.mkdirSync(distVideos, { recursive: true });

async function generate() {
  console.log('🎥 Generating dedicated video loops for Clinics, Gyms, and Events...');

  const targetIds = [
    'item_c1', 'item_c2', 'item_c3', 'item_c4',
    'item_g1', 'item_g2', 'item_g3', 'item_g4',
    'item_e1', 'item_e2', 'item_e3',
    'item_biz_mvtm188hnxq_1'
  ];

  for (const id of targetIds) {
    const item = queryAll('SELECT id, name, image_url FROM menu_items WHERE id = ?', [id])[0];
    if (!item) continue;

    const targetFileName = `${id}.mp4`;
    const publicTarget = path.join(publicVideos, targetFileName);
    const distTarget = path.join(distVideos, targetFileName);
    const tempImg = path.join('/tmp', `${id}.jpg`);

    try {
      console.log(`Downloading image for ${item.name} (${id})...`);
      const res = await fetch(item.image_url);
      const buf = await res.arrayBuffer();
      fs.writeFileSync(tempImg, Buffer.from(buf));

      console.log(`Encoding H.264 loop for ${id}...`);
      execSync(
        `/opt/homebrew/bin/ffmpeg -y -loop 1 -framerate 25 -t 3 -i "${tempImg}" -vf "scale=640:360:force_original_aspect_ratio=increase,crop=640:360" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -movflags +faststart "${publicTarget}"`,
        { stdio: 'ignore' }
      );

      // Copy to dist
      fs.copyFileSync(publicTarget, distTarget);
      if (fs.existsSync(tempImg)) fs.unlinkSync(tempImg);

      // Update DB
      execute('UPDATE menu_items SET video_url = ? WHERE id = ?', [
        `/videos/${targetFileName}`,
        id
      ]);
      console.log(`✅ Ready: /videos/${targetFileName} for ${item.name}`);
    } catch (err) {
      console.error(`Error processing ${id}:`, err.message);
    }
  }

  console.log('🎉 All industry videos generated and synced!');
  process.exit(0);
}

generate();
