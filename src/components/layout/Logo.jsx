import Image from "next/image";
import Link from "next/link";

export default function Logo({
	url = null,
	width = 40,
	height = 40,
	isTitleDisplayed = true,
	titleSize = "text-lg md:text-xl",
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
						className={`w-${width} h-${height}`}
					/>
					{isTitleDisplayed && (
						<span
							className={`${titleSize} font-bold text-[rgb(var(--color-text-primary))] group-hover:text-teal-600 transition-colors`}
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
						className={`w-${width} h-${height}`}
					/>
					{isTitleDisplayed && (
						<span
							className={`${titleSize} font-bold text-[rgb(var(--color-text-primary))]`}
						>
							SkromaPASS
						</span>
					)}
				</div>
			)}
		</>
	);
}
