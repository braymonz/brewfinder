"use client";

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
	getPaginationRowModel,
	type SortingState,
	getSortedRowModel,
	type ColumnFiltersState,
	getFilteredRowModel,
	type FilterFn,
} from "@tanstack/react-table";

import {
	getSearchTypePrefix,
	packageMatchesSearch,
} from "@/lib/package-search";
import type { PackageFilteredData } from "@/types/homebrew";

import { XCircleIcon, Loader2 } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	packagesType?: "cask" | "formula" | null;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	packagesType,
}: Readonly<DataTableProps<TData, TValue>>) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [searchValue, setSearchValue] = useState(
		searchParams.get("search") ?? "",
	);

	const debounceRef = useRef<NodeJS.Timeout | null>(null);

	// Custom filter function using packageMatchesSearch
	const packageSearchFilter: FilterFn<PackageFilteredData> = (
		row,
		_columnId,
		filterValue,
	) => {
		const pkg = row.original;
		const result = packageMatchesSearch(pkg, filterValue);
		return result.match;
	};
	const updateSearchParam = useCallback(
		(key: string, value: string | null) => {
			const params = new URLSearchParams(searchParams.toString());
			if (value) {
				params.set(key, value);
			} else {
				params.delete(key);
			}
			const newUrl = params.toString()
				? `?${params.toString()}`
				: globalThis.location.pathname;
			startTransition(() => {
				router.replace(newUrl, { scroll: false });
			});
		},
		[router, searchParams],
	);

	// Debounced search update
	const debouncedUpdateSearch = useCallback(
		(value: string) => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
			debounceRef.current = setTimeout(() => {
				updateSearchParam("search", value || null);
			}, 200);
		},
		[updateSearchParam],
	);

	// Cleanup debounce on unmount
	useEffect(() => {
		return () => {
			if (debounceRef.current) {
				clearTimeout(debounceRef.current);
			}
		};
	}, []);

	// Set filter for packages type based on query string
	useEffect(() => {
		if (packagesType) {
			setTypeFilter(packagesType);
		}
	}, [packagesType]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		globalFilterFn: packageSearchFilter as unknown as FilterFn<TData>,
		state: {
			sorting,
			columnFilters,
			globalFilter: searchValue,
		},
		onGlobalFilterChange: setSearchValue,
	});

	// Sync type filter with table
	useEffect(() => {
		if (typeFilter === "all") {
			table.getColumn("type")?.setFilterValue(undefined);
		} else {
			table.getColumn("type")?.setFilterValue(typeFilter);
		}
	}, [typeFilter, table]);

	// Sync search from URL to table
	const search = searchParams.get("search");
	useEffect(() => {
		setSearchValue(search ?? "");
	}, [search]);

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		debouncedUpdateSearch(value);

		// Update type filter based on search prefix
		const { type } = getSearchTypePrefix(value);
		if (type) {
			setTypeFilter(type);
		}
	};

	const handleClearSearch = () => {
		setSearchValue("");
		updateSearchParam("search", null);
	};

	return (
		<div>
			<div className="flex flex-col sm:flex-row items-center gap-4 pb-2 justify-between">
				<div className="relative flex sm:max-w-md bg-secondary w-full rounded-md">
					<Input
						className="pr-16"
						placeholder="Filter packages..."
						value={searchValue}
						onChange={(event) =>
							handleSearchChange(event.target.value)
						}
					/>
					<div className="absolute right-0 h-full flex items-center gap-1 pr-1">
						{isPending ? (
							<Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
						) : (
							<Button
								variant="ghost"
								size="icon"
								onClick={handleClearSearch}
								className="cursor-pointer h-8 w-8"
								aria-label="Clear search"
							>
								<XCircleIcon className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger className="w-full sm:w-45 bg-secondary">
						<SelectValue placeholder="Select type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						<SelectItem value="formula">Formula</SelectItem>
						<SelectItem value="cask">Cask</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<p className="text-foreground text-sm mb-4 text">
				You can use <b>&quot;c:&quot;</b> or <b>&quot;f:&quot;</b>{" "}
				prefix to filter by casks or formulas.{" "}
			</p>
			<div className="rounded-md border">
				<Table>
					<TableHeader className="bg-secondary">
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef
														.header,
													header.getContext(),
												)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									className="bg-secondary/50 backdrop-blur-md hover:bg-accent"
									key={row.id}
									data-state={
										row.getIsSelected() && "selected"
									}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow className="bg-secondary/50 backdrop-blur-md">
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex items-center justify-between space-x-2 py-4 bg-secondary/50 backdrop-blur-md px-2">
				<div className="text-sm text-muted-foreground">
					<div>
						Showing{" "}
						{table.getState().pagination.pageIndex *
							table.getState().pagination.pageSize +
							1}
						-
						{Math.min(
							(table.getState().pagination.pageIndex + 1) *
								table.getState().pagination.pageSize,
							table.getFilteredRowModel().rows.length,
						)}{" "}
						of {table.getFilteredRowModel().rows.length} results
					</div>
				</div>

				<div className="space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
						className="cursor-pointer"
					>
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
						className="cursor-pointer"
					>
						Next
					</Button>
				</div>
			</div>
		</div>
	);
}
