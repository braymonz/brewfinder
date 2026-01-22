import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Brewfinder - Homebrew Package Explorer",
	description: "Discover, save, and install Homebrew packages with ease",
	openGraph: {
		title: "Brewfinder - Homebrew Package Explorer",
		description: "Discover, save, and install Homebrew packages with ease",
		url: "https://www.brewfinder.app",
		siteName: "Brewfinder - Homebrew Package Explorer",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} relative overflow-y-auto antialiased min-h-screen flex flex-col bg-background`}
			>
				{/* Top glow effect */}
				<div
					className="pointer-events-none fixed inset-x-0 top-0 z-10 h-150"
					style={{
						background:
							"radial-gradient(ellipse 80% 70% at 50% 0%, hsl(var(--primary) / 0.2), transparent)",
					}}
				/>

				{/* <div className="bg-[url(/pattern-randomized.svg)] not-dark:bg-[url(/pattern-randomized-light.svg)] "> */}
				<div>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem
						disableTransitionOnChange
					>
						<SidebarProvider className="flex flex-col">
							<Header />
							<AppSidebar className="md:hidden" />
							<main className="container mx-auto px-4 py-8 grow flex flex-col w-screen">
								{children}
								<Toaster richColors position="top-right" />
							</main>
							<Footer />
						</SidebarProvider>
					</ThemeProvider>
				</div>
			</body>
		</html>
	);
}
