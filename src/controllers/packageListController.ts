import { connectToDatabase as connectDB } from "@/lib/db";
import { NextResponse } from "next/server";
import PackageListModel, { PackageList } from "@/models/packageLists";

export const getAll = async () => {
	try {
		await connectDB();
		const PackageListResult = await PackageListModel.find();
		return NextResponse.json(PackageListResult);
	} catch (error) {
		console.error("Error while fetching package lists", error);
		return NextResponse.error();
	}
};

export const getAllPublic = async () => {
	try {
		await connectDB();
		const PackageListResult = await PackageListModel.find({
			isPublic: true,
		});
		return NextResponse.json(PackageListResult);
	} catch (error) {
		console.error("Error while fetching public package lists", error);
		return NextResponse.error();
	}
};

export const getById = async (listID: string) => {
	try {
		await connectDB();
		const PackageListResult = await PackageListModel.findById(listID);
		return NextResponse.json(PackageListResult);
	} catch (error) {
		console.error("Error while fetching package list by ID", error);

		return NextResponse.error();
	}
};

export const getByUserId = async (userID: string) => {
	try {
		await connectDB();
		const PackageListResult = await PackageListModel.find({
			"owner.id": userID,
		});

		if (!PackageListResult) {
			return new NextResponse("Package list not found", {
				status: 404,
			});
		}

		return NextResponse.json(PackageListResult);
	} catch (error) {
		console.error(error);
		return new NextResponse(
			(error as Error)?.message || "Internal server error",
			{
				status: 500,
			},
		);
	}
};

export const getLikedByUserId = async (userID: string) => {
	try {
		await connectDB();
		const PackageListResult = await PackageListModel.find({
			likes: userID,
		});

		if (!PackageListResult) {
			return new NextResponse("User liked lists not found", {
				status: 404,
			});
		}

		return NextResponse.json(PackageListResult);
	} catch (error) {
		console.error(error);
		return new NextResponse(
			(error as Error)?.message || "Internal server error",
			{
				status: 500,
			},
		);
	}
};

export const create = async ({
	name,
	description,
	packages,
	installationCommand,
	owner,
	isPublic,
	likes,
	icon,
}: PackageList) => {
	try {
		await connectDB();

		const newPackageList = await PackageListModel.create({
			name,
			description,
			packages,
			installationCommand,
			owner,
			isPublic,
			likes,
			icon,
		});

		return NextResponse.json(newPackageList);
	} catch (error) {
		console.error({ error });
		return NextResponse.error();
	}
};

export const update = async ({
	_id,
	name,
	description,
	packages,
	installationCommand,
	owner,
	isPublic,
	likes,
	icon,
}: PackageList) => {
	try {
		await connectDB();

		const newPackageList = await PackageListModel.findByIdAndUpdate(_id, {
			name,
			description,
			packages,
			installationCommand,
			owner,
			isPublic,
			likes,
			icon,
		});

		return NextResponse.json(newPackageList);
	} catch (error) {
		console.error({ error });
		return NextResponse.error();
	}
};

export const deleteList = async (_id: string) => {
	try {
		await connectDB();

		const newPackageList = await PackageListModel.findByIdAndDelete(_id);

		return NextResponse.json(newPackageList);
	} catch (error) {
		console.error({ error });
		return NextResponse.error();
	}
};
