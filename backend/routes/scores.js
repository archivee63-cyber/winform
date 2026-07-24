const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get all scores (admin only or form owner)
 * GET /api/scores
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { form_id, response_id, min_score, max_score, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    let query = supabase
      .from('scores')
      .select(`
        *,
        responses!inner (
          form_id,
          user_id,
          forms!inner (admin_id)
        )
      `, { count: 'exact' });

    // Apply filters
    if (form_id) {
      query = query.eq('responses.form_id', form_id);
    }

    if (response_id) {
      query = query.eq('response_id', response_id);
    }

    if (min_score) {
      query = query.gte('valeur', parseInt(min_score));
    }

    if (max_score) {
      query = query.lte('valeur', parseInt(max_score));
    }

    // Non-admin users can only see scores for forms they own
    if (!user || user.role !== 'admin') {
      query = query.eq('responses.forms.admin_id', userId);
    }

    const { data: scores, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch scores' });
    }

    // Simplify the response structure
    const simplifiedScores = scores.map(score => ({
      id: score.id,
      response_id: score.response_id,
      valeur: score.valeur,
      seuil: score.seuil,
      feedback: score.feedback,
      ai_model: score.ai_model,
      created_at: score.created_at,
      metadata: score.metadata
    }));

    res.json({
      success: true,
      scores: simplifiedScores,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get score statistics
 * GET /api/scores/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { form_id, timeframe = 'all' } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    let query = supabase
      .from('scores')
      .select(`
        *,
        responses!inner (
          form_id,
          forms!inner (admin_id)
        )
      `);

    // Apply timeframe filter
    if (timeframe !== 'all') {
      const now = new Date();
      let startDate;
      
      switch (timeframe) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
      
      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
    }

    // Apply form filter
    if (form_id) {
      query = query.eq('responses.form_id', form_id);
    }

    // Non-admin users can only see stats for forms they own
    if (!user || user.role !== 'admin') {
      query = query.eq('responses.forms.admin_id', userId);
    }

    const { data: scores, error } = await query;

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch score statistics' });
    }

    // Calculate statistics
    const scoreValues = scores.map(score => score.valeur);
    const totalScores = scoreValues.length;
    const averageScore = totalScores > 0 
      ? scoreValues.reduce((sum, val) => sum + val, 0) / totalScores 
      : 0;
    
    const highScores = scoreValues.filter(score => score > 70).length;
    const lowScores = scoreValues.filter(score => score <= 30).length;

    // Score distribution
    const distribution = {
      '0-30': scoreValues.filter(score => score <= 30).length,
      '31-50': scoreValues.filter(score => score > 30 && score <= 50).length,
      '51-70': scoreValues.filter(score => score > 50 && score <= 70).length,
      '71-90': scoreValues.filter(score => score > 70 && score <= 90).length,
      '91-100': scoreValues.filter(score => score > 90).length
    };

    res.json({
      success: true,
      statistics: {
        total_scores: totalScores,
        average_score: Math.round(averageScore * 10) / 10,
        high_scores_count: highScores,
        low_scores_count: lowScores,
        high_score_percentage: totalScores > 0 ? Math.round((highScores / totalScores) * 100) : 0,
        distribution
      }
    });
  } catch (error) {
    console.error('Get score stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get score by ID
 * GET /api/scores/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const { data: score, error } = await supabase
      .from('scores')
      .select(`
        *,
        responses!inner (
          form_id,
          user_id,
          forms!inner (admin_id)
        )
      `)
      .eq('id', id)
      .single();

    if (error || !score) {
      return res.status(404).json({ error: 'Score not found' });
    }

    // Check permissions
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    const canView = user && (
      user.role === 'admin' || 
      score.responses.forms.admin_id === userId ||
      score.responses.user_id === userId
    );

    if (!canView) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get response details
    const { data: response } = await supabase
      .from('responses')
      .select('*')
      .eq('id', score.response_id)
      .single();

    // Get form details
    const { data: form } = await supabase
      .from('forms')
      .select('*')
      .eq('id', response?.form_id)
      .single();

    res.json({
      success: true,
      score: {
        id: score.id,
        response_id: score.response_id,
        valeur: score.valeur,
        seuil: score.seuil,
        feedback: score.feedback,
        ai_model: score.ai_model,
        created_at: score.created_at,
        metadata: score.metadata,
        response: response || {},
        form: form || {}
      }
    });
  } catch (error) {
    console.error('Get score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update score (admin only)
 * PUT /api/scores/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const updates = req.body;

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Remove protected fields
    delete updates.id;
    delete updates.response_id;
    delete updates.created_at;

    const { data: score, error } = await supabase
      .from('scores')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update score' });
    }

    res.json({
      success: true,
      score,
      message: 'Score updated successfully'
    });
  } catch (error) {
    console.error('Update score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete score (admin only)
 * DELETE /api/scores/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete score' });
    }

    res.json({
      success: true,
      message: 'Score deleted successfully'
    });
  } catch (error) {
    console.error('Delete score error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Export scores as CSV (admin only)
 * GET /api/scores/export/csv
 */
router.get('/export/csv', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { form_id } = req.query;

    // Check if user is admin
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    let query = supabase
      .from('scores')
      .select(`
        *,
        responses!inner (
          contenu,
          forms!inner (titre)
        )
      `);

    if (form_id) {
      query = query.eq('responses.form_id', form_id);
    }

    const { data: scores, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch scores for export' });
    }

    // Convert to CSV
    const headers = ['ID', 'Response ID', 'Score', 'Threshold', 'Feedback', 'AI Model', 'Created At', 'Form Title'];
    const csvRows = [
      headers.join(','),
      ...scores.map(score => [
        score.id,
        score.response_id,
        score.valeur,
        score.seuil,
        `"${score.feedback || ''}"`,
        score.ai_model || '',
        score.created_at,
        `"${score.responses.forms.titre || ''}"`
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=scores_export_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export scores error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;