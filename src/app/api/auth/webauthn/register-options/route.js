import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { RP_NAME, getRpId, signChallenge } from "@/lib/webauthn";

export async function GET(req) {
    const { userId, error } = await requireAuth();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const existingCreds = await prisma.webauthnCredential.findMany({
        where: { userId },
        select: { credentialId: true },
    });

    const options = await generateRegistrationOptions({
        rpName: RP_NAME,
        rpID: getRpId(req),
        // v9 expects userID to already be a Base64URLString
        userID: Buffer.from(userId).toString("base64url"),
        userName: userId,
        attestation: "none",
        authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
            residentKey: "discouraged",
        },
        // Pass as Buffer so v9's isoBase64URL.fromBuffer() works correctly
        excludeCredentials: existingCreds.map((c) => ({
            id: Buffer.from(c.credentialId, "base64url"),
            type: "public-key",
        })),
    });

    const challengeToken = signChallenge(options.challenge);
    const response = NextResponse.json(options);
    response.cookies.set("wa_reg_challenge", challengeToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 120,
        path: "/",
    });
    return response;
}
