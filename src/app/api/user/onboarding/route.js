import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/** GET — retourne le statut d'onboarding */
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { hasCompletedOnboarding: true },
    });

    return NextResponse.json({ hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false });
}

/** PUT — marque l'onboarding comme terminé */
export async function PUT() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await prisma.user.update({
        where: { id: session.user.id },
        data: { hasCompletedOnboarding: true },
    });

    // Set a long-lived httpOnly cookie so the middleware can immediately allow
    // the user through to /dashboard without needing a JWT update.
    const response = NextResponse.json({ hasCompletedOnboarding: true });
    response.cookies.set("mkp_onboarded", "1", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 365 * 24 * 60 * 60,
        path: "/",
    });
    return response;
}
