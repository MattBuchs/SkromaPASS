import { requireAuth } from "@/lib/auth-helpers";
import { calculatePasswordStrength, encrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { NextResponse } from "next/server";

// Format détection helpers
function detectFormat(headers) {
	const h = headers.map((s) => s.toLowerCase().trim());
	if (h.includes("login_uri") || h.includes("login_username"))
		return "lastpass";
	if (
		h.includes("url") &&
		h.includes("username") &&
		h.includes("password") &&
		h.includes("name") &&
		!h.includes("login_uri")
	) {
		if (h.includes("totp")) return "bitwarden";
		return "chrome";
	}
	if (
		h.includes("title") &&
		h.includes("username") &&
		h.includes("password") &&
		h.includes("url")
	)
		return "1password";
	return "generic";
}

function parseCSV(text) {
	const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
	if (lines.length < 2) return [];

	// Simple CSV parser (handles quoted fields with commas inside)
	function parseLine(line) {
		const result = [];
		let current = "";
		let inQuotes = false;
		for (let i = 0; i < line.length; i++) {
			const ch = line[i];
			if (ch === '"') {
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
			} else if (ch === "," && !inQuotes) {
				result.push(current.trim());
				current = "";
			} else {
				current += ch;
			}
		}
		result.push(current.trim());
		return result;
	}

	const headers = parseLine(lines[0]);
	const format = detectFormat(headers);
	const rows = [];

	for (let i = 1; i < lines.length; i++) {
		const values = parseLine(lines[i]);
		const row = {};
		headers.forEach((h, idx) => {
			row[h.toLowerCase().trim()] = values[idx] ?? "";
		});
		rows.push(row);
	}

	// Normalize to {name, username, email, password, website, notes}
	return rows
		.map((row) => {
			let entry = {
				name: "",
				username: "",
				email: "",
				password: "",
				website: "",
				notes: "",
			};

			if (format === "lastpass") {
				entry.name = row.name || row.grouping || "";
				entry.username = row.username || "";
				entry.password = row.password || "";
				entry.website = row.url || row.login_uri || "";
				entry.notes = row.extra || row.notes || "";
			} else if (format === "bitwarden") {
				entry.name = row.name || "";
				entry.username = row.login_username || row.username || "";
				entry.email = "";
				entry.password = row.login_password || row.password || "";
				entry.website =
					row.login_uri || row.login_uris || row.url || "";
				entry.notes = row.notes || "";
			} else if (format === "chrome") {
				entry.name = row.name || row.title || "";
				entry.username = row.username || "";
				entry.password = row.password || "";
				entry.website = row.url || "";
				entry.notes = "";
			} else if (format === "1password") {
				entry.name = row.title || row.name || "";
				entry.username = row.username || "";
				entry.password = row.password || "";
				entry.website = row.url || row.website || "";
				entry.notes = row.notes || row["note text"] || "";
			} else {
				// generic fallback
				entry.name =
					row.name ||
					row.title ||
					row.sitename ||
					Object.values(row)[0] ||
					"";
				entry.username = row.username || row.login || row.user || "";
				entry.email = row.email || "";
				entry.password = row.password || row.pass || "";
				entry.website = row.url || row.website || row.uri || "";
				entry.notes = row.notes || row.note || row.extra || "";
			}

			return entry;
		})
		.filter((e) => e.name && e.password); // must have at least name + password
}

// POST /api/passwords/import - Importer des mots de passe depuis un CSV
export async function POST(request) {
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

		const body = await request.json();
		const { csvContent } = body;

		if (!csvContent || typeof csvContent !== "string") {
			return NextResponse.json(
				{ success: false, error: "Contenu CSV manquant" },
				{ status: 400 },
			);
		}

		if (csvContent.length > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ success: false, error: "Fichier trop volumineux (5 Mo max)" },
				{ status: 400 },
			);
		}

		const entries = parseCSV(csvContent);

		if (entries.length === 0) {
			return NextResponse.json(
				{
					success: false,
					error: "Aucun mot de passe valide trouvé dans le fichier",
				},
				{ status: 400 },
			);
		}

		if (entries.length > 1000) {
			return NextResponse.json(
				{
					success: false,
					error: "Maximum 1000 mots de passe par import",
				},
				{ status: 400 },
			);
		}

		// Encrypt all passwords and bulk create
		const dataToCreate = entries.map((e) => ({
			userId,
			name: e.name.slice(0, 100),
			username: e.username?.slice(0, 100) || null,
			email: e.email?.slice(0, 255) || null,
			password: encrypt(e.password),
			website: e.website?.slice(0, 500) || null,
			notes: e.notes?.slice(0, 1000) || null,
			strength: calculatePasswordStrength(e.password),
		}));

		const result = await prisma.password.createMany({
			data: dataToCreate,
			skipDuplicates: false,
		});

		logSecurityEvent("PASSWORDS_IMPORTED", { userId, count: result.count });

		return NextResponse.json({
			success: true,
			imported: result.count,
			total: entries.length,
		});
	} catch (error) {
		console.error("Error importing passwords:", error);
		return NextResponse.json(
			{ success: false, error: "Erreur lors de l'import" },
			{ status: 500 },
		);
	}
}
