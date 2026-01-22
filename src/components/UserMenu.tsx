"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { User } from "better-auth";
import { signOut } from "@/actions/auth";

type Props = {
	user: User;
};

export function UserMenu({ user }: Readonly<Props>) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					className="h-8 w-8 rounded-full cursor-pointer m-0"
				>
					<Avatar className="h-8 w-8">
						{user?.image && (
							<AvatarImage
								src={user.image}
								alt={user.email}
							/>
						)}

						<AvatarFallback className="">
							{user?.email?.substring(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end" forceMount>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						{user?.name && (
							<p className="text-sm font-medium leading-none">
								{user?.name}
							</p>
						)}
						<p className="text-sm leading-none text-muted-foreground">
							{user?.email}
						</p>
					</div>
				</DropdownMenuLabel>
				{/* <DropdownMenuSeparator />
				 <DropdownMenuGroup>
					<DropdownMenuItem>
						<User className="mr-2 h-4 w-4" />
						<span>Profile</span>
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						<Settings className="mr-2 h-4 w-4" />
						<span>Settings</span>
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuGroup> */}
				<DropdownMenuSeparator />
				<DropdownMenuItem className="hover:bg-transparent!">
					<form
						action={signOut}
						className="w-full"
					>
						<Button
							variant="outline"
							type="submit"
							className="w-full cursor-pointer"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Log Out
						</Button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
