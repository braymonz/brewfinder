// Gets icons from macosicons.com with caching and rate limiting (if needed)
// Fallbacks to Google favicons if not found.
// Not being used for now due to macosicons.com API limitations (free tier 2 req/sec | max 50 requests per month).
// More info https://docs.macosicons.com/api-management

import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis-io";
import { macosIconsRateLimiter } from "@/lib/rate-limiter";

const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days in seconds
const DEFAULT_ICON = "https://brew.sh/assets/img/homebrew-256x256.png";
const ICONS_HASH_KEY = "icons"; // Single hash for all icons

// URL prefix compression - map common prefixes to short codes
const URL_PREFIXES: Record<string, string> = {
	"m:": "https://parsefiles.back4app.com/JPaQcFfEEQ1ePBxbf6wvzkPMEqKYHhPYv8boI1Rc/",
	"g:": "https://www.google.com/s2/favicons?sz=128&domain=",
};

const PREFIX_TO_CODE = Object.entries(URL_PREFIXES).reduce(
	(acc, [code, prefix]) => {
		acc[prefix] = code;
		return acc;
	},
	{} as Record<string, string>,
);

// Compress URL by replacing known prefixes with short codes
function compressUrl(url: string): string {
	for (const [prefix, code] of Object.entries(PREFIX_TO_CODE)) {
		if (url.startsWith(prefix)) {
			return code + url.slice(prefix.length);
		}
	}
	return url;
}

// Decompress URL by expanding short codes back to full prefixes
function decompressUrl(compressed: string): string {
	for (const [code, prefix] of Object.entries(URL_PREFIXES)) {
		if (compressed.startsWith(code)) {
			return prefix + compressed.slice(code.length);
		}
	}
	return compressed;
}

export async function GET(request: NextRequest) {
	const searchParams = request.nextUrl.searchParams;
	const name = searchParams.get("name");
	const homepage = searchParams.get("homepage");

	if (!name) {
		return NextResponse.json({ error: "Missing name" }, { status: 400 });
	}

	try {
		// HGET is more memory efficient than individual keys
		const cached = await redis.hget(ICONS_HASH_KEY, name);
		if (cached) {
			const iconUrl = decompressUrl(cached);
			return NextResponse.json(
				{ iconUrl, defaultIcon: DEFAULT_ICON },
				{
					headers: {
						"Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
						"X-Cache": "HIT",
					},
				},
			);
		}
	} catch (error) {
		console.error("Redis get error:", error);
	}

	const fetchOptions = {
		headers: {
			"Content-Type": "application/json",
			"x-api-key": `${process.env.MACOSICONS_API_KEY}`,
		},
		method: "POST",
		next: { revalidate: CACHE_TTL },
		body: JSON.stringify({
			query: name,
			searchOptions: {
				hitsPerPage: 1,
				page: 1,
			},
		}),
	};

	try {
		const macosIconsUrl = "https://api.macosicons.com/api/v1/search";

		// Rate-limited fetch to respect 2 req/sec limit
		const iconData = await macosIconsRateLimiter.execute(async () => {
			const res = await fetch(macosIconsUrl, fetchOptions);
			return res.json();
		});

		console.log({iconData})

		const iconUrl =
			iconData?.hits?.[0]?.lowResPngUrl ||
			(homepage
				? `https://www.google.com/s2/favicons?sz=128&domain=${homepage}`
				: null);

		if(iconData?.hits?.[0]?.lowResPngUrl){
			console.log("Fetched icon from macosicons for", name);
		} else {
			console.log("Using favicon for", name);
		}
		
		// Store compressed URL in Redis hash with per-field TTL (Redis 7.4+)
		if (iconUrl) {
			const compressed = compressUrl(iconUrl);
			redis
				.pipeline()
				.hset(ICONS_HASH_KEY, name, compressed)
				.call("HEXPIRE", ICONS_HASH_KEY, CACHE_TTL, "FIELDS", 1, name)
				.exec()
				.catch((error) => {
					console.error("Redis set error:", error);
				});
		}

		return NextResponse.json(
			{ iconUrl, defaultIcon: DEFAULT_ICON },
			{
				headers: {
					"Cache-Control": `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`,
					"X-Cache": "MISS",
				},
			},
		);
	} catch (error) {
		console.error("Icon fetch error:", error);
		return NextResponse.json(
			{ iconUrl: null, defaultIcon: DEFAULT_ICON },
			{ status: 200 },
		);
	}
}
