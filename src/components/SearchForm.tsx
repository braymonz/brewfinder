"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { GlowEffectButton } from "./GlowEffectButton";

export function SearchForm() {
	const router = useRouter();

	const handleOnSubmit = (event: FormEvent<HTMLFormElement>): void => {
		event.preventDefault();
		const form = event.target as HTMLFormElement;
		const input = form.querySelector(
			'input[type="search"]',
		) as HTMLInputElement;
		router.push(`/packages/?search=${input.value}`);
	};

	return (
		<form
			className="flex items-end sm:items-center space-x-2 sm:gap-x-4 flex-col gap-y-4 sm:flex-row"
			onSubmit={handleOnSubmit}
		>
			<Input
				type="search"
				placeholder="Search for Homebrew packages..."
				className="text-lg py-6 bg-secondary w-full m-0"
			/>
			<GlowEffectButton type="submit" size="lg" className="cursor-pointer">
				<Search className="h-5 w-5" />
				Search
			</GlowEffectButton>
		</form>
	);
}
