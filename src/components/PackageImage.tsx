"use client";

type Props = {
	name: string;
	homepage?: string;
	size?: number;
	className?: string;
};

export default function PackageImage({
	name,
	homepage,
	size = 32,
	className = "object-contain rounded-md",
}: Readonly<Props>) {
	const domain = homepage ? new URL(homepage).hostname : "brew.sh";

	return (
		<img
			src={`https://www.google.com/s2/favicons?sz=128&domain=${domain}`}
			alt={name}
			width={size}
			height={size}
			className={className}
			onError={(e) => {
				(e.target as HTMLImageElement).src =
					"https://brew.sh/assets/img/homebrew-256x256.png";
			}}
		/>
	);
}
