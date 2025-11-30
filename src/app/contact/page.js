"use client";

import { useState } from "react";
import {
    Mail,
    Send,
    CheckCircle,
    AlertCircle,
    User,
    MessageSquare,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ContactPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Effacer l'erreur du champ modifié
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError("");
        setSuccess(false);
        setIsLoading(true);

        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors) {
                    // Erreurs de validation Zod
                    const formattedErrors = {};
                    data.errors.forEach((error) => {
                        formattedErrors[error.field] = error.message;
                    });
                    setErrors(formattedErrors);
                } else {
                    setApiError(data.error || "Une erreur est survenue");
                }
                return;
            }

            // Succès
            setSuccess(true);
            setFormData({ name: "", email: "", subject: "", message: "" });

            // Masquer le message de succès après 5 secondes
            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Erreur:", error);
            setApiError(
                "Impossible de contacter le serveur. Veuillez réessayer."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <div className="lg:ml-64 mt-16 p-4 sm:p-6 lg:p-8">
                {/* En-tête */}
                <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                                Contactez-nous
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1">
                                Une question ? Un problème ? Nous sommes là pour
                                vous aider
                            </p>
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Informations de contact */}
                        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
                            {/* Card Support */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                            Support par email
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                            Réponse sous 24h
                                        </p>
                                        <a
                                            href="mailto:support@memkeypass.com"
                                            className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                                        >
                                            support@memkeypass.com
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Card Documentation */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                            Documentation
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                            Guides et tutoriels
                                        </p>
                                        <a
                                            href="#"
                                            className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                                        >
                                            Voir la documentation
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Card FAQ */}
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                                        <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                                            FAQ
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                            Questions fréquentes
                                        </p>
                                        <a
                                            href="#"
                                            className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                                        >
                                            Consulter la FAQ
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Formulaire de contact */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
                                {/* Message de succès */}
                                {success && (
                                    <div className="mb-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl flex items-start gap-3 animate-fade-in">
                                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-green-900">
                                                Message envoyé avec succès !
                                            </p>
                                            <p className="text-xs sm:text-sm text-green-700 mt-1">
                                                Nous vous répondrons dans les
                                                plus brefs délais.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Message d'erreur global */}
                                {apiError && (
                                    <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl flex items-start gap-3 animate-fade-in">
                                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">
                                            {apiError}
                                        </p>
                                    </div>
                                )}

                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4 sm:space-y-6"
                                >
                                    {/* Nom */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom complet{" "}
                                            <span className="text-xs text-gray-500">
                                                (optionnel)
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <Input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Nom complet"
                                                className={`pl-10 ${
                                                    errors.name
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Adresse email
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <Input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="exemple@email.com"
                                                required
                                                className={`pl-10 ${
                                                    errors.email
                                                        ? "border-red-500"
                                                        : ""
                                                }`}
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Sujet */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Sujet
                                        </label>
                                        <Input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="De quoi souhaitez-vous parler ?"
                                            required
                                            className={
                                                errors.subject
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {errors.subject && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.subject}
                                            </p>
                                        )}
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Message
                                        </label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            rows={6}
                                            placeholder="Décrivez votre demande en détail..."
                                            required
                                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none text-sm sm:text-base ${
                                                errors.message
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                            }`}
                                        />
                                        {errors.message && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Bouton d'envoi */}
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 sm:py-4 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Envoi en cours...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Envoyer le message
                                            </>
                                        )}
                                    </Button>
                                </form>

                                {/* Note de confidentialité */}
                                <div className="mt-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                                    <p className="text-xs sm:text-sm text-blue-800">
                                        🔒 <strong>Confidentialité :</strong>{" "}
                                        Vos informations sont sécurisées et ne
                                        seront jamais partagées avec des tiers.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
