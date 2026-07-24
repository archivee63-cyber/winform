const { Resend } = require('resend');
const EmailTemplate = require('./emailTemplate');

class ResendEmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'notifications@winform.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'https://winform.vercel.app';
  }

  /**
   * Send email when score > 70
   */
  async sendScoreEmail(adminEmail, userName, score, formTitle) {
    try {
      if (!adminEmail || !userName || !score) {
        throw new Error('Missing required parameters for sendScoreEmail');
      }

      const emailHtml = EmailTemplate.scoreNotification({
        userName,
        score,
        formTitle,
        dashboardUrl: `${this.frontendUrl}/dashboard`,
        date: new Date().toLocaleString('fr-FR')
      });

      const { data, error } = await this.resend.emails.send({
        from: `Winform <${this.fromEmail}>`,
        to: [adminEmail],
        subject: `🎯 Nouveau score élevé : ${userName} a obtenu ${score}/100`,
        html: emailHtml,
        tags: [
          { name: 'category', value: 'score_notification' },
          { name: 'score', value: score > 70 ? 'high' : 'medium' }
        ]
      });

      if (error) {
        console.error('Resend email error:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Email sent to ${adminEmail} for score ${score}`);
      return { success: true, data };
    } catch (error) {
      console.error('Send email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmation(userEmail, userName, planName) {
    try {
      const emailHtml = EmailTemplate.paymentConfirmation({
        userName,
        planName,
        dashboardUrl: `${this.frontendUrl}/dashboard`,
        date: new Date().toLocaleString('fr-FR')
      });

      const { data, error } = await this.resend.emails.send({
        from: `Winform <${this.fromEmail}>`,
        to: [userEmail],
        subject: `🎉 Votre abonnement ${planName} est activé !`,
        html: emailHtml,
        tags: [
          { name: 'category', value: 'payment_confirmation' }
        ]
      });

      if (error) {
        console.error('Payment confirmation email error:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Payment confirmation sent to ${userEmail}`);
      return { success: true, data };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send new response notification
   */
  async sendNewResponseEmail(adminEmail, formTitle, userName) {
    try {
      const emailHtml = EmailTemplate.newResponse({
        formTitle,
        userName,
        dashboardUrl: `${this.frontendUrl}/dashboard`,
        date: new Date().toLocaleString('fr-FR')
      });

      const { data, error } = await this.resend.emails.send({
        from: `Winform <${this.fromEmail}>`,
        to: [adminEmail],
        subject: `📝 Nouvelle réponse : ${formTitle}`,
        html: emailHtml,
        tags: [
          { name: 'category', value: 'new_response' }
        ]
      });

      if (error) {
        console.error('New response email error:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ New response notification sent to ${adminEmail}`);
      return { success: true, data };
    } catch (error) {
      console.error('New response email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send welcome email to new user
   */
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const emailHtml = EmailTemplate.welcomeEmail({
        userName,
        dashboardUrl: `${this.frontendUrl}/dashboard`,
        pricingUrl: `${this.frontendUrl}/pricing`
      });

      const { data, error } = await this.resend.emails.send({
        from: `Winform <${this.fromEmail}>`,
        to: [userEmail],
        subject: `Bienvenue sur Winform, ${userName}!`,
        html: emailHtml,
        tags: [
          { name: 'category', value: 'welcome' }
        ]
      });

      if (error) {
        console.error('Welcome email error:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Welcome email sent to ${userEmail}`);
      return { success: true, data };
    } catch (error) {
      console.error('Welcome email error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get email sending stats
   */
  async getEmailStats() {
    try {
      // This would require additional Resend API calls
      // For now, return mock data
      return {
        success: true,
        stats: {
          totalEmails: 42,
          delivered: 40,
          opened: 35,
          clicked: 28
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new ResendEmailService();