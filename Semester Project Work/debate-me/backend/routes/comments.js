/**
 * routes/comments.js
 * Handles comments for each debate topic
 * 1. Fetching comments for a specific debate
 * 2. Adding a new comment to a debate
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * GET /api/comments/:debateId
 * Fetches all comments for a specific debate
 * Returns comments ordered by newest first
 */
router.get('/:debateId', async (req, res) => {
  const { debateId } = req.params;

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('debate_id', debateId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);

  } catch (error) {
    console.error('❌ Fetch comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments. Please try again.' });
  }
});

/**
 * POST /api/comments
 * Adds a new comment to a debate
 * Accepts debate_id, username, and comment text
 */
router.post('/', async (req, res) => {
  const { debate_id, username, comment } = req.body;

  // Validate required fields
  if (!debate_id || !comment || comment.trim() === '') {
    return res.status(400).json({ error: 'Debate ID and comment are required' });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        debate_id,
        username: username?.trim() || 'Anonymous',
        comment: comment.trim()
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);

  } catch (error) {
    console.error('❌ Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment. Please try again.' });
  }
});

module.exports = router;