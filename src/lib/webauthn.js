import jwt from "jsonwebtoken";

export const RP_NAME = "SkromaPASS";

/**
 * Extract the hostname (without port) from a Next.js Request.
 * Falls back to NEXTAUTH_URL, then 'localhost'.
 */
export function getRpId(req) {
	if (req) {
		const host = req.headers.get("host") || "";
		const hostname = host.split(":")[0];
		if (hostname) return hostname;
	}
	const url = process.env.NEXTAUTH_URL || "http://localhost:3000";
	try {
		return new URL(url).hostname;
	} catch {
		return "localhost";
	}
}

/**
 * Build the full origin from the incoming request (scheme + host).
 * Falls back to NEXTAUTH_URL.
 */
export function getOrigin(req) {
	if (req) {
		// Use the x-forwarded-proto header when behind a proxy/ngrok
		const proto =
			req.headers.get("x-forwarded-proto") ||
			(req.headers.get("host")?.includes("localhost") ? "http" : "https");
		const host = req.headers.get("host") || "localhost:3000";
		return `${proto}://${host}`;
	}
	return process.env.NEXTAUTH_URL || "http://localhost:3000";
}

/** Sign a WebAuthn challenge into a short-lived JWT (2 minutes). */
export function signChallenge(challenge) {
	return jwt.sign({ challenge }, process.env.AUTH_SECRET, {
		expiresIn: "2m",
	});
}

/** Verify and extract the challenge from a signed JWT. Returns null if invalid/expired. */
export function verifyChallenge(token) {
	if (!token) return null;
	try {
		const payload = jwt.verify(token, process.env.AUTH_SECRET);
		return payload.challenge;
	} catch {
		return null;
	}
}
