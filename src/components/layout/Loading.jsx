import Image from "next/image";

export default function Loading() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="flex flex-col items-center relative">
				<Image
					src="/SkromaPASS.svg"
					alt="SkromaPASS"
					className="w-48 h-48"
					width={200}
					height={200}
				/>
				<div className="flex items-center gap-3.5 mt-5 mb-1 absolute left-1/2 top-[60%] -translate-x-1/2 -translate-y-1/2">
					{[0, 0.15, 0.3, 0.45, 0.6].map((delay, i) => (
						<span
							key={i}
							className="w-2.5 h-2.5 rounded-full bg-[rgb(var(--color-primary))] animate-dot"
							style={{ animationDelay: `${delay}s` }}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
