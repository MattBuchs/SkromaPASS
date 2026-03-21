import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import { decrypt, encrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const secureNoteSchema = z.object({
	title: z.string().min(1, "Le titre est requis").max(100, "Titre trop long"),
	type: z.enum(["NOTE", "CARD", "IDENTITY", "PIN"]).default("NOTE"),
	content: z.string().min(1, "Le contenu est requis"),
});

// GET /api/secure-notes - Récupérer toutes les notes sécurisées
export async function GET(request) {
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

		const notes = await prisma.secureNote.findMany({
			where: { userId },
			orderBy: { updatedAt: "desc" },
		});

		const decryptedNotes = notes.map((note) => {
			try {
				return { ...note, content: decrypt(note.encryptedContent) };
			} catch {
				return { ...note, content: null };
			}
		});

		return NextResponse.json({ success: true, data: decryptedNotes });
	} catch (error) {
		console.error("Error fetching secure notes:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}

// POST /api/secure-notes - Créer une note sécurisée
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
		const validation = secureNoteSchema.safeParse(body);
		if (!validation.success) {
			return NextResponse.json(
				{
					success: false,
					error: fromZodError(validation.error).message,
				},
				{ status: 400 },
			);
		}

		const { title, type, content } = validation.data;
		const encryptedContent = encrypt(content);

		const note = await prisma.secureNote.create({
			data: { userId, title, type, encryptedContent },
		});

		logSecurityEvent("SECURE_NOTE_CREATED", { userId, noteId: note.id });

		return NextResponse.json({
			success: true,
			data: { ...note, content },
		});
	} catch (error) {
		console.error("Error creating secure note:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
