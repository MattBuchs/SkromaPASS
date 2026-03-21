import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { getOrigin, getRpId, verifyChallenge } from "@/lib/webauthn";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
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

	const challengeToken = req.cookies.get("wa_reg_challenge")?.value;
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

	const { credential: regCredential, deviceName = "Mon appareil" } = body;

	let verification;
	try {
		verification = await verifyRegistrationResponse({
			response: regCredential,
			expectedChallenge: challenge,
			expectedOrigin: getOrigin(req),
			expectedRPID: getRpId(req),
			requireUserVerification: true,
		});
	} catch (e) {
		return NextResponse.json(
			{ error: apiT(locale, "biometricFailed") + " " + e.message },
			{ status: 400 },
		);
	}

	if (!verification.verified || !verification.registrationInfo) {
		return NextResponse.json(
			{ error: apiT(locale, "biometricFailed") },
			{ status: 400 },
		);
	}

	const { credentialID, credentialPublicKey, counter } =
		verification.registrationInfo;

	// credentialID is Uint8Array in v9 — convert to base64url string for storage
	const credentialIdB64 = Buffer.from(credentialID).toString("base64url");

	// Check this credential isn't already registered
	const existing = await prisma.webauthnCredential.findUnique({
		where: { credentialId: credentialIdB64 },
	});
	if (existing) {
		const response = NextResponse.json({
			success: true,
			alreadyRegistered: true,
		});
		response.cookies.delete("wa_reg_challenge");
		return response;
	}

	const created = await prisma.webauthnCredential.create({
		data: {
			userId,
			credentialId: credentialIdB64,
			publicKey: Buffer.from(credentialPublicKey),
			signCount: counter,
			deviceName,
		},
		select: { id: true },
	});

	// Return the DB id so the client can store it in localStorage to identify
	// this specific device later (used by ReauthModal to skip biometric on
	// devices that never registered a credential).
	const response = NextResponse.json({
		success: true,
		credentialDbId: created.id,
	});
	response.cookies.delete("wa_reg_challenge");
	return response;
}
