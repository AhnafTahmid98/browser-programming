/**
 * server.js
 * Entry point for the Debate Me backend API
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const debateRoutes = require('./routes/debate');
const leaderboardRoutes = require('./routes/leaderboard');
const commentRoutes = require('./routes/comments');
const statsRoutes = require('./routes/stats');
const trendingRoutes = require('./routes/trending');

const app = express();

app.use(cors());
app.use(express.json());

// Mount all routes
app.use('/api/debate', debateRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/trending', trendingRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: '✅ Debate Me API is running 🎯' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});