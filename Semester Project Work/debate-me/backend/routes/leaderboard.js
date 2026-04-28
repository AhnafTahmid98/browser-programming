/**
 * routes/leaderboard.js
 * Fetches the most recent debates from Supabase
 * Enriches each record with a total_votes count
 * Used by the frontend to render the live leaderboard
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * GET /api/leaderboard
 * Returns the 10 most recent debates ordered by creation date
 * Each record includes topic, for_votes, against_votes, and total_votes
 */
router.get('/', async (req, res) => {
  try {
    // Fetch latest 10 debates from Supabase ordered by newest first
    const { data, error } = await supabase
      .from('debates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Compute total votes for each debate
    // This helps frontend show engagement level per topic
    const enriched = data.map(debate => ({
      ...debate,
      total_votes: debate.for_votes + debate.against_votes
    }));

    res.json(enriched);

  } catch (error) {
    console.error('❌ Leaderboard fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch leaderboard. Please try again.' });
  }
});

module.exports = router;