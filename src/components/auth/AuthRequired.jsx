"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { Lock, LogIn } from "lucide-react";
import Button from "@/components/ui/Button";

export default function AuthRequired() {
    const { t } = useLanguage();
    return (
        <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-linear-to-br from-teal-500 to-cyan-600 p-2 rounded-lg shadow-lg">
                                <Lock className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-gray-900">
                                MemKeyPass
                            </span>
                        </Link>
                        <div className="flex items-center gap-3">
                            <Link href="/login">
                                <Button variant="ghost">{t("authRequired.login")}</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary">
                                    {t("authRequired.register")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Message */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="max-w-md w-full text-center">
                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-100 rounded-full mb-6">
                            <Lock className="w-10 h-10 text-indigo-600" />
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
            </div>
        </div>
    );
}
