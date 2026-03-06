import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";
import { requireAuth } from "@/lib/auth-helpers";
import { rateLimit, logSecurityEvent } from "@/lib/security";
import { checkPasswordExposure } from "@/lib/pwned-passwords";

export async function POST(request) {
    try {
        const rateLimitResult = rateLimit(request, { endpoint: "api" });
        if (!rateLimitResult.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Trop de requetes, veuillez reessayer plus tard",
                },
                { status: 429 }
            );
        }

        const { userId, error } = await requireAuth();
        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: error.status }
            );
        }

        const passwords = await prisma.password.findMany({
            where: { userId },
            select: {
                id: true,
                name: true,
                website: true,
                password: true,
                compromised: true,
                compromisedReason: true,
            },
        });

        if (passwords.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    scanned: 0,
                    compromisedDetected: 0,
                    updatedEntries: 0,
                    compromisedEntries: [],
                    message: "Aucun mot de passe a analyser.",
                },
            });
        }

        const plaintextById = new Map();
        for (const item of passwords) {
            try {
                plaintextById.set(item.id, decrypt(item.password));
            } catch {
                plaintextById.set(item.id, null);
            }
        }

        const uniqueByPlain = new Map();
        for (const [id, plain] of plaintextById.entries()) {
            if (!plain) continue;
            if (!uniqueByPlain.has(plain)) {
                uniqueByPlain.set(plain, []);
            }
            uniqueByPlain.get(plain).push(id);
        }

        const breachCountByPlain = new Map();
        for (const plain of uniqueByPlain.keys()) {
            const result = await checkPasswordExposure(plain);
            breachCountByPlain.set(plain, result.breachCount);
        }

        const updates = [];
        const compromisedEntries = [];

        for (const item of passwords) {
            const plain = plaintextById.get(item.id);
            const breachCount = plain ? breachCountByPlain.get(plain) || 0 : 0;
            const isCompromised = breachCount > 0;

            const shouldUpdate =
                item.compromised !== isCompromised ||
                (isCompromised && !item.compromisedReason) ||
                (!isCompromised && item.compromisedReason);

            if (shouldUpdate) {
                updates.push(
                    prisma.password.update({
                        where: { id: item.id },
                        data: {
                            compromised: isCompromised,
                            compromisedAt: isCompromised ? new Date() : null,
                            compromisedReason: isCompromised
                                ? `Detecte dans des fuites publiques (${breachCount} occurrences)`
                                : null,
                        },
                    })
                );
            }

            if (isCompromised) {
                compromisedEntries.push({
                    id: item.id,
                    name: item.name,
                    website: item.website,
                    breachCount,
                });
            }
        }

        if (updates.length > 0) {
            await Promise.all(updates);
        }

        compromisedEntries.sort((a, b) => b.breachCount - a.breachCount);

        logSecurityEvent("BREACH_SCAN_EXECUTED", {
            userId,
            scanned: passwords.length,
            compromisedDetected: compromisedEntries.length,
        });

        return NextResponse.json({
            success: true,
            data: {
                scanned: passwords.length,
                compromisedDetected: compromisedEntries.length,
                updatedEntries: updates.length,
                compromisedEntries: compromisedEntries.slice(0, 10),
                message:
                    compromisedEntries.length > 0
                        ? "Scan termine: des mots de passe exposes ont ete detectes."
                        : "Scan termine: aucune fuite publique detectee.",
            },
        });
    } catch (error) {
        console.error("Error running breach scan:", error);
        logSecurityEvent("BREACH_SCAN_FAILED", { error: error.message });
        return NextResponse.json(
            {
                success: false,
                error: "Impossible de lancer le scan de fuite pour le moment",
            },
            { status: 500 }
        );
    }
}
