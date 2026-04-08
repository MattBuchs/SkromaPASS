"use client";

import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
	AlertTriangle,
	ArrowRight,
	CheckCircle,
	Copy,
	Eye,
	Fingerprint,
	Folder,
	Globe,
	Key,
	Lock,
	Puzzle,
	Shield,
	Star,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

export default function HomePageContent({ isAuthenticated }) {
	const { t, locale, setLocale } = useLanguage();
	const { theme } = useTheme();
	const router = useRouter();
	const isFirstRef = useRef(true);
	const statsRef = useRef(null);
	const [statsVisible, setStatsVisible] = useState(false);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const urlLang = params.get("lang");
		if (urlLang === "en" || urlLang === "fr") {
			setLocale(urlLang);
		} else {
			const stored = localStorage.getItem("mkp_locale");
			const realLocale =
				stored === "en" || stored === "fr"
					? stored
					: (navigator.language || "").startsWith("fr")
						? "fr"
						: "en";
			params.set("lang", realLocale);
			router.replace(`/?${params.toString()}`, { scroll: false });
		}
	}, [router, setLocale]);

	useEffect(() => {
		if (isFirstRef.current) {
			isFirstRef.current = false;
			return;
		}
		const params = new URLSearchParams(window.location.search);
		if (params.get("lang") !== locale) {
			params.set("lang", locale);
			router.replace(`/?${params.toString()}`, { scroll: false });
		}
	}, [locale, router]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) setStatsVisible(true);
			},
			{ threshold: 0.3 },
		);
		if (statsRef.current) observer.observe(statsRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		const revealObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("revealed");
						revealObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12 },
		);
		document
			.querySelectorAll(
				".scroll-reveal, .scroll-reveal-scale, .scroll-reveal-step, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-glow",
			)
			.forEach((el) => revealObserver.observe(el));
		return () => revealObserver.disconnect();
	}, []);

	return (
		<div
			data-theme={theme}
			style={{
				backgroundColor: theme === "light" ? "#f0f9ff" : "#020617",
			}}
			className="min-h-screen text-white overflow-x-hidden animate-page-reveal"
		>
			{/* ──────────────────────────────────────────────────────── HERO */}
			<section className="relative min-h-screen flex items-center pt-24 pb-16 px-4 overflow-hidden">
				{/* Atmospheric background glows */}
				<div className="absolute inset-0 pointer-events-none select-none">
					<div className="absolute top-1/4 -left-24 w-[500px] h-[500px] bg-teal-600/15 rounded-full blur-3xl animate-glow-pulse" />
					<div className="absolute bottom-1/4 -right-24 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-3xl animate-glow-pulse-delay" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-900/10 rounded-full blur-3xl" />
				</div>
				{/* Subtle dot grid */}
				<div className="absolute inset-0 bg-[linear-gradient(rgba(9,132,121,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(9,132,121,0.04)_1px,transparent_1px)] bg-size-[72px_72px] pointer-events-none" />

				<div className="container mx-auto max-w-7xl relative z-10">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Left — content */}
						<div>
							{/* Live badge */}
							<div
								style={{ animationDelay: "0ms" }}
								className="animate-fade-in-up inline-flex items-center gap-2.5 bg-teal-500/10 border border-teal-500/25 text-teal-400 px-4 py-2 rounded-full mb-8 backdrop-blur-sm"
							>
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500" />
								</span>
								<span className="text-sm font-medium tracking-wide">
									{t("home.badge")}
								</span>
							</div>

							{/* Headline */}
							<h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[0.95] tracking-tight mb-7">
								<span className="block overflow-hidden">
									<span
										style={{ animationDelay: "650ms" }}
										className="text-white block animate-text-reveal"
									>
										{t("home.heroTitle1")}
									</span>
								</span>
								<span className="block overflow-hidden mt-2">
									<span
										style={{ animationDelay: "950ms" }}
										className="block animate-text-reveal"
									>
										<span className="bg-linear-to-r from-teal-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent animate-shimmer">
											{t("home.heroTitle2")}
										</span>
									</span>
								</span>
							</h1>

							<p
								style={{ animationDelay: "500ms" }}
								className="animate-fade-in-up text-gray-400 text-xl leading-relaxed mb-10 max-w-lg"
							>
								{t("home.heroSubtitle")}
							</p>

							{/* CTAs */}
							<div
								style={{ animationDelay: "500ms" }}
								className="animate-fade-in-up flex flex-col sm:flex-row gap-4 mb-10"
							>
								{isAuthenticated ? (
									<Link
										href="/dashboard"
										className="group inline-flex items-center justify-center gap-2.5 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300"
									>
										{t("home.ctaDashboard")}
										<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
									</Link>
								) : (
									<>
										<Link
											href="/register"
											className="group inline-flex items-center justify-center gap-2.5 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-semibold text-lg px-8 py-4 rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all duration-300"
										>
											{t("home.ctaStart")}
											<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
										</Link>
										<Link
											href="/login"
											className="inline-flex items-center justify-center text-white/80 hover:text-white border border-white/15 hover:border-white/30 font-semibold text-lg px-8 py-4 rounded-xl backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
										>
											{t("home.ctaLogin")}
										</Link>
									</>
								)}
							</div>

							{!isAuthenticated && (
								<p
									style={{ animationDelay: "400ms" }}
									className="animate-fade-in-up text-sm text-gray-600"
								></p>
							)}

							{/* Trust row */}
							<div
								style={{ animationDelay: "1100ms" }}
								className="animate-fade-in-up flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-white/5"
							>
								{[
									{ icon: Shield, label: t("home.trust1") },
									{ icon: Globe, label: t("home.trust2") },
									{ icon: Star, label: t("home.trust3") },
									{ icon: Key, label: t("home.trust4") },
								].map(({ icon: Icon, label }) => (
									<div
										key={label}
										className="flex items-center gap-2 text-gray-500 text-sm hover:text-gray-400 transition-colors"
									>
										<Icon className="w-4 h-4 text-teal-600" />
										<span>{label}</span>
									</div>
								))}
							</div>
						</div>

						{/* Right — floating vault card mockup */}
						<div
							style={{ animationDelay: "400ms" }}
							className="hidden lg:flex items-center justify-center animate-slide-in-right"
							aria-hidden
						>
							<div className="relative w-full max-w-sm animate-float">
								{/* Main vault card */}
								<div className="bg-white/4 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/50">
									{/* Card header */}
									<div className="flex items-center justify-between mb-6">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 bg-linear-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
												<Lock className="w-5 h-5 text-white" />
											</div>
											<div>
												<p className="text-white font-semibold text-sm">
													SkromaPASS
												</p>
												<p className="text-gray-500 text-xs">
													Coffre sécurisé
												</p>
											</div>
										</div>
										<div className="flex items-center gap-1.5 bg-teal-500/10 border border-teal-500/25 px-2.5 py-1 rounded-full">
											<div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
											<span className="text-teal-400 text-xs font-medium">
												AES-256
											</span>
										</div>
									</div>

									{/* Password entries */}
									{[
										{
											site: "Google",
											url: "google.com",
											color: "from-red-400 to-orange-500",
										},
										{
											site: "GitHub",
											url: "github.com",
											color: "from-slate-400 to-slate-600",
										},
										{
											site: "Netflix",
											url: "netflix.com",
											color: "from-red-500 to-red-700",
										},
									].map((item) => (
										<div
											key={item.site}
											className="flex items-center justify-between py-3.5 border-b border-white/5 last:border-0"
										>
											<div className="flex items-center gap-3">
												<div
													className={`w-9 h-9 bg-linear-to-br ${item.color} rounded-xl flex items-center justify-center`}
												>
													<span className="text-white text-xs font-black">
														{item.site[0]}
													</span>
												</div>
												<div>
													<p className="text-white text-sm font-medium">
														{item.site}
													</p>
													<p className="text-gray-600 text-xs">
														{item.url}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<span className="text-gray-700 text-sm font-mono tracking-widest">
													••••••••
												</span>
												<button
													aria-hidden
													aria-label="fake button"
													className="w-7 h-7 bg-white/5 hover:bg-teal-500/15 rounded-lg flex items-center justify-center transition-colors group"
												>
													<Copy className="w-3.5 h-3.5 text-gray-500 group-hover:text-teal-400 transition-colors" />
												</button>
											</div>
										</div>
									))}

									{/* Add button */}
									<div className="flex gap-2 mt-4">
										<button
											aria-hidden
											className="flex-1 bg-linear-to-r from-teal-500 to-cyan-500 text-white text-xs font-semibold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-teal-500/25"
										>
											+ Ajouter
										</button>
										<button
											aria-hidden
											aria-label="fake button"
											className="w-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-colors border border-white/5"
										>
											<Eye className="w-4 h-4 text-gray-500" />
										</button>
									</div>
								</div>

								{/* Floating accent badges */}
								<div className="absolute -top-5 -right-5 bg-linear-to-br from-teal-500 to-cyan-600 rounded-2xl p-3.5 shadow-xl shadow-teal-500/40 animate-float-delayed">
									<Shield className="w-6 h-6 text-white" />
								</div>
								<div className="absolute -bottom-5 -left-5 bg-linear-to-br from-indigo-600 to-purple-700 rounded-2xl p-3.5 shadow-xl shadow-indigo-500/40 animate-float-slow">
									<Key className="w-6 h-6 text-white" />
								</div>

								{/* Card ambient glow */}
								<div className="absolute -inset-2 bg-linear-to-br from-teal-500/10 to-indigo-500/5 rounded-3xl blur-xl -z-10" />
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ──────────────────────────────────────────── FEATURES BENTO */}
			<section className="py-32 px-4">
				<div className="container mx-auto max-w-7xl">
					<div className="text-center mb-20">
						<span className="text-teal-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 block">
							{t("home.featuresLabel")}
						</span>
						<h2 className="text-4xl md:text-6xl font-black text-white mb-5 leading-tight">
							{t("home.featuresTitle")}
						</h2>
						<p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
							{t("home.featuresSubtitle")}
						</p>
					</div>

					{/* Bento grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{/* AES-256 — wide card */}
						<div className="lg:col-span-2 group relative overflow-hidden bg-linear-to-br from-teal-950/60 to-slate-950/80 border border-teal-500/15 hover:border-teal-500/35 rounded-3xl p-8 transition-all duration-500 cursor-default scroll-reveal">
							<div className="absolute inset-0 bg-linear-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="bg-teal-500/15 border border-teal-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500/25 transition-all duration-300">
									<Shield className="w-7 h-7 text-teal-400" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">
									{t("home.feature1Title")}
								</h3>
								<p className="text-gray-400 text-lg leading-relaxed max-w-lg">
									{t("home.feature1Desc")}
								</p>
								<div className="mt-8 flex flex-wrap gap-2">
									{[
										"AES-256-GCM",
										"PBKDF2",
										"SHA-512",
										"Zero-Knowledge",
										"E2EE",
									].map((tag) => (
										<span
											key={tag}
											className="bg-teal-500/8 border border-teal-500/20 text-teal-400 text-xs font-mono px-3 py-1.5 rounded-lg hover:bg-teal-500/15 transition-colors"
										>
											{tag}
										</span>
									))}
								</div>
							</div>
						</div>

						{/* Generator */}
						<div
							className="group relative overflow-hidden bg-linear-to-br from-indigo-950/60 to-slate-950/80 border border-indigo-500/15 hover:border-indigo-500/35 rounded-3xl p-8 transition-all duration-500 cursor-default scroll-reveal"
							style={{ transitionDelay: "100ms" }}
						>
							<div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="bg-indigo-500/15 border border-indigo-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/25 transition-all duration-300">
									<Zap className="w-7 h-7 text-indigo-400" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">
									{t("home.feature2Title")}
								</h3>
								<p className="text-gray-400 leading-relaxed">
									{t("home.feature2Desc")}
								</p>
								<div className="mt-6 bg-black/30 border border-white/5 rounded-xl px-4 py-3 font-mono text-sm tracking-wider">
									<span className="text-teal-400">G8k</span>
									<span className="text-pink-400">#mP</span>
									<span className="text-yellow-400">2vQ</span>
									<span className="text-blue-400">nR!</span>
									<span className="text-green-400">7xZ</span>
									<span className="text-purple-400">$wL</span>
								</div>
							</div>
						</div>

						{/* Organization */}
						<div
							className="group relative overflow-hidden bg-linear-to-br from-purple-950/60 to-slate-950/80 border border-purple-500/15 hover:border-purple-500/35 rounded-3xl p-8 transition-all duration-500 cursor-default scroll-reveal"
							style={{ transitionDelay: "150ms" }}
						>
							<div className="absolute inset-0 bg-linear-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							<div className="relative z-10">
								<div className="bg-purple-500/15 border border-purple-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-purple-500/25 transition-all duration-300">
									<Folder className="w-7 h-7 text-purple-400" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">
									{t("home.feature3Title")}
								</h3>
								<p className="text-gray-400 leading-relaxed">
									{t("home.feature3Desc")}
								</p>
							</div>
						</div>

						{/* Multi-factor */}
						<div
							className="group relative overflow-hidden bg-linear-to-br from-orange-950/60 to-slate-950/80 border border-orange-500/15 hover:border-orange-500/35 rounded-3xl p-8 transition-all duration-500 cursor-default scroll-reveal"
							style={{ transitionDelay: "200ms" }}
						>
							<div className="relative z-10">
								<div className="bg-orange-500/15 border border-orange-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-500/25 transition-all duration-300">
									<Fingerprint className="w-7 h-7 text-orange-400" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">
									{t("home.feature4Title")}
								</h3>
								<p className="text-gray-400 leading-relaxed">
									{t("home.feature4Desc")}
								</p>
							</div>
						</div>

						{/* Breach Lab */}
						<div
							className="group relative overflow-hidden bg-linear-to-br from-red-950/60 to-slate-950/80 border border-red-500/15 hover:border-red-500/35 rounded-3xl p-8 transition-all duration-500 cursor-default scroll-reveal"
							style={{ transitionDelay: "250ms" }}
						>
							<div className="relative z-10">
								<div className="bg-red-500/15 border border-red-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-red-500/25 transition-all duration-300">
									<AlertTriangle className="w-7 h-7 text-red-400" />
								</div>
								<h3 className="text-2xl font-bold text-white mb-3">
									{t("home.feature5Title")}
								</h3>
								<p className="text-gray-400 leading-relaxed">
									{t("home.feature5Desc")}
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ─────────────────────────────────────────── HOW IT WORKS */}
			<section className="py-32 px-4 relative">
				<div className="absolute inset-0 bg-linear-to-b from-transparent via-teal-950/5 to-transparent pointer-events-none" />
				<div className="container mx-auto max-w-7xl relative z-10">
					<div className="text-center mb-20 scroll-reveal-scale">
						<h2 className="text-4xl md:text-6xl font-black text-white leading-tight">
							{t("home.howTitle")}
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-12 relative">
						{/* Connecting line (desktop only) */}
						<div className="hidden md:block absolute top-8 left-[calc(33.33%+2rem)] right-[calc(33.33%+2rem)] h-px bg-linear-to-r from-teal-500/40 via-teal-500/20 to-teal-500/40" />

						{[
							{
								num: t("home.howStep1Num"),
								title: t("home.howStep1Title"),
								desc: t("home.howStep1Desc"),
							},
							{
								num: t("home.howStep2Num"),
								title: t("home.howStep2Title"),
								desc: t("home.howStep2Desc"),
							},
							{
								num: t("home.howStep3Num"),
								title: t("home.howStep3Title"),
								desc: t("home.howStep3Desc"),
							},
						].map((step, i) => (
							<div
								key={i}
								className="text-center group scroll-reveal-step"
								style={{ transitionDelay: `${i * 150}ms` }}
							>
								<div className="inline-flex w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/25 items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal-500/20 group-hover:border-teal-500/40 transition-all duration-300">
									<span className="text-teal-400 font-black text-xl">
										{step.num}
									</span>
								</div>
								<h3 className="text-xl font-bold text-white mb-3">
									{step.title}
								</h3>
								<p className="text-gray-400 leading-relaxed">
									{step.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ──────────────────────────────────── EXTENSION COMING SOON */}
			<section className="py-32 px-4 relative overflow-hidden">
				<div className="absolute inset-0 bg-linear-to-br from-slate-900/90 via-teal-950/30 to-slate-900/90 pointer-events-none" />
				<div className="absolute inset-0 bg-[linear-gradient(rgba(9,132,121,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(9,132,121,0.06)_1px,transparent_1px)] bg-size-[48px_48px] pointer-events-none" />
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-linear-to-b from-teal-500/50 to-transparent" />

				<div className="container mx-auto max-w-7xl relative z-10">
					<div className="grid lg:grid-cols-2 gap-16 items-center">
						{/* Left — text */}
						<div className="scroll-reveal-left">
							<div className="inline-flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 px-4 py-2 rounded-full mb-8">
								<span className="relative flex h-2 w-2">
									<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
									<span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
								</span>
								<span className="text-sm font-medium">
									{t("home.extensionBadge")}
								</span>
							</div>

							<h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
								{t("home.extensionTitle")}
							</h2>
							<p className="text-gray-400 text-xl leading-relaxed mb-10">
								{t("home.extensionSubtitle")}
							</p>

							<ul className="space-y-4 mb-10">
								{[
									t("home.extensionFeature1"),
									t("home.extensionFeature2"),
									t("home.extensionFeature3"),
									t("home.extensionFeature4"),
								].map((feature) => (
									<li
										key={feature}
										className="flex items-center gap-3"
									>
										<div className="w-6 h-6 bg-teal-500/15 border border-teal-500/20 rounded-lg flex items-center justify-center shrink-0">
											<CheckCircle className="w-3.5 h-3.5 text-teal-400" />
										</div>
										<span className="text-gray-300">
											{feature}
										</span>
									</li>
								))}
							</ul>

							<div className="flex flex-wrap items-center gap-3">
								<div className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors">
									<Globe className="w-5 h-5 text-blue-400" />
									<span className="text-gray-300 text-sm font-medium">
										{t("home.extensionChrome")}
									</span>
								</div>
								<div className="flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 px-4 py-2.5 rounded-xl transition-colors">
									<Puzzle className="w-5 h-5 text-orange-400" />
									<span className="text-gray-300 text-sm font-medium">
										{t("home.extensionFirefox")}
									</span>
								</div>
							</div>
						</div>

						{/* Right — extension popup mockup */}
						<div
							className="flex justify-center items-center scroll-reveal-right px-6 sm:px-0"
							style={{ transitionDelay: "150ms" }}
						>
							<div className="relative animate-float-slow w-full max-w-[340px] mx-auto">
								{/* Extension popup card */}
								<div className="w-full bg-[#16181f] rounded-2xl border border-white/10 shadow-2xl shadow-teal-500/10 overflow-hidden dark-card">
									{/* Header */}
									<div className="bg-linear-to-r from-teal-900/60 to-slate-900 px-5 py-4 border-b border-white/8">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2.5">
												<div className="w-8 h-8 bg-linear-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-md shadow-teal-500/30">
													<Key className="w-4 h-4 text-white" />
												</div>
												<div>
													<p className="text-white text-sm font-bold tracking-tight">
														SkromaPASS
													</p>
													<p className="text-teal-400 text-xs">
														{locale === "fr"
															? "Extension active"
															: "Extension active"}
													</p>
												</div>
											</div>
											<div className="flex items-center gap-1.5">
												<div className="w-2.5 h-2.5 bg-teal-500 rounded-full animate-pulse shadow-sm shadow-teal-500/50" />
												<span className="text-teal-400 text-xs">
													On
												</span>
											</div>
										</div>
									</div>

									{/* Site detected */}
									<div className="px-5 py-3 bg-teal-950/40 border-b border-white/5 flex items-center justify-between">
										<div>
											<p className="text-teal-400 text-xs font-semibold uppercase tracking-wider">
												{locale === "fr"
													? "Site détecté"
													: "Site detected"}
											</p>
											<p className="text-white text-sm font-semibold mt-0.5">
												github.com
											</p>
										</div>
										<div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
											<span className="text-white text-xs font-black">
												G
											</span>
										</div>
									</div>

									{/* Credentials */}
									<div className="px-5 py-4 space-y-2.5">
										<p className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-3">
											{locale === "fr"
												? "1 identifiant trouvé"
												: "1 credential found"}
										</p>
										<div className="bg-white/4 hover:bg-teal-500/8 rounded-xl p-3.5 border border-white/5 hover:border-teal-500/25 cursor-pointer transition-all duration-200 group">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 bg-linear-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center">
														<span className="text-white text-xs font-bold">
															G
														</span>
													</div>
													<div>
														<p className="text-white text-sm font-medium">
															user@email.com
														</p>
														<p className="text-gray-600 text-xs font-mono tracking-widest">
															••••••••••
														</p>
													</div>
												</div>
												<ArrowRight className="w-4 h-4 text-teal-500 group-hover:translate-x-0.5 transition-transform" />
											</div>
										</div>
									</div>

									{/* Actions */}
									<div className="px-5 pb-5 grid grid-cols-2 gap-2">
										<button className="bg-linear-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-md shadow-teal-500/20">
											{locale === "fr"
												? "Auto-remplir"
												: "Auto-fill"}
										</button>
										<button className="bg-white/5 hover:bg-white/8 text-gray-300 text-xs font-semibold py-2.5 rounded-xl border border-white/8 hover:border-white/15 transition-all">
											{locale === "fr"
												? "+ Sauvegarder"
												: "+ Save"}
										</button>
									</div>
								</div>

								{/* Ambient glow */}
								<div className="absolute -inset-3 bg-linear-to-br from-teal-500/15 to-cyan-500/8 rounded-3xl blur-xl -z-10" />

								{/* Coming soon pill */}
								<div className="absolute -top-4 right-0 sm:-right-6 bg-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg shadow-amber-500/30 whitespace-nowrap ring-1 ring-amber-600/20">
									{t("home.extensionBadge")}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ───────────────────────────────────────────────── STATS */}
			<section
				ref={statsRef}
				className={`py-32 px-4 transition-all duration-1000 ${
					statsVisible
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-8"
				}`}
			>
				<div className="container mx-auto max-w-7xl">
					<div className="relative rounded-3xl overflow-hidden border border-white/8">
						<div className="absolute inset-0 bg-linear-to-br from-teal-950/40 via-slate-900/60 to-indigo-950/40" />
						<div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-teal-500/50 to-transparent" />
						<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />

						<div className="relative z-10 grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
							{[
								{
									value: "100%",
									label: t("home.statSecure"),
									sub: "AES-256 / Zero-Knowledge",
									color: "from-teal-400 to-cyan-300",
								},
								{
									value: "0€",
									label: t("home.statFree"),
									sub:
										locale === "fr"
											? "Pour toujours"
											: "Forever",
									color: "from-white to-gray-300",
								},
								{
									value: "24/7",
									label: t("home.statAvailable"),
									sub:
										locale === "fr"
											? "Uptime garanti"
											: "Guaranteed uptime",
									color: "from-indigo-400 to-purple-300",
								},
							].map(({ value, label, sub, color }) => (
								<div
									key={label}
									className="p-12 text-center group hover:bg-teal-500/5 transition-colors duration-500"
								>
									<div
										className={`text-7xl font-black bg-linear-to-b ${color} bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform duration-300`}
									>
										{value}
									</div>
									<div className="text-white font-semibold text-xl mb-1">
										{label}
									</div>
									<div className="text-gray-600 text-sm">
										{sub}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>
			{/* ──────────────────────────────── DASHBOARD PREVIEW */}
			<section className="py-24 px-4 relative overflow-hidden">
				{/* Full-width background band */}
				<div className="absolute inset-0 bg-[#040f1c]" />
				<div className="absolute inset-0 bg-linear-to-br from-teal-950/60 via-[#040f1c] to-cyan-950/30" />
				{/* Top & bottom fades to blend with page bg */}
				<div
					className={`absolute top-0 left-0 right-0 h-28 bg-linear-to-b ${theme === "light" ? "from-[#f0f9ff]" : "from-[#020617]"} to-transparent pointer-events-none z-10`}
				/>
				<div
					className={`absolute bottom-0 left-0 right-0 h-28 bg-linear-to-t ${theme === "light" ? "from-[#f0f9ff]" : "from-[#020617]"} to-transparent pointer-events-none z-10`}
				/>
				<div className="container mx-auto max-w-6xl relative z-10">
					{/* Section header */}
					<div className="text-center mb-14 scroll-reveal-scale">
						<div className="inline-flex items-center gap-2 bg-white/4 border border-white/8 rounded-full px-4 py-1.5 text-xs font-medium text-teal-400 tracking-wide uppercase mb-5">
							{locale === "fr"
								? "Aperçu de l'interface"
								: "Interface preview"}
						</div>
						<h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4">
							{locale === "fr" ? (
								<>
									Votre coffre,{" "}
									<span className="bg-linear-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
										simplement
									</span>
								</>
							) : (
								<>
									Your vault,{" "}
									<span className="bg-linear-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
										simplified
									</span>
								</>
							)}
						</h2>
						<p className="text-gray-400 text-lg max-w-xl mx-auto">
							{locale === "fr"
								? "Une interface claire, rapide, pensée pour votre quotidien."
								: "A clean, fast interface designed for your everyday use."}
						</p>
					</div>

					{/* Browser mockup */}
					<div className="scroll-reveal-glow">
						{/* Dashboard screenshot */}
						<Image
							src="/screenshot-preview.png"
							width={1200}
							height={800}
							alt={
								locale === "fr"
									? "Aperçu du tableau de bord SkromaPASS"
									: "SkromaPASS dashboard preview"
							}
							className="w-full h-auto block drop-shadow-2xl"
							draggable={false}
						/>
					</div>
				</div>
			</section>

			{/* ──────────────────────────────── CAPTION UNDER PREVIEW */}
			<div className="px-4 -mt-12 relative z-10">
				<div className="container mx-auto max-w-3xl">
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 scroll-reveal">
						{[
							{
								icon: Shield,
								label:
									locale === "fr"
										? "Chiffrement AES-256"
										: "AES-256 Encryption",
							},
							{
								icon: Eye,
								label:
									locale === "fr"
										? "Architecture zero-knowledge"
										: "Zero-knowledge architecture",
							},
							{
								icon: Globe,
								label:
									locale === "fr"
										? "Accessible partout"
										: "Accessible anywhere",
							},
						].map(({ icon: Icon, label }, i) => (
							<Fragment key={label}>
								<div className="flex items-center gap-2.5 text-gray-500 hover:text-gray-300 transition-colors duration-200">
									<Icon className="w-4 h-4 text-teal-600 shrink-0" />
									<span className="text-sm">{label}</span>
								</div>
								{i < 2 && (
									<span className="hidden sm:block w-px h-4 bg-white/10 mx-8" />
								)}
							</Fragment>
						))}
					</div>
				</div>
			</div>

			{/* ──────────────────────────────────────────────── FINAL CTA */}
			<section className="py-32 px-4 relative overflow-hidden">
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-teal-600/10 rounded-full blur-3xl" />
					<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-indigo-600/8 rounded-full blur-3xl" />
				</div>
				<div className="container mx-auto max-w-4xl text-center relative z-10">
					<div className="bg-linear-to-br from-white/4 to-teal-950/20 border border-white/8 rounded-3xl p-8 md:p-16 backdrop-blur-sm relative overflow-hidden scroll-reveal-glow">
						<div className="absolute top-0 left-1/4 right-1/4 h-px bg-linear-to-r from-transparent via-teal-500/60 to-transparent" />
						<h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
							{t("home.ctaTitle")}
						</h2>
						<p className="text-gray-400 text-xl mb-10 max-w-lg mx-auto leading-relaxed">
							{t("home.ctaDesc")}
						</p>
						<Link
							href="/register"
							className="group inline-flex items-center gap-3 bg-linear-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-white font-bold text-lg px-10 py-5 rounded-2xl shadow-2xl shadow-teal-500/25 hover:shadow-teal-500/50 hover:scale-105 transition-all duration-300"
						>
							{t("home.ctaButton")}
							<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
						</Link>
						{!isAuthenticated && (
							<p className="text-gray-600 text-sm mt-6">
								{t("home.noCreditCard")}
							</p>
						)}
					</div>
				</div>
			</section>

			{/* Footer transition + Footer */}

			<Footer />
		</div>
	);
}
