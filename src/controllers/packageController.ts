import { redis } from "@/lib/redis-io";
import { Package, PackageFilteredData } from "@/types/homebrew";
import { NextResponse } from "next/server";

export const getAll = async () => {
	const cachedData = await redis.get("packages");

	if (cachedData) {
		console.log("Returning packages from cached data");
		return NextResponse.json(JSON.parse(cachedData));
	} else {
		console.log("Returning packages from fresh data");

		const promises = Promise.all([
			fetch("https://formulae.brew.sh/api/formula.json").then((res) =>
				res.json(),
			),
			fetch("https://formulae.brew.sh/api/cask.json").then((res) =>
				res.json(),
			),
		]);

		const freshData: Package[] = (await promises).flat();

		const packagesFiltered: PackageFilteredData[] = [];

		freshData.forEach((pkg: Package) => {
			const { name, token, tap, versions, version, desc, homepage } = pkg;

			packagesFiltered.push({
				name: Array.isArray(name) ? name[0] : name,
				token,
				type: tap.includes("cask") ? "cask" : "formula",
				version: versions?.stable ?? version,
				homepage,
				desc,
			});
		});

		await redis.set(
			"packages",
			JSON.stringify(packagesFiltered),
			"EX",
			60 * 60 * 24,
		);

		return NextResponse.json(packagesFiltered);
	}
};
