import { Beer, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendVerificationEmail, signOut } from "@/actions/auth";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AuthVerificationCodes } from "@/types/auth";
import { BASE_ERROR_CODES } from "better-auth";
import { SonnerSuccessIcon } from "@/lib/icons";
import { Check } from "lucide-react";

type PageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function VerifyEmail(props: Readonly<PageProps>) {
	const { error, verification_status } = await props.searchParams;
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<div className="container mx-auto flex flex-col items-center justify-center grow py-2">
			<div className="w-full max-w-md space-y-8">
				{session ? (
					<div className="text-center">
						<Beer className="mx-auto h-12 w-12 text-primary" />
						<h2 className="mt-6 text-3xl font-bold">
							Welcome to Brewfinder,{" "}
							{session.user.name ?? session.user.email}
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							You are already logged in, you can continue to use
							Brewfinder
						</p>
						<div className="flex justify-center flex-col items-center space-x-4 space-y-4 mt-6">
							<Button asChild>
								<Link href="/">Go to Home Page</Link>
							</Button>
							<span className="text-sm">Or</span>

							<form action={signOut}>
								<Button
									variant="outline"
									type="submit"
									className="cursor-pointer"
								>
									<LogOut className="mr-2 h-4 w-4" />
									Sign in with a different account
								</Button>
							</form>
						</div>
					</div>
				) : (
					<>
						<div className="text-center">
							<Beer className="mx-auto h-12 w-12" />
							<h2 className="mt-6 text-3xl font-bold">
								Welcome back to Brewfinder
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Please verify your email address using the form
								below which will send you an email with a
								verification link.
							</p>
						</div>

						<form
							action={sendVerificationEmail}
							className="mt-8 space-y-6"
						>
							<div className="space-y-4 rounded-md shadow-sm">
								<div className="space-y-4">
									<Label htmlFor="email" className="text-md">
										Email address
									</Label>
									<Input
										id="email"
										name="email"
										type="email"
										autoComplete="email"
										required
										className="mt-1 mb-4 bg-secondary"
									/>
								</div>
							</div>

							<Button
								type="submit"
								className="w-full text-md cursor-pointer text-primary-foreground"
							>
								Verify email
							</Button>
							{error && (
								<Alert variant="destructive">
									<AlertDescription className="items-center flex justify-between">
										{BASE_ERROR_CODES[
											error as keyof typeof BASE_ERROR_CODES
										] ??
											"An unexpected error occurred. Please try again or contact support."}
									</AlertDescription>
								</Alert>
							)}
							{verification_status && (
								<Alert
									variant={
										AuthVerificationCodes.INVALID_TOKEN ===
										verification_status
											? "destructive"
											: "success"
									}
								>
									<AlertDescription className="items-center flex justify-between">
										{verification_status ===
											AuthVerificationCodes.VERIFICATION_SENT && (
											<p className="flex items-center">
												<Check className="h-4 w-4 mr-2" />
												Verification has been sent!
												Please check your email.
											</p>
										)}
									</AlertDescription>
								</Alert>
							)}
						</form>
					</>
				)}
			</div>
		</div>
	);
}
