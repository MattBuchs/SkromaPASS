import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { loginSchema } from "@/lib/validations";
import prisma from "@/lib/prisma";
import { verify2FAVerifiedToken } from "@/lib/auth-tokens";

export const { handlers, auth, signIn, signOut } = NextAuth({
    trustHost: true,
    session: {
        strategy: "jwt",
        maxAge: 15 * 24 * 60 * 60, // 15 jours en secondes
        updateAge: 24 * 60 * 60, // Renouveler la session toutes les 24h si l'utilisateur est actif
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
                verifiedToken: { label: "Token 2FA vérifié", type: "text" },
            },
            async authorize(credentials) {
                try {
                    // Si un token 2FA vérifié est fourni, l'utiliser directement
                    if (credentials.verifiedToken) {
                        const payload = verify2FAVerifiedToken(
                            credentials.verifiedToken
                        );

                        if (!payload) {
                            console.error(
                                "Token 2FA vérifié invalide ou expiré"
                            );
                            return null;
                        }

                        // Récupérer l'utilisateur
                        const user = await prisma.user.findUnique({
                            where: { id: payload.userId },
                        });

                        if (!user) {
                            return null;
                        }

                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        };
                    }

                    // Sinon, authentification classique
                    // Validation avec Zod
                    const validatedFields = loginSchema.parse(credentials);

                    // Recherche de l'utilisateur
                    const user = await prisma.user.findUnique({
                        where: {
                            email: validatedFields.email,
                        },
                    });

                    if (!user || !user.passwordHash) {
                        return null;
                    }

                    // Vérification du mot de passe
                    const passwordMatch = await bcrypt.compare(
                        validatedFields.password,
                        user.passwordHash
                    );

                    if (!passwordMatch) {
                        return null;
                    }

                    // Vérification que l'email a été vérifié
                    if (!user.emailVerified) {
                        throw new Error("EMAIL_NOT_VERIFIED");
                    }

                    // Retour de l'utilisateur
                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                    };
                } catch (error) {
                    console.error("Erreur d'authentification:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            // Mettre à jour le timestamp à chaque requête pour renouveler la session
            if (trigger === "update" || trigger === "signIn") {
                token.iat = Math.floor(Date.now() / 1000);
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
            }
            return session;
        },
    },
});
