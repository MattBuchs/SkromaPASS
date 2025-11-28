"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import SettingsIcon from "@/components/icons/Settings";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("account");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [settings, setSettings] = useState({
        email: "user@example.com",
        name: "Utilisateur",
        autoLogout: "30",
        twoFactor: false,
        notifications: true,
        darkMode: false,
    });

    const handleSave = () => {
        alert("Paramètres sauvegardés !");
    };

    return (
        <div className="min-h-screen">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <SettingsIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
                                Paramètres
                            </h1>
                        </div>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            Gérez vos préférences et paramètres de sécurité
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-[rgb(var(--color-border))]">
                        <button
                            onClick={() => setActiveTab("account")}
                            className={`px-4 py-3 font-medium transition-colors ${
                                activeTab === "account"
                                    ? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                        >
                            Compte
                        </button>
                        <button
                            onClick={() => setActiveTab("security")}
                            className={`px-4 py-3 font-medium transition-colors ${
                                activeTab === "security"
                                    ? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                        >
                            Sécurité
                        </button>
                        <button
                            onClick={() => setActiveTab("preferences")}
                            className={`px-4 py-3 font-medium transition-colors ${
                                activeTab === "preferences"
                                    ? "text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-primary))]"
                                    : "text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]"
                            }`}
                        >
                            Préférences
                        </button>
                    </div>

                    {/* Account Tab */}
                    {activeTab === "account" && (
                        <div className="space-y-6">
                            <Card>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                    Informations du compte
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            Nom
                                        </label>
                                        <Input
                                            type="text"
                                            value={settings.name}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            Email
                                        </label>
                                        <Input
                                            type="email"
                                            value={settings.email}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                    Modifier le mot de passe principal
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            Mot de passe actuel
                                        </label>
                                        <Input type="password" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            Nouveau mot de passe
                                        </label>
                                        <Input type="password" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            Confirmer le mot de passe
                                        </label>
                                        <Input type="password" />
                                    </div>
                                    <Button variant="primary">
                                        Changer le mot de passe
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === "security" && (
                        <div className="space-y-6">
                            <Card>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                    Authentification à deux facteurs
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[rgb(var(--color-text-primary))] font-medium">
                                            Activer la 2FA
                                        </p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            Ajoutez une couche de sécurité
                                            supplémentaire
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.twoFactor}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    twoFactor: e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgb(var(--color-primary))]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
                                    </label>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                    Déconnexion automatique
                                </h3>
                                <div className="space-y-4">
                                    <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                        Déconnectez-vous automatiquement après
                                        une période d&apos;inactivité
                                    </p>
                                    <div>
                                        <label className="block text-sm font-medium text-[rgb(var(--color-text-secondary))] mb-2">
                                            Délai (minutes)
                                        </label>
                                        <Input
                                            type="number"
                                            value={settings.autoLogout}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    autoLogout: e.target.value,
                                                })
                                            }
                                            min="5"
                                            max="120"
                                        />
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-red-50 border-red-200">
                                <h3 className="text-lg font-semibold text-red-900 mb-4">
                                    Zone de danger
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-red-900 font-medium">
                                                Supprimer le compte
                                            </p>
                                            <p className="text-sm text-red-700">
                                                Cette action est irréversible
                                            </p>
                                        </div>
                                        <Button variant="danger">
                                            Supprimer
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === "preferences" && (
                        <div className="space-y-6">
                            <Card>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                    Apparence
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[rgb(var(--color-text-primary))] font-medium">
                                            Mode sombre
                                        </p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            Activez le thème sombre de
                                            l&apos;application
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.darkMode}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    darkMode: e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgb(var(--color-primary))]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
                                    </label>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                                    Notifications
                                </h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[rgb(var(--color-text-primary))] font-medium">
                                            Activer les notifications
                                        </p>
                                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                            Recevez des alertes de sécurité
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications}
                                            onChange={(e) =>
                                                setSettings({
                                                    ...settings,
                                                    notifications:
                                                        e.target.checked,
                                                })
                                            }
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[rgb(var(--color-primary))]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
                                    </label>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button variant="primary" onClick={handleSave}>
                            Sauvegarder les modifications
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
