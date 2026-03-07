# 🔐 MemKeyPass

**Gestionnaire de mots de passe sécurisé et moderne**

MemKeyPass est une application Next.js complète pour gérer vos mots de passe en toute sécurité. Elle offre un système d'authentification robuste avec vérification d'email, un chiffrement côté client, et une interface utilisateur intuitive.

---

## ✨ Fonctionnalités principales

### Sécurité

-   🔒 **Authentification sécurisée** avec NextAuth.js
-   ✉️ **Vérification d'email obligatoire** pour les nouveaux comptes
-   🔐 **Chiffrement côté client** des mots de passe
-   🛡️ **Tokens cryptographiquement sécurisés**
-   🔑 **Hachage bcrypt** pour les mots de passe utilisateurs
-   ⏱️ **Sessions gérées** avec JWT

### Gestion des mots de passe

-   📁 **Organisation par dossiers** avec slugs personnalisés
-   🏷️ **Catégorisation** des mots de passe
-   🔍 **Recherche rapide** et filtrage
-   📋 **Copie en un clic** des identifiants
-   🎨 **Personnalisation** (couleurs, icônes)
-   🔄 **Générateur de mots de passe** sécurisés

### Interface utilisateur

-   🎨 **Design moderne** avec Tailwind CSS
-   📱 **Responsive** sur tous les appareils
-   🌗 **Interface intuitive** et épurée
-   ⚡ **Performances optimisées** avec React Query
-   🎯 **Navigation fluide** avec Next.js App Router

---

## 🚀 Démarrage rapide

### Prérequis

-   Node.js 18+
-   PostgreSQL
-   npm ou yarn

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/MattBuchs/MemKeyPass.git
cd memkeypass

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# 4. Configurer la base de données
npx prisma generate
npx prisma migrate deploy

# 5. (Optionnel) Marquer les utilisateurs existants comme vérifiés
node scripts/mark-existing-users-verified.js

# 6. Démarrer en développement
npm run dev
```

L'application sera accessible sur [https://memkeypass.fr](https://memkeypass.fr)

---

## 📋 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Base de données
DATABASE_URL="postgresql://user:password@host:port/database"
DIRECT_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="https://memkeypass.fr"
NEXTAUTH_SECRET="votre-secret-super-securise"

# Email (optionnel en dev, obligatoire en prod)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Environment
NODE_ENV="development"
```

Voir `.env.example` pour plus de détails.

### Configuration email

En **développement**, les URLs de vérification s'affichent dans la console.

En **production**, configurez un service d'email :

