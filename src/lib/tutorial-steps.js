// Toutes les étapes du tutoriel multi-pages
export const tutorialSteps = [
    // Dashboard - Étapes 1-5
    {
        page: "/dashboard",
        target: "[data-tour='stats']",
        title: "Bienvenue sur MemKeyPass !",
        description:
            "Découvrez votre tableau de bord. Ici vous pouvez voir vos statistiques de sécurité : le nombre total de mots de passe, les mots de passe forts et votre score de sécurité global.",
    },
    {
        page: "/dashboard",
        target: "[data-tour='add-password']",
        title: "Ajouter un mot de passe",
        description:
            "Cliquez ici pour ajouter un nouveau mot de passe. Vous pourrez entrer le nom du site, vos identifiants et même générer un mot de passe sécurisé automatiquement.",
    },
    {
        page: "/dashboard",
        target: "[data-tour='search']",
        title: "Rechercher rapidement",
        description:
            "Utilisez la barre de recherche pour retrouver instantanément vos mots de passe par nom, site web ou URL.",
    },
    {
        page: "/dashboard",
        target: "[data-tour='filters']",
        title: "Filtrer par catégorie",
        description:
            "Organisez vos mots de passe par catégories : Divertissement, Professionnel, etc. Cliquez sur une catégorie pour filtrer l'affichage.",
    },
    {
        page: "/dashboard",
        target: "aside",
        title: "Menu de navigation",
        description:
            "Accédez à toutes les fonctionnalités via ce menu latéral : générateur de mots de passe, dossiers, sécurité, contact et paramètres.",
        navigateTo: "/folders",
    },

    // Folders - Étapes 6-8
    {
        page: "/folders",
        target: "[data-tour='folders-intro']",
        title: "Organisez avec des dossiers",
        description:
            "Les dossiers vous permettent d'organiser vos mots de passe comme vous le souhaitez. C'est parfait pour une meilleure organisation !",
    },
    {
        page: "/folders",
        target: "[data-tour='create-folder']",
        title: "Créer un dossier",
        description:
            "Cliquez ici pour créer un nouveau dossier. Vous pourrez lui donner un nom, une description et même choisir une couleur pour le personnaliser.",
    },
    {
        page: "/folders",
        target: "[data-tour='folder-list']",
        title: "Accéder à vos dossiers",
        description:
            "Vos dossiers apparaissent ici. Cliquez sur un dossier pour voir tous les mots de passe qu'il contient. Vous pouvez ajouter des mots de passe directement depuis le dossier.",
        navigateTo: "/settings",
    },

    // Settings - Étapes 9-11
    {
        page: "/settings",
        target: "[data-tour='2fa-section']",
        title: "Sécurité renforcée : Double authentification",
        description:
            "La double authentification (2FA) ajoute une couche de sécurité supplémentaire. Même si quelqu'un connaît votre mot de passe, il ne pourra pas accéder à votre compte sans le code 2FA. Donc je vous recommande vivement de l'activer !",
    },
    {
        page: "/settings",
        target: "[data-tour='pin-section']",
        title: "Accès rapide avec le code PIN",
        description:
            "Configurez un code PIN (4 à 8 chiffres) pour accéder rapidement à vos mots de passe sans avoir à saisir un mot de passe à rallonge à chaque fois. C'est pratique et sécurisé !",
    },
    {
        page: "/settings",
        target: null, // Pas de cible spécifique pour la dernière étape
        title: "Tutoriel terminé !",
        description:
            "Vous connaissez maintenant toutes les fonctionnalités principales de MemKeyPass ! N'hésitez pas à explorer l'application et à sécuriser tous vos mots de passe. 🔒",
    },
];
