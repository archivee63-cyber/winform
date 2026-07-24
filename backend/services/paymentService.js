
const { createClient } = require('@supabase/supabase-js');
const EmailService = require('./emailService');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class PaymentService {
  /**
   * Generate WhatsApp payment link
   */
  static generateWhatsAppPaymentLink(userId, amount, currency = 'XOF') {
    const whatsappNumber = process.env.WHATSAPP_PHONE || '+22966895973';
    const message = encodeURIComponent(
      `Bonjour, je souhaite souscrire à Winform Premium. ` +
      `ID utilisateur: ${userId}, Montant: ${amount} ${currency}. ` +
      `Merci de me fournir les instructions de paiement.`
    );

    return `https://wa.me/${whatsappNumber}?text=${message}`;
  }

  /**
   * Create payment record (for manual WhatsApp payments)
   */
  static async createPayment(userId, amount, currency = 'XOF') {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('email, nom, plan')
        .eq('id', userId)
        .single();

      if (!user) {
        throw new Error('User not found');
      }

      // Create payment record
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          amount: amount,
          currency: currency,
          status: 'pending',
          payment_method: 'whatsapp',
          whatsapp_number: process.env.WHATSAPP_PHONE,
          metadata: {
            user_email: user.email,
            user_name: user.nom,
            current_plan: user.plan
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Generate WhatsApp link
      const whatsappLink = this.generateWhatsAppPaymentLink(userId, amount, currency);

      return {
        success: true,
        payment,
        whatsapp_link: whatsappLink,
        message: 'Payment record created. Redirect user to WhatsApp for payment.'
      };
    } catch (error) {
      console.error('Payment creation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Confirm payment (called by admin after manual verification)
   */
  static async confirmPayment(paymentId, transactionId) {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          transaction_id: transactionId,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update user plan to premium
      await supabase
        .from('users')
        .update({
          plan: 'premium',
          forms_limit: 999, // Unlimited forms
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.user_id);

      // Send confirmation email
      await EmailService.sendPaymentConfirmation(payment.user_id, {
        amount: payment.amount,
        currency: payment.currency,
        payment_method: payment.payment_method,
        transaction_id: payment.transaction_id,
        date: new Date().toISOString()
      });

      return {
        success: true,
        payment,
        message: 'Payment confirmed and user upgraded to premium'
      };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get payment status
   */
  static async getPaymentStatus(paymentId) {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        payment
      };
    } catch (error) {
      console.error('Get payment status error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user payment history
   */
  static async getUserPaymentHistory(userId) {
    try {
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        payments
      };
    } catch (error) {
      console.error('Get payment history error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create payment intent (for future Stripe integration)
   */
  static async createPaymentIntent(userId, amount, currency = 'XOF') {
    // This is a placeholder for future Stripe integration
    // For now, we'll use the WhatsApp flow
    return this.createPayment(userId, amount, currency);
  }

  /**
   * Get pricing plans
   */
  static getPricingPlans() {
    return [
      {
        id: 'free',
        name: 'Gratuit',
        price: 0,
        currency: 'XOF',
        features: [
          '2 formulaires maximum',
          'Scoring IA de base',
          'Notifications email',
          'Support communautaire'
        ],
        is_popular: false
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 10000,
        currency: 'XOF',
        features: [
          'Formulaires illimités',
          'Scoring IA avancé',
          'Export de données',
          'Notifications personnalisées',
          'Support prioritaire',
          'Analyses avancées'
        ],
        is_popular: true
      }
    ];
  }
}

module.exports = PaymentService;