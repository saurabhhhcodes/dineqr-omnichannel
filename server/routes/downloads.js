// server/routes/downloads.js - Multi-Platform Package Distribution & Local Engine Installer API
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadsDir = path.resolve(__dirname, '../../public/downloads');

const router = express.Router();

const MIME_TYPES = {
  '.exe': 'application/vnd.microsoft.portable-executable',
  '.apk': 'application/vnd.android.package-archive',
  '.dmg': 'application/x-apple-diskimage',
  '.deb': 'application/vnd.debian.binary-package',
  '.json': 'application/json',
};

// GET /api/downloads - List all available platform releases
router.get('/', (req, res) => {
  try {
    const metaFile = path.join(downloadsDir, 'downloads.json');
    if (fs.existsSync(metaFile)) {
      const data = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
      return res.json(data);
    }

    res.json({
      success: true,
      releases: [],
      message: 'Downloads catalog initializing...',
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/downloads/:filename - Stream or download binary package
router.get('/:filename', (req, res) => {
  try {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(downloadsDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: `File ${filename} not found on server` });
    }

    const ext = path.extname(filename).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', fs.statSync(filePath).size);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
