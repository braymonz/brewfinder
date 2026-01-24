import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getConnectionDBClient } from "@/lib/db";
import { nextCookies } from "better-auth/next-js";
import { sendTransactionalEmail } from "@/lib/email";
import { confirmEmailTemplate } from "@/resources/confirmEmailTemplate";
import type { User } from "better-auth";

const client = await getConnectionDBClient();

const authConfig = {
	database: mongodbAdapter(client.db()),
	plugins: [
		nextCookies(), // make sure this is the last plugin in the array
	],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // Cache duration in seconds
		},
	},
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
	},
	emailVerification: {
		sendOnSignUp: true,
		sendOnSignIn: true,
		autoSignInAfterVerification: true,
		sendVerificationEmail: async ({
			user,
			url,
		}: {
			user: User;
			url: string;
		}) => {
			void sendTransactionalEmail({
				to: user.email,
				toName: user.name || "",
				subject: "Verify your email address",
				htmlContent: confirmEmailTemplate(
					user.name || "Brewfinder user",
					url,
				),
			});
		},
	},
	socialProviders: {
		github: {
			clientId: process.env.BETTER_AUTH_GITHUB_ID as string,
			clientSecret: process.env.BETTER_AUTH_GITHUB_SECRET as string,
			redirectUri: process.env.BETTER_AUTH_GITHUB_REDIRECT_URI as string,
		},
		google: {
			clientId: process.env.BETTER_AUTH_GOOGLE_CLIENT_ID as string,
			clientSecret: process.env
				.BETTER_AUTH_GOOGLE_CLIENT_SECRET as string,
			redirectUri: process.env.BETTER_AUTH_GOOGLE_REDIRECT_URI as string,
		},
	},
};

export default authConfig;
