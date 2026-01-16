import { NotebookText } from "lucide-react";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import React from "react";

type Props = { icon: string; className?: string };

function FallbackIcon() {
	return <NotebookText />;
}

export default function LucideDynamicIcon({ icon, className }: Props) {
	// Convert PascalCase to lower kebab case for Lucide icon access
	const kebabName = icon
		.replaceAll(/([A-Z])/g, "-$1")
		.toLowerCase()
		.slice(1); // Slice(1) to remove leading hyphen

	return (
		<DynamicIcon
			name={kebabName as IconName}
			fallback={FallbackIcon}
			className={className}
		/>
	);
}
