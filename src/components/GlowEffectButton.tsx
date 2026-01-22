import { GlowEffect } from "@/components/motion-primitives/glow-effect";
import { Button } from "./ui/button";

type Props = {
	children?: React.ReactNode;
	variant?:
		| "default"
		| "secondary"
		| "ghost"
		| "link"
		| "outline"
		| "destructive";
	size?: "default" | "sm" | "lg" | "icon";
	type?: "button" | "submit" | "reset";
	className?: string;
};

export function GlowEffectButton({
	children,
	variant = "default",
	size,
	type = "button",
	className,
}: Readonly<Props>) {
	return (
		<div className="relative">
			<GlowEffect
				colors={["var(--color-primary)", "var(--color-secondary)"]}
				mode="colorShift"
				blur="soft"
				duration={3}
				scale={0.9}
			/>
			<Button
				variant={variant}
				size={size}
				type={type}
				className={`relative inline-flex items-center gap-1 rounded-md bg-zinc-950 px-2.5 py-1.5 text-sm text-zinc-50 outline-1 outline-[#fff2f21f] ${className}`}
			>
				{children}
			</Button>
		</div>
	);
}
