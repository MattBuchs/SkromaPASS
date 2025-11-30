import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Routes publiques complètes (accessibles sans authentification)
    const publicRoutes = [
        "/",
        "/login",
        "/register",
        "/verify-email",
        "/resend-verification",
        "/verify-2fa",
        "/legal/privacy",
        "/legal/terms",
        "/legal/cookies",
        "/contact",
    ];

    const isPublicRoute = publicRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    // Routes d'API publiques
    const publicApiRoutes = [
        "/api/auth/register",
        "/api/auth/verify-email",
        "/api/auth/resend-verification",
        "/api/auth/check-verification",
        "/api/auth/check-2fa",
        "/api/auth/verify-2fa",
        "/api/auth/[...nextauth]",
        "/api/contact",
    ];

    const isPublicApiRoute = publicApiRoutes.some((route) =>
        pathname.startsWith(route.replace("[...nextauth]", ""))
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

// Configuration du matcher pour spécifier les routes à protéger
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)",
    ],
};
