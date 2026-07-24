class EmailTemplate {
  /**
   * Score notification email template
   */
  static scoreNotification({ userName, score, formTitle, dashboardUrl, date }) {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nouveau score élevé sur Winform</title>
  <style type="text/css">
    /* Base ------------------------------ */
    * {
      margin: 0;
      padding: 0;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    body {
      -webkit-font-smoothing: antialiased;
      -webkit-text-size-adjust: none;
      width: 100% !important;
      height: 100%;
      line-height: 1.6;
    }

    /* Layout ------------------------------ */
    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 20px 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    /* Header ------------------------------ */
    .email-header {
      background-color: #2563eb;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    /* Content ------------------------------ */
    .email-content {
      padding: 24px;
      color: #1f2937;
    }

    .email-content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }

    .email-content p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
      color: #4b5563;
    }

    /* Score Card ------------------------------ */
    .score-card {
      background-color: #f0f9ff;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #2563eb;
    }

    .score-value {
      font-size: 32px;
      font-weight: 700;
      color: #2563eb;
      margin: 10px 0;
    }

    /* Button ------------------------------ */
    .email-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
    }

    /* Footer ------------------------------ */
    .email-footer {
      padding: 24px;
      text-align: center;
      background-color: #f8fafc;
      color: #6b7280;
      font-size: 14px;
    }

    .email-footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <h1>🎯 Nouveau score élevé</h1>
        <p>Winform - Plateforme de scoring IA</p>
      </div>

      <!-- Content -->
      <div class="email-content">
        <h2>Bonjour Admin,</h2>

        <p>Un nouvel inscrit a obtenu un score élevé sur votre formulaire !</p>

        <!-- Score Card -->
        <div class="score-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #111827;">${formTitle}</h3>
            <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Score élevé</span>
          </div>

          <div class="score-value">${score}/100</div>

          <div style="margin-top: 15px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Inscrit</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${userName}</p>
          </div>
        </div>

        <p>Ce score dépasse le seuil de 70, ce qui indique un inscrit qualifié pour votre programme.</p>

        <p>Nous vous recommandons de :</p>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
          <li style="margin-bottom: 8px;">✅ Contacter rapidement l'inscrit</li>
          <li style="margin-bottom: 8px;">✅ Vérifier ses informations complètes</li>
          <li style="margin-bottom: 8px;">✅ Planifier un entretien si nécessaire</li>
        </ul>

        <a href="${dashboardUrl}" class="email-button">Voir les détails dans le dashboard</a>

        <p style="margin-top: 30px;">Cordialement,</p>
        <p style="font-weight: 600;">L'équipe Winform</p>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <p>© ${new Date().getFullYear()} Winform. Tous droits réservés.</p>
        <p style="margin-top: 8px;">
          <a href="${dashboardUrl}">Dashboard</a> |
          <a href="https://winform.com/privacy">Politique de confidentialité</a> |
          <a href="https://winform.com/support">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * Payment confirmation email template
   */
  static paymentConfirmation({ userName, planName, dashboardUrl, date }) {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirmation de paiement Winform</title>
  <style type="text/css">
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 20px 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .email-header {
      background-color: #10b981;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .email-content {
      padding: 24px;
      color: #1f2937;
    }

    .email-content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }

    .email-content p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
      color: #4b5563;
    }

    .plan-card {
      background-color: #f0fdf4;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #10b981;
    }

    .plan-name {
      font-size: 24px;
      font-weight: 700;
      color: #10b981;
      margin: 10px 0;
    }

    .email-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
    }

    .email-footer {
      padding: 24px;
      text-align: center;
      background-color: #f8fafc;
      color: #6b7280;
      font-size: 14px;
    }

    .email-footer a {
      color: #10b981;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>🎉 Abonnement activé !</h1>
        <p>Winform - Votre compte premium est prêt</p>
      </div>

      <div class="email-content">
        <h2>Bonjour ${userName},</h2>

        <p>Nous sommes ravis de vous confirmer que votre abonnement <strong>${planName}</strong> a été activé avec succès !</p>

        <div class="plan-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #111827;">Abonnement activé</h3>
            <span style="background-color: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Premium</span>
          </div>

          <div class="plan-name">${planName}</div>

          <div style="margin-top: 15px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Date d'activation</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${date}</p>
          </div>
        </div>

        <p>Vous avez maintenant accès à toutes les fonctionnalités premium de Winform :</p>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
          <li style="margin-bottom: 8px;">✨ Formulaires illimités</li>
          <li style="margin-bottom: 8px;">✨ Scoring IA avancé</li>
          <li style="margin-bottom: 8px;">✨ Export de données</li>
          <li style="margin-bottom: 8px;">✨ Notifications personnalisées</li>
          <li style="margin-bottom: 8px;">✨ Support prioritaire</li>
        </ul>

        <a href="${dashboardUrl}" class="email-button">Accéder à votre dashboard</a>

        <p style="margin-top: 30px;">Si vous avez des questions ou besoin d'aide, n'hésitez pas à nous contacter.</p>

        <p style="font-weight: 600;">L'équipe Winform</p>
      </div>

      <div class="email-footer">
        <p>© ${new Date().getFullYear()} Winform. Tous droits réservés.</p>
        <p style="margin-top: 8px;">
          <a href="${dashboardUrl}">Dashboard</a> |
          <a href="https://winform.com/privacy">Politique de confidentialité</a> |
          <a href="https://winform.com/support">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * New response notification template
   */
  static newResponse({ formTitle, userName, dashboardUrl, date }) {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nouvelle réponse reçue</title>
  <style type="text/css">
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 20px 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .email-header {
      background-color: #7c3aed;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .email-content {
      padding: 24px;
      color: #1f2937;
    }

    .email-content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }

    .email-content p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
      color: #4b5563;
    }

    .response-card {
      background-color: #faf5ff;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #7c3aed;
    }

    .email-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #7c3aed;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      margin-top: 20px;
    }

    .email-footer {
      padding: 24px;
      text-align: center;
      background-color: #f8fafc;
      color: #6b7280;
      font-size: 14px;
    }

    .email-footer a {
      color: #7c3aed;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>📝 Nouvelle réponse</h1>
        <p>Winform - Notification de réponse</p>
      </div>

      <div class="email-content">
        <h2>Bonjour Admin,</h2>

        <p>Une nouvelle réponse a été soumise pour votre formulaire.</p>

        <div class="response-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: #111827;">${formTitle}</h3>
            <span style="background-color: #f3e8ff; color: #6d28d9; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">Nouvelle réponse</span>
          </div>

          <div style="margin-top: 15px;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Soumis par</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">${userName}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${date}</p>
          </div>
        </div>

        <p>Une nouvelle réponse est disponible pour votre formulaire. Connectez-vous à votre dashboard pour la consulter et l'évaluer.</p>

        <a href="${dashboardUrl}" class="email-button">Voir la réponse</a>

        <p style="margin-top: 30px;">Cordialement,</p>
        <p style="font-weight: 600;">L'équipe Winform</p>
      </div>

      <div class="email-footer">
        <p>© ${new Date().getFullYear()} Winform. Tous droits réservés.</p>
        <p style="margin-top: 8px;">
          <a href="${dashboardUrl}">Dashboard</a> |
          <a href="https://winform.com/privacy">Politique de confidentialité</a> |
          <a href="https://winform.com/support">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }

  /**
   * Welcome email template
   */
  static welcomeEmail({ userName, dashboardUrl, pricingUrl }) {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Bienvenue sur Winform</title>
  <style type="text/css">
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    .email-wrapper {
      width: 100%;
      background-color: #f8fafc;
      padding: 20px 0;
    }

    .email-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .email-header {
      background-color: #2563eb;
      padding: 24px;
      text-align: center;
      color: #ffffff;
    }

    .email-header h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .email-content {
      padding: 24px;
      color: #1f2937;
    }

    .email-content h2 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }

    .email-content p {
      font-size: 16px;
      line-height: 1.6;
      margin-bottom: 16px;
      color: #4b5563;
    }

    .email-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      margin: 10px 0;
    }

    .email-footer {
      padding: 24px;
      text-align: center;
      background-color: #f8fafc;
      color: #6b7280;
      font-size: 14px;
    }

    .email-footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-container">
      <div class="email-header">
        <h1>👋 Bienvenue sur Winform</h1>
        <p>Votre plateforme de formulaires intelligents</p>
      </div>

      <div class="email-content">
        <h2>Bonjour ${userName},</h2>

        <p>Nous sommes ravis de vous accueillir sur Winform ! Votre compte a été créé avec succès et vous pouvez commencer à créer des formulaires intelligents dès maintenant.</p>

        <h3 style="margin: 24px 0 16px 0; font-size: 18px; color: #111827;">Pour commencer :</h3>

        <a href="${dashboardUrl}" class="email-button">🚀 Accéder à votre dashboard</a>

        <p style="margin-top: 20px;">Avec Winform, vous pouvez :</p>
        <ul style="padding-left: 20px; margin-bottom: 20px;">
          <li style="margin-bottom: 8px;">✨ Créer des formulaires personnalisés</li>
          <li style="margin-bottom: 8px;">✨ Recevoir des réponses automatiquement analysées</li>
          <li style="margin-bottom: 8px;">✨ Bénéficier de notre scoring IA avancé</li>
          <li style="margin-bottom: 8px;">✨ Gérer facilement vos inscrits</li>
        </ul>

        <p>Votre compte est actuellement en version gratuite, ce qui vous permet de créer jusqu'à 2 formulaires. Pour débloquer des fonctionnalités avancées, vous pouvez passer à notre offre Premium.</p>

        <a href="${pricingUrl}" class="email-button" style="background-color: #10b981;">💎 Découvrir nos offres</a>

        <p style="margin-top: 30px;">Si vous avez des questions ou besoin d'aide, notre équipe est à votre disposition.</p>

        <p style="font-weight: 600;">L'équipe Winform</p>
      </div>

      <div class="email-footer">
        <p>© ${new Date().getFullYear()} Winform. Tous droits réservés.</p>
        <p style="margin-top: 8px;">
          <a href="${dashboardUrl}">Dashboard</a> |
          <a href="https://winform.com/privacy">Politique de confidentialité</a> |
          <a href="https://winform.com/support">Support</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;
  }
}

module.exports = EmailTemplate;