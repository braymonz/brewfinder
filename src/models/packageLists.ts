import mongoose, { ObjectId } from "mongoose";
import { User } from "better-auth";

export type PackageDetails = {
	id: string;
	type: string;
};

const PackageDetailsSchema = new mongoose.Schema<PackageDetails>({
	id: String,
	type: String,
});

const UserSchema = new mongoose.Schema<User>({
	name: String,
	email: String,
	image: String,
	id: String,
});

export type PackageList = {
	_id?: ObjectId;
	name: string;
	description: string;
	packages: [PackageDetails];
	installationCommand: string;
	owner: User;
	isPublic: boolean;
	likes: [mongoose.Schema.Types.ObjectId];
	icon: string;
	createdAt?: Date; // required to be used in another files
	updatedAt?: Date; // required to be used in another files
};

const schema = new mongoose.Schema<PackageList>(
	{
		name: { type: String, required: true },
		description: { type: String, required: true },
		packages: { type: [PackageDetailsSchema], required: true },
		installationCommand: { type: String, required: true },
		owner: { type: UserSchema, required: true },
		isPublic: { type: Boolean, required: true },
		likes: { type: [mongoose.Schema.Types.ObjectId], required: false },
		icon: { type: String, required: false },
	},
	{
		timestamps: true, // Adds createdAt and updatedAt fields
	}
);

// This is necessary to avoid OverwriteModelError
// when using Next.js API routes
export default mongoose.models.Package_List ||
	mongoose.model("Package_List", schema);
