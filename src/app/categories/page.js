"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FolderIcon from "@/components/icons/Folder";
import PlusIcon from "@/components/icons/Plus";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/categories");
            const data = await response.json();
            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error("Error loading categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (name) => {
        const colors = {
            Personnel: "bg-blue-500",
            Professionnel: "bg-purple-500",
            Social: "bg-pink-500",
            Shopping: "bg-orange-500",
            Divertissement: "bg-red-500",
            Développement: "bg-green-500",
        };
        return colors[name] || "bg-teal-500";
    };

    if (loading) {
        return (
            <div className="min-h-screen">
                <Header
                    onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                />
                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />
                <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <FolderIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-primary))] animate-pulse mb-4" />
                            <p className="text-[rgb(var(--color-text-secondary))]">
                                Chargement...
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <FolderIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
                                Catégories
                            </h1>
                        </div>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            Classez vos mots de passe par catégories
                        </p>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Card key={category.id} hover className="group">
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-12 h-12 ${getCategoryColor(
                                            category.name
                                        )} rounded-xl flex items-center justify-center text-white shadow-md`}
                                    >
                                        <FolderIcon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            {category._count?.passwords || 0}{" "}
                                            mot
                                            {category._count?.passwords !== 1
                                                ? "s"
                                                : ""}{" "}
                                            de passe
                                        </p>
                                        {category.description && (
                                            <p className="text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                                                {category.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Info Card */}
                    <Card className="mt-8 bg-blue-50 border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            💡 À propos des catégories
                        </h3>
                        <p className="text-sm text-blue-800">
                            Les catégories vous permettent d&apos;organiser vos
                            mots de passe par thématique. Vous pouvez assigner
                            une catégorie lors de la création ou modification
                            d&apos;un mot de passe.
                        </p>
                    </Card>
                </div>
            </main>
        </div>
    );
}
