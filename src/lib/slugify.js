/**
 * Génère un slug à partir d'un texte
 * @param {string} text - Le texte à convertir en slug
 * @returns {string} Le slug généré
 */
export function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .normalize("NFD") // Normalise les caractères accentués
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .trim()
        .replace(/\s+/g, "-") // Remplace les espaces par des tirets
        .replace(/[^\w\-]+/g, "") // Supprime les caractères spéciaux
        .replace(/\-\-+/g, "-") // Remplace les tirets multiples par un seul
        .replace(/^-+/, "") // Supprime les tirets au début
        .replace(/-+$/, ""); // Supprime les tirets à la fin
}

/**
 * Génère un slug unique en ajoutant un suffixe numérique si nécessaire
 * @param {string} text - Le texte à convertir en slug
 * @param {Function} checkExists - Fonction async qui vérifie si le slug existe
 * @returns {Promise<string>} Le slug unique
 */
export async function generateUniqueSlug(text, checkExists) {
    let slug = slugify(text);
    let counter = 1;
    let uniqueSlug = slug;

    while (await checkExists(uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }

    return uniqueSlug;
}
