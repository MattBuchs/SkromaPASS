"use client";

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
			{copied ? "Copié !" : "Copier"}
		</button>
	);
}

function Field({ label, value, masked }) {
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
								<EyeOff size={12} /> Masquer
							</>
						) : (
							<>
								<Eye size={12} /> Afficher
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
	const params = useParams();
	const token = params?.token;
	// États : loading → ready → revealing → revealed | expired | exhausted | error
	const [state, setState] = useState("loading");
	const [meta, setMeta] = useState(null); // { name, expiresAt, viewsRemaining }
	const [data, setData] = useState(null); // contenu révélé
	const [errorMsg, setErrorMsg] = useState("");

	// Phase 1 : GET = métadonnées uniquement, aucune vue consommée, bot-safe
	useEffect(() => {
		if (!token) {
			setTimeout(() => {
				setState("error");
				setErrorMsg("Token manquant");
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
					setErrorMsg(json.error || "Erreur inconnue");
				}
			})
			.catch(() => {
				setState("error");
				setErrorMsg("Impossible de contacter le serveur");
			});
	}, [token]);

	// Phase 2 : POST = révéler le contenu et consommer une vue (action explicite uniquement)
	async function handleReveal() {
		setState("revealing");
		try {
			// Valider la clé côté client AVANT de consommer une vue sur le serveur
			const fragment = window.location.hash.slice(1);
			const { isValidKeyFragment, importShareKey, decryptFromShare } =
				await import("@/lib/share-crypto");
			if (!isValidKeyFragment(fragment)) {
				setState("error");
				setErrorMsg(
					"Clé de déchiffrement manquante ou invalide — copiez l'intégralité du lien (y compris la partie après #)",
				);
				return;
			}

			const res = await fetch(`/api/share/${token}`, { method: "POST" });
			const json = await res.json();

			if (json.success) {
				// Déchiffrer localement avec la clé du fragment URL — le serveur ne l'a jamais vue
				let content;
				try {
					const key = await importShareKey(fragment);
					content = await decryptFromShare(
						key,
						json.data.encryptedBlob,
					);
				} catch {
					setState("error");
					setErrorMsg(
						"Impossible de déchiffrer — clé invalide ou lien corrompu",
					);
					return;
				}
				setData({
					...content,
					name: json.data.name,
					expiresAt: json.data.expiresAt,
					viewsRemaining: json.data.viewsRemaining,
				});
				setState("revealed");
				// Effacer la clé de l'URL après déchiffrement (ne plus la laisser dans la barre d'adresse)
				window.history.replaceState(null, "", window.location.pathname);
			} else if (json.expired) {
				setState("expired");
			} else if (json.exhausted) {
				setState("exhausted");
			} else {
				setState("error");
				setErrorMsg(json.error || "Erreur inconnue");
			}
		} catch {
			setState("error");
			setErrorMsg("Impossible de contacter le serveur");
		}
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Logo */}
				<div className="flex items-center justify-center gap-2 mb-8">
					<div className="w-10 h-10 rounded-xl bg-[#098479] flex items-center justify-center text-white font-bold text-lg">
						M
					</div>
					<span className="text-xl font-bold text-gray-900">
						MemKeyPass
					</span>
				</div>

				{state === "loading" && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<Loader2
							size={40}
							className="text-[#098479] animate-spin mx-auto mb-4"
						/>
						<p className="text-gray-600">Vérification du lien...</p>
					</div>
				)}

				{/* État "prêt" : afficher les métadonnées + bouton de révélation */}
				{(state === "ready" || state === "revealing") && meta && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="bg-[#098479] px-6 py-4">
							<p className="text-white/80 text-sm">
								Mot de passe partagé
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
									Avant de révéler ce mot de passe :
								</p>
								<ul className="list-disc list-inside space-y-0.5 text-amber-700">
									<li>
										Assurez-vous d&apos;être sur un appareil
										sécurisé
									</li>
									<li>
										Cette action comptera comme une
										utilisation du lien
									</li>
									<li>
										{meta.viewsRemaining === 1 ? (
											<span className="flex items-center gap-1 text-amber-700 font-medium">
												<TriangleAlert
													size={12}
													className="shrink-0"
												/>
												C&apos;est la dernière
												utilisation disponible
											</span>
										) : (
											`${meta.viewsRemaining} utilisation${meta.viewsRemaining > 1 ? "s" : ""} restante${meta.viewsRemaining > 1 ? "s" : ""}`
										)}
									</li>
								</ul>
							</div>
							<div className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
								<Clock size={12} />
								Expire le{" "}
								{new Date(meta.expiresAt).toLocaleDateString(
									"fr-FR",
									{
										day: "2-digit",
										month: "long",
										year: "numeric",
									},
								)}
							</div>
							<button
								onClick={handleReveal}
								disabled={state === "revealing"}
								className="w-full py-3 px-6 bg-[#098479] hover:bg-[#0f766e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
							>
								{state === "revealing" ? (
									<>
										<Loader2
											size={16}
											className="animate-spin"
										/>
										Déchiffrement...
									</>
								) : (
									<>
										<LockOpen size={16} />
										Révéler le mot de passe
									</>
								)}
							</button>
						</div>
					</div>
				)}

				{/* État "révélé" : afficher le contenu complet */}
				{state === "revealed" && data && (
					<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
						<div className="bg-[#098479] px-6 py-4">
							<p className="text-white/80 text-sm">
								Mot de passe partagé
							</p>
							<h1 className="text-white text-xl font-bold mt-0.5">
								{data.name}
							</h1>
						</div>
						<div className="px-6 py-4">
							<Field
								label="Identifiant / Email"
								value={data.username || data.email}
							/>
							<Field
								label="Mot de passe"
								value={data.password}
								masked
							/>
							<Field label="Site web" value={data.website} />
							{data.notes && (
								<div className="py-3">
									<p className="text-xs text-gray-500 mb-1 font-medium uppercase tracking-wide">
										Notes
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
								Expire le{" "}
								{new Date(data.expiresAt).toLocaleDateString(
									"fr-FR",
									{
										day: "2-digit",
										month: "long",
										year: "numeric",
									},
								)}
							</span>
							{data.viewsRemaining > 0 && (
								<span className="flex items-center gap-1">
									<Eye size={12} />
									{data.viewsRemaining} vue
									{data.viewsRemaining > 1 ? "s" : ""}{" "}
									restante
									{data.viewsRemaining > 1 ? "s" : ""}
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
								? "Ce lien a expiré"
								: "Lien épuisé"}
						</h2>
						<p className="text-gray-600 text-sm">
							{state === "expired"
								? "Ce lien de partage n'est plus valide."
								: "Ce lien a déjà été utilisé le nombre maximum de fois."}
						</p>
					</div>
				)}

				{state === "error" && (
					<div className="bg-white rounded-2xl shadow-lg p-8 text-center">
						<div className="flex justify-center mb-4">
							<XCircle size={48} className="text-red-400" />
						</div>
						<h2 className="text-lg font-bold text-gray-900 mb-2">
							Lien introuvable
						</h2>
						<p className="text-gray-600 text-sm">{errorMsg}</p>
					</div>
				)}

				{/* Footer */}
				<p className="text-center text-xs text-gray-500 mt-6">
					Partagé via{" "}
					<Link href="/" className="text-[#098479] hover:underline">
						MemKeyPass
					</Link>{" "}
					— Gestionnaire de mots de passe chiffré
				</p>
			</div>
		</div>
	);
}
