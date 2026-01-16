"use client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Heart, ListPlus, Package } from "lucide-react";
import { useParams, redirect } from "next/navigation";
import useSWR from "swr";
import { PackageList } from "@/models/packageLists";
import CreatePackageListForm from "@/components/CreatePackageListForm";
import { PackageFilteredData } from "@/types/homebrew";
import PackageListCard from "@/components/PackageListCard";
import { authClient } from "@/lib/auth-client";

const fetcher = ([url, id]: [string, string?]) =>
	fetch(`${url}/${id || ""}`).then((res) => res.json());

export default function MyLists() {
	const params = useParams();

	const { data, error, isPending } = authClient.useSession();

	const userId = data?.user?.id;

	const { data: lists } = useSWR<PackageList[], Error>(
		["/api/packageLists/getByUserId", userId],
		fetcher,
	);
	const { data: likedLists } = useSWR<PackageList[], Error>(
		["/api/packageLists/getLikedByUserId", userId],
		fetcher,
	);
	const { data: packagesData } = useSWR<PackageFilteredData[], Error>(
		["/api/packages/getAll"],
		fetcher,
	);
	if (isPending) {
		return <div>Pending</div>;
	}
	if (!data || error) {
		redirect("/signin");
	}
	const { createNewList, package: defaultPkg } = params;

	return (
		<div className="space-y-8">
			<h1 className="text-3xl font-bold">My Lists</h1>

			<Tabs defaultValue="my-lists" className="w-full">
				<TabsList className="grid w-full grid-cols-2 mb-8">
					<TabsTrigger
						value="my-lists"
						className="flex items-center cursor-pointer"
					>
						<ListPlus className="mr-2 h-4 w-4" />
						<span>My Lists</span>
					</TabsTrigger>
					<TabsTrigger
						value="liked-lists"
						className="flex items-center cursor-pointer"
					>
						<Heart className="mr-2 h-4 w-4" />
						<span>Liked Lists</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="my-lists" className="space-y-6">
					<div className="flex justify-between items-center h-9">
						<h2 className="text-xl font-semibold">
							Lists You&#39;ve Created
						</h2>
						<CreatePackageListForm
							isOpen={Boolean(createNewList)}
							packages={packagesData ?? []}
							defaultPackage={defaultPkg as string}
						/>
					</div>

					{!lists || lists.length === 0 ? (
						<div className="text-center py-12 rounded-lg">
							<Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">
								No lists yet
							</h3>
							<p className="text-muted-foreground mb-4">
								You haven&#39;t created any lists yet.
							</p>
							<CreatePackageListForm
								isOpen={Boolean(createNewList)}
								packages={packagesData ?? []}
								defaultPackage={defaultPkg as string}
							/>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{lists?.map((list) => (
								<PackageListCard
									key={list._id?.toString()}
									listId={list._id?.toString() as string}
									listName={list.name}
									packageCount={list.packages.length}
									installationCommand={
										list.installationCommand
									}
									listDescription={list.description}
									owner={
										list.owner?.name ??
										list.owner.email
									}
									icon={list.icon}
								/>
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="liked-lists" className="space-y-6">
					<div className="flex justify-between items-center h-9">
						<h2 className="text-xl font-semibold">
							Lists You&#39;ve Liked
						</h2>
					</div>

					{!likedLists || likedLists?.length === 0 ? (
						<div className="text-center py-12 rounded-lg">
							<Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
							<h3 className="text-lg font-medium mb-2">
								No liked lists yet
							</h3>
							<p className="text-muted-foreground mb-4">
								You haven&#39;t liked any lists yet.
							</p>
							<Button asChild>
								<Link href="/lists">Explore Public Lists</Link>
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{likedLists?.map((list) => (
									<PackageListCard
										key={list._id?.toString() as string}
										listId={list._id?.toString() as string}
										listName={list.name}
										packageCount={list.packages.length}
										installationCommand={
											list.installationCommand
										}
										listDescription={list.description}
										owner={
											(list.owner?.name ??
												list.owner.email)
										}
										icon={list.icon}
									/>
								))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
