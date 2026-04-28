/**
 * routes/trending.js
 * Returns top 5 most voted debates
 * Used for the Trending Topics section
 */

const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('debates')
      .select('*')
      .order('for_votes', { ascending: false })
      .limit(5);

    if (error) throw error;

    const enriched = data.map(d => ({
      ...d,
      total_votes: d.for_votes + d.against_votes
    }));

    res.json(enriched);

  } catch (error) {
    console.error('❌ Trending error:', error);
    res.status(500).json({ error: 'Failed to fetch trending topics.' });
  }
});

module.exports = router;