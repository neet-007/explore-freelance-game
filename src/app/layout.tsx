import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
    title: "Freelance Run",
    description: "A decision-based quiz game with live stats and leaderboard tracking.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased" suppressHydrationWarning>
                <Navbar />
                {children}
            </body>
        </html>
    );
}