-   **Resend** (recommandé) - [resend.com](https://resend.com)
-   **SendGrid** - [sendgrid.com](https://sendgrid.com)
-   **SMTP** (Gmail, Outlook, etc.)

Voir `VERIFICATION_EMAIL.md` pour les instructions détaillées.

---

## 🛠️ Commandes disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Production
npm run build        # Créer le build de production
npm run start        # Démarrer le serveur de production

# Base de données
npm run db:seed      # Peupler la base avec des données de test
npx prisma studio    # Interface visuelle pour la base de données
npx prisma generate  # Générer le client Prisma
npx prisma migrate dev # Créer et appliquer une migration

# Migration des utilisateurs
node scripts/mark-existing-users-verified.js

# Linting
npm run lint         # Vérifier le code avec ESLint
```

---

## 📁 Structure du projet

```
memkeypass/
├── prisma/                      # Schéma et migrations Prisma
│   ├── schema.prisma
│   └── migrations/
├── public/                      # Fichiers statiques
├── src/
│   ├── app/                     # Pages et routes API (App Router)
│   │   ├── api/
│   │   │   ├── auth/           # Routes d'authentification
│   │   │   ├── passwords/      # CRUD mots de passe
│   │   │   ├── folders/        # Gestion des dossiers
│   │   │   └── categories/     # Gestion des catégories
│   │   ├── dashboard/          # Tableau de bord
│   │   ├── login/              # Page de connexion
│   │   ├── register/           # Page d'inscription
│   │   ├── verify-email/       # Vérification d'email
│   │   └── ...
│   ├── components/             # Composants React réutilisables
│   │   ├── ui/                 # Composants UI basiques
│   │   ├── layout/             # Header, Sidebar
│   │   └── modals/             # Modales
│   ├── hooks/                  # Hooks personnalisés
│   ├── lib/                    # Utilitaires et configurations
│   │   ├── prisma.js           # Client Prisma
│   │   ├── auth-helpers.js     # Helpers d'authentification
│   │   ├── encryption.js       # Chiffrement des mots de passe
│   │   ├── email.js            # Gestion des emails
│   │   └── validations.js      # Schémas Zod
│   └── types/                  # Définitions de types
├── scripts/                    # Scripts utilitaires
├── .env.example               # Exemple de configuration
├── VERIFICATION_EMAIL.md      # Documentation vérification email
├── TESTING_VERIFICATION.md    # Guide de tests
├── QUICK_START.md            # Démarrage rapide
└── README.md                 # Ce fichier
```

---

## 🔐 Système de vérification d'email

### Fonctionnement

1. **Inscription** : L'utilisateur crée un compte
2. **Token généré** : Un token cryptographique unique est créé
3. **Email envoyé** : L'utilisateur reçoit un email avec le lien de vérification
4. **Vérification** : L'utilisateur clique sur le lien
5. **Activation** : Le compte est activé, connexion possible

### Sécurité

-   ✅ Tokens cryptographiquement sécurisés (32 bytes)
-   ✅ Expiration automatique après 24 heures
-   ✅ Usage unique (suppression après utilisation)
-   ✅ Connexion bloquée si email non vérifié
-   ✅ Protection contre les abus

### Documentation complète

-   **VERIFICATION_EMAIL.md** - Architecture et implémentation
-   **TESTING_VERIFICATION.md** - Guide de tests complet
-   **QUICK_START.md** - Démarrage rapide

---

## 🧪 Tests

### Test manuel

```bash
# 1. Démarrer le serveur
npm run dev

# 2. S'inscrire sur /register

# 3. Vérifier la console serveur pour l'URL de vérification

# 4. Cliquer sur l'URL ou la copier dans le navigateur

# 5. Se connecter sur /login
```

### Test automatisé

Voir `TESTING_VERIFICATION.md` pour la checklist complète.

---

## 🏗️ Technologies utilisées

### Frontend

-   **Next.js 16** - Framework React avec App Router
-   **React 19** - Bibliothèque UI
-   **Tailwind CSS 4** - Framework CSS utilitaire
-   **React Query** - Gestion de l'état serveur
-   **Lucide React** - Icônes

### Backend

-   **Next.js API Routes** - API REST
-   **NextAuth.js 5** - Authentification
-   **Prisma** - ORM pour PostgreSQL
-   **PostgreSQL** - Base de données
-   **bcryptjs** - Hachage de mots de passe
-   **crypto-js** - Chiffrement côté client

### Validation & Sécurité

-   **Zod** - Validation de schémas
-   **JWT** - Tokens de session
-   **crypto (Node.js)** - Génération de tokens sécurisés

---

## 🔒 Sécurité

### Bonnes pratiques implémentées

-   ✅ Authentification robuste avec NextAuth.js
-   ✅ Vérification d'email obligatoire
-   ✅ Hachage bcrypt des mots de passe (12 rounds)
-   ✅ Chiffrement AES des données sensibles
-   ✅ Tokens CSRF automatiques
-   ✅ Sessions sécurisées avec JWT
-   ✅ Validation stricte des entrées (Zod)
-   ✅ Protection contre les injections SQL (Prisma)
-   ✅ Messages d'erreur génériques (pas de fuite d'info)

### À considérer pour la production

-   ⚠️ Rate limiting sur les routes sensibles
-   ⚠️ Authentification à deux facteurs (2FA)
-   ⚠️ Logs de sécurité détaillés
-   ⚠️ Monitoring et alertes
-   ⚠️ HTTPS obligatoire
-   ⚠️ Sauvegardes automatiques

---

## 📚 Documentation

-   [QUICK_START.md](./QUICK_START.md) - Démarrage rapide
-   [VERIFICATION_EMAIL.md](./VERIFICATION_EMAIL.md) - Système de vérification d'email
-   [TESTING_VERIFICATION.md](./TESTING_VERIFICATION.md) - Tests et validation
-   [.env.example](./.env.example) - Configuration des variables

---

## 🌐 Extension de Navigateur

MemKeyPass propose une **extension Chrome/Firefox** pour l'auto-remplissage et l'enregistrement automatique des mots de passe sur les sites web.

### ✨ Fonctionnalités de l'extension

-   🔑 **Auto-remplissage intelligent** des formulaires de connexion
-   💾 **Enregistrement automatique** des nouveaux mots de passe
-   🎯 **Détection automatique** des champs login/password
-   🔒 **Synchronisation sécurisée** avec votre coffre-fort MemKeyPass
-   🎨 **Interface moderne** et intuitive
-   📊 **Badge** indiquant le nombre de mots de passe disponibles

### 🚀 Installation rapide

```bash
# 1. Générer les icônes de l'extension
# Ouvrez extension/generate-icons.html dans votre navigateur
# Téléchargez les icônes et placez-les dans extension/icons/

# 2. Charger l'extension dans Chrome
# - Allez sur chrome://extensions/
# - Activez "Mode développeur"
# - Cliquez sur "Charger l'extension non empaquetée"
# - Sélectionnez le dossier extension/

# 3. C'est prêt ! 🎉
```

### 📚 Documentation

Consultez [extension/README.md](./extension/README.md) pour :

-   Installation détaillée
-   Guide d'utilisation
-   APIs disponibles
-   Débogage et développement
-   Publication sur Chrome Web Store

### 🧪 Page de test

Ouvrez `extension/test-page.html` dans votre navigateur pour tester l'extension sur une page de démonstration.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👨‍💻 Auteur

**Matt Buchs** - [GitHub](https://github.com/MattBuchs)

---

## 🙏 Remerciements

-   Next.js pour le framework exceptionnel
-   NextAuth.js pour l'authentification simplifiée
-   Prisma pour l'ORM moderne
-   Tailwind CSS pour le design rapide et élégant
-   La communauté open source

---

## 📞 Support

Pour toute question ou problème :

-   📧 Email : [votre-email]
-   🐛 Issues : [GitHub Issues](https://github.com/MattBuchs/MemKeyPass/issues)
-   📖 Documentation : Voir les fichiers .md dans le projet

---

**MemKeyPass** - Gérez vos mots de passe en toute sécurité 🔐
