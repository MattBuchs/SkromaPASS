import { z } from "zod";

// Schema pour la création/modification de mot de passe
export const passwordSchema = z.object({
    name: z
        .string()
        .min(1, "Le nom est requis")
        .max(100, "Le nom est trop long"),
    username: z.string().max(100).optional().or(z.literal("")),
    email: z
        .string()
        .email("Email invalide")
        .optional()
        .or(z.literal(""))
        .nullable(),
    password: z.string().min(1, "Le mot de passe est requis"),
    website: z
        .union([
            z.string().url("URL invalide"),
            z.literal(""),
            z.null(),
            z.undefined(),
        ])
        .optional(),
    notes: z
        .string()
        .max(1000, "Les notes sont trop longues")
        .optional()
        .or(z.literal(""))
        .nullable(),
    categoryId: z.string().optional().or(z.literal("")).nullable(),
    folderId: z.string().optional().or(z.literal("")).nullable(),
    strength: z.number().min(0).max(100).optional(),
});

// Schema pour la création/modification de dossier
export const folderSchema = z.object({
    name: z
        .string()
        .min(1, "Le nom est requis")
        .max(50, "Le nom est trop long"),
    description: z
        .string()
        .max(200, "La description est trop longue")
        .optional()
        .or(z.literal("")),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Couleur invalide")
        .optional(),
    icon: z.string().max(50).optional().or(z.literal("")),
});

// Schema pour la création/modification de catégorie
export const categorySchema = z.object({
    name: z
        .string()
        .min(1, "Le nom est requis")
        .max(50, "Le nom est trop long"),
    slug: z
        .string()
        .min(1, "Le slug est requis")
        .max(50, "Le slug est trop long")
        .regex(
            /^[a-z0-9-]+$/,
            "Le slug doit contenir uniquement des lettres minuscules, chiffres et tirets"
        ),
    color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Couleur invalide")
        .optional(),
    icon: z.string().max(50).optional().or(z.literal("")),
});

// Schema pour le générateur de mot de passe
export const passwordGeneratorSchema = z
    .object({
        length: z
            .number()
            .min(8, "Minimum 8 caractères")
            .max(128, "Maximum 128 caractères"),
        includeLowercase: z.boolean(),
        includeUppercase: z.boolean(),
        includeNumbers: z.boolean(),
        includeSymbols: z.boolean(),
    })
    .refine(
        (data) =>
            data.includeLowercase ||
            data.includeUppercase ||
            data.includeNumbers ||
            data.includeSymbols,
        { message: "Au moins un type de caractère doit être sélectionné" }
    );

// Schema pour l'authentification
export const loginSchema = z.object({
    email: z.string().email("Email invalide"),
    password: z.string().min(1, "Le mot de passe est requis"),
});

export const registerSchema = z.object({
    name: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(50, "Le nom est trop long"),
    email: z.string().email("Email invalide"),
    password: z
        .string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .regex(
            /[a-z]/,
            "Le mot de passe doit contenir au moins une lettre minuscule"
        )
        .regex(
            /[A-Z]/,
            "Le mot de passe doit contenir au moins une lettre majuscule"
        )
        .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
});
