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

    const options = await generateAuthenticationOptions({
        rpID: getRpId(req),
        userVerification: "required",
        // Pass as Buffer so v9's isoBase64URL.fromBuffer() works correctly
        allowCredentials: creds.map((c) => ({
            id: Buffer.from(c.credentialId, "base64url"),
            type: "public-key",
        })),
        timeout: 60000,
    });

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
