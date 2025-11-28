"use client";

import { useState } from "react";
import { useFolders, useAddFolder, useDeleteFolder } from "@/hooks/useApi";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import FolderIcon from "@/components/icons/Folder";
import PlusIcon from "@/components/icons/Plus";
import TrashIcon from "@/components/icons/Trash";
import LockIcon from "@/components/icons/Lock";

export default function FoldersPage() {
    const { data: folders = [], isLoading: loading } = useFolders();
    const addFolderMutation = useAddFolder();
    const deleteFolderMutation = useDeleteFolder();

    const [isCreating, setIsCreating] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        try {
            await addFolderMutation.mutateAsync({
                name: newFolderName,
                description: "",
            });
            setNewFolderName("");
            setIsCreating(false);
        } catch (error) {
            console.error("Error creating folder:", error);
            alert("Erreur lors de la création du dossier");
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce dossier ?")) return;

        try {
            await deleteFolderMutation.mutateAsync(folderId);
        } catch (error) {
            console.error("Error deleting folder:", error);
            alert("Erreur lors de la suppression");
        }
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
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <FolderIcon className="w-8 h-8 text-[rgb(var(--color-primary))]" />
                                <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">
                                    Mes dossiers
                                </h1>
                            </div>
                            <p className="text-[rgb(var(--color-text-secondary))]">
                                Organisez vos mots de passe par dossiers
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => setIsCreating(true)}
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Nouveau dossier
                        </Button>
                    </div>

                    {/* Create Folder Form */}
                    {isCreating && (
                        <Card className="mb-6 border-2 border-[rgb(var(--color-primary))]">
                            <form onSubmit={handleCreateFolder}>
                                <div className="flex gap-3">
                                    <Input
                                        type="text"
                                        placeholder="Nom du dossier..."
                                        value={newFolderName}
                                        onChange={(e) =>
                                            setNewFolderName(e.target.value)
                                        }
                                        autoFocus
                                        className="flex-1"
                                    />
                                    <Button type="submit" variant="primary">
                                        Créer
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setNewFolderName("");
                                        }}
                                    >
                                        Annuler
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    {/* Folders Grid */}
                    {folders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {folders.map((folder) => (
                                <Card
                                    key={folder.id}
                                    hover
                                    className="group relative"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-[rgb(var(--color-primary))] rounded-xl flex items-center justify-center text-white shadow-md">
                                            <FolderIcon className="w-6 h-6" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-1">
                                                {folder.name}
                                            </h3>
                                            <p className="text-sm text-[rgb(var(--color-text-secondary))]">
                                                {folder._count?.passwords || 0}{" "}
                                                mot
                                                {folder._count?.passwords !== 1
                                                    ? "s"
                                                    : ""}{" "}
                                                de passe
                                            </p>
                                        </div>
                                        <button
                                            onClick={() =>
                                                handleDeleteFolder(folder.id)
                                            }
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-[rgb(var(--color-error))] hover:bg-red-50 rounded-lg"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-12">
                            <FolderIcon className="w-16 h-16 mx-auto text-[rgb(var(--color-text-tertiary))] mb-4" />
                            <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))] mb-2">
                                Aucun dossier
                            </h3>
                            <p className="text-[rgb(var(--color-text-secondary))] mb-4">
                                Créez votre premier dossier pour organiser vos
                                mots de passe
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => setIsCreating(true)}
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Créer un dossier
                            </Button>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}
