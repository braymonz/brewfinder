import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Beer } from "lucide-react";
import { ModeToggle } from "@/components/ModeToggle";
import { auth } from "@/lib/auth";
import { UserMenu } from "./UserMenu";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";

export default async function Header() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return (
		<header className="border-b text-secondary-foreground bg-secondary/50 backdrop-blur-xl z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<Link href="/" className="flex items-center space-x-2">
					<Beer className="h-6 w-6" />
					<span className="text-xl font-bold">Brewfinder</span>
				</Link>
				<div className="hidden md:block">
					<Navbar />
				</div>
				<div className="items-center space-x-2 hidden md:flex">
					{session ? (
						<UserMenu user={session.user} />
					) : (
						<Button
							className="cursor-pointer text-primary-foreground"
							type="submit"
						>
							<Link href={`/signin`}>Sign In</Link>
						</Button>
					)}
					<Separator
						orientation="vertical"
						className="bg-muted-foreground h-5! mx-4"
					></Separator>
					<ModeToggle />
				</div>
				<SidebarTrigger className="md:hidden" />
			</div>
		</header>
	);
}
