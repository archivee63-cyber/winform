const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

class EmailService {
  /**
   * Send high score notification to admin
   */
  static async sendHighScoreNotification(responseId, score, threshold) {
    try {
      // Get response details
      const { data: response, error: responseError } = await supabase
        .from('responses')
        .select(`
          *,
          forms!inner (
            titre,
            admin_id
          ),
          users!inner (
            email,
            nom
          )
        `)
        .eq('id', responseId)
        .single();

      if (responseError || !response) {
        console.error('Response not found for email notification:', responseError);
        return false;
      }

      // Get admin email
      const { data: admin } = await supabase
        .from('users')
        .select('email, nom')
        .eq('id', response.forms.admin_id)
        .single();

      if (!admin) {
        console.error('Admin not found for email notification');
        return false;
      }

      const mailOptions = {
        from: `"Winform AI" <${process.env.SMTP_USER}>`,
        to: admin.email,
        subject: `🎯 Nouveau score élevé détecté : ${score}/100`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">🎯 Score élevé détecté !</h2>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1e293b;">Détails de la réponse</h3>
              <p><strong>Formulaire :</strong> ${response.forms.titre}</p>
              <p><strong>Utilisateur :</strong> ${response.users.nom} (${response.users.email})</p>
              <p><strong>Score obtenu :</strong> <span style="color: #16a34a; font-weight: bold;">${score}/100</span></p>
              <p><strong>Seuil de qualification :</strong> ${threshold}/100</p>
              <p><strong>Date :</strong> ${new Date(response.date).toLocaleDateString('fr-FR')}</p>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1;">📊 Statistiques</h4>
              <p>Le score de ${score} dépasse le seuil de ${threshold}. Cet utilisateur est potentiellement qualifié !</p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Cette notification a été générée automatiquement par le système de scoring IA Winform.<br>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/responses/${responseId}" style="color: #2563eb;">
                  Voir la réponse complète →
                </a>
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      // Store notification in database
      await supabase
        .from('notifications')
        .insert({
          user_id: response.forms.admin_id,
          type: 'high_score',
          title: `Score élevé : ${score}/100`,
          message: `L'utilisateur ${response.users.nom} a obtenu un score de ${score} sur le formulaire "${response.forms.titre}"`,
          metadata: {
            response_id: responseId,
            score: score,
            threshold: threshold,
            form_title: response.forms.titre,
            user_name: response.users.nom
          }
        });

      console.log(`📧 High score notification sent to ${admin.email}`);
      return true;
    } catch (error) {
      console.error('Error sending high score notification:', error);
      return false;
    }
  }

  /**
   * Send payment confirmation email
   */
  static async sendPaymentConfirmation(userId, paymentDetails) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('email, nom')
        .eq('id', userId)
        .single();

      if (!user) {
        console.error('User not found for payment confirmation');
        return false;
      }

      const mailOptions = {
        from: `"Winform Paiements" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '✅ Paiement confirmé - Winform Premium',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a;">✅ Paiement confirmé !</h2>
            
            <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #166534;">Merci pour votre achat</h3>
              <p>Bonjour ${user.nom},</p>
              <p>Votre paiement a été confirmé avec succès. Vous avez maintenant accès à toutes les fonctionnalités premium de Winform.</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <h4 style="color: #1e293b; margin-top: 0;">Détails de la transaction</h4>
                <p><strong>Montant :</strong> ${paymentDetails.amount} ${paymentDetails.currency}</p>
                <p><strong>Méthode :</strong> ${paymentDetails.payment_method}</p>
                <p><strong>ID Transaction :</strong> ${paymentDetails.transaction_id}</p>
                <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
              </div>
            </div>

            <div style="background-color: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #1e40af;">🎁 Fonctionnalités Premium débloquées</h4>
              <ul style="color: #374151;">
                <li>Formulaires illimités</li>
                <li>Analyses IA avancées</li>
                <li>Export de données CSV/Excel</li>
                <li>Notifications personnalisées</li>
                <li>Support prioritaire</li>
              </ul>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Besoin d'aide ? Contactez notre équipe support :<br>
                📧 support@winform.com | 📱 +229 66 89 59 73
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      // Store notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'payment_confirmed',
          title: 'Paiement confirmé',
          message: `Votre paiement de ${paymentDetails.amount} ${paymentDetails.currency} a été confirmé.`,
          metadata: paymentDetails
        });

      console.log(`📧 Payment confirmation sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending payment confirmation:', error);
      return false;
    }
  }

