"use client";
import { Beer, Package, ExternalLink, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import AddPackageToListForm from "@/components/AddPackageToListForm";
import { PackageDetails, PackageList } from "@/models/packageLists";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

interface PackageHeaderProps {
	name: string;
	description: string;
	homepage: string;
	packageType: "formula" | "cask";
	currentPackageId: PackageDetails;
}

export function PackageHeader({
	name,
	description,
	homepage,
	packageType,
	currentPackageId,
}: PackageHeaderProps) {
	const { data: session } = authClient.useSession();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const userId = session?.user?.id;
	const [open, setOpen] = useState(false);

	const fetcher = (...args: [RequestInfo, RequestInit?]) =>
		fetch(...args).then((res) => res.json());
	const { data: listData } = useSWR<PackageList[]>(
		`/api/packageLists/getByUserId/${userId as string}`,
		fetcher,
	);

	const handleClick = () => {
		if (!session) {
			return router.push(
				`/signin?callbackURL=${pathname}${encodeURIComponent("?" + searchParams)}`,
			);
		}
	};

	return (
		<Card className="mb-8">
			<CardContent className="flex items-start space-x-4 flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 p-6 rounded-lg">
				<div className="bg-primary text-primary-foreground p-3 rounded-lg">
					{packageType === "formula" ? (
						<Beer size={32} />
					) : (
						<Package size={32} />
					)}
				</div>
				<div className="flex flex-col md:flex-row flex-grow justify-between items-start">
					<div>
						<h1 className="text-3xl font-bold">{name}</h1>
						<p className="text-xl text-muted-foreground mt-2">
							{description}
						</p>
						<div className="my-2 flex items-center space-x-4">
							<span className="text-muted-foreground text-sm">
								{packageType === "formula" ? "Formula" : "Cask"}
							</span>
						</div>
					</div>
					<div className="flex items-center space-x-4">
						<Popover open={open} onOpenChange={setOpen}>
							<PopoverTrigger asChild onClick={handleClick}>
								<Button className="cursor-pointer">
									<BookmarkPlus />
									Add to List
								</Button>
							</PopoverTrigger>
							<PopoverContent>
								<AddPackageToListForm
									currentPackageId={currentPackageId}
									lists={listData ?? []}
								/>
							</PopoverContent>
						</Popover>

						<Button asChild variant={"secondary"}>
							<Link
								href={homepage}
								target="_blank"
								rel="noopener noreferrer"
							>
								<ExternalLink />
								Visit Homepage
							</Link>
						</Button>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
