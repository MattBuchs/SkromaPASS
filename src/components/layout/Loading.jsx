import Image from "next/image";

export default function Loading({ isFullScreen = true }) {
	return (
		<div
			className={`${isFullScreen ? "min-h-screen" : "h-full"} flex items-center justify-center`}
		>
			<div className="flex flex-col items-center relative">
				<Image
					src="/SkromaPASS.svg"
					alt="SkromaPASS"
					className={`w-${isFullScreen ? 48 : 28} h-${isFullScreen ? 48 : 28}`}
					width={isFullScreen ? 192 : 112}
					height={isFullScreen ? 192 : 112}
				/>
				<div
					className={`flex items-center ${isFullScreen ? "gap-3.5 mt-5" : "gap-2 mt-3.5"} mb-1 absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2`}
				>
					{[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
						<span
							key={i}
							className={`w-${isFullScreen ? 2.5 : 2} h-${isFullScreen ? 2.5 : 2} rounded-full bg-[rgb(var(--color-primary))] animate-dot`}
							style={{ animationDelay: `${delay}s` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
