import { requireAuth } from "@/lib/auth-helpers";
import { decrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { createCipheriv, randomBytes, scryptSync } from "crypto";
import { NextResponse } from "next/server";

// Derive a key from user-supplied export password using scrypt
function deriveKey(exportPassword, salt) {
	return scryptSync(exportPassword, salt, 32);
}

function encryptWithPassword(plaintext, exportPassword) {
	const salt = randomBytes(16);
	const iv = randomBytes(16);
	const key = deriveKey(exportPassword, salt);
	const cipher = createCipheriv("aes-256-gcm", key, iv);
	const encrypted = Buffer.concat([
		cipher.update(plaintext, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();
	return {
		salt: salt.toString("hex"),
		iv: iv.toString("hex"),
		authTag: authTag.toString("hex"),
		data: encrypted.toString("hex"),
	};
}

// GET /api/passwords/export - Exporter le coffre chiffré
export async function GET(request) {
	try {
		const { userId, error } = await requireAuth();
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		const rateLimitResult = rateLimit(request, { endpoint: "api" });
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{ success: false, error: "Trop de requêtes" },
				{ status: 429 },
			);
		}

		const { searchParams } = new URL(request.url);
		const exportPassword = searchParams.get("exportPassword");

		if (!exportPassword || exportPassword.length < 8) {
			return NextResponse.json(
				{
					success: false,
					error: "Mot de passe d'export requis (8 caractères minimum)",
				},
				{ status: 400 },
			);
		}

		// Fetch all user passwords
		const passwords = await prisma.password.findMany({
			where: { userId },
			include: { category: true, folder: true },
			orderBy: { name: "asc" },
		});

		// Fetch all secure notes
		const secureNotes = await prisma.secureNote.findMany({
			where: { userId },
			orderBy: { title: "asc" },
		});

		// Decrypt everything
		const decryptedPasswords = passwords
			.map((p) => {
				try {
					return {
						name: p.name,
						username: p.username,
						email: p.email,
						password: decrypt(p.password),
						website: p.website,
						notes: p.notes,
						isFavorite: p.isFavorite,
						strength: p.strength,
						category: p.category?.name ?? null,
						folder: p.folder?.name ?? null,
						createdAt: p.createdAt,
						updatedAt: p.updatedAt,
					};
				} catch {
					return null;
				}
			})
			.filter(Boolean);

		const decryptedNotes = secureNotes
			.map((n) => {
				try {
					return {
						title: n.title,
						type: n.type,
						content: decrypt(n.encryptedContent),
						createdAt: n.createdAt,
						updatedAt: n.updatedAt,
					};
				} catch {
					return null;
				}
			})
			.filter(Boolean);

		const vaultPayload = JSON.stringify({
			version: "1.0",
			exportedAt: new Date().toISOString(),
			app: "MemKeyPass",
			passwords: decryptedPasswords,
			secureNotes: decryptedNotes,
		});

		// Encrypt the whole vault with user's export password
		const encrypted = encryptWithPassword(vaultPayload, exportPassword);

		const exportData = JSON.stringify({
			format: "mkp",
			version: "1.0",
			...encrypted,
		});

		logSecurityEvent("VAULT_EXPORTED", {
			userId,
			passwordCount: decryptedPasswords.length,
		});

		return new NextResponse(exportData, {
			status: 200,
			headers: {
				"Content-Type": "application/json",
				"Content-Disposition": `attachment; filename="memkeypass-export-${new Date().toISOString().slice(0, 10)}.mkp"`,
			},
		});
	} catch (error) {
		console.error("Error exporting vault:", error);
		return NextResponse.json(
			{ success: false, error: "Erreur lors de l'export" },
			{ status: 500 },
		);
	}
}
