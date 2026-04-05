"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function Input({
	label,
	bonusLabel,
	error,
	icon: Icon,
	className = "",
	containerClassName = "",
	type = "text",
	...props
}) {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === "password";
	const inputType = isPassword ? (showPassword ? "text" : "password") : type;

	return (
		<div className={`${containerClassName}`}>
			{label && (
				<label className="block text-sm font-medium text-[rgb(var(--color-text-primary))] mb-2">
					{label}
					{bonusLabel && (
						<span className="text-xs italic text-[rgb(var(--color-text-tertiary))] ml-1">
							{bonusLabel}
						</span>
					)}
				</label>
			)}
			<div className="relative">
				{Icon && (
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Icon className="h-5 w-5 text-gray-500" />
					</div>
				)}
				<input
					type={inputType}
					className={`block w-full rounded-md border border-[rgb(var(--color-border))] bg-[rgb(var(--color-background))] px-4 py-2.5 text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-tertiary))] focus:border-[rgb(var(--color-primary))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))] focus:ring-opacity-20 transition-all duration-200 ${
						Icon ? "pl-10" : ""
					} ${isPassword ? "pr-10" : ""} ${
						error ? "border-[rgb(var(--color-error))]" : ""
					} ${className}`}
					{...props}
				/>
				{isPassword && (
					<button
						type="button"
						tabIndex={-1}
						onClick={() => setShowPassword((v) => !v)}
						className="absolute inset-y-0 right-0 pr-3 flex items-center text-[rgb(var(--color-text-tertiary))] hover:text-[rgb(var(--color-primary))] transition-colors cursor-pointer"
						aria-label={
							showPassword
								? "Masquer le mot de passe"
								: "Afficher le mot de passe"
						}
					>
						{showPassword ? (
							<EyeOff className="h-5 w-5" />
						) : (
							<Eye className="h-5 w-5" />
						)}
					</button>
				)}
			</div>
			{error && (
				<p className="mt-1 text-sm text-[rgb(var(--color-error))]">
					{error}
				</p>
			)}
		</div>
	);
}
