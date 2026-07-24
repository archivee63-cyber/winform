const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware to verify admin role
const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In a real implementation, you would verify JWT and check role
    // For simplicity, we'll check via query param or header
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Get all users (admin only)
 * GET /api/users
 */
router.get('/', isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,nom.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .order('date_inscription', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    res.json({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    // Users can only view their own profile unless admin
    if (id !== userId) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user statistics
    const { data: formsCount } = await supabase
      .from('forms')
      .select('id', { count: 'exact' })
      .eq('admin_id', id);

    const { data: responsesCount } = await supabase
      .from('responses')
      .select('id', { count: 'exact' })
      .eq('user_id', id);

    res.json({
      success: true,
      user: {
        ...user,
        statistics: {
          forms_created: formsCount?.length || 0,
          responses_submitted: responsesCount?.length || 0
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Update user profile
 * PUT /api/users/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    const updates = req.body;

    // Users can only update their own profile
    if (id !== userId) {
      return res.status(403).json({ error: 'Can only update your own profile' });
    }

    // Remove protected fields
    delete updates.id;
    delete updates.email;
    delete updates.role;
    delete updates.date_inscription;
    delete updates.created_at;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update user' });
    }

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Delete user (admin only)
 * DELETE /api/users/:id
 */
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    const adminId = req.headers['x-user-id'];
    if (id === adminId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete user' });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Export users data (admin only)
 * GET /api/users/export/csv
 */
router.get('/export/csv', isAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('date_inscription', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch users for export' });
    }

    // Convert to CSV
    const headers = ['ID', 'Email', 'Nom', 'Date Inscription', 'Role', 'Plan', 'Forms Created'];
    const csvRows = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.email}"`,
        `"${user.nom || ''}"`,
        user.date_inscription,
        user.role,
        user.plan,
        user.forms_created
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=users_export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

module.exports = router;