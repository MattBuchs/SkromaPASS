"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import KeyIcon from "@/components/icons/Key";
import CopyIcon from "@/components/icons/Copy";
import EyeIcon from "@/components/icons/Eye";
import EyeSlashIcon from "@/components/icons/EyeSlash";

export default function GeneratorPage() {
    const [password, setPassword] = useState("");
    const [length, setLength] = useState(16);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(true);
    const [showPassword, setShowPassword] = useState(true);
    const [copied, setCopied] = useState(false);
    const [strength, setStrength] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const calculateStrength = (pwd) => {
        let str = 0;
        if (pwd.length >= 8) str += 25;
        if (pwd.length >= 12) str += 25;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) str += 20;
        if (/[0-9]/.test(pwd)) str += 15;
        if (/[^a-zA-Z0-9]/.test(pwd)) str += 15;
        return Math.min(str, 100);
    };

    const generatePassword = () => {
        let charset = "";
        if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
        if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeNumbers) charset += "0123456789";
        if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

        if (charset === "") {
            alert("Veuillez sélectionner au moins un type de caractère");
            return;
        }

        let newPassword = "";
        for (let i = 0; i < length; i++) {
            newPassword += charset.charAt(
                Math.floor(Math.random() * charset.length)
            );
        }

        setPassword(newPassword);
        setStrength(calculateStrength(newPassword));
        setCopied(false);
    };

    const handleCopy = () => {
        if (password) {
            navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getStrengthColor = () => {
        if (strength < 40) return "bg-red-500";
        if (strength < 70) return "bg-orange-500";
        return "bg-green-500";
    };

    const getStrengthLabel = () => {
        if (strength < 40) return "Faible";
        if (strength < 70) return "Moyen";
        return "Fort";
    };

    const getStrengthTextColor = () => {
        if (strength < 40) return "text-red-500";
        if (strength < 70) return "text-orange-500";
        return "text-green-500";
    };

    return (
        <div className="min-h-screen">
            <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="lg:ml-64 mt-16 p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <KeyIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                            <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
                                Générateur de mots de passe
                            </h1>
                        </div>
                        <p className="text-[rgb(var(--color-text-secondary))]">
                            Créez des mots de passe sécurisés et aléatoires en
                            quelques secondes
                        </p>
                    </div>

                    {/* Generated Password Card */}
                    <Card className="mb-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                    Mot de passe généré
                                </label>
                                {password && (
                                    <span
                                        className={`text-sm font-medium ${getStrengthTextColor()}`}
                                    >
                                        {getStrengthLabel()}
                                    </span>
                                )}
                            </div>

                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    readOnly
                                    placeholder="Cliquez sur 'Générer' pour créer un mot de passe"
                                    className="pr-24 font-mono text-lg"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="p-2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="w-5 h-5" />
                                        ) : (
                                            <EyeIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        disabled={!password}
                                        className="p-2 text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors disabled:opacity-50"
                                    >
                                        <CopyIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {copied && (
                                <p className="text-sm text-green-500 font-medium">
                                    ✓ Copié dans le presse-papiers !
                                </p>
                            )}

                            {password && (
                                <div className="space-y-2">
                                    <div className="h-2 bg-[rgb(var(--color-bg-tertiary))] rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getStrengthColor()} transition-all duration-300`}
                                            style={{ width: `${strength}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Options Card */}
                    <Card className="mb-6">
                        <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-4">
                            Options de génération
                        </h3>

                        <div className="space-y-6">
                            {/* Length */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium text-[rgb(var(--color-text-secondary))]">
                                        Longueur : {length} caractères
                                    </label>
                                </div>
                                <input
                                    type="range"
                                    min="4"
                                    max="64"
                                    value={length}
                                    onChange={(e) =>
                                        setLength(Number(e.target.value))
                                    }
                                    className="w-full h-2 bg-[rgb(var(--color-bg-secondary))] rounded-lg appearance-none cursor-pointer slider"
                                />
                                <div className="flex justify-between text-xs text-[rgb(var(--color-text-tertiary))] mt-1">
                                    <span>4</span>
                                    <span>64</span>
                                </div>
                            </div>

                            {/* Character Types */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={includeLowercase}
                                        onChange={(e) =>
                                            setIncludeLowercase(
                                                e.target.checked
                                            )
                                        }
                                        className="w-5 h-5 rounded border-2 border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Lettres minuscules (a-z)
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={includeUppercase}
                                        onChange={(e) =>
                                            setIncludeUppercase(
                                                e.target.checked
                                            )
                                        }
                                        className="w-5 h-5 rounded border-2 border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Lettres majuscules (A-Z)
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={includeNumbers}
                                        onChange={(e) =>
                                            setIncludeNumbers(e.target.checked)
                                        }
                                        className="w-5 h-5 rounded border-2 border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Chiffres (0-9)
                                    </span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={includeSymbols}
                                        onChange={(e) =>
                                            setIncludeSymbols(e.target.checked)
                                        }
                                        className="w-5 h-5 rounded border-2 border-[rgb(var(--color-border))] text-[rgb(var(--color-primary))] focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-offset-0 cursor-pointer"
                                    />
                                    <span className="text-[rgb(var(--color-text-primary))] group-hover:text-[rgb(var(--color-primary))] transition-colors">
                                        Symboles (!@#$%^&*)
                                    </span>
                                </label>
                            </div>
                        </div>
                    </Card>

                    {/* Generate Button */}
                    <Button
                        variant="primary"
                        onClick={generatePassword}
                        className="w-full"
                    >
                        <KeyIcon className="w-5 h-5 mr-2" />
                        Générer un nouveau mot de passe
                    </Button>

                    {/* Tips Card */}
                    <Card className="mt-6 bg-blue-50 border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3">
                            💡 Conseils de sécurité
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800">
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>
                                    Utilisez au moins 12 caractères pour une
                                    meilleure sécurité
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>
                                    Incluez des majuscules, minuscules, chiffres
                                    et symboles
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>
                                    Ne réutilisez jamais le même mot de passe
                                    sur plusieurs sites
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>
                                    Changez régulièrement vos mots de passe
                                    importants
                                </span>
                            </li>
                        </ul>
                    </Card>
                </div>
            </main>
        </div>
    );
}
