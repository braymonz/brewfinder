"use client";

import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

type Props = {
	name: string;
	homepage?: string;
	size?: number;
	className?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// SWR configuration for icon caching
const swrOptions = {
	revalidateOnFocus: false,
	revalidateOnReconnect: false,
	revalidateIfStale: false,
	dedupingInterval: 1000 * 60 * 60, // 1 hour to prevent duplicate requests
};

export default function PackageImage({
	name,
	homepage,
	size = 32,
	className = "object-contain rounded-md",
}: Readonly<Props>) {
	const [isVisible, setIsVisible] = useState(false);
	const containerRef = useRef<HTMLImageElement>(null);

	// Only fetch when element is visible (lazy loading)
	useEffect(() => {
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setIsVisible(true);
					observer.disconnect(); // Stop observing once visible
				}
			},
			{ rootMargin: "100px" }, // Start loading 100px before visible
		);

		if (containerRef.current) {
			observer.observe(containerRef.current);
		}

		return () => observer.disconnect();
	}, []);

	const { data, isLoading } = useSWR<{
		iconUrl: string | null;
		defaultIcon: string;
	}>(
		// Only fetch when visible
		isVisible
			? `/api/icons?name=${encodeURIComponent(name)}&homepage=${encodeURIComponent(homepage || "")}`
			: null,
		fetcher,
		swrOptions,
	);

	const iconUrl = data?.iconUrl || data?.defaultIcon;

	// Show placeholder while not visible or loading
	if (!isVisible || isLoading || !iconUrl) {
		return (
			<img
				ref={containerRef}
				src={`https://www.google.com/s2/favicons?sz=128&domain=${homepage || "brew.sh"}`}
				alt={name}
				width={size}
				height={size}
				className={className}
			/>
		);
	}

	return (
		<img
			src={iconUrl}
			alt={name}
			width={size}
			height={size}
			className={className}
			onError={(e) => {
				(e.target as HTMLImageElement).src =
					data?.defaultIcon ||
					"https://brew.sh/assets/img/homebrew-256x256.png";
			}}
		/>
	);
}