  /**
   * Send form submission notification to form owner
   */
  static async sendFormSubmissionNotification(formId, responseId) {
    try {
      const { data: response } = await supabase
        .from('responses')
        .select(`
          *,
          forms!inner (
            titre,
            admin_id
          ),
          users!inner (
            email,
            nom
          )
        `)
        .eq('id', responseId)
        .single();

      if (!response) {
        console.error('Response not found for form submission notification');
        return false;
      }

      const { data: formOwner } = await supabase
        .from('users')
        .select('email, nom')
        .eq('id', response.forms.admin_id)
        .single();

      if (!formOwner) {
        console.error('Form owner not found');
        return false;
      }

      const mailOptions = {
        from: `"Winform Forms" <${process.env.SMTP_USER}>`,
        to: formOwner.email,
        subject: `📝 Nouvelle réponse reçue : ${response.forms.titre}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">📝 Nouvelle réponse reçue</h2>
            
            <div style="background-color: #faf5ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #5b21b6;">${response.forms.titre}</h3>
              
              <p><strong>De :</strong> ${response.users.nom} (${response.users.email})</p>
              <p><strong>Date :</strong> ${new Date(response.date).toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
              
              <div style="margin-top: 15px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/responses/${responseId}" 
                   style="background-color: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Voir la réponse complète
                </a>
              </div>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Cette réponse sera automatiquement analysée par notre IA dans les prochaines minutes.<br>
                Vous recevrez une notification lorsque le score sera disponible.
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      
      // Store notification
      await supabase
        .from('notifications')
        .insert({
          user_id: response.forms.admin_id,
          type: 'form_submission',
          title: 'Nouvelle réponse reçue',
          message: `Nouvelle réponse de ${response.users.nom} sur "${response.forms.titre}"`,
          metadata: {
            response_id: responseId,
            form_id: formId,
            form_title: response.forms.titre,
            user_name: response.users.nom
          }
        });

      console.log(`📧 Form submission notification sent to ${formOwner.email}`);
      return true;
    } catch (error) {
      console.error('Error sending form submission notification:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new user
   */
  static async sendWelcomeEmail(userId) {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('email, nom')
        .eq('id', userId)
        .single();

      if (!user) {
        console.error('User not found for welcome email');
        return false;
      }

      const mailOptions = {
        from: `"Winform" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: '👋 Bienvenue sur Winform !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Bienvenue sur Winform, ${user.nom} !</h2>
            
            <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p>Merci de vous être inscrit sur Winform, la plateforme de formulaires intelligents avec scoring IA.</p>
              
              <h3 style="color: #1e40af;">🚀 Commencez dès maintenant</h3>
              <ul style="color: #374151;">
                <li><strong>2 formulaires gratuits</strong> pour tester la plateforme</li>
                <li><strong>Scoring IA automatique</strong> de vos réponses</li>
                <li><strong>Tableau de bord</strong> pour suivre vos performances</li>
                <li><strong>Notifications</strong> pour les scores élevés</li>
              </ul>
            </div>

            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #0369a1;">💡 Premiers pas</h4>
              <ol style="color: #374151;">
                <li>Créez votre premier formulaire</li>
                <li>Partagez le lien avec vos utilisateurs</li>
                <li>Recevez et analysez les réponses automatiquement</li>
                <li>Identifiez les meilleurs candidats avec notre IA</li>
              </ol>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Accéder à mon tableau de bord
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px;">
                Besoin d'aide ? Consultez notre <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/help" style="color: #2563eb;">centre d'aide</a><br>
                Ou contactez-nous : 📧 support@winform.com | 📱 +229 66 89 59 73
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Verify email configuration
   */
  static async verifyConnection() {
    try {
      await transporter.verify();
      console.log('✅ Email service configured successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }
}

module.exports = EmailService;