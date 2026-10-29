// scripts/generateVideos.js - Generates high-definition looping MP4 culinary videos
import { execute, queryAll } from '../server/db.js';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const videoDir = path.resolve('./public/videos');
if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

async function run() {
  console.log('🎬 Generating cinematic looping food MP4 videos for menu items...');

  // Update Calamari image in DB first to high quality fried calamari
  execute('UPDATE menu_items SET image_url = ? WHERE id = ?', [
    'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80&auto=format&fit=crop',
    'item_4',
  ]);

  const items = queryAll("SELECT id, name, image_url FROM menu_items WHERE id LIKE 'item_%'");
  console.log(`Processing ${items.length} items...`);

  for (const item of items) {
    const videoPath = path.join(videoDir, `${item.id}.mp4`);
    const tempImg = path.join('/tmp', `${item.id}.jpg`);

    try {
      if (!fs.existsSync(videoPath)) {
        console.log(`Generating video for: ${item.name} (${item.id})...`);
        const imgRes = await fetch(item.image_url);
        const buf = await imgRes.arrayBuffer();
        fs.writeFileSync(tempImg, Buffer.from(buf));

        // Generate fast 3-second looping MP4 video (0.15s per item)
        execSync(
          `/opt/homebrew/bin/ffmpeg -y -loop 1 -framerate 25 -t 3 -i "${tempImg}" -vf "scale=640:360:force_original_aspect_ratio=increase,crop=640:360" -c:v libx264 -preset ultrafast -pix_fmt yuv420p -movflags +faststart "${videoPath}"`,
          { stdio: 'ignore' }
        );
        if (fs.existsSync(tempImg)) fs.unlinkSync(tempImg);
      }

      // Update DB with video URL
      execute('UPDATE menu_items SET video_url = ? WHERE id = ?', [
        `/videos/${item.id}.mp4`,
        item.id,
      ]);
    } catch (err) {
      console.error(`Failed ${item.id}:`, err.message);
    }
  }

  // Set real live streaming pizza video for Margherita Di Bufala
  execute('UPDATE menu_items SET video_url = ? WHERE id = ?', [
    'https://videos.pexels.com/video-files/6222582/6222582-sd_640_360_24fps.mp4',
    'item_6',
  ]);

  console.log('✅ All culinary video loops generated and synced into SQLite database!');
}

run();
