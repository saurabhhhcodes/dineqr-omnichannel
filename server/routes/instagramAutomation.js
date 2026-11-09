// server/routes/instagramAutomation.js - AutoGram AI: Autonomous Instagram Growth & Video Engine (YC Pitch Grade)
import express from 'express';

const router = express.Router();

// Mock store for automation state
let automationState = {
  account: {
    handle: '@autogram.ai',
    name: 'AutoGram AI Studio',
    followers: 14850,
    following: 112,
    posts_count: 84,
    engagement_rate: '6.4%',
    verified: true,
    niche: 'AI SaaS & Growth Automation',
  },
  autopilot_enabled: true,
  daily_posts_target: 2,
  comment_to_dm_enabled: true,
  trigger_keywords: ['DEMO', 'SCALE', 'POS', 'VIRAL', 'AGENT'],
  stats: {
    dms_sent_today: 142,
    leads_captured: 68,
    comments_replied: 219,
    hours_saved_weekly: 18.5,
  },
  recent_leads: [
    {
      id: 'lead_1',
      username: '@urban_cafe_delhi',
      comment: 'DEMO please! Need this for my 2 outlets',
      triggered_keyword: 'DEMO',
      dm_sent_at: '2 mins ago',
      status: 'CONVERTED',
      phone: '+91 98111 22334',
    },
    {
      id: 'lead_2',
      username: '@fitness_first_mumbai',
      comment: 'SCALE - do you integrate with gyms?',
      triggered_keyword: 'SCALE',
      dm_sent_at: '14 mins ago',
      status: 'LINK_OPENED',
      phone: '+91 98222 33445',
    },
    {
      id: 'lead_3',
      username: '@artisan_brew_bangalore',
      comment: 'VIRAL - how does the automated video generator work?',
      triggered_keyword: 'VIRAL',
      dm_sent_at: '45 mins ago',
      status: 'QUALIFIED',
      phone: '+91 98333 44556',
    },
  ],
  scheduled_posts: [
    {
      id: 'sched_1',
      title: 'Stop Spending ₹50,000 on Video Editors',
      type: 'REEL_VIDEO',
      hook: 'POV: You fired your $5,000/mo agency and let AI run your Instagram',
      scheduled_time: 'Today, 7:45 PM',
      viral_score: 94,
      hashtags: ['#AIAutomation', '#ContentCreator', '#SaaS', '#GrowthHacking', '#BuildInPublic'],
      status: 'READY_TO_DISPATCH',
    },
    {
      id: 'sched_2',
      title: 'How 1 Keyword Generated ₹1,40,000 in DMs',
      type: 'CAROUSEL',
      hook: 'Steal our exact Comment-to-DM Instagram automation funnel',
      scheduled_time: 'Tomorrow, 1:15 PM',
      viral_score: 89,
      hashtags: ['#InstagramMarketing', '#LeadGeneration', '#AgencyLife', '#IndieHacker'],
      status: 'SCHEDULED',
    },
    {
      id: 'sched_3',
      title: 'Autonomous AI Content Pipeline Walkthrough',
      type: 'REEL_VIDEO',
      hook: 'From idea to viral 9:16 reel in 30 seconds with kinetic subtitles',
      scheduled_time: 'Wednesday, 8:00 PM',
      viral_score: 96,
      hashtags: ['#YCombinator', '#AIAgents', '#AutonomousAgents', '#InstagramGrowth'],
      status: 'SCHEDULED',
    },
  ],
};

// GET /api/autogram/status
router.get('/status', (req, res) => {
  res.json({
    success: true,
    ...automationState,
  });
});

// POST /api/autogram/toggle-autopilot
router.post('/toggle-autopilot', (req, res) => {
  automationState.autopilot_enabled = !automationState.autopilot_enabled;
  res.json({
    success: true,
    autopilot_enabled: automationState.autopilot_enabled,
    message: automationState.autopilot_enabled
      ? 'Autonomous Auto-Pilot is now LIVE! AI will queue, render, and dispatch content 24/7.'
      : 'Auto-Pilot paused. Manual approval required for next posts.',
  });
});

// POST /api/autogram/generate-script
router.post('/generate-script', (req, res) => {
  const { topic = 'SaaS product demo', audience = 'Entrepreneurs and creators' } = req.body;

  const generated = {
    hook: `Stop doing this on Instagram if you want to scale past 10,000 followers in 2026! 🛑`,
    body: `Instead of spending 4 hours editing in Premiere Pro, our autonomous AI agent drafts the script, animates Hormozi-style kinetic captions, and syncs trending audio in 30 seconds flat.`,
    cta: `Comment 'AGENT' below and our bot will DM you the private beta link instantly! 🚀`,
    viral_score: Math.floor(88 + Math.random() * 11), // 88 - 98
    suggested_audio: 'Phonk Tech Beat · Trending in Top 50',
    estimated_reach: '15,000 - 45,000 views',
    hashtags: ['#AIReels', '#AutomationAgent', '#ContentAutomation', '#BuildInPublic', '#TechHacks'],
  };

  res.json({
    success: true,
    script: generated,
  });
});

// POST /api/autogram/simulate-comment
router.post('/simulate-comment', (req, res) => {
  const { username = '@tech_founder_99', comment = 'DEMO' } = req.body;
  const upper = (comment || '').toUpperCase();

  const matchedKeyword =
    automationState.trigger_keywords.find((k) => upper.includes(k)) || 'DEMO';

  const publicReply = `Hey ${username}! 🚀 Just sent you a private DM with direct access and your VIP invite code. Check your requests!`;
  const privateDm = `Hey there! 👋 Thanks for commenting "${comment}". Here is your exclusive 1-click access to AutoGram AI: https://dineqr-omnichannel.netlify.app/instagram-automation?ref=${matchedKeyword.toLowerCase()} \n\nUse code YC2026 for 50% off lifetime access. Let me know if you have any questions!`;

  // Log in recent leads
  const newLead = {
    id: 'lead_' + Date.now().toString(36),
    username: username.startsWith('@') ? username : `@${username}`,
    comment,
    triggered_keyword: matchedKeyword,
    dm_sent_at: 'Just now',
    status: 'ACTIVE_CONVERSATION',
    phone: '+91 99' + Math.floor(10000000 + Math.random() * 90000000),
  };

  automationState.recent_leads.unshift(newLead);
  automationState.stats.dms_sent_today += 1;
  automationState.stats.leads_captured += 1;
  automationState.stats.comments_replied += 1;

  res.json({
    success: true,
    matched_keyword: matchedKeyword,
    public_reply: publicReply,
    private_dm: privateDm,
    lead: newLead,
  });
});

export default router;
