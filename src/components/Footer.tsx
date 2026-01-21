import Link from "next/link";
import { Beer, HeartHandshake, Mail } from "lucide-react";
import { SiGithub, SiX } from "@icons-pack/react-simple-icons";
import { Separator } from "./ui/separator";
import { CONTACT_EMAIL, GITHUB_URL, X_URL } from "@/lib/constants";

export default function Footer() {
	return (
		<footer className="border-t text-secondary-foreground relative bg-secondary/50 backdrop-blur-xl">
			<div className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
					<div className="space-y-4">
						<Link href="/" className="flex items-center space-x-2">
							<Beer className="h-6 w-6" />
							<span className="text-xl font-bold">
								Brewfinder
							</span>
						</Link>
						<p className="text-sm">
							Discover, save, and install Homebrew packages with
							ease.
						</p>
						<div className="flex space-x-4">
							<Link href="/support">
								<HeartHandshake />
							</Link>
							<Link
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<SiGithub />
							</Link>
							<Link
								href={X_URL}
								target="_blank"
								rel="noopener noreferrer"
							>
								<SiX />
							</Link>
							<Link
								href={`mailto:${CONTACT_EMAIL}`}
								target="_blank"
								rel="noopener noreferrer"
							>
								<Mail />
							</Link>
						</div>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/"
									className="text-sm hover:underline"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/packages"
									className="text-sm hover:underline"
								>
									Packages
								</Link>
							</li>
							<li>
								<Link
									href="/lists/user"
									className="text-sm hover:underline"
								>
									My Lists
								</Link>
							</li>
							<li>
								<Link
									href="/lists"
									className="text-sm hover:underline"
								>
									Public Lists
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Socials</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href={GITHUB_URL}
									className="text-sm hover:underline"
								>
									GitHub
								</Link>
							</li>
							<li>
								<Link
									href={X_URL}
									className="text-sm hover:underline"
								>
									X
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Resources</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/support"
									className="text-sm hover:underline"
								>
									Support Brewfinder
								</Link>
							</li>
							<li>
								<Link
									href="/roadmap"
									className="text-sm hover:underline"
								>
									Feature Roadmap
								</Link>
							</li>
							<li>
								<Link
									href={`mailto:${CONTACT_EMAIL}`}
									className="text-sm hover:underline"
									target="_blank"
									rel="noopener noreferrer"
								>
									Contact
								</Link>
							</li>
							<li>
								<Link
									href={`${GITHUB_URL}/issues/new?template=bug_report.md`}
									rel="noopener noreferrer"
									target="_blank"
									className="text-sm hover:underline"
								>
									Report a Bug
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Legal</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/terms"
									className="text-sm hover:underline"
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="text-sm hover:underline"
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<Separator className="my-4" />
				<div className="text-center text-sm text-muted-foreground">
					Brewfinder is not associated with Homebrew in any way.
				</div>
			</div>
		</footer>
	);
}
