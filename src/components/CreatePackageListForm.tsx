"use client";
import { Fragment, KeyboardEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CheckIcon, Edit } from "lucide-react";
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
import {
	MultiSelector,
	MultiSelectorContent,
	MultiSelectorInput,
	MultiSelectorItem,
	MultiSelectorList,
	MultiSelectorTrigger,
} from "@/components/ui/extension/multi-select";
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
import { ChevronsUpDown, Trash2 } from "lucide-react";
import { PackageFilteredData } from "@/types/homebrew";
import { formSchema } from "@/schemas/zod";
import { Badge } from "./ui/badge";
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
}: Props) {
	const { icons } = useIconPickerLucide();

	const { data: session } = authClient.useSession();

	const [isformOpen, setIsformOpen] = useState(isOpen);

	const [open, setOpen] = useState(false);

	// console.log({ packages });

	// packages = packages.slice(0, 100);
	const [filteredPackages, setFilteredPackages] = useState<
		PackageFilteredData[]
	>([]);

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
			form.setValue("description", currentData.description);
			form.setValue(
				"packages",
				currentData.packages.map((pkg) =>
					JSON.stringify(pkg),
				) as unknown as string[],
			);
			form.setValue("isPublic", currentData.isPublic);
			form.setValue("icon", currentData.icon);
		} else if (defaultPackage) {
			const defaultPkg = decodeURI(defaultPackage);
			// console.log({ defaultPkg });
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
			// toast(
			// 	<pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
			// 		<code className="text-white">{JSON.stringify(values, null, 2)}</code>
			// 	</pre>
			// );

			const newListBody = {
				...values,
				owner: {
					id: session?.user?.id,
					name: session?.user?.name,
					email: session?.user?.email,
					image: session?.user?.image,
				},
				likes: currentData ? currentData.likes : [],
				get packages(): PackageDetails[] {
					return values.packages.map((pkg) => JSON.parse(pkg));
				},
				get installationCommand(): string {
					return getInstallationCommand(this.packages);
				},
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
			} else {
				toast.error("Failed to create list. Please try again.");
			}
		} catch (error) {
			console.error("Form submission error: ", error);
			toast.error("Failed to submit the form. Please try again.");
		}
	}

	async function handleDelete() {
		try {
			const listDeleted = await fetch(
				`/api/packageLists/delete/${currentData?._id}`,
				{ method: "DELETE" },
			);

			if (listDeleted.ok) {
				toast.success("List deleted successfully");
			} else {
				toast.error("Failed to delete list. Please try again.");
			}
		} catch (error) {
			console.error("List delete error: ", error);
			toast.error("Failed to delete list. Please try again.");
		}
	}

	let timeoutId: NodeJS.Timeout;

	function debounce(cb: (...args: never[]) => void, delay: number) {
		return (...args: never[]) => {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				cb(...args);
			}, delay);
		};
	}

	function handleMultiSelectorKeyup(
		event: KeyboardEvent<HTMLInputElement>,
	): void {
		const inputValue = (event.target as HTMLInputElement).value;

		if (inputValue.length < 1) {
			setFilteredPackages([]);
			return;
		}

		debounce(() => {
			setFilteredPackages(() => {
				return packages
					.filter((pkg) => {
						return (
							Array.isArray(pkg.name) ? pkg.name[0] : pkg.name
						)
							.toLowerCase()
							.includes(inputValue);
					})
					.slice(0, 10);
			});
		}, 500)();
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
											<MultiSelector
												shouldFilter={false} // fix issue mentioned in https://github.com/shadcn-ui/ui/discussions/3862
												values={
													field.value
														? field.value
														: []
												}
												onValuesChange={(value) => {
													setFilteredPackages([]);
													field.onChange(value);
												}}
												loop
											>
												<MultiSelectorTrigger
													accessorJSONValue="id"
													isJSONValue={true}
												>
													<MultiSelectorInput
														onKeyUp={
															handleMultiSelectorKeyup
														}
														placeholder="Search packages"
													/>
												</MultiSelectorTrigger>
												<MultiSelectorContent>
													<MultiSelectorList
														showNoResults={true}
														noResultsText="Start searching for a package..."
													>
														{filteredPackages.map(
															(pkg) => {
																return (
																	<Fragment
																		key={
																			(pkg.token ??
																				pkg.name) +
																			pkg.type
																		}
																	>
																		<MultiSelectorItem
																			value={JSON.stringify(
																				{
																					id:
																						pkg.token ??
																						pkg.name,
																					type: pkg.type,
																				},
																			)}
																		>
																			<div className="flex items-center justify-between space-x-2 grow">
																				<div className="flex flex-wrap">
																					<p className="">
																						{
																							pkg.name
																						}{" "}
																					</p>
																					<span className="mx-1">
																						@
																					</span>
																					<p className="text-sm">
																						{
																							pkg.version
																						}
																					</p>
																				</div>
																				<Badge>
																					{
																						pkg.type
																					}
																				</Badge>
																			</div>
																		</MultiSelectorItem>
																		<Separator />
																	</Fragment>
																);
															},
														)}
													</MultiSelectorList>
												</MultiSelectorContent>
											</MultiSelector>
										</FormControl>
										<FormDescription>
											Select multiple packages to be
											included.
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
											className="w-[300px] p-0"
										>
											<Command>
												<CommandInput placeholder="Search icon..." />
												<CommandList>
													<CommandEmpty>
														No icon found
													</CommandEmpty>
													<CommandGroup>
														{icons.map(
															({
																name,
																Component,
																friendly_name,
															}) => (
																<CommandItem
																	key={name}
																	value={
																		friendly_name
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
									Do you really want to delete this list? This
									action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
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
