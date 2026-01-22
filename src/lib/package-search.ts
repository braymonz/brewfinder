import { PackageFilteredData } from "@/types/homebrew";

export type PackageSearchResult<T = PackageFilteredData> = {
	casks: T[];
	formulas: T[];
};

export type PackageSearchOptions = {
	/** Maximum total results to return */
	maxResults?: number;
	/** Minimum search length before returning results */
	minSearchLength?: number;
};

/**
 * Parse search type prefix from search string
 * - "c:" or "cask:" → filter casks only
 * - "f:" or "formula:" → filter formulas only
 */
export function getSearchTypePrefix(search: string): {
	type: "cask" | "formula" | null;
	query: string;
} {
	const searchLower = search.toLowerCase().trim();

	if (searchLower.startsWith("c:")) {
		return { type: "cask", query: searchLower.slice(2).trim() };
	}
	if (searchLower.startsWith("cask:")) {
		return { type: "cask", query: searchLower.slice(5).trim() };
	}
	if (searchLower.startsWith("f:")) {
		return { type: "formula", query: searchLower.slice(2).trim() };
	}
	if (searchLower.startsWith("formula:")) {
		return { type: "formula", query: searchLower.slice(8).trim() };
	}

	return { type: null, query: searchLower };
}

/**
 * Get the display name from a package
 */
export function getPackageName(pkg: PackageFilteredData): string {
	return Array.isArray(pkg.name) ? pkg.name[0] : pkg.name;
}

/**
 * Check if a package matches the search query
 * Searches across name, token, and description
 */
export function packageMatchesSearch(
	pkg: PackageFilteredData,
	query: string,
): { match: boolean; field?: string; type?: "formula" | "cask" | null } {
	if (!query) return { match: true };

	const { type: searchType, query: searchQuery } = getSearchTypePrefix(query);

	const pkgName = getPackageName(pkg);
	const queryLower = searchQuery.toLowerCase();

	if (pkgName?.toLowerCase().includes(queryLower)) {
		return {
			match: true,
			field: "name",
			type: searchType,
		};
	}

	if (pkg.token?.toLowerCase().includes(queryLower)) {
		return {
			match: true,
			field: "token",
			type: searchType,
		};
	}

	if (pkg.desc?.toLowerCase().includes(queryLower)) {
		return {
			match: true,
			field: "desc",
			type: searchType,
		};
	}

	return { match: false };
}

/**
 * Filter packages based on search string
 * Supports type prefixes (c:, f:, cask:, formula:) and searches name, token, description
 */
export function filterPackages(
	packages: PackageFilteredData[],
	search: string,
	options: PackageSearchOptions = {},
): PackageSearchResult {
	const { maxResults = 20, minSearchLength = 2 } = options;

	const result: PackageSearchResult = {
		casks: [],
		formulas: [],
	};

	if (search.length < minSearchLength) {
		return result;
	}

	const { type: searchType, query } = getSearchTypePrefix(search);

	for (const pkg of packages) {
		// Check type filter
		if (searchType && pkg.type !== searchType) {
			continue;
		}

		// Check max results
		if (result.casks.length + result.formulas.length >= maxResults) {
			break;
		}

		// Check if matches search
		if (!packageMatchesSearch(pkg, query).match) {
			continue;
		}

		if (pkg.type === "cask") {
			result.casks.push(pkg);
		} else {
			result.formulas.push(pkg);
		}
	}

	return result;
}

/**
 * Filter packages and return as flat array
 */
export function filterPackagesFlat(
	packages: PackageFilteredData[],
	search: string,
	options: PackageSearchOptions = {},
): PackageFilteredData[] {
	const { casks, formulas } = filterPackages(packages, search, options);
	return [...casks, ...formulas];
}
