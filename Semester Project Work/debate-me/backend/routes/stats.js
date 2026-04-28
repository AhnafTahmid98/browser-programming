/**
 * routes/stats.js
 * Returns overall app statistics:
 * - Total debates generated
 * - Total votes cast
 * - Total comments posted
 * - Most voted topic
 * - Most commented topic
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/', async (req, res) => {
  try {
    // Get all debates
    const { data: debates, error: debatesError } = await supabase
      .from('debates')
      .select('*');

    if (debatesError) throw debatesError;

    // Get all comments
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*');

    if (commentsError) throw commentsError;

    // Calculate total votes
    const totalVotes = debates.reduce((sum, d) => sum + d.for_votes + d.against_votes, 0);

    // Find most voted debate
    const mostVoted = debates.reduce((max, d) =>
      (d.for_votes + d.against_votes) > (max.for_votes + max.against_votes) ? d : max,
      debates[0] || null
    );

    // Count comments per debate
    const commentCounts = comments.reduce((acc, c) => {
      acc[c.debate_id] = (acc[c.debate_id] || 0) + 1;
      return acc;
    }, {});

    // Find most commented debate
    const mostCommentedId = Object.keys(commentCounts).reduce((a, b) =>
      commentCounts[a] > commentCounts[b] ? a : b, null
    );

    const mostCommented = mostCommentedId
      ? debates.find(d => d.id === mostCommentedId)
      : null;

    res.json({
      total_debates: debates.length,
      total_votes: totalVotes,
      total_comments: comments.length,
      most_voted: mostVoted ? {
        topic: mostVoted.topic,
        votes: mostVoted.for_votes + mostVoted.against_votes
      } : null,
      most_commented: mostCommented ? {
        topic: mostCommented.topic,
        comments: commentCounts[mostCommentedId]
      } : null
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;