import { auth } from "@/auth";
import { apiT, getLocale } from "@/lib/api-i18n";
import { NextResponse } from "next/server";

export async function GET(request) {
	try {
		const session = await auth();

		if (!session || !session.user) {
			return NextResponse.json(
				{ error: apiT(getLocale(request), "unauthenticated") },
				{ status: 401 },
			);
		}

		return NextResponse.json({ session });
	} catch (error) {
		console.error("Erreur lors de la récupération de la session:", error);
		return NextResponse.json(
			{ error: apiT(getLocale(request), "anErrorOccurred") },
			{ status: 500 },
		);
	}
}
