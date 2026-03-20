import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import { calculatePasswordStrength, encrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { createDecipheriv, scryptSync } from "crypto";
import { NextResponse } from "next/server";

function decryptVault(mkpData, importPassword) {
	const { salt, iv, authTag, data } = mkpData;
	const key = scryptSync(importPassword, Buffer.from(salt, "hex"), 32);
	const decipher = createDecipheriv(
		"aes-256-gcm",
		key,
		Buffer.from(iv, "hex"),
	);
	decipher.setAuthTag(Buffer.from(authTag, "hex"));
	const decrypted = Buffer.concat([
		decipher.update(Buffer.from(data, "hex")),
		decipher.final(),
	]);
	return JSON.parse(decrypted.toString("utf8"));
}

// POST /api/passwords/import/mkp - Importer un coffre chiffré .mkp
export async function POST(request) {
	try {
		const locale = getLocale(request);
		const { userId, error } = await requireAuth(request);
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "tooManyRequestsShort") },
				{ status: 429 },
			);
		}

		const body = await request.json();
		const { mkpContent, importPassword } = body;

		if (!mkpContent || typeof mkpContent !== "string") {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "mkpMissing") },
				{ status: 400 },
			);
		}

		if (!importPassword || typeof importPassword !== "string") {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "importPasswordMissing"),
				},
				{ status: 400 },
			);
		}

		let mkpData;
		try {
			mkpData = JSON.parse(mkpContent);
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "mkpInvalidJson"),
				},
				{ status: 400 },
			);
		}

		if (
			mkpData.format !== "mkp" ||
			!mkpData.salt ||
			!mkpData.iv ||
			!mkpData.authTag ||
			!mkpData.data
		) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "mkpInvalidFormat") },
				{ status: 400 },
			);
		}

		let vault;
		try {
			vault = decryptVault(mkpData, importPassword);
		} catch {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "wrongPasswordOrCorrupted"),
				},
				{ status: 400 },
			);
		}

		const passwords = vault.passwords ?? [];

		if (passwords.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "noPasswordsInExport"),
				},
				{ status: 400 },
			);
		}

		if (passwords.length > 1000) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "maxImportExceeded"),
				},
				{ status: 400 },
			);
		}

		const dataToCreate = passwords.map((p) => ({
			userId,
			name: (p.name ?? "Sans nom").slice(0, 100),
			username: p.username?.slice(0, 100) || null,
			email: p.email?.slice(0, 255) || null,
			password: encrypt(p.password ?? ""),
			website: p.website?.slice(0, 500) || null,
			notes: p.notes?.slice(0, 1000) || null,
			strength: calculatePasswordStrength(p.password ?? ""),
		}));

		await prisma.password.createMany({ data: dataToCreate });

		logSecurityEvent("VAULT_IMPORTED_MKP", {
			userId,
			passwordCount: dataToCreate.length,
		});

		return NextResponse.json({
			success: true,
			imported: dataToCreate.length,
		});
	} catch (error) {
		console.error("Error importing mkp vault:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
