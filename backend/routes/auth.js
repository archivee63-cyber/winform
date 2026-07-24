const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Register a new user
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, nom } = req.body;

    if (!email || !password || !nom) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Create user profile in users table
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: email,
        nom: nom,
        date_inscription: new Date().toISOString(),
        role: 'user'
      })
      .select()
      .single();

    if (profileError) {
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: authData.user.id, 
        email: authData.user.email,
        role: 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nom: nom,
        role: 'user'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login user
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: authData.user.id, 
        email: authData.user.email,
        role: userProfile?.role || 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        nom: userProfile?.nom || '',
        role: userProfile?.role || 'user'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * Login with Google OAuth
 * POST /api/auth/google
 */
router.post('/google', async (req, res) => {
  try {
    // This would typically redirect to Supabase OAuth
    // For MVP, we'll simulate the flow
    res.json({
      success: true,
      message: 'Google OAuth endpoint - would redirect to Supabase OAuth',
      redirect_url: `${supabaseUrl}/auth/v1/authorize?provider=google`
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

/**
 * Login with GitHub OAuth
 * POST /api/auth/github
 */
router.post('/github', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'GitHub OAuth endpoint - would redirect to Supabase OAuth',
      redirect_url: `${supabaseUrl}/auth/v1/authorize?provider=github`
    });
  } catch (error) {
    console.error('GitHub auth error:', error);
    res.status(500).json({ error: 'GitHub authentication failed' });
  }
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user profile
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', decoded.userId)
      .single();

    if (error || !userProfile) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

/**
 * Logout user
 * POST /api/auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    // In a real implementation, you would invalidate the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;