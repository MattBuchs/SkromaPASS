import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { getRpId, signChallenge } from "@/lib/webauthn";

export async function GET(req) {
    const { userId, error } = await requireAuth();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const creds = await prisma.webauthnCredential.findMany({
        where: { userId },
        select: { credentialId: true },
    });

    if (creds.length === 0) {
        return NextResponse.json(
            { error: "Aucun appareil biométrique enregistré" },
            { status: 404 }
        );
    }

    // Generate options without allowCredentials — we add them manually below
    // to avoid @hexagon/base64's fromBuffer() re-encoding the stored base64url
    // strings to a different (non-canonical) base64url representation.
    const options = await generateAuthenticationOptions({
        rpID: getRpId(req),
        userVerification: "required",
        timeout: 60000,
    });

    // Inject allowCredentials directly with stored base64url strings + "internal"
    // transport hint so Chrome on Android skips the credential chooser and goes
    // straight to the platform biometric prompt (fingerprint / Face ID).
    options.allowCredentials = creds.map((c) => ({
        id: c.credentialId,
        type: "public-key",
        transports: ["internal"],
    }));

    const challengeToken = signChallenge(options.challenge);
    const response = NextResponse.json(options);
    response.cookies.set("wa_auth_challenge", challengeToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 120,
        path: "/",
    });
    return response;
}
