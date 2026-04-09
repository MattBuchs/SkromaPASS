"use client";

import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";

export default function Loading({ isFullScreen = true }) {
	const { theme } = useTheme();
	return (
		<div
			className={`${isFullScreen ? "min-h-screen" : "h-full"} ${isFullScreen ? (theme === "dark" ? "dark bg-[rgb(var(--color-background))]" : "bg-white") : ""} flex items-center justify-center`}
		>
			<div className="flex flex-col items-center relative">
				<Image
					src="/SkromaPASS.svg"
					alt="SkromaPASS"
					className={isFullScreen ? "w-48 h-48" : "w-28 h-28"}
					width={isFullScreen ? 192 : 112}
					height={isFullScreen ? 192 : 112}
					loading="eager"
				/>
				<div
					className={`flex items-center ${isFullScreen ? "gap-3.5 mt-5" : "gap-2 mt-3.5"} mb-1 absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2`}
				>
					{[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
						<span
							key={i}
							className={`${isFullScreen ? "w-2.5 h-2.5" : "w-2 h-2"} rounded-full bg-[rgb(var(--color-primary))] animate-dot`}
							style={{ animationDelay: `${delay}s` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
