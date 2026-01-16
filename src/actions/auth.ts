"use server";

import { auth } from "@/lib/auth";
import { AuthVerificationCodes, Provider } from "@/types/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { APIError } from "better-auth/api";

const catchAuthError = (
	error: unknown,
	action: "signin" | "signup" | "verify-email",
) => {
	if (error instanceof APIError) {
		console.error(
			`Error with ${action}:`,
			error.name,
			error.body,
			error.statusCode,
			error.status,
		);
		redirect(`/${action}?error=${error.body?.code || "unknown_error"}`);
	} else {
		console.error("Unexpected error:", error);
	}
	console.log({ error });
	redirect(`/${action}?error=unknown_error`);
};

export const loginWithSocials = async (
	provider: Provider["id"],
	callbackURL?: string,
) => {
	try {
		const { redirect: isRedirectRequired, url } =
			await auth.api.signInSocial({
				body: {
					provider,
					callbackURL: callbackURL ?? "/",
				},
			});

		if (url && isRedirectRequired) {
			redirect(url);
		}
	} catch (error: unknown) {
		catchAuthError(error, "signin");
	}
};

export const signOut = async () => {
	await auth.api.signOut({
		// This endpoint requires session cookies
		headers: await headers(),
	});
	redirect("/");
};

export const loginWithEmail = async (
	formData: FormData,
	callbackURL?: string,
) => {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const rememberMe = formData.get("remember") === "on";
	try {
		await auth.api.signInEmail({
			body: {
				email,
				password,
				rememberMe,
				callbackURL: callbackURL ?? "/",
			},
			// This endpoint requires session cookies.
			headers: await headers(),
		});
	} catch (error: unknown) {
		catchAuthError(error, "signin");
	}
};

export async function signUpWithEmail(
	formData: FormData,
	callbackURL?: string,
) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const name = formData.get("name") as string;

	try {
		await auth.api.signUpEmail({
			body: {
				email,
				password,
				name,
				callbackURL: callbackURL ?? "/",
			},
			asResponse: true,
		});
	} catch (error: unknown) {
		catchAuthError(error, "signup");
	}
}

export async function sendVerificationEmail(formData: FormData) {
	const email = formData.get("email") as string;

	try {
		await auth.api.sendVerificationEmail({
			body: {
				email,
			},
		});
	} catch (error: unknown) {
		catchAuthError(error, "verify-email");
	}
	redirect(
		`/verify-email?verification_status=${AuthVerificationCodes.VERIFICATION_SENT}`,
	);
}
