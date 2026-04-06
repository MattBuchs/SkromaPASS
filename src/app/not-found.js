"use client";

import Logo from "@/components/layout/Logo";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, Home, Search } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	const { t } = useLanguage();
	const { theme } = useTheme();
	return (
		<div
			className={`min-h-screen auth-page ${
				theme === "dark"
					? "dark bg-[rgb(var(--color-background))]"
					: "bg-linear-to-br from-indigo-50 via-white to-purple-50"
			}`}
			data-theme={theme}
		>
			{/* Content */}
			<div className="flex items-center justify-center min-h-screen px-4 pt-20">
				<div className="max-w-2xl w-full text-center">
					{/* Illustration avec le logo */}
					<div className="mb-8 flex justify-center">
						<div className="relative">
							<Logo
								width={80}
								height={80}
								titleSize="text-2xl"
								flexDirection="column"
							/>
						</div>
					</div>

					{/* Code 404 */}
					<div className="mb-6">
						<h1 className="text-8xl md:text-8xl font-bold bg-linear-to-br from-teal-600 to-cyan-600 from-25% bg-clip-text text-transparent mb-2">
							404
						</h1>
						<div className="h-1 w-24 bg-linear-to-br from-teal-600 to-cyan-600 from-25% rounded-full mx-auto"></div>
					</div>

					{/* Message */}
					<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						{t("notFound.title")}
					</h2>

					<p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
						{t("notFound.subtitle")}
					</p>

					{/* Suggestions */}
					<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
						<h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
							<Search className="w-4 h-4 text-teal-500" />
							{t("notFound.suggestions")}
						</h3>
						<ul className="space-y-2 text-sm text-gray-600">
							<li className="flex items-center justify-center gap-2">
								<span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
								{t("notFound.suggestion1")}
							</li>
							<li className="flex items-center justify-center gap-2">
								<span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
								{t("notFound.suggestion2")}
							</li>
							<li className="flex items-center justify-center gap-2">
								<span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
								{t("notFound.suggestion3")}
							</li>
						</ul>
					</div>

					{/* Actions */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Link href="/">
							<Button
								variant="primary"
								className="text-base px-6 py-3 flex items-center gap-2"
							>
								<Home className="w-5 h-5" />
								{t("notFound.backHome")}
							</Button>
						</Link>
						<button
							onClick={() => window.history.back()}
							className="inline-flex items-center gap-2 text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))] transition-colors duration-200 cursor-pointer"
						>
							<ArrowLeft className="w-5 h-5" />
							{t("notFound.backPrev")}
						</button>
					</div>

					{/* Footer link */}
					<div className="mt-12 pt-8 border-t border-gray-200 mb-10">
						<p className="text-sm text-gray-500">
							{t("notFound.helpText")}{" "}
							<Link
								href="/contact"
								className="text-teal-600 hover:text-teal-700 font-medium transition-colors duration-200"
							>
								{t("notFound.contactLink")}
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
