import crypto from "crypto";

const HIBP_API_BASE = "https://api.pwnedpasswords.com/range/";

function parsePwnedResponse(text) {
    const suffixMap = new Map();

    for (const line of text.split("\n")) {
        const [suffix, count] = line.trim().split(":");
        if (!suffix || !count) continue;
        suffixMap.set(suffix.toUpperCase(), Number.parseInt(count, 10) || 0);
    }

    return suffixMap;
}

function getRiskLevel(count) {
    if (count >= 1000000) return "critical";
    if (count >= 10000) return "high";
    if (count >= 100) return "medium";
    if (count > 0) return "low";
    return "none";
}

export async function checkPasswordExposure(password) {
    const sha1 = crypto
        .createHash("sha1")
        .update(password, "utf8")
        .digest("hex")
        .toUpperCase();

    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);

    const response = await fetch(`${HIBP_API_BASE}${prefix}`, {
        headers: {
            "Add-Padding": "true",
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`HIBP range API error: ${response.status}`);
    }

    const text = await response.text();
    const suffixMap = parsePwnedResponse(text);
    const breachCount = suffixMap.get(suffix) || 0;

    return {
        breachCount,
        isCompromised: breachCount > 0,
        riskLevel: getRiskLevel(breachCount),
    };
}
