"use client";

import { useEffect } from "react";
import Button from "../ui/Button";

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    variant = "danger",
}) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[rgb(var(--color-surface))] rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">
                        {title}
                    </h3>
                </div>

                {/* Message */}
                <p className="text-[rgb(var(--color-text-secondary))] mb-6">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
