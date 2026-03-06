import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { getRpId, getOrigin, verifyChallenge } from "@/lib/webauthn";

export async function POST(req) {
    const { userId, error } = await requireAuth();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const challengeToken = req.cookies.get("wa_auth_challenge")?.value;
    const challenge = verifyChallenge(challengeToken);
    if (!challenge) {
        return NextResponse.json(
            { error: "Challenge expiré ou invalide. Réessayez." },
            { status: 400 }
        );
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const { credential: authCredential } = body;

    // Find the matching stored credential
    const credRecord = await prisma.webauthnCredential.findUnique({
        where: { credentialId: authCredential.id },
    });

    if (!credRecord || credRecord.userId !== userId) {
        return NextResponse.json(
            { error: "Appareil non reconnu." },
            { status: 404 }
        );
    }

    let verification;
    try {
        verification = await verifyAuthenticationResponse({
            response: authCredential,
            expectedChallenge: challenge,
            expectedOrigin: getOrigin(req),
            expectedRPID: getRpId(req),
            requireUserVerification: true,
            authenticator: {
                // v9 API uses credentialID (Uint8Array) and credentialPublicKey (Uint8Array)
                credentialID: Buffer.from(credRecord.credentialId, "base64url"),
                credentialPublicKey: new Uint8Array(credRecord.publicKey),
                counter: credRecord.signCount,
            },
        });
    } catch (e) {
        return NextResponse.json(
            { error: "Vérification biométrique échouée : " + e.message },
            { status: 400 }
        );
    }

    if (!verification.verified) {
        return NextResponse.json(
            { error: "Vérification biométrique échouée." },
            { status: 401 }
        );
    }

    // Update sign count to prevent replay attacks
    await prisma.webauthnCredential.update({
        where: { credentialId: credRecord.credentialId },
        data: { signCount: verification.authenticationInfo.newCounter },
    });

    const response = NextResponse.json({ success: true });
    response.cookies.delete("wa_auth_challenge");
    return response;
}
