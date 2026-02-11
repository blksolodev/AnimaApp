/**
 * Anima Backend Server
 * Node.js middleware connecting React Native app to AI recommendation engine
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5000';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ============================================
// AI RECOMMENDATION ROUTES
// ============================================

/**
 * Aura Search - Mood-based anime recommendations
 * POST /api/recommend/aura
 * Body: { query: string, limit?: number, minScore?: number }
 */
app.post('/api/recommend/aura', async (req, res) => {
  try {
    const { query, limit = 10, minScore = 0 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/recommend/mood`, {
      query,
      limit,
      min_score: minScore
    });

    res.json(response.data);
  } catch (error) {
    console.error('Aura search error:', error.message);
    res.status(500).json({
      error: 'Failed to get recommendations',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Similar Anime recommendations
 * GET /api/recommend/similar/:animeId
 */
app.get('/api/recommend/similar/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const response = await axios.get(
      `${AI_SERVICE_URL}/recommend/similar/${animeId}?limit=${limit}`
    );

    res.json(response.data);
  } catch (error) {
    console.error('Similar anime error:', error.message);
    res.status(500).json({
      error: 'Failed to get similar anime',
      details: error.response?.data || error.message
    });
  }
});

/**
 * Party Matching - Find users with similar watchlists
 * POST /api/party/match
 * Body: { watchlist: number[], minOverlap?: number }
 */
app.post('/api/party/match', async (req, res) => {
  try {
    const { watchlist, minOverlap = 0.3 } = req.body;

    if (!watchlist || !Array.isArray(watchlist)) {
      return res.status(400).json({ error: 'Watchlist array is required' });
    }

    // In production, fetch other users' watchlists from Firebase
    // For now, return mock data
    const mockOtherUsers = [
      { user_id: 'user1', watchlist: [1, 2, 3, 4, 5] },
      { user_id: 'user2', watchlist: [2, 3, 6, 7, 8] },
      { user_id: 'user3', watchlist: [1, 3, 5, 7, 9] },
    ];

    const response = await axios.post(`${AI_SERVICE_URL}/party/match`, {
      watchlist,
      other_users: mockOtherUsers,
      min_overlap: minOverlap
    });

    res.json(response.data);
  } catch (error) {
    console.error('Party match error:', error.message);
    res.status(500).json({
      error: 'Failed to find party matches',
      details: error.response?.data || error.message
    });
  }
});

// ============================================
// STREAMING PORTAL ROUTES
// ============================================

/**
 * Get streaming availability for an anime
 * GET /api/streaming/:animeId
 */
app.get('/api/streaming/:animeId', async (req, res) => {
  try {
    const { animeId } = req.params;

    // In production, integrate with streaming service APIs
    // For now, return mock availability data
    const streamingData = {
      animeId: parseInt(animeId),
      availability: [
        {
          service: 'crunchyroll',
          available: true,
          url: `https://www.crunchyroll.com/watch/${animeId}`,
          region: 'US'
        },
        {
          service: 'netflix',
          available: Math.random() > 0.5,
          url: `https://www.netflix.com/title/${animeId}`,
          region: 'US'
        },
        {
          service: 'funimation',
          available: Math.random() > 0.5,
          url: `https://www.funimation.com/shows/${animeId}`,
          region: 'US'
        },
        {
          service: 'hulu',
          available: Math.random() > 0.7,
          url: `https://www.hulu.com/series/${animeId}`,
          region: 'US'
        },
        {
          service: 'prime',
          available: Math.random() > 0.6,
          url: `https://www.amazon.com/gp/video/detail/${animeId}`,
          region: 'US'
        },
        {
          service: 'hidive',
          available: Math.random() > 0.7,
          url: `https://www.hidive.com/stream/${animeId}`,
          region: 'US'
        },
      ]
    };

    res.json(streamingData);
  } catch (error) {
    console.error('Streaming lookup error:', error.message);
    res.status(500).json({ error: 'Failed to get streaming availability' });
  }
});

// ============================================
// BOSS RUSH / SEASONAL RANKINGS
// ============================================

/**
 * Get current season's Boss Rush rankings
 * GET /api/bossrush/rankings
 */
app.get('/api/bossrush/rankings', async (req, res) => {
  try {
    const { season, year } = req.query;

    // Mock rankings data
    const rankings = {
      season: season || 'WINTER',
      year: parseInt(year) || new Date().getFullYear(),
      rankings: [
        { rank: 1, animeId: 1, title: 'Top Anime', predictedScore: 95, actualScore: 92 },
        { rank: 2, animeId: 2, title: 'Second Place', predictedScore: 88, actualScore: 90 },
        { rank: 3, animeId: 3, title: 'Third Place', predictedScore: 85, actualScore: 84 },
      ],
      userParticipants: 1250,
      prizesAwarded: 45
    };

    res.json(rankings);
  } catch (error) {
    console.error('Boss rush rankings error:', error.message);
    res.status(500).json({ error: 'Failed to get rankings' });
  }
});

/**
 * Submit Boss Rush predictions
 * POST /api/bossrush/predict
 */
app.post('/api/bossrush/predict', async (req, res) => {
  try {
    const { userId, predictions } = req.body;

    if (!userId || !predictions) {
      return res.status(400).json({ error: 'userId and predictions are required' });
    }

    // In production, save to Firebase
    const submission = {
      userId,
      predictions,
      submittedAt: new Date().toISOString(),
      status: 'confirmed'
    };

    res.json({ success: true, submission });
  } catch (error) {
    console.error('Boss rush prediction error:', error.message);
    res.status(500).json({ error: 'Failed to submit predictions' });
  }
});

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Generate smart notification for episode airing
 * POST /api/notifications/episode
 */
app.post('/api/notifications/episode', async (req, res) => {
  try {
    const { animeId, episode, watchingCount } = req.body;

    // Generate RPG-style notification message
    const messages = [
      `Quest Update: Episode ${episode} just appeared! ${watchingCount} party members are watching. Join the guild?`,
      `New Quest Available! Episode ${episode} has spawned. ${watchingCount} adventurers online!`,
      `Alert: Episode ${episode} is now airing! ${watchingCount} heroes are in the guild chat.`,
    ];

    const notification = {
      type: 'new_episode',
      message: messages[Math.floor(Math.random() * messages.length)],
      animeId,
      episode,
      watchingCount,
      createdAt: new Date().toISOString()
    };

    res.json(notification);
  } catch (error) {
    console.error('Notification generation error:', error.message);
    res.status(500).json({ error: 'Failed to generate notification' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║           ANIMA BACKEND SERVER               ║
║                                              ║
║   Port: ${PORT}                                 ║
║   AI Service: ${AI_SERVICE_URL}      ║
║                                              ║
║   Ready to accept quests!                    ║
╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
