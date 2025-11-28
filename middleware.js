import { NextResponse } from "next/server";

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Routes publiques (pas de redirection)
    const publicRoutes = ["/login", "/register"];
    const isPublicRoute = publicRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Routes d'API publiques
    const publicApiRoutes = ["/api/auth"];
    const isPublicApiRoute = publicApiRoutes.some((route) =>
        pathname.startsWith(route)
    );

    // Laisser passer les routes publiques et les API publiques
    if (isPublicRoute || isPublicApiRoute) {
        return NextResponse.next();
    }

    // Pour les autres routes, on laisse passer (la protection se fera côté serveur/client)
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
