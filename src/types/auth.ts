import { BASE_ERROR_CODES } from "better-auth";

export type Provider = {
	id: string;
};

export const ErrorCodes = Object.fromEntries(
	Object.keys(BASE_ERROR_CODES).map((k) => [k, k]),
) as { [K in keyof typeof BASE_ERROR_CODES]: K };

export enum AuthVerificationCodes {
	INVALID_TOKEN = "invalid_token",
	VERIFICATION_SENT = "verification_sent",
	VERIFIED = "verified",
}
