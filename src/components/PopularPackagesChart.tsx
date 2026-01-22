"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { DownloadCloud } from "lucide-react";
import { Package, PackageAnalytics } from "@/types/homebrew";
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	ChartLegend,
	ChartLegendContent,
} from "./ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import PackageImage from "./PackageImage";

import { Badge } from "./ui/badge";

interface PopularPackagesChartProps {
	data: PackageAnalytics["items"];
	chartHeader: string;
}

interface XAxisTickProps {
	x?: number;
	y?: number;
	payload?: { value: string };
}

const chartConfig = {
	cask: {
		label: "Cask Installations",
		icon: DownloadCloud,
		theme: { light: "hsl(var(--chart-1))", dark: "hsl(var(--chart-1))" },
	},
	formula: {
		label: "Formula Installations",
		icon: DownloadCloud,
		theme: { light: "hsl(var(--chart-1))", dark: "hsl(var(--chart-1))" },
	},
} satisfies ChartConfig;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getPackageKey = (pkg: Package) =>
	pkg.token ?? (Array.isArray(pkg.name) ? pkg.name[0] : pkg.name);

const parseItemCount = (count: string) => parseFloat(count.replace(/,/g, ""));

// Custom X-Axis Tick Component
function XAxisTick({
	x,
	y,
	payload,
	packageDetailsMap,
	showImages,
}: XAxisTickProps & {
	packageDetailsMap: Map<string, Package>;
	showImages: boolean;
}) {
	const pkgName = payload?.value ?? "";
	const homepage = packageDetailsMap.get(pkgName)?.homepage;

	return (
		<g transform={`translate(${x},${y})`}>
			{showImages && (
				<foreignObject x={-16} y={4} width={32} height={32}>
					<PackageImage name={pkgName} homepage={homepage} size={32} />
				</foreignObject>
			)}
			<foreignObject x={-40} y={showImages ? 38 : 4} width={80} height={36}>
				<div className="flex h-full w-full items-start justify-center overflow-hidden wrap-break-word text-center text-xs leading-tight">
					{pkgName}
				</div>
			</foreignObject>
		</g>
	);
}

export function PopularPackagesChart({ data, chartHeader }: PopularPackagesChartProps) {
	const router = useRouter();

	const packageType = data.length > 0 && "cask" in data[0] ? "cask" : "formula";

	const packageTokens = useMemo(
		() =>
			data.map((item) => ({
				name: "cask" in item ? item.cask : item.formula,
				type: "cask" in item ? "cask" : "formula",
			})),
		[data],
	);

	const { data: packagesDetails, isLoading } = useSWR<Package[]>(
		packageTokens.length > 0
			? `homebrew-packages-${packageType}-${packageTokens.map((p) => p.name).join(",")}`
			: null,
		async () => {
			const results = await Promise.allSettled(
				packageTokens.map((pkg) =>
					fetcher(`https://formulae.brew.sh/api/${encodeURIComponent(pkg.type)}/${encodeURIComponent(pkg.name)}.json`),
				),
			);
			return results
				.filter((r): r is PromiseFulfilledResult<Package> => r.status === "fulfilled")
				.map((r) => r.value);
		},
	);

	const detailsMap = useMemo(() => {
		const map = new Map<string, Package>();
		packagesDetails?.forEach((pkg) => map.set(getPackageKey(pkg), pkg));
		return map;
	}, [packagesDetails]);

	const formattedData = useMemo(
		() =>
			data.map((item) => ({
				name: "cask" in item ? item.cask : item.formula,
				cask: "cask" in item ? parseItemCount(item.count) : 0,
				formula: "formula" in item ? parseItemCount(item.count) : 0,
				percentage: item.percent,
			})),
		[data],
	);

	const handleBarClick = (barData: { payload?: { name?: string } }) => {
		if (barData?.payload?.name && !barData.payload.name.includes("/")) {
			router.push(`/packages/${barData.payload.name}?type=${packageType}`);
		}
	};

	const showImages = !isLoading && !!packagesDetails?.length;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{chartHeader}</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				<ChartContainer config={chartConfig}>
					<BarChart accessibilityLayer data={formattedData}>
						<CartesianGrid vertical={false} strokeDasharray="3 3" />
						<XAxis
							dataKey="name"
							tickLine={false}
							tickMargin={10}
							axisLine={false}
							height={85}
							interval={0}
							tick={(props: XAxisTickProps) => (
								<XAxisTick {...props} packageDetailsMap={detailsMap} showImages={showImages} />
							)}
						/>
						<YAxis
							tickFormatter={(value) =>
								value % 1 === 0 ? value.toLocaleString() : value.toFixed(2)
							}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value, _, item) => {
										if (value === undefined) return null;
										const isThirdParty = item.payload.name?.includes("/");
										return (
											<div className="flex flex-1 flex-col items-start justify-between gap-2">
												<div className="flex items-center gap-2">
													<span className="font-mono font-medium tabular-nums">
														{value.toLocaleString()} ({item.payload.percentage}%)
													</span>
													
												</div>
												{isThirdParty && (
														<Badge variant="secondary" className="text-xs px-1.5 py-0">
															3rd party tap
														</Badge>
													)}
											</div>
										);
									}}
								/>
							}
						/>
						<ChartLegend
							className="mb-4"
							content={(props) => (
								<ChartLegendContent accessKey={packageType} payload={props.payload}/>
							)}
						/>
						<Bar
							dataKey={packageType}
							fill={`var(--color-${packageType})`}
							radius={4}
							onClick={handleBarClick}
							className="cursor-pointer"
						/>
					</BarChart>
				</ChartContainer>
			</CardContent>
		</Card>
	);
}
