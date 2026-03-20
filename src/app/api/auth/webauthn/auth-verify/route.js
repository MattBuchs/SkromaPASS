import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { getOrigin, getRpId, verifyChallenge } from "@/lib/webauthn";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { NextResponse } from "next/server";

export async function POST(req) {
	const { userId, error } = await requireAuth();
	if (error) {
		return NextResponse.json(
			{ error: error.message },
			{ status: error.status },
		);
	}
	const locale = getLocale(req);

	const challengeToken = req.cookies.get("wa_auth_challenge")?.value;
	const challenge = verifyChallenge(challengeToken);
	if (!challenge) {
		return NextResponse.json(
			{ error: apiT(locale, "challengeExpired") },
			{ status: 400 },
		);
	}

	let body;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: apiT(locale, "invalidBody") },
			{ status: 400 },
		);
	}

	const { credential: authCredential } = body;

	// Find the matching stored credential
	const credRecord = await prisma.webauthnCredential.findUnique({
		where: { credentialId: authCredential.id },
	});

	if (!credRecord || credRecord.userId !== userId) {
		return NextResponse.json(
			{ error: apiT(locale, "deviceNotRecognized") },
			{ status: 404 },
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
				credentialID: Buffer.from(credRecord.credentialId, "base64url"),
				credentialPublicKey: new Uint8Array(credRecord.publicKey),
				counter: credRecord.signCount,
			},
		});
	} catch (e) {
		return NextResponse.json(
			{
				error:
					apiT(locale, "biometricVerificationFailed") +
					" " +
					e.message,
			},
			{ status: 400 },
		);
	}

	if (!verification.verified) {
		return NextResponse.json(
			{ error: apiT(locale, "biometricVerificationFailed") },
			{ status: 401 },
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
