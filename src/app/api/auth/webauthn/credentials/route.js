import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";

/** GET — list the user's registered biometric devices */
export async function GET() {
    const { userId, error } = await requireAuth();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const credentials = await prisma.webauthnCredential.findMany({
        where: { userId },
        select: {
            id: true,
            credentialId: true,
            deviceName: true,
            createdAt: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ credentials, count: credentials.length });
}

/** DELETE — remove a specific credential by its DB id */
export async function DELETE(req) {
    const { userId, error } = await requireAuth();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: error.status });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
    }

    const { id } = body;
    if (!id) {
        return NextResponse.json({ error: "Identifiant requis" }, { status: 400 });
    }

    // Verify ownership before deleting
    const credential = await prisma.webauthnCredential.findUnique({
        where: { id },
        select: { userId: true },
    });

    if (!credential || credential.userId !== userId) {
        return NextResponse.json({ error: "Appareil non trouvé" }, { status: 404 });
    }

    await prisma.webauthnCredential.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
