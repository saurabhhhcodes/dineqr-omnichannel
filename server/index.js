// server/index.js - Express server entry point
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { initDb } from './db.js';
import { registerSSE } from './sse.js';

import tablesRouter from './routes/tables.js';
import menuRouter from './routes/menu.js';
import ordersRouter from './routes/orders.js';
import paymentRouter from './routes/payment.js';
import invoiceRouter from './routes/invoice.js';
import statsRouter from './routes/stats.js';
import restaurantsRouter from './routes/restaurants.js';
import walletRouter from './routes/wallet.js';
import backupRouter from './routes/backup.js';
import erpRouter from './routes/erp.js';
import downloadsRouter from './routes/downloads.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxies (Cloudflare, Vercel, Nginx) for accurate HTTPS detection
app.set('trust proxy', true);

// Initialize database & tables
initDb();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-Sent Events endpoint for real-time kitchen display updates
app.get('/api/events', registerSSE);

// API Routes
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/tables', tablesRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payment/razorpay', paymentRouter);
app.use('/api/invoice', invoiceRouter);
app.use('/api/stats', statsRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/backup', backupRouter);
app.use('/api/erp', erpRouter);
app.use('/api/downloads', downloadsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'DineQR Restaurant Platform API',
  });
});

// Serve public directory assets (e.g. food videos) and production frontend
const publicPath = path.resolve(__dirname, '../public');
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(publicPath));
app.use(express.static(distPath));

// Fallback to index.html for client-side React routing (Express 5 syntax)
app.get('{*path}', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API endpoint not found' });
  }
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.status(200).sendFile('index.html', { root: distPath });
  } else {
    res.status(200).send(`DineQR Server running on port ${PORT}. In dev mode, visit Vite dev server at http://localhost:5173.`);
  }
});

// Start listening if not running in a serverless environment (e.g. Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 DineQR Platform Server running on http://localhost:${PORT}`);
    console.log(`📡 Real-time Kitchen SSE ready at http://localhost:${PORT}/api/events`);
  });
}

export default app;
