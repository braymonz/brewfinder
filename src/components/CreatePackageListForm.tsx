"use client";
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, Edit, ChevronsUpDown, Trash2 } from "lucide-react";
import type { MultiSelectGroup } from "@/components/multi-select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { PackageFilteredData } from "@/types/homebrew";
import { formSchema } from "@/schemas/zod";
import {
	filterPackages,
	getPackageName,
} from "@/lib/package-search";
import {
	IconRendererLucide,
	useIconPickerLucide,
} from "@/components/IconPicker";
import { PackageDetails, PackageList } from "@/models/packageLists";
import { Separator } from "./ui/separator";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { MultiSelect } from "./multi-select";
import PackageImage from "./PackageImage";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";

type Props = {
	packages: PackageFilteredData[];
	currentData?: PackageList;
	isOpen?: boolean;
	defaultPackage?: string;
	triggerClassName?: string;
};

export default function CreatePackageListForm({
	packages,
	currentData,
	isOpen = false,
	defaultPackage = "",
	triggerClassName,
}: Readonly<Props>) {
	const router = useRouter();
	const { mutate } = useSWRConfig();
	const { icons } = useIconPickerLucide();

	const { data: session } = authClient.useSession();

	const [isformOpen, setIsformOpen] = useState(isOpen);

	const [open, setOpen] = useState(false);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// Debounced search handler
	const handleSearchChange = useCallback((value: string) => {
		if (debounceRef.current) {
			clearTimeout(debounceRef.current);
		}

		debounceRef.current = setTimeout(() => {
			setDebouncedSearch(value);
		}, 200); // 200ms debounce delay
	}, []);

	// Cleanup timeout on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	const truncateVersion = (version: string, maxLength = 5) => {
		return version.length > maxLength
			? `${version.slice(0, maxLength)}...`
			: version;
	};

	const completePackageOptions = useMemo(() => {
		return packages.map((pkg) => {
			const pkgName = Array.isArray(pkg.name) ? pkg.name[0] : pkg.name;
			return {
				label: `${pkgName} @ ${truncateVersion(pkg.version)}`,
				value: JSON.stringify({
					id: pkg.token ?? pkgName,
					type: pkg.type,
				}),
			};
		});
	}, [packages]);

	// Memoize filtered options for the MultiSelect - only show results when searching
	const filteredOptions = useMemo(() => {
		const { casks, formulas } = filterPackages(packages, debouncedSearch, {
			maxResults: 20,
			minSearchLength: 2,
		});

		const results: MultiSelectGroup[] = [];

		if (casks.length > 0) {
			results.push({
				heading: "Casks",
				options: casks.map((pkg) => {
					const pkgName = getPackageName(pkg);
					const pkgHomepage = pkg.homepage;
					return {
						label: `${pkgName} @ ${truncateVersion(pkg.version)}`,
						value: JSON.stringify({
							id: pkg.token ?? pkgName,
							type: pkg.type,
						}),
						icon: () => (
							<PackageImage
								name={pkgName}
								homepage={pkgHomepage}
								size={24}
							/>
						),
					};
				}),
			});
		}

		if (formulas.length > 0) {
			results.push({
				heading: "Formulas",
				options: formulas.map((pkg) => {
					const pkgName = getPackageName(pkg);
					return {
						label: `${pkgName} @ ${truncateVersion(pkg.version)}`,
						value: JSON.stringify({
							id: pkg.token ?? pkgName,
							type: pkg.type,
						}),
					};
				}),
			});
		}

		return results;
	}, [packages, debouncedSearch]);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: "",
			description: "",
			packages: [],
			isPublic: false,
			icon: "",
		},
	});

	useEffect(() => {
		if (currentData) {
			form.setValue("name", currentData.name);
			form.setValue("description", currentData.description || "");
			form.setValue(
				"packages",
				currentData.packages.map((pkg) =>
					JSON.stringify({ id: pkg.id, type: pkg.type }),
				) as unknown as string[],
			);
			form.setValue("isPublic", currentData.isPublic);
			form.setValue("icon", currentData.icon);
		} else if (defaultPackage) {
			const defaultPkg = decodeURI(defaultPackage);
			form.setValue("packages", [defaultPkg]);
		}
	}, [form, currentData, defaultPackage]);

	const getOnlyPackageNamesByType = (
		packages: PackageDetails[],
		type: string,
	) => {
		return packages
			.filter((pkg) => pkg.type === type)
			.map((pkg) => pkg.id)
			.join(" ");
	};

	const getInstallationCommand = (packages: PackageDetails[]): string => {
		const formulas = getOnlyPackageNamesByType(packages, "formula");
		const casks = getOnlyPackageNamesByType(packages, "cask");

		const formulasInstallationCommand = formulas
			? `brew install ${formulas}`
			: "";
		const casksInstallationCommand = casks
			? `brew install --cask ${casks}`
			: "";
		if (formulas && casks) {
			return `${formulasInstallationCommand} && ${casksInstallationCommand}`;
		}
		return formulasInstallationCommand || casksInstallationCommand;
	};

	async function onSubmit(values: z.infer<typeof formSchema>) {
		try {
			const parsedPackages: PackageDetails[] = values.packages.map(
				(pkg) => JSON.parse(pkg),
			);
			const newListBody = {
				...values,
				owner: {
					id: session?.user?.id,
					name: session?.user?.name,
					email: session?.user?.email,
					image: session?.user?.image,
				},
				likes: currentData ? currentData.likes : [],
				packages: parsedPackages,
				installationCommand: getInstallationCommand(parsedPackages),
			};

			let newList;

			// if there is already data, then we are updating the list
			if (currentData) {
				newList = await fetch(
					`/api/packageLists/update/${currentData._id}`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(newListBody),
					},
				);
			} else {
				// create a new list
				newList = await fetch("/api/packageLists/create", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(newListBody),
				});
			}

			if (newList.ok) {
				if (currentData) {
					toast.success("List updated successfully");
				} else {
					toast.success("List created successfully");
				}
				// Revalidate SWR cache to refresh list data
				mutate(
					(key: unknown) =>
						Array.isArray(key) &&
						typeof key[0] === "string" &&
						key[0].includes("/api/packageLists"),
				);
			} else {
				toast.error("Failed to create list. Please try again.");
			}
		} catch (error) {
			console.error("Form submission error: ", error);
			toast.error("Failed to submit the form. Please try again.");
		}
		setIsformOpen(false);
	}

	async function handleDelete() {
		try {
			const listDeleted = await fetch(
				`/api/packageLists/delete/${currentData?._id}`,
				{ method: "DELETE" },
			);

			if (listDeleted.ok) {
				toast.success("List deleted successfully");
				setIsformOpen(false);
				router.push("/lists/user");
			} else {
				toast.error("Failed to delete list. Please try again.");
			}
		} catch (error) {
			console.error("List delete error: ", error);
			toast.error("Failed to delete list. Please try again.");
		}
	}

	return (
		<Dialog open={isformOpen} onOpenChange={setIsformOpen}>
			<DialogTrigger asChild>
				<Button
					className={`cursor-pointer ${triggerClassName}`}
					variant={currentData ? "outline" : "default"}
				>
					<Edit className="w-6 h-6"></Edit>
					{currentData ? "Edit List" : "Create New List"}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-3xl max-h-5/6 overflow-y-auto flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{currentData
							? "Edit package list"
							: "Create new package list"}
					</DialogTitle>
					<DialogDescription>
						Enter the details of the list
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-8 w-full mx-auto"
						id="create-package-list-form"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder=""
											type="text"
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Textarea
											placeholder=""
											className="resize-none"
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="packages"
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Packages</FormLabel>
										<FormControl>
											<MultiSelect
												autoSize={true}
												modalPopover
												hideSelectAll={true}
												maxCount={3}
												onSearchChange={
													handleSearchChange
												}
												completeOptions={
													completePackageOptions
												}
												defaultValue={field.value}
												deduplicateOptions={true}
												options={filteredOptions}
												onValueChange={field.onChange}
												placeholder="Select packages..."
											/>
										</FormControl>
										<FormDescription>
											Select multiple packages to be
											included. <br />
											You can use <b>
												&quot;c:&quot;
											</b> or <b>&quot;f:&quot;</b> prefix
											to filter by casks or formulas.{" "}
											<br />
											*Package icons might not be 100%
											accurate.
										</FormDescription>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							control={form.control}
							name="isPublic"
							render={({ field }) => (
								<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
									<FormControl>
										<Checkbox
											checked={field.value}
											onCheckedChange={field.onChange}
										/>
									</FormControl>
									<div className="space-y-1 leading-none">
										<FormLabel>Make Public</FormLabel>
										<FormDescription>
											Other users will be able to see and
											like your list
										</FormDescription>
										<FormMessage />
									</div>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="icon"
							render={({ field }) => (
								<FormItem className="flex flex-col">
									<FormLabel>Icon</FormLabel>
									<Popover>
										<PopoverTrigger asChild>
											<FormControl>
												<Button
													variant="outline"
													role="combobox"
													className={cn(
														"w-[300px] justify-between cursor-pointer",
														!field.value &&
															"text-muted-foreground",
													)}
												>
													{!!field.value && (
														<IconRendererLucide
															className="size-4 text-zinc-500"
															icon={field.value}
														/>
													)}
													Select Icon
													<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
												</Button>
											</FormControl>
										</PopoverTrigger>
										<PopoverContent
											onWheel={(e) => e.stopPropagation()} // Fix issue mentioned in https://github.com/radix-ui/primitives/issues/1159#issuecomment-2403909634
											onTouchMove={(e) =>
												e.stopPropagation()
											} // Fix issue mentioned in https://github.com/radix-ui/primitives/issues/1159#issuecomment-2403909634
											className="w-75 p-0"
										>
											<Command>
												<CommandInput placeholder="Search icon..." />
												<CommandList>
													<CommandEmpty>
														No icon found
													</CommandEmpty>
													<CommandGroup>
														{icons.map(
															(
																{
																	name,
																	Component,
																	friendly_name,
																},
																index,
															) => (
																<CommandItem
																	key={name}
																	value={
																		friendly_name +
																		index
																	}
																	onSelect={() => {
																		form.setValue(
																			"icon",
																			name,
																		);
																	}}
																	className="flex items-center gap-x-2 truncate capitalize"
																>
																	<Component />
																	{
																		friendly_name
																	}
																	<CheckIcon
																		data-selected={
																			form.getValues(
																				"icon",
																			) ==
																			name
																		}
																		className="ml-auto opacity-0 data-[selected=true]:opacity-100"
																	/>
																</CommandItem>
															),
														)}
													</CommandGroup>
												</CommandList>
											</Command>
										</PopoverContent>
									</Popover>

									<FormMessage> </FormMessage>
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<DialogFooter className="flex justify-between items-center">
					{currentData && (
						<>
							<AlertDialog open={open} onOpenChange={setOpen}>
								<AlertDialogTrigger asChild>
									<Button
										variant="destructive"
										className="w-full sm:w-auto cursor-pointer"
									>
										<Trash2 />
										Delete
									</Button>
								</AlertDialogTrigger>
								<AlertDialogContent>
									<AlertDialogHeader>
										<AlertDialogTitle>
											Are you absolutely sure?
										</AlertDialogTitle>
										<AlertDialogDescription>
											Do you really want to delete this
											list? This action cannot be undone.
										</AlertDialogDescription>
									</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>
											Cancel
										</AlertDialogCancel>
										<AlertDialogAction
											className="cursor-pointer"
											onClick={handleDelete}
											variant="destructive"
										>
											Delete
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
							<Separator
								orientation="vertical"
								className="bg-muted-foreground h-5! mx-4"
							/>
						</>
					)}

					<Button
						type="submit"
						form="create-package-list-form"
						className="block cursor-pointer"
					>
						Submit
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
