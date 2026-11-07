// server/routes/tts.js - Human-Like OpenAI Text-to-Speech Engine
import express from 'express';

const router = express.Router();

// In-memory audio buffer cache to save API costs & latency
const audioCache = new Map();

// POST /api/tts/speak - Generate ultra human-like voice using OpenAI TTS
router.post('/speak', async (req, res) => {
  try {
    const { text, voice = 'nova', model = 'tts-1', speed = 1.0 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ success: false, error: 'Text prompt is required' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        success: false,
        fallback: true,
        message: 'OPENAI_API_KEY not configured in .env. Falling back to high-grade neural browser voices.',
      });
    }

    // Cache key based on voice and text
    const cacheKey = `${voice}_${speed}_${text.trim()}`;
    if (audioCache.has(cacheKey)) {
      const cachedBuffer = audioCache.get(cacheKey);
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('X-TTS-Source', 'Cache');
      return res.send(cachedBuffer);
    }

    // Call OpenAI TTS API
    const openAiRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'tts-1',
        input: text,
        voice: voice || 'nova', // alloy, echo, fable, onyx, nova, shimmer
        speed: speed || 1.0,
        response_format: 'mp3',
      }),
    });

    if (!openAiRes.ok) {
      const errJson = await openAiRes.json().catch(() => ({}));
      console.warn('[OpenAI TTS] API response error:', errJson);
      return res.status(200).json({
        success: false,
        fallback: true,
        error: errJson.error?.message || 'OpenAI TTS request failed. Falling back to browser speech.',
      });
    }

    const arrayBuffer = await openAiRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Cache up to 100 recent clips
    if (audioCache.size > 100) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, buffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('X-TTS-Source', 'OpenAI-TTS-1');
    res.send(buffer);
  } catch (err) {
    console.error('[OpenAI TTS Route Error]:', err);
    res.status(200).json({
      success: false,
      fallback: true,
      error: err.message,
    });
  }
});

// GET /api/tts/status - Check if OpenAI TTS is enabled
router.get('/status', (req, res) => {
  const hasKey = !!process.env.OPENAI_API_KEY;
  res.json({
    success: true,
    openai_tts_active: hasKey,
    model: 'tts-1',
    recommended_voices: ['nova', 'alloy', 'shimmer', 'onyx'],
  });
});

export default router;
