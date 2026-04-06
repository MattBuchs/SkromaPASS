"use client";

import Logo from "@/components/layout/Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
	AlertTriangle,
	Ban,
	Clock,
	Copy,
	Eye,
	EyeOff,
	Loader2,
	LockOpen,
	TriangleAlert,
	XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

function CopyButton({ text }) {
	const { t } = useLanguage();
	const [copied, setCopied] = useState(false);
	function handleCopy() {
		navigator.clipboard.writeText(text);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}
	return (
		<button
			onClick={handleCopy}
			className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded bg-[#098479]/10 text-[#098479] hover:bg-[#098479]/20 transition-colors border border-[#098479]/30 cursor-pointer"
		>
			<Copy size={11} />
			{copied ? t("shareToken.copied") : t("shareToken.copy")}
		</button>
	);
}

function Field({ label, value, masked }) {
	const { t } = useLanguage();
	const [revealed, setRevealed] = useState(!masked);
	if (!value) return null;
	return (
		<div className="py-3 border-b border-gray-100 last:border-0">
			<p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
				{label}
			</p>
			<div className="flex items-center gap-2">
				<span className="text-gray-900 font-mono text-sm break-all">
					{masked && !revealed ? "••••••••••••" : value}
				</span>
				{masked && (
					<button
						onClick={() => setRevealed(!revealed)}
						className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors underline cursor-pointer"
					>
						{revealed ? (
							<>
								<EyeOff size={12} /> {t("shareToken.hide")}
							</>
						) : (
							<>
								<Eye size={12} /> {t("shareToken.show")}
							</>
						)}
					</button>
				)}
				{(!masked || revealed) && <CopyButton text={value} />}
			</div>
		</div>
	);
}

export default function SharePage() {
	const { t, locale } = useLanguage();
	const { theme } = useTheme();
	const params = useParams();
	const token = params?.token;
	// States: loading → ready → revealing → revealed | expired | exhausted | error
	const [state, setState] = useState("loading");
	const [meta, setMeta] = useState(null); // { name, expiresAt, viewsRemaining }
	const [data, setData] = useState(null); // revealed content
	const [errorMsg, setErrorMsg] = useState("");

	// Phase 1: GET = metadata only, no view consumed, bot-safe
	useEffect(() => {
		if (!token) {
			setTimeout(() => {
				setState("error");
				setErrorMsg(t("shareToken.errMissingToken"));
			}, 0);
			return;
		}
		fetch(`/api/share/${token}`, { method: "GET" })
			.then(async (res) => {
				const json = await res.json();
				if (json.success) {
					setMeta(json.data);
					setState("ready");
				} else if (json.expired) {
					setState("expired");
				} else if (json.exhausted) {
					setState("exhausted");
				} else {
					setState("error");
					setErrorMsg(json.error || t("shareToken.errUnknown"));
				}
			})
			.catch(() => {
				setState("error");
				setErrorMsg(t("shareToken.errServerUnreachable"));
			});
	}, [token, t]);

	// Phase 2: POST = reveal content and consume a view (explicit action only)
	async function handleReveal() {
		setState("revealing");
		try {
			// Validate key client-side BEFORE consuming a view on the server
			const fragment = window.location.hash.slice(1);
			const { isValidKeyFragment, importShareKey, decryptFromShare } =
				await import("@/lib/share-crypto");
			if (!isValidKeyFragment(fragment)) {
				setState("error");
				setErrorMsg(t("shareToken.errMissingKey"));
				return;
			}

			const res = await fetch(`/api/share/${token}`, { method: "POST" });
			const json = await res.json();

			if (json.success) {
				// Decrypt locally with URL fragment key — server never saw it
				let content;
				try {
					const key = await importShareKey(fragment);
					content = await decryptFromShare(
						key,
						json.data.encryptedBlob,
					);
				} catch {
					setState("error");
					setErrorMsg(t("shareToken.errDecrypt"));
					return;
				}
				setData({
					...content,
					name: json.data.name,
					expiresAt: json.data.expiresAt,
					viewsRemaining: json.data.viewsRemaining,
				});
				setState("revealed");
				// Clear key from URL after decryption
				window.history.replaceState(null, "", window.location.pathname);
			} else if (json.expired) {
				setState("expired");
			} else if (json.exhausted) {
				setState("exhausted");
			} else {
				setState("error");
				setErrorMsg(json.error || t("shareToken.errUnknown"));
			}
		} catch {
			setState("error");
			setErrorMsg(t("shareToken.errServerUnreachable"));
		}
	}

	const dateLocale = locale === "fr" ? "fr-FR" : "en-US";
	const dateOptions = { day: "2-digit", month: "long", year: "numeric" };

	return (
		<div
			className={`min-h-screen auth-page ${
				theme === "dark"
					? "dark bg-[rgb(var(--color-background))]"
					: "bg-gray-50"
			} flex items-center justify-center p-4`}
			data-theme={theme}
		>
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="flex items-center justify-center mb-8">
					<Logo url="/" titleSize="text-xl" />
				</div>

				{state === "loading" && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<Loader2
							size={40}
							className="text-[#098479] animate-spin mx-auto mb-4"
						/>
						<p className="text-gray-600">
							{t("shareToken.loading")}
						</p>
					</div>
				)}

				{/* "Ready" state: show metadata + reveal button */}
				{(state === "ready" || state === "revealing") && meta && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="bg-linear-to-r from-teal-500 to-cyan-500 px-6 py-4">
							<p className="text-white/80 text-sm">
								{t("shareToken.sharedPassword")}
							</p>
							<h1 className="text-white text-xl font-bold mt-0.5">
								{meta.name}
							</h1>
						</div>
						<div className="px-6 py-5 space-y-4">
							<div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 space-y-1">
								<p className="font-semibold flex items-center gap-1.5">
									<AlertTriangle
										size={15}
										className="shrink-0"
									/>
									{t("shareToken.warningTitle")}
								</p>
								<ul className="list-disc list-inside space-y-0.5 text-amber-700">
									<li>{t("shareToken.warningDevice")}</li>
									<li>{t("shareToken.warningCount")}</li>
									<li>
										{meta.viewsRemaining === 1 ? (
											<span className="flex items-center gap-1 text-amber-700 font-medium">
												<TriangleAlert
													size={12}
													className="shrink-0"
												/>
												{t("shareToken.warningLast")}
											</span>
										) : (
											`${meta.viewsRemaining} ${meta.viewsRemaining > 1 ? t("shareToken.viewsRemainingPlural") : t("shareToken.viewsRemainingOne")}`
										)}
									</li>
								</ul>
							</div>
							<div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
								<Clock size={12} />
								{t("shareToken.expireOn")}{" "}
								{new Date(meta.expiresAt).toLocaleDateString(
									dateLocale,
									dateOptions,
								)}
							</div>
							<button
								onClick={handleReveal}
								disabled={state === "revealing"}
								className="w-full py-3 px-6 bg-linear-to-r from-teal-500 to-cyan-500 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-opacity cursor-pointer flex items-center justify-center gap-2"
							>
								{state === "revealing" ? (
									<>
										<Loader2
											size={16}
											className="animate-spin"
										/>
										{t("shareToken.decrypting")}
									</>
								) : (
									<>
										<LockOpen size={16} />
										{t("shareToken.revealBtn")}
									</>
								)}
							</button>
						</div>
					</div>
				)}

				{/* "Revealed" state: show full content */}
				{state === "revealed" && data && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="bg-linear-to-r from-teal-500 to-cyan-500 px-6 py-4">
							<p className="text-white/80 text-sm">
								{t("shareToken.sharedPassword")}
							</p>
							<h1 className="text-white text-xl font-bold mt-0.5">
								{data.name}
							</h1>
						</div>
						<div className="px-6 py-4">
							<Field
								label={t("shareToken.fieldUsername")}
								value={data.username || data.email}
							/>
							<Field
								label={t("shareToken.fieldPassword")}
								value={data.password}
								masked
							/>
							<Field
								label={t("shareToken.fieldWebsite")}
								value={data.website}
							/>
							{data.notes && (
								<div className="py-3">
									<p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
										{t("shareToken.fieldNotes")}
									</p>
									<p className="text-sm text-gray-700 whitespace-pre-wrap">
										{data.notes}
									</p>
								</div>
							)}
						</div>
						<div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 flex items-center justify-between gap-2">
							<span className="flex items-center gap-1">
								<Clock size={12} />
								{t("shareToken.expireOn")}{" "}
								{new Date(data.expiresAt).toLocaleDateString(
									dateLocale,
									dateOptions,
								)}
							</span>
							{data.viewsRemaining > 0 && (
								<span className="flex items-center gap-1">
									<Eye size={12} />
									{data.viewsRemaining}{" "}
									{data.viewsRemaining > 1
										? t("shareToken.viewsLeft")
										: t("shareToken.viewLeft")}
								</span>
							)}
						</div>
					</div>
				)}

				{(state === "expired" || state === "exhausted") && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<div className="flex justify-center mb-4">
							{state === "expired" ? (
								<Clock size={48} className="text-amber-400" />
							) : (
								<Ban size={48} className="text-red-400" />
							)}
						</div>
						<h2 className="text-lg font-bold text-gray-900 mb-2">
							{state === "expired"
								? t("shareToken.expiredTitle")
								: t("shareToken.exhaustedTitle")}
						</h2>
						<p className="text-gray-600 text-sm">
							{state === "expired"
								? t("shareToken.expiredDesc")
								: t("shareToken.exhaustedDesc")}
						</p>
					</div>
				)}

				{state === "error" && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<div className="flex justify-center mb-4">
							<XCircle size={48} className="text-red-400" />
						</div>
						<h2 className="text-lg font-bold text-gray-900 mb-2">
							{t("shareToken.errorTitle")}
						</h2>
						<p className="text-gray-600 text-sm">{errorMsg}</p>
					</div>
				)}

				{/* Footer */}
				<p className="text-center text-xs text-gray-500 mt-6">
					{t("shareToken.footerSharedVia")}{" "}
					<Link href="/" className="text-[#098479] hover:underline">
						SkromaPASS
					</Link>{" "}
					&mdash; {t("shareToken.footerTagline")}
				</p>
			</div>
		</div>
	);
}
