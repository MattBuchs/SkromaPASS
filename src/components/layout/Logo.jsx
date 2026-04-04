import Image from "next/image";
import Link from "next/link";

export default function Logo({
	url = null,
	width = 40,
	height = 40,
	isTitleDisplayed = true,
	titleSize = "text-lg md:text-xl",
	textColor = "text-[rgb(var(--color-text-primary))]",
	flexDirection = "row",
}) {
	return (
		<>
			{url ? (
				<Link
					href={url}
					className={`flex ${flexDirection === "column" ? "flex-col" : "flex-row"} items-center gap-2 group`}
				>
					<Image
						src="/icon-192.png"
						alt="SkromaPASS Logo"
						width={width}
						height={height}
						className="transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_10px_rgba(20,184,166,0.5)] group-hover:rotate-3"
					/>
					{isTitleDisplayed && (
						<span
							className={`${titleSize} font-bold ${textColor} bg-linear-to-r from-teal-400 to-cyan-300 bg-clip-text group-hover:text-transparent transition-colors duration-300`}
						>
							SkromaPASS
						</span>
					)}
				</Link>
			) : (
				<div
					className={`flex ${flexDirection === "column" ? "flex-col" : "flex-row"} items-center gap-2`}
				>
					<Image
						src="/icon-192.png"
						alt="SkromaPASS Logo"
						width={width}
						height={height}
					/>
					{isTitleDisplayed && (
						<span className={`${titleSize} font-bold ${textColor}`}>
							SkromaPASS
						</span>
					)}
				</div>
			)}
		</>
	);
}
