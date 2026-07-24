# Winform SaaS - AI-Powered Form Scoring Platform

![Winform Logo](https://img.shields.io/badge/Winform-SaaS-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange)

Winform est un SaaS de création de formulaires en ligne avec scoring IA automatique. L'IA analyse les réponses et attribue un score selon les critères définis par l'admin, avec détection automatique des inscrits qualifiés et notifications intelligentes.

## 🚀 Fonctionnalités Principales

### Pour les Admins
- ✅ **Création de formulaires personnalisés** (texte, choix multiples, fichiers)
- ✅ **Scoring IA** basé sur critères personnalisés (via API OpenRouter)
- ✅ **Tableau de bord admin** avec liste des inscrits et leurs scores
- ✅ **Notifications email** automatiques si score > 70
- ✅ **Gestion complète des inscrits** (CRUD, filtres, export CSV)
- ✅ **Essais gratuits** (2 formulaires par compte)
- ✅ **Paiement MVP** via redirection WhatsApp (+229 66 89 59 73)

### Pour les Utilisateurs
- ✅ **Soumission de réponses** aux formulaires
- ✅ **Visualisation des scores** et feedback IA
- ✅ **Authentification** (email/mot de passe, Google, GitHub)
- ✅ **Gestion de profil** personnelle

## 🏗️ Architecture Technique

### Stack
- **Frontend**: Next.js 14 (React) avec TypeScript et Tailwind CSS
- **Backend**: Node.js + Express
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth (JWT + OAuth Google/GitHub)
- **IA**: OpenRouter API (DeepSeek/Mistral)
- **Email**: Nodemailer/SendGrid via Supabase Functions
- **Déploiement**: Vercel (frontend) + Supabase (backend + DB)

### Tables Supabase
- `users` → Inscrits avec leurs informations
- `forms` → Formulaires créés par les admins
- `responses` → Réponses des utilisateurs
- `scores` → Résultats IA + seuils de qualification
- `notifications` → Notifications système
- `payments` → Transactions de paiement

## 📁 Structure du Projet

```
winform/
├── frontend/                 # Application Next.js
│   ├── app/                 # Pages et layouts
│   ├── components/          # Composants React
│   ├── lib/                 # Utilitaires et clients API
│   └── styles/              # Styles Tailwind
├── backend/                 # API Express
│   ├── routes/             # Endpoints REST
│   │   ├── auth.js         # Authentification
│   │   ├── users.js        # Gestion utilisateurs
│   │   ├── forms.js        # Formulaires
│   │   ├── responses.js    # Réponses
│   │   ├── scores.js       # Scores IA
│   │   └── ai.js           # Service IA
│   ├── migrations/         # Scripts SQL
│   └── index.js            # Serveur principal
└── package.json            # Configuration monorepo
```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Clé API OpenRouter

### 1. Configuration Backend

```bash
cd backend
cp .env.example .env
# Éditer .env avec vos clés API
```

Variables d'environnement requises :
```env
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
JWT_SECRET=votre_secret_jwt
OPENROUTER_API_KEY=votre_cle_openrouter
```

### 2. Installation des Dépendances

```bash
# Installation racine
npm install

# Installation backend
cd backend
npm install

# Installation frontend
cd ../frontend
npm install
```

### 3. Configuration de la Base de Données

1. Créer un projet sur [Supabase](https://supabase.com)
2. Exécuter le script de migration :
```sql
-- Copier le contenu de backend/migrations/001_initial_tables.sql
-- dans l'éditeur SQL de Supabase
```

### 4. Démarrage en Développement

```bash
# Depuis la racine du projet
npm run dev

# Ou démarrer séparément
cd backend && npm run dev   # Port 3001
cd frontend && npm run dev  # Port 3000
```

## 📡 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/google` - OAuth Google
- `POST /api/auth/github` - OAuth GitHub
- `GET /api/auth/me` - Profil utilisateur

### Formulaires
- `GET /api/forms` - Liste des formulaires
- `POST /api/forms` - Créer un formulaire
- `GET /api/forms/:id` - Détails d'un formulaire
- `PUT /api/forms/:id` - Modifier un formulaire
- `DELETE /api/forms/:id` - Supprimer un formulaire

### Scoring IA
- `POST /api/ai/score` - Analyser une réponse avec IA
- `GET /api/ai/scores/:response_id` - Historique des scores

### Utilisateurs (Admin)
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/export/csv` - Export CSV
- `DELETE /api/users/:id` - Supprimer un utilisateur

## 🔧 Services IA

Le service de scoring IA utilise OpenRouter API avec les modèles :
- DeepSeek Chat (par défaut)
- Mistral
- GPT-4 (optionnel)

**Processus de scoring** :
1. Récupération de la réponse et du formulaire
2. Génération d'un prompt d'évaluation
3. Appel à l'API OpenRouter
4. Analyse du résultat JSON
5. Stockage du score dans la base
6. Notification si score > seuil (70)

## 💰 Système de Paiement MVP

Pour la version MVP, le paiement se fait via :
1. Redirection vers WhatsApp (+229 66 89 59 73)
2. Paiement manuel confirmé par l'admin
3. Mise à jour du statut dans la table `payments`

**Plans** :
- **Gratuit** : 2 formulaires maximum
- **Premium** : Formulaires illimités (10,000 XOF/mois)

## 📧 Notifications Email

Les notifications sont déclenchées automatiquement :
- Score > 70 : Notification à l'admin
- Nouvelle réponse : Notification au propriétaire du formulaire
- Paiement confirmé : Notification à l'utilisateur

Configuration SMTP dans `.env` :
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_app
```

## 🚀 Déploiement

### Frontend (Vercel)
```bash
cd frontend
vercel deploy
```

### Backend (Supabase Functions)
1. Déployer les fonctions Edge
2. Configurer les variables d'environnement
3. Déployer la base de données

### Base de Données (Supabase)
1. Importer les migrations
2. Configurer RLS (Row Level Security)
3. Configurer les politiques d'accès

## 📊 Roadmap MVP

- **Semaine 1** : Auth Supabase + Configuration DB
- **Semaine 2** : Création formulaires + Scoring IA
- **Semaine 3** : Dashboard admin + Notifications email
- **Semaine 4** : Paiement WhatsApp + Déploiement

## 🛠️ Développement

### Commandes Utiles
```bash
# Lancer les tests
npm test

# Linter le code
npm run lint

# Exécuter les migrations
npm run migrate

# Générer des données de test
npm run seed
```

### Variables d'Environnement de Développement
```bash
# Backend
PORT=3001
NODE_ENV=development

# Frontend
NEXT_PUBLIC_SUPABASE_URL=votre_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

- Email : support@winform.com
- WhatsApp : +229 66 89 59 73
- Issues GitHub : [Report a bug](https://github.com/yourusername/winform/issues)

---

**Winform** - Transformez vos formulaires en insights intelligents avec l'IA 🚀