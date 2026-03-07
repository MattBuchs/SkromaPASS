import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, logSecurityEvent } from "@/lib/security";
import { checkPasswordExposure } from "@/lib/pwned-passwords";

export async function POST(request) {
    try {
        const rateLimitResult = rateLimit(request, { endpoint: "api" });
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de requetes, veuillez reessayer plus tard",
                },
                { status: 429 }
            );
        }

        const { userId, error } = await requireAuth();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        const body = await request.json();
        const candidate = body?.password;

        if (typeof candidate !== "string" || candidate.length < 4) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Le mot a verifier doit contenir au moins 4 caracteres",
                },
                { status: 400 }
            );
        }

        if (candidate.length > 256) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Le mot a verifier est trop long",
                },
                { status: 400 }
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
                    ? "Ce mot apparait dans des fuites connues"
                    : "Aucune fuite publique detectee pour ce mot",
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
                error: "Verification impossible pour le moment",
            },
            { status: 500 }
        );
    }
}
