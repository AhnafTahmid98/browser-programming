/**
 * routes/debate.js
 * Handles:
 * 1. Generating AI debate arguments using Groq (primary) with Gemini fallback
 * 2. Recording user votes and storing them in Supabase
 * 3. AI rebuttal generation after voting
 * 4. Deleting a debate topic
 */

const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

// Initialize Groq client — primary AI provider
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Initialize Gemini client — fallback AI provider
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

/**
 * Builds the debate prompt based on topic, language and mode
 */
const buildPrompt = (topic, language = 'English', mode = 'Formal') => {
  const modeInstructions = {
    Formal: 'Use formal, professional and academic language.',
    Casual: 'Use casual, conversational and friendly language.',
    Funny: 'Use humor, wit and sarcasm while still making valid points.',
    ELI5: 'Explain like I am 5 years old. Use very simple words and analogies.'
  };

  return `
    You are a professional debate moderator with years of experience.
    Given the topic: "${topic.trim()}"
    
    Debate style: ${mode}. ${modeInstructions[mode]}
    Response language: ${language}
    
    Provide the strongest possible argument FOR and AGAINST this topic.
    
    Respond ONLY with a valid JSON object in this exact format, no extra text, no markdown:
    {
      "for": "Write 3-4 sentences arguing strongly FOR this topic",
      "against": "Write 3-4 sentences arguing strongly AGAINST this topic"
    }
  `;
};

/**
 * Attempts to generate debate using Groq (LLaMA 3.3 70B)
 */
const generateWithGroq = async (prompt) => {
  console.log('🤖 Trying Groq (LLaMA 3.3)...');
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });
  return completion.choices[0].message.content;
};

/**
 * Attempts to generate debate using Google Gemini 2.0 Flash
 */
const generateWithGemini = async (prompt) => {
  console.log('🤖 Falling back to Gemini...');
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * POST /api/debate/generate
 * Accepts topic, language and mode from frontend
 * Tries Groq first, falls back to Gemini if quota exceeded
 */
router.post('/generate', async (req, res) => {
  const { topic, language = 'English', mode = 'Formal' } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ error: 'Topic is required' });
  }

  try {
    let text;
    let provider;

    try {
      text = await generateWithGroq(buildPrompt(topic, language, mode));
      provider = 'groq';
    } catch (groqError) {
      const isQuotaError = groqError?.status === 429 ||
        groqError?.message?.includes('quota') ||
        groqError?.message?.includes('rate limit');

      if (isQuotaError) {
        try {
          text = await generateWithGemini(buildPrompt(topic, language, mode));
          provider = 'gemini';
        } catch (geminiError) {
          console.error('❌ Both providers failed:', geminiError.message);
          return res.status(503).json({ error: 'All AI providers are currently unavailable.' });
        }
      } else {
        throw groqError;
      }
    }

    const cleaned = text.replace(/```json|```/g, '').trim();
    const debateArguments = JSON.parse(cleaned);

    const { data, error } = await supabase
      .from('debates')
      .insert({ topic: topic.trim(), language, mode })
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Debate generated using ${provider}`);

    res.json({
      id: data.id,
      topic: data.topic,
      language: data.language,
      mode: data.mode,
      for: debateArguments.for,
      against: debateArguments.against,
      provider
    });

  } catch (error) {
    console.error('❌ Debate generation error:', error);
    res.status(500).json({ error: 'Failed to generate debate. Please try again.' });
  }
});

/**
 * POST /api/debate/vote
 * Records a vote for either FOR or AGAINST side
 */
router.post('/vote', async (req, res) => {
  const { id, side } = req.body;

  if (!id || !side) {
    return res.status(400).json({ error: 'Debate ID and side are required' });
  }

  if (!['for', 'against'].includes(side)) {
    return res.status(400).json({ error: 'Side must be either "for" or "against"' });
  }

  const column = side === 'for' ? 'for_votes' : 'against_votes';

  try {
    const { data: current, error: fetchError } = await supabase
      .from('debates')
      .select(column)
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const { data, error } = await supabase
      .from('debates')
      .update({ [column]: current[column] + 1 })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: '✅ Vote recorded successfully',
      for_votes: data.for_votes,
      against_votes: data.against_votes
    });

  } catch (error) {
    console.error('❌ Voting error:', error);
    res.status(500).json({ error: 'Failed to record vote. Please try again.' });
  }
});

/**
 * POST /api/debate/rebuttal
 * Generates an AI rebuttal for the losing side after voting
 */
router.post('/rebuttal', async (req, res) => {
  const { topic, side, argument } = req.body;

  if (!topic || !side || !argument) {
    return res.status(400).json({ error: 'Topic, side and argument are required' });
  }

  try {
    const prompt = `
      You are a skilled debate coach.
      The topic is: "${topic}"
      The ${side} side made this argument: "${argument}"
      
      Write a powerful 2-3 sentence rebuttal that directly challenges this argument.
      Be specific and convincing. No extra text, just the rebuttal.
    `;

    let rebuttal;
    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8
      });
      rebuttal = completion.choices[0].message.content;
    } catch (groqError) {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      rebuttal = result.response.text();
    }

    res.json({ rebuttal: rebuttal.trim() });

  } catch (error) {
    console.error('❌ Rebuttal error:', error);
    res.status(500).json({ error: 'Failed to generate rebuttal. Please try again.' });
  }
});

/**
 * DELETE /api/debate/:id
 * Deletes a debate topic and all its comments
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Delete comments first due to foreign key constraint
    await supabase
      .from('comments')
      .delete()
      .eq('debate_id', id);

    // Then delete the debate
    const { error } = await supabase
      .from('debates')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: '✅ Debate deleted successfully' });

  } catch (error) {
    console.error('❌ Delete error:', error);
    res.status(500).json({ error: 'Failed to delete debate. Please try again.' });
  }
});

module.exports = router;