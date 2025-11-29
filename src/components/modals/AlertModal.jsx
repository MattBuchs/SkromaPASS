"use client";

import { useEffect } from "react";
import Button from "../ui/Button";

export default function AlertModal({
    isOpen,
    onClose,
    title,
    message,
    variant = "error",
    buttonText = "OK",
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

    const variantStyles = {
        error: {
            bg: "bg-red-50",
            icon: "text-red-600",
            iconBg: "bg-red-100",
        },
        success: {
            bg: "bg-green-50",
            icon: "text-green-600",
            iconBg: "bg-green-100",
        },
        warning: {
            bg: "bg-yellow-50",
            icon: "text-yellow-600",
            iconBg: "bg-yellow-100",
        },
        info: {
            bg: "bg-blue-50",
            icon: "text-blue-600",
            iconBg: "bg-blue-100",
        },
    };

    const style = variantStyles[variant] || variantStyles.error;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[rgb(var(--color-surface))] rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
                {/* Icon */}
                <div
                    className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${style.iconBg} mb-4`}
                >
                    {variant === "error" && (
                        <svg
                            className={`h-6 w-6 ${style.icon}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    )}
                    {variant === "success" && (
                        <svg
                            className={`h-6 w-6 ${style.icon}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    )}
                    {variant === "warning" && (
                        <svg
                            className={`h-6 w-6 ${style.icon}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    )}
                    {variant === "info" && (
                        <svg
                            className={`h-6 w-6 ${style.icon}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    )}
                </div>

                {/* Header */}
                <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
                        {title}
                    </h3>
                </div>

                {/* Message */}
                <p className="text-center text-[rgb(var(--color-text-secondary))] mb-6">
                    {message}
                </p>

                {/* Action */}
                <div className="flex justify-center">
                    <Button variant="primary" onClick={onClose}>
                        {buttonText}
                    </Button>
                </div>
            </div>
        </div>
    );
}
