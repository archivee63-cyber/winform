const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// OpenRouter API configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

/**
 * Score a response using AI
 * POST /api/ai/score
 * Body: { response_id: string }
 */
router.post('/score', async (req, res) => {
  try {
    const { response_id } = req.body;
    
    if (!response_id) {
      return res.status(400).json({ error: 'response_id is required' });
    }

    // Fetch the response from database
    const { data: response, error: responseError } = await supabase
      .from('responses')
      .select('*')
      .eq('id', response_id)
      .single();

    if (responseError || !response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Fetch the form to get scoring criteria
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', response.form_id)
      .single();

    if (formError || !form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Generate AI prompt for scoring
    const prompt = `
      You are an expert evaluator for form responses.
      
      FORM TITLE: ${form.title}
      FORM DESCRIPTION: ${form.description}
      
      RESPONSE CONTENT: ${response.contenu}
      
      Please evaluate this response based on the following criteria:
      1. Relevance to the form topic
      2. Completeness of information provided
      3. Clarity and organization
      4. Quality of language and expression
      5. Overall impression
      
      Provide a numerical score from 0 to 100 where:
      - 0-20: Poor (incomplete, irrelevant, unclear)
      - 21-40: Below average (some relevant info but lacking)
      - 41-60: Average (adequate but not exceptional)
      - 61-80: Good (well-structured, relevant, clear)
      - 81-100: Excellent (outstanding in all aspects)
      
      Return ONLY a JSON object with this exact structure:
      {
        "score": number,
        "feedback": "brief constructive feedback",
        "threshold": 70
      }
    `;

    // Call OpenRouter API
    const aiResponse = await axios.post(
      `${OPENROUTER_BASE_URL}/chat/completions`,
      {
        model: 'deepseek/deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert evaluator that provides numerical scores and feedback for form responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://winform-saas.com',
          'X-Title': 'Winform AI Scoring'
        }
      }
    );

    const aiResult = aiResponse.data.choices[0].message.content;
    
    // Parse the JSON response
    let scoreData;
    try {
      scoreData = JSON.parse(aiResult);
    } catch (parseError) {
      // If parsing fails, extract score from text
      const scoreMatch = aiResult.match(/\b(\d{1,3})\b/);
      scoreData = {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        feedback: 'AI evaluation completed',
        threshold: 70
      };
    }

    // Store score in database
    const { data: savedScore, error: scoreError } = await supabase
      .from('scores')
      .insert({
        response_id: response_id,
        valeur: scoreData.score,
        seuil: scoreData.threshold,
        feedback: scoreData.feedback,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (scoreError) {
      return res.status(500).json({ error: 'Failed to save score', details: scoreError.message });
    }

    // Check if score exceeds threshold and trigger notification
    if (scoreData.score > scoreData.threshold) {
      // Fetch admin user (assuming first user is admin)
      const { data: adminUser } = await supabase
        .from('users')
        .select('email')
        .eq('role', 'admin')
        .limit(1)
        .single();

      if (adminUser) {
        // Trigger email notification (would be implemented as a separate service)
        console.log(`📧 High score alert! Score: ${scoreData.score} > ${scoreData.threshold}`);
        console.log(`📧 Would send email to: ${adminUser.email}`);
        
        // In a real implementation, you would call an email service here
        // await sendHighScoreNotification(adminUser.email, response, scoreData);
      }
    }

    res.json({
      success: true,
      score: savedScore,
      message: 'Response scored successfully'
    });

  } catch (error) {
    console.error('AI scoring error:', error);
    res.status(500).json({ 
      error: 'Failed to score response', 
      details: error.message 
    });
  }
});

/**
 * Get scoring history for a response
 * GET /api/ai/scores/:response_id
 */
router.get('/scores/:response_id', async (req, res) => {
  try {
    const { response_id } = req.params;

    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('response_id', response_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch scores' });
    }

    res.json({ scores });
  } catch (error) {
    console.error('Error fetching scores:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;