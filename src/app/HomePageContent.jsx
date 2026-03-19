"use client";

import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Folder, Key, Lock, Shield } from "lucide-react";
import Link from "next/link";

export default function HomePageContent({ isAuthenticated }) {
	const { t } = useLanguage();

	return (
		<div className="min-h-screen bg-linear-to-r from-indigo-50 via-white to-indigo-50">
			<main>
				{/* Hero Section */}
				<section className="pt-32 pb-20 px-4">
					<div className="container mx-auto max-w-6xl text-center">
						<div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-6">
							<Shield className="w-4 h-4" />
							<span className="text-sm font-medium">
								{t("home.badge")}
							</span>
						</div>

						<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
							{t("home.heroTitle1")}
							<br />
							<span className="bg-linear-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
								{t("home.heroTitle2")}
							</span>
						</h1>

						<p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
							{t("home.heroSubtitle")}
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
							{isAuthenticated ? (
								<Link href="/dashboard">
									<Button
										variant="primary"
										className="text-lg px-8 py-4"
									>
										{t("home.ctaDashboard")}
									</Button>
								</Link>
							) : (
								<>
									<Link
										href="/register"
										className="text-lg px-8 py-4 bg-[rgb(var(--color-primary))] text-white hover:bg-[rgb(var(--color-primary-dark))] focus:ring-[rgb(var(--color-primary))] shadow-sm hover:shadow-md w-full sm:w-auto rounded-md"
									>
										{t("home.ctaStart")}
									</Link>
									<Link
										href="/login"
										className="text-lg px-8 py-4 w-full sm:w-auto bg-[rgb(var(--color-surface))] text-[rgb(var(--color-text-primary))] border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-background))] focus:ring-[rgb(var(--color-primary))] rounded-md"
									>
										{t("home.ctaLogin")}
									</Link>
								</>
							)}
						</div>

						{!isAuthenticated && (
							<p className="text-sm text-gray-500 mt-4">
								{t("home.noCreditCard")}
							</p>
						)}
					</div>
				</section>

				{/* Features Section */}
				<section className="py-20 px-4 bg-white">
					<div className="container mx-auto max-w-6xl">
						<div className="text-center mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
								{t("home.featuresTitle")}
							</h2>
							<p className="text-lg text-gray-600">
								{t("home.featuresSubtitle")}
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							{/* Feature 1 */}
							<div className="bg-linear-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 hover:shadow-lg transition-shadow">
								<div className="bg-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
									<Shield className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{t("home.feature1Title")}
								</h3>
								<p className="text-gray-600">
									{t("home.feature1Desc")}
								</p>
							</div>

							{/* Feature 2 */}
							<div className="bg-linear-to-br from-teal-50 to-white p-8 rounded-2xl border border-teal-100 hover:shadow-lg transition-shadow">
								<div className="bg-teal-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
									<Key className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{t("home.feature2Title")}
								</h3>
								<p className="text-gray-600">
									{t("home.feature2Desc")}
								</p>
							</div>

							{/* Feature 3 */}
							<div className="bg-linear-to-br from-purple-50 to-white p-8 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow">
								<div className="bg-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
									<Folder className="w-6 h-6 text-white" />
								</div>
								<h3 className="text-xl font-bold text-gray-900 mb-3">
									{t("home.feature3Title")}
								</h3>
								<p className="text-gray-600">
									{t("home.feature3Desc")}
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Stats Section */}
				<section className="py-20 px-4">
					<div className="container mx-auto max-w-6xl">
						<div className="bg-linear-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 text-white text-center">
							<h2 className="text-3xl md:text-4xl font-bold mb-12">
								{t("home.statsTitle")}
							</h2>
							<div className="grid md:grid-cols-3 gap-8">
								<div>
									<div className="text-5xl font-bold mb-2">
										100%
									</div>
									<div className="text-indigo-200">
										{t("home.statSecure")}
									</div>
								</div>
								<div>
									<div className="text-5xl font-bold mb-2">
										0€
									</div>
									<div className="text-indigo-200">
										{t("home.statFree")}
									</div>
								</div>
								<div>
									<div className="text-5xl font-bold mb-2">
										24/7
									</div>
									<div className="text-indigo-200">
										{t("home.statAvailable")}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20 px-4 bg-white">
					<div className="container mx-auto max-w-4xl text-center">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							{t("home.ctaTitle")}
						</h2>
						<p className="text-xl text-gray-600 mb-8">
							{t("home.ctaDesc")}
						</p>
						<Link href="/register">
							<Button
								variant="primary"
								className="text-lg px-8 py-4"
							>
								{t("home.ctaButton")}
							</Button>
						</Link>
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="py-12 px-4 border-t border-gray-200 bg-gray-50">
				<div className="container mx-auto max-w-6xl">
					<div className="grid md:grid-cols-3 gap-8 mb-8">
						{/* About */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-4">
								MemKeyPass
							</h3>
							<p className="text-sm text-gray-600 mb-4">
								{t("home.footerAboutDesc")}
							</p>
							<div className="flex items-center gap-2">
								<div className="bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-lg shadow-lg">
									<Lock className="w-5 h-5 text-white" />
								</div>
								<span className="font-bold text-gray-900">
									MemKeyPass
								</span>
							</div>
						</div>

						{/* Navigation */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-4">
								{t("home.footerNavTitle")}
							</h3>
							<ul className="space-y-2 text-sm">
								<li>
									<Link
										href="/dashboard"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										Dashboard
									</Link>
								</li>
								<li>
									<Link
										href="/generator"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("headerHome.generator")}
									</Link>
								</li>
								<li>
									<Link
										href="/security"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("nav.security")}
									</Link>
								</li>
								<li>
									<Link
										href="/contact"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("headerHome.contact")}
									</Link>
								</li>
							</ul>
						</div>

						{/* Legal */}
						<div>
							<h3 className="font-semibold text-gray-900 mb-4">
								{t("home.footerLegalTitle")}
							</h3>
							<ul className="space-y-2 text-sm">
								<li>
									<Link
										href="/legal/mentions-legales"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("home.legalNotice")}
									</Link>
								</li>
								<li>
									<Link
										href="/legal/politique-confidentialite"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("home.privacyPolicy")}
									</Link>
								</li>
								<li>
									<Link
										href="/legal/cgu"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("home.terms")}
									</Link>
								</li>
								<li>
									<Link
										href="/legal/politique-cookies"
										className="text-gray-600 hover:text-indigo-600 transition-colors"
									>
										{t("home.cookiePolicy")}
									</Link>
								</li>
							</ul>
						</div>
					</div>

					{/* Copyright */}
					<div className="pt-8 border-t border-gray-300 text-center">
						<p className="text-sm text-gray-600">
							© {new Date().getFullYear()} MemKeyPass.{" "}
							{t("home.copyright")}
						</p>
						<p className="text-xs text-gray-500 mt-2">
							{t("home.footerInfo")}
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
