"use client";

import Button from "@/components/ui/Button";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Header from "../layout/Header";
import Logo from "../layout/Logo";
import Sidebar from "../layout/Sidebar";

export default function AuthRequired() {
	const { t } = useLanguage();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	return (
		<div className="bg-linear-to-br from-indigo-50 via-white to-purple-50">
			{/* Header */}
			<Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
			<Sidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
			/>

			{/* Message */}
			<main className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] flex items-center justify-center -translate-y-8">
				<div className="max-w-md w-full text-center">
					<div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
						<div className="inline-flex items-center justify-center w-16 h-16 mb-2">
							<Logo
								width={64}
								height={64}
								isTitleDisplayed={false}
							/>
						</div>
						<h1 className="text-3xl font-bold text-gray-900 mb-4">
							{t("authRequired.title")}
						</h1>
						<p className="text-gray-600 mb-8">
							{t("authRequired.desc")}
						</p>
						<div className="flex flex-col sm:flex-row gap-3">
							<Link href="/login" className="flex-1">
								<Button
									variant="primary"
									className="w-full flex items-center justify-center gap-2"
								>
									<LogIn className="w-5 h-5" />
									{t("authRequired.loginBtn")}
								</Button>
							</Link>
							<Link href="/register" className="flex-1">
								<Button
									variant="ghost"
									className="w-full border border-gray-300"
								>
									{t("authRequired.registerBtn")}
								</Button>
							</Link>
						</div>
						<div className="mt-6 pt-6 border-t border-gray-200">
							<Link
								href="/"
								className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
							>
								{t("authRequired.backHome")}
							</Link>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
