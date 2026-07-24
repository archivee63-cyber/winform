const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all forms for current user
 * GET /api/forms
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    let query = supabase
      .from('forms')
      .select('*');

    // Admins can see all forms, users only see their own
    if (!user || user.role !== 'admin') {
      query = query.eq('admin_id', userId);
    }

    const { data: forms, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch forms' });
    }

    res.json({
      success: true,
      forms
    });
  } catch (error) {
    console.error('Get forms error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Create a new form
 * POST /api/forms
 */
router.post('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { titre, description, fields, scoring_criteria } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!titre) {
      return res.status(400).json({ error: 'Form title is required' });
    }

    // Check user's form limit
    const { data: user } = await supabase
      .from('users')
      .select('forms_created, forms_limit, plan')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Free trial: 2 forms limit
    if (user.plan === 'free' && user.forms_created >= user.forms_limit) {
      return res.status(403).json({ 
        error: 'Form limit reached', 
        message: 'Free trial allows only 2 forms. Upgrade to premium for unlimited forms.',
        upgrade_required: true
      });
    }

    // Create the form
    const { data: form, error } = await supabase
      .from('forms')
      .insert({
        titre,
        description,
        admin_id: userId,
        fields: fields || [],
        scoring_criteria: scoring_criteria || {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create form' });
    }

    // Update user's forms count
    await supabase
      .from('users')
      .update({
        forms_created: user.forms_created + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    res.status(201).json({
      success: true,
      form,
      message: 'Form created successfully'
    });
  } catch (error) {
    console.error('Create form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get form by ID
 * GET /api/forms/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const { data: form, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Check permissions
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'admin' && form.admin_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get form statistics
    const { data: responsesCount } = await supabase
      .from('responses')
      .select('id', { count: 'exact' })
      .eq('form_id', id);

    const { data: scores } = await supabase
      .from('responses')
      .select(`
        id,
        scores (valeur)
      `)
      .eq('form_id', id);

    const averageScore = scores && scores.length > 0
      ? scores.reduce((sum, response) => {
          const responseScores = response.scores || [];
          const avg = responseScores.reduce((s, score) => s + score.valeur, 0) / (responseScores.length || 1);
          return sum + avg;
        }, 0) / scores.length
      : 0;

    res.json({
      success: true,
      form: {
        ...form,
        statistics: {
          responses_count: responsesCount?.length || 0,
          average_score: Math.round(averageScore * 10) / 10
        }
      }
    });
  } catch (error) {
    console.error('Get form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update form
 * PUT /api/forms/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const updates = req.body;

    // Check permissions
    const { data: form } = await supabase
      .from('forms')
      .select('admin_id')
      .eq('id', id)
      .single();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'admin' && form.admin_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove protected fields
    delete updates.id;
    delete updates.admin_id;
    delete updates.created_at;

    const { data: updatedForm, error } = await supabase
      .from('forms')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update form' });
    }

    res.json({
      success: true,
      form: updatedForm,
      message: 'Form updated successfully'
    });
  } catch (error) {
    console.error('Update form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete form
 * DELETE /api/forms/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    // Check permissions
    const { data: form } = await supabase
      .from('forms')
      .select('admin_id')
      .eq('id', id)
      .single();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'admin' && form.admin_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete form' });
    }

    // Update user's forms count
    await supabase
      .from('users')
      .update({
        forms_created: user.forms_created - 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    res.json({
      success: true,
      message: 'Form deleted successfully'
    });
  } catch (error) {
    console.error('Delete form error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get form responses
 * GET /api/forms/:id/responses
 */
router.get('/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    // Check permissions
    const { data: form } = await supabase
      .from('forms')
      .select('admin_id')
      .eq('id', id)
      .single();

    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || (user.role !== 'admin' && form.admin_id !== userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data: responses, error, count } = await supabase
      .from('responses')
      .select('*', { count: 'exact' })
      .eq('form_id', id)
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch responses' });
    }

    // Get scores for each response
    const responsesWithScores = await Promise.all(
      responses.map(async (response) => {
        const { data: scores } = await supabase
          .from('scores')
          .select('*')
          .eq('response_id', response.id)
          .order('created_at', { ascending: false });

        return {
          ...response,
          scores: scores || []
        };
      })
    );

    res.json({
      success: true,
      responses: responsesWithScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get form responses error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;