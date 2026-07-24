const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get pricing plans
 * GET /api/payments/plans
 */
router.get('/plans', async (req, res) => {
  try {
    const plans = PaymentService.getPricingPlans();
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Get pricing plans error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Create payment intent
 * POST /api/payments/create
 */
router.post('/create', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const { plan_id } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!plan_id) {
      return res.status(400).json({ error: 'Plan ID is required' });
    }

    // Get plan details
    const plans = PaymentService.getPricingPlans();
    const plan = plans.find(p => p.id === plan_id);

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Create payment
    const result = await PaymentService.createPayment(userId, plan.price, plan.currency);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      payment: result.payment,
      whatsapp_link: result.whatsapp_link,
      message: 'Redirect to WhatsApp for payment'
    });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get user current plan
 * GET /api/payments/current-plan
 */
router.get('/current-plan', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('plan, forms_created, forms_limit')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      plan: user.plan,
      forms_created: user.forms_created,
      forms_limit: user.forms_limit,
      can_create_more_forms: user.forms_created < user.forms_limit
    });
  } catch (error) {
    console.error('Get current plan error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Confirm payment (admin only)
 * POST /api/payments/confirm
 */
router.post('/confirm', async (req, res) => {
  try {
    const { payment_id, transaction_id } = req.body;

    if (!payment_id || !transaction_id) {
      return res.status(400).json({ error: 'Payment ID and transaction ID are required' });
    }

    const result = await PaymentService.confirmPayment(payment_id, transaction_id);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      payment: result.payment,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get payment history
 * GET /api/payments/history
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const result = await PaymentService.getUserPaymentHistory(userId);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      payments: result.payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;