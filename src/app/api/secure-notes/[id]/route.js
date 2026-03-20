import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import { decrypt, encrypt } from "@/lib/encryption";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { NextResponse } from "next/server";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const updateSecureNoteSchema = z.object({
	title: z
		.string()
		.min(1, "Le titre est requis")
		.max(100, "Titre trop long")
		.optional(),
	type: z.enum(["NOTE", "CARD", "IDENTITY", "PIN"]).optional(),
	content: z.string().min(1, "Le contenu est requis").optional(),
});

// PATCH /api/secure-notes/[id] - Modifier une note sécurisée
export async function PATCH(request, { params }) {
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

		const { id } = await params;
		const existing = await prisma.secureNote.findFirst({
			where: { id, userId },
		});
		if (!existing) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "noteNotFound") },
				{ status: 404 },
			);
		}

		const body = await request.json();
		const validation = updateSecureNoteSchema.safeParse(body);
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
		const updateData = {};
		if (title !== undefined) updateData.title = title;
		if (type !== undefined) updateData.type = type;
		if (content !== undefined)
			updateData.encryptedContent = encrypt(content);

		const updated = await prisma.secureNote.update({
			where: { id },
			data: updateData,
		});

		logSecurityEvent("SECURE_NOTE_UPDATED", { userId, noteId: id });

		return NextResponse.json({
			success: true,
			data: {
				...updated,
				content: content ?? decrypt(updated.encryptedContent),
			},
		});
	} catch (error) {
		console.error("Error updating secure note:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}

// DELETE /api/secure-notes/[id] - Supprimer une note sécurisée
export async function DELETE(request, { params }) {
	try {
		const locale = getLocale(request);
		const { userId, error } = await requireAuth(request);
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		const { id } = await params;
		const existing = await prisma.secureNote.findFirst({
			where: { id, userId },
		});
		if (!existing) {
			return NextResponse.json(
				{ success: false, error: apiT(locale, "noteNotFound") },
				{ status: 404 },
			);
		}

		await prisma.secureNote.delete({ where: { id } });

		logSecurityEvent("SECURE_NOTE_DELETED", { userId, noteId: id });

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error deleting secure note:", error);
		return NextResponse.json(
			{ success: false, error: apiT(getLocale(request), "serverError") },
			{ status: 500 },
		);
	}
}
