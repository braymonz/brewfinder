import { betterAuth } from "better-auth";
import authConfig from "./auth.config";

export const auth = betterAuth(authConfig);

export const providerMap: { id: string }[] = Object.keys(
	authConfig.socialProviders,
).map((key) => {
	return {
		id: key,
	};
});
