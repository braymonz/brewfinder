"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Home,
	Package,
	List,
	Globe,
	BarChart2,
	Lightbulb,
	HeartHandshake,
	SidebarClose,
} from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { UserMenu } from "@/components/UserMenu";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ModeToggle";
import { GITHUB_URL } from "@/lib/constants";
import { authClient } from "@/lib/auth-client";

export const navItems = [
	{
		title: "Home",
		url: "/",
		icon: Home,
	},
	{
		title: "All Packages",
		url: "/packages",
		icon: Package,
	},
	{
		title: "My Lists",
		url: "/lists/user",
		icon: List,
	},
	{
		title: "Public Lists",
		url: "/lists",
		icon: Globe,
	},
];

type Props = {
	className?: string;
};

export function AppSidebar({ className }: Props) {
	const { toggleSidebar } = useSidebar();
	const { data: session } = authClient.useSession();
	return (
		<Sidebar
			side="right"
			variant="floating"
			className={`${className} w-64 p-4`}
		>
			<SidebarHeader>
				<SidebarGroup>
					<SidebarGroupLabel className="flex items-center">
						Account
						<Button
							variant="ghost"
							size="icon"
							className="h-7 w-7 ml-auto"
							onClick={() => {
								toggleSidebar();
							}}
						>
							<SidebarClose className="rotate-180" />
							<span className="sr-only">Toggle Sidebar</span>
						</Button>
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<div className="flex items-center space-x-2 mt-2">
									{!session ? (
										<Button
											className="cursor-pointer text-primary-foreground"
											type="submit"
										>
											<Link href={`/signin`}>
												Sign In
											</Link>
										</Button>
									) : (
										<UserMenu user={session.user} />
									)}
									<Separator
										orientation="vertical"
										className="bg-muted-foreground h-5! mx-4"
									></Separator>
									<ModeToggle />
								</div>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{navItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton
										asChild
										onClick={() => {
											toggleSidebar();
										}}
									>
										<Link href={item.url}>
											<item.icon className="mr-2 h-5 w-5" />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
				<SidebarGroup>
					<SidebarGroupLabel>Community</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									onClick={() => {
										toggleSidebar();
									}}
								>
									<Link href="/roadmap">
										<BarChart2 className="mr-2 h-5 w-5" />
										<span>Roadmap</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									onClick={() => {
										toggleSidebar();
									}}
								>
									<Link
										href={`${GITHUB_URL}/issues/new/choose`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Lightbulb className="mr-2 h-5 w-5" />
										<span>Feature Requests</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									onClick={() => {
										toggleSidebar();
									}}
								>
									<Link href="/support">
										<HeartHandshake className="mr-2 h-5 w-5" />
										<span>Support Project</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
