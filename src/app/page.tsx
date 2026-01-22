import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Download, Star, ArrowUpRight } from "lucide-react";
import { PopularPackagesChart } from "@/components/PopularPackagesChart";
import { PackageAnalytics } from "@/types/homebrew";
import { SearchForm } from "@/components/SearchForm";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";

async function getAnalyticsData() {
	const [formulaRes, caskRes, releaseRes] = await Promise.all([
		fetch(
			"https://formulae.brew.sh/api/analytics/install-on-request/30d.json",
			{
				next: { revalidate: 3600 * 24 }, // Cache for 24 hours
			},
		),
		fetch("https://formulae.brew.sh/api/analytics/cask-install/30d.json", {
			next: { revalidate: 3600 * 24 }, // Cache for 24 hours
		}),
		fetch("https://api.github.com/repos/Homebrew/brew/releases/latest", {
			next: { revalidate: 3600 * 24 }, // Cache for 24 hours
		}),
	]);

	const [formulaData, caskData, homebrewLatestGHRelease] = await Promise.all([
		formulaRes.ok ? (formulaRes.json() as Promise<PackageAnalytics>) : null,
		caskRes.ok ? (caskRes.json() as Promise<PackageAnalytics>) : null,
		releaseRes.ok ? releaseRes.json() : null,
	]);

	return { formulaData, caskData, homebrewLatestGHRelease };
}

export default async function Home() {
	const { formulaData, caskData, homebrewLatestGHRelease } =
		await getAnalyticsData();

	const totalPackages =
		(caskData?.total_items || 0) + (formulaData?.total_items || 0);
	const totalDownloads =
		(caskData?.total_count || 0) + (formulaData?.total_count || 0);

	return (
		<div className="space-y-12 grow flex flex-col justify-center">
			<section className="text-center space-y-6 min-h-80 flex flex-col justify-center items-center">
				<h1 className="text-4xl font-bold mb-4 bg-background">
					<TextShimmer duration={5}>
						Welcome to Brewfinder
					</TextShimmer>
				</h1>
				<p className="text-xl text-muted-foreground bg-background">
					Discover, save, and install{" "}
					<Link
						href="https://brew.sh/"
						target={"_blank"}
						rel="noopener noreferrer"
						className="underline decoration-primary decoration-solid decoration-2"
					>
						Homebrew
					</Link>{" "}
					packages with ease
				</p>
				<div className="w-full max-w-2xl">
					<SearchForm />
				</div>
			</section>

			<section className="mb-12">
				<h2 className="text-2xl font-semibold inline-block bg-background">
					Homebrew Statistics
				</h2>
				<span className="text-muted-foreground text-sm block mb-4">
					(Last 30 Days)
				</span>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Current Homebrew Version
							</CardTitle>
							<Star className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								<Link
									href={
										(homebrewLatestGHRelease?.html_url as string) ??
										""
									}
									target={"_blank"}
									rel="noopener noreferrer"
									className="inline-flex items-center underline decoration-primary not-dark:decoration-foreground decoration-2 decoration-solid  hover:underline-solid text-secondary-foreground"
								>
									{(homebrewLatestGHRelease?.tag_name as string) ??
										"---"}
									<ArrowUpRight className="ml-1 h-4 w-4" />
								</Link>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Unique Package Installations (30 days)
							</CardTitle>
							<Package className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{totalPackages.toLocaleString()}
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">
								Total Package Installations (30 days)
							</CardTitle>
							<Download className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">
								{totalDownloads.toLocaleString()}
							</div>
						</CardContent>
					</Card>
				</div>
			</section>

			{caskData && formulaData && (
				<section className="mb-12">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<PopularPackagesChart
							chartHeader="Casks"
							data={caskData.items.slice(0, 5)}
						/>
						<PopularPackagesChart
							chartHeader="Formulae"
							data={formulaData.items.slice(0, 5)}
						/>
					</div>
				</section>
			)}

			<section className="mb-12">
				<h2 className="text-2xl font-semibold mb-4 inline-block bg-background">
					Formulae vs Casks
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<Card>
						<CardHeader>
							<CardTitle>Formulae</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground">
							<p>
								Command-line tools and libraries installed into
								<strong>/usr/local</strong> or
								<strong>/opt/homebrew</strong>.
							</p>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								<li>Typically run in the terminal</li>
								<li>
									No .app bundle; versioned like libraries
								</li>
								<li>
									British English plural of
									&quot;formula&quot;
								</li>
							</ul>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Casks</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2 text-muted-foreground">
							<p>
								Graphical macOS apps distributed as .app, .dmg,
								or .pkg, typically installed into
								<strong>/Applications</strong>.
							</p>
							<ul className="list-disc pl-5 space-y-1 text-sm">
								<li>GUI applications</li>
								<li>
									Provides an easy &quot;brew upgrade&quot;
									command to update all Casks (and Formulae)
									at once.
								</li>
								<li>
									It&apos;s possible to choose specific
									version installation
								</li>
							</ul>
						</CardContent>
					</Card>
				</div>
				<Card className="mt-8">
					<CardContent className="py-4">
						<div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
							<div className="text-sm text-muted-foreground">
								Unsure which to use? If it&apos;s a GUI app like
								Chrome or VS Code, it&apos;s a Cask. Terminal
								tools like git, node, ffmpeg are Formulae.
							</div>
							<div className="flex gap-2">
								<Button variant="outline" asChild>
									<Link href="/packages?type=formula">
										Browse Formulae
									</Link>
								</Button>
								<Button variant="outline" asChild>
									<Link href="/packages?type=cask">
										Browse Casks
									</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</section>
			<section className="mb-8">
				<h2 className="text-2xl font-semibold mb-4 inline-block bg-background">
					New to Homebrew?
				</h2>
				<p className="mb-4">
					Homebrew is the most popular and powerful package manager
					for <strong>macOS</strong>, available also for{" "}
					<strong>Linux</strong> and <strong>Windows</strong> (via
					WSL)
				</p>
				<div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
					<Button asChild variant="default">
						<Link
							href="https://brew.sh"
							target="_blank"
							rel="noopener noreferrer"
						>
							Installation Instructions
						</Link>
					</Button>
					<span className="px-2 bg-background text-muted-foreground">
						Or
					</span>
					<Button asChild variant="outline">
						<Link
							href="https://github.com/Homebrew/brew/releases/latest"
							target="_blank"
							rel="noopener noreferrer"
						>
							Download .pkg for macos
						</Link>
					</Button>
				</div>
				<p className="text-center text-sm text-muted-foreground inline-block bg-background">
					Follow the official installation instructions to get started
					with <strong>Homebrew</strong> and{" "}
					<strong>Brewfinder</strong>
				</p>
			</section>
		</div>
	);
}
