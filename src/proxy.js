import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function proxy(request) {
    const { pathname } = request.nextUrl;

    // Routes publiques complètes (accessibles sans authentification)
    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/verify-email",
        "/resend-verification",
        "/verify-2fa",
        "/legal/mentions-legales",
        "/legal/politique-confidentialite",
        "/legal/cgu",
        "/legal/politique-cookies",
        "/contact",
        "/security",
        "/generator",
    ];

    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Routes d'API publiques (NextAuth uniquement, pas les sous-routes custom)
    const publicApiRoutes = [
        "/api/auth/signin",
        "/api/auth/signout",
        "/api/auth/callback",
        "/api/auth/csrf",
        "/api/auth/session",
        "/api/auth/providers",
        "/api/contact",
    ];

    const isPublicApiRoute = publicApiRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Laisser passer les routes publiques
    if (isPublicRoute || isPublicApiRoute) {
        return NextResponse.next();
    }

    // Pour toutes les autres routes, vérifier l'authentification
    const session = await auth();

    // Si pas de session et route protégée, rediriger vers login
    if (!session) {
        // Si c'est une route API, retourner 401
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        // Si c'est une page, rediriger vers login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Configuration du matcher - exclure explicitement les fichiers statiques et les routes API d'auth
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, robots.txt, manifest.json
         * - files with extensions (images, etc)
         */
        "/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|.*\\..*).*)",
        "/api/:path*",
    ],
};
