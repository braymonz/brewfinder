"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";
import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Badge } from "./ui/badge";
import LucideDynamicIcon from "./LucideDynamicIcon";

interface PackageListCardProps {
	listName: string;
	packageCount: number;
	listId: string;
	installationCommand: string;
	listDescription?: string;
	owner: string;
	icon: string;
}

function PackageListCard({
	listName,
	packageCount,
	listId,
	installationCommand,
	listDescription,
	owner,
	icon,
}: PackageListCardProps) {
	const [copied, setCopied] = useState(false);

	const handleCopyCommandClick = () => {
		navigator.clipboard.writeText(installationCommand);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<Card className="bg-secondary/50 backdrop-blur-md">
			<CardHeader>
				<div className="flex items-center space-x-2">
					<LucideDynamicIcon icon={icon} />
					<CardTitle>{listName}</CardTitle>
				</div>
				<CardDescription>By {owner}</CardDescription>
				<Badge variant="secondary">{packageCount} Packages</Badge>
			</CardHeader>
			<CardContent>
				{/* Add more details or a preview of the list here */}
				{listDescription}
			</CardContent>
			<CardFooter className="flex justify-between">
				<Button variant="outline" asChild>
					<Link href={`/lists/${listId}`}>View</Link>
				</Button>
				<Button
					onClick={handleCopyCommandClick}
					className="cursor-pointer"
				>
					{copied ? (
						<Check className="h-4 w-4" />
					) : (
						<Copy className="h-4 w-4" />
					)}
					Copy install command
				</Button>
			</CardFooter>
		</Card>
	);
}

export default PackageListCard;
