const fs = require("fs");
const path = require("path");

// Ce script génère des icônes SVG simples pour l'extension
// Exécutez-le avec: node generate-svg-icons.js

const sizes = [16, 32, 48, 128];

const generateSVG = (size) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#14b8a6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond -->
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.15}"/>
  
  <!-- Clé -->
  <g fill="white">
    <!-- Tête de la clé (cercle) -->
    <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.15}"/>
    <!-- Trou dans la tête -->
    <circle cx="${size * 0.3}" cy="${size * 0.3}" r="${
        size * 0.06
    }" fill="#14b8a6"/>
    
    <!-- Tige -->
    <rect x="${size * 0.26}" y="${size * 0.3}" width="${size * 0.08}" height="${
        size * 0.5
    }"/>
    
    <!-- Dents -->
    <rect x="${size * 0.18}" y="${size * 0.72}" width="${
        size * 0.08
    }" height="${size * 0.08}"/>
    <rect x="${size * 0.18}" y="${size * 0.6}" width="${size * 0.08}" height="${
        size * 0.08
    }"/>
    <rect x="${size * 0.34}" y="${size * 0.66}" width="${
        size * 0.08
    }" height="${size * 0.08}"/>
  </g>
</svg>`;

    return svg;
};

const iconsDir = path.join(__dirname, "icons");

// Créer le dossier icons s'il n'existe pas
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

console.log("🎨 Génération des icônes SVG...\n");

sizes.forEach((size) => {
    const svg = generateSVG(size);
    const filePath = path.join(iconsDir, `icon${size}.svg`);
    fs.writeFileSync(filePath, svg);
    console.log(`✅ Créé: icon${size}.svg`);
});

console.log("\n✨ Icônes SVG générées avec succès!");
console.log("\n💡 Note: Pour Chrome, vous devez les convertir en PNG.");
console.log("   Ouvrez extension/generate-icons.html dans votre navigateur.");
