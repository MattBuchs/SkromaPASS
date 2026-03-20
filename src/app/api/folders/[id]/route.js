import { apiT, getLocale } from "@/lib/api-i18n";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { logSecurityEvent, rateLimit } from "@/lib/security";
import { generateUniqueSlug } from "@/lib/slugify";
import { folderSchema } from "@/lib/validations";
import { NextResponse } from "next/server";
import { fromZodError } from "zod-validation-error";

// PATCH /api/folders/[id] - Modifier un dossier
export async function PATCH(request, { params }) {
	try {
		const locale = getLocale(request);
		const rateLimitResult = rateLimit(request);
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(locale, "tooManyRequests"),
				},
				{ status: 429 },
			);
		}

		const { id } = await params;
		const { userId, error } = await requireAuth(request);
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		const existingFolder = await prisma.folder.findFirst({
			where: { id, userId },
		});

		if (!existingFolder) {
			return NextResponse.json(
				{ success: false, error: "Folder not found" },
				{ status: 404 },
			);
		}

		const body = await request.json();
		const validation = folderSchema.safeParse(body);
		if (!validation.success) {
			const validationError = fromZodError(validation.error);
			return NextResponse.json(
				{ success: false, error: validationError.message },
				{ status: 400 },
			);
		}

		const { name, description, color, icon } = validation.data;

		// Régénérer le slug uniquement si le nom a changé
		let slug = existingFolder.slug;
		if (name !== existingFolder.name) {
			slug = await generateUniqueSlug(name, async (testSlug) => {
				const existing = await prisma.folder.findFirst({
					where: { slug: testSlug, id: { not: id } },
				});
				return !!existing;
			});
		}

		const folder = await prisma.folder.update({
			where: { id },
			data: {
				name,
				slug,
				description,
				color: color || existingFolder.color,
				icon,
			},
		});

		logSecurityEvent("FOLDER_UPDATED", { userId, folderId: id });

		return NextResponse.json({ success: true, data: folder });
	} catch (error) {
		console.error("Error updating folder:", error);
		return NextResponse.json(
			{ success: false, error: "Failed to update folder" },
			{ status: 500 },
		);
	}
}

// DELETE /api/folders/[id] - Supprimer un dossier
export async function DELETE(request, { params }) {
	try {
		// Rate limiting
		const rateLimitResult = rateLimit(request);
		if (!rateLimitResult.allowed) {
			return NextResponse.json(
				{
					success: false,
					error: apiT(getLocale(request), "tooManyRequests"),
				},
				{ status: 429 },
			);
		}

		const { id } = await params;
		// Vérifier l'authentification
		const { userId, error } = await requireAuth(request);
		if (error) {
			return NextResponse.json(
				{ error: error.message },
				{ status: error.status },
			);
		}

		// Vérifier que le dossier appartient à l'utilisateur
		const existingFolder = await prisma.folder.findFirst({
			where: {
				id,
				userId,
			},
		});

		if (!existingFolder) {
			return NextResponse.json(
				{
					success: false,
					error: "Folder not found",
				},
				{ status: 404 },
			);
		}

		// Supprimer le dossier (les mots de passe associés auront folderId = null)
		await prisma.folder.delete({
			where: {
				id,
			},
		});

		logSecurityEvent("FOLDER_DELETED", {
			userId,
			folderId: id,
		});

		return NextResponse.json({
			success: true,
			message: "Folder deleted successfully",
		});
	} catch (error) {
		console.error("Error deleting folder:", error);
		logSecurityEvent("ERROR_DELETING_FOLDER", { error: error.message });
		return NextResponse.json(
			{
				success: false,
				error: "Failed to delete folder",
			},
			{ status: 500 },
		);
	}
}
