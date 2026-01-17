import { Beer, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { signOut, signUpWithEmail } from "@/actions/auth";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BASE_ERROR_CODES } from "better-auth";
import { ErrorCodes } from "@/types/auth";
type PageProps = {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
export default async function SignupPage(props: Readonly<PageProps>) {
	const { error } = await props.searchParams;
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
								Welcome to Brewfinder
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Please sign up with your email and password
							</p>
						</div>

						<form
							action={signUpWithEmail}
							className="mt-8 space-y-6"
						>
							<div className="space-y-6 rounded-md shadow-sm">
								<Label htmlFor="name" className="text-md">
									Name
								</Label>
								<Input
									id="name"
									name="name"
									type="text"
									required
									className="mt-1 bg-secondary"
								/>
								<Label htmlFor="email" className="text-md">
									Email address
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									required
									className="mt-1 bg-secondary"
								/>
								<Label htmlFor="password" className="text-md">
									Password
								</Label>
								<Input
									id="password"
									name="password"
									type="password"
									required
									className="mt-1 bg-secondary"
								/>
							</div>
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

							<Button
								type="submit"
								className="w-full text-md cursor-pointer text-primary-foreground"
							>
								Sign up
							</Button>
						</form>
					</>
				)}
			</div>
		</div>
	);
}
