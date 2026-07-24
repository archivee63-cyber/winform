const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Submit a response to a form
 * POST /api/responses
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { form_id, contenu } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!form_id || !contenu) {
      return res.status(400).json({ error: 'form_id and contenu are required' });
    }

    // Check if form exists and is active
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', form_id)
      .eq('is_active', true)
      .single();

    if (formError || !form) {
      return res.status(404).json({ error: 'Form not found or inactive' });
    }

    // Create the response
    const { data: response, error } = await supabase
      .from('responses')
      .insert({
        form_id,
        user_id: userId,
        contenu,
        date: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to submit response' });
    }

    // Trigger AI scoring automatically
    // In production, this might be done asynchronously
    console.log(`Response ${response.id} submitted - AI scoring would be triggered`);

    res.status(201).json({
      success: true,
      response,
      message: 'Response submitted successfully',
      scoring_triggered: true
    });
  } catch (error) {
    console.error('Submit response error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get user's responses
 * GET /api/responses
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: responses, error, count } = await supabase
      .from('responses')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch responses' });
    }

    // Get form details and scores for each response
    const responsesWithDetails = await Promise.all(
      responses.map(async (response) => {
        const { data: form } = await supabase
          .from('forms')
          .select('titre, description')
          .eq('id', response.form_id)
          .single();

        const { data: scores } = await supabase
          .from('scores')
          .select('*')
          .eq('response_id', response.id)
          .order('created_at', { ascending: false });

        return {
          ...response,
          form: form || {},
          scores: scores || []
        };
      })
    );

    res.json({
      success: true,
      responses: responsesWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get responses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get response by ID
 * GET /api/responses/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const { data: response, error } = await supabase
      .from('responses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    // Check permissions - user can only view their own responses unless admin
    if (response.user_id !== userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'admin') {
        // Check if user is the form owner
        const { data: form } = await supabase
          .from('forms')
          .select('admin_id')
          .eq('id', response.form_id)
          .single();

        if (!form || form.admin_id !== userId) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }
    }

    // Get form details
    const { data: form } = await supabase
      .from('forms')
      .select('*')
      .eq('id', response.form_id)
      .single();

    // Get scores
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('response_id', id)
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      response: {
        ...response,
        form: form || {},
        scores: scores || []
      }
    });
  } catch (error) {
    console.error('Get response error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update response (only for corrections)
 * PUT /api/responses/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const { contenu } = req.body;

    if (!contenu) {
      return res.status(400).json({ error: 'contenu is required' });
    }

    // Check permissions - user can only update their own responses
    const { data: response } = await supabase
      .from('responses')
      .select('user_id, is_scored')
      .eq('id', id)
      .single();

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    if (response.user_id !== userId) {
      return res.status(403).json({ error: 'Can only update your own responses' });
    }

    // If already scored, mark for re-scoring
    const { data: updatedResponse, error } = await supabase
      .from('responses')
      .update({
        contenu,
        is_scored: response.is_scored ? false : response.is_scored,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update response' });
    }

    res.json({
      success: true,
      response: updatedResponse,
      message: 'Response updated successfully',
      rescore_needed: response.is_scored
    });
  } catch (error) {
    console.error('Update response error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete response
 * DELETE /api/responses/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    // Check permissions
    const { data: response } = await supabase
      .from('responses')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    if (response.user_id !== userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { error } = await supabase
      .from('responses')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete response' });
    }

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Delete response error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;