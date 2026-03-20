import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import { checkPasswordExposure } from "@/lib/pwned-passwords";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { NextResponse } from "next/server";

export async function POST(request) {
	try {
		const locale = getLocale(request);
		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "tooManyRequests"),
				},
				{ status: 429 },
			);
		}

		const { userId, error } = await requireAuth(request);
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		const body = await request.json();
		const candidate = body?.password;

		if (typeof candidate !== "string" || candidate.length < 4) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "passwordCheckMinLength"),
				},
				{ status: 400 },
			);
		}

		if (candidate.length > 256) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "passwordCheckTooLong"),
				},
				{ status: 400 },
			);
		}

		const result = await checkPasswordExposure(candidate);

		logSecurityEvent("MANUAL_PASSWORD_CHECK_EXECUTED", {
			userId,
			isCompromised: result.isCompromised,
			riskLevel: result.riskLevel,
		});

		return NextResponse.json({
			success: true,
			data: {
				...result,
				message: result.isCompromised
					? apiT(locale, "passwordCompromised")
					: apiT(locale, "passwordNotCompromised"),
			},
		});
	} catch (error) {
		console.error("Error checking custom password:", error);
		logSecurityEvent("MANUAL_PASSWORD_CHECK_FAILED", {
			error: error.message,
		});

		return NextResponse.json(
			{
				success: false,
				error: apiT(getLocale(request), "verificationImpossible"),
			},
			{ status: 500 },
		);
	}
}
