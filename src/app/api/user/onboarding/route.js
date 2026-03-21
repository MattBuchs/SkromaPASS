import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

/** GET — retourne le statut d'onboarding */
export async function GET(req) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json(
			{ error: apiT(getLocale(req), "unauthenticated") },
			{ status: 401 },
		);
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { hasCompletedOnboarding: true },
	});

	return NextResponse.json({
		hasCompletedOnboarding: user?.hasCompletedOnboarding ?? false,
	});
}

/** PUT — marque l'onboarding comme terminé */
export async function PUT(req) {
	const session = await auth();
	if (!session?.user?.id) {
		return NextResponse.json(
			{ error: apiT(getLocale(req), "unauthenticated") },
			{ status: 401 },
		);
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
