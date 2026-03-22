import Image from "next/image";
import Link from "next/link";

export default function Logo({
	url = null,
	width = 40,
	height = 40,
	isTitleDisplayed = true,
	titleSize = "text-lg md:text-xl",
}) {
	return (
		<div className="flex-1 flex justify-center lg:justify-start lg:ml-0">
			{url ? (
				<Link href={url} className="flex items-center gap-2 group">
					<Image
						src="/icon-192.png"
						alt="SkromaPASS Logo"
						width={width}
						height={height}
						className={`w-${width} h-${height} hidden lg:block`}
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
				<div className="flex items-center gap-2">
					<Image
						src="/icon-192.png"
						alt="SkromaPASS Logo"
						width={width}
						height={height}
						className={`w-${width} h-${height} hidden lg:block`}
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
		</div>
	);
}
