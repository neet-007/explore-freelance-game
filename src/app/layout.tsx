import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";
import BackgroundDecor from "@/components/BgDecor";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
    title: "Freelance Run",
    description: "A decision-based quiz game with live stats and leaderboard tracking.",
};

type Deco = {
    src: string;
    alt: string;
    className: string;
    delayClass?: string;
};

const decos: Deco[] = [
    {
        src: "/AI.webp",
        alt: "star",
        className:
            "top-[90%] right-[75%] lg:right-[80%] w-9 opacity-60 -rotate-12",
        delayClass: "[animation-delay:0.2s]",
    },
    {
        src: "/Computer Vision.webp",
        alt: "blob",
        className:
            "top-[20%] lg:top-[30%] right-[10%] w-14 opacity-50 -rotate-6",
        delayClass: "[animation-delay:1.1s]",
    },
    {
        src: "/Cyber security.webp",
        alt: "bolt",
        className:
            "top-[90%] right-[50%] w-12 opacity-50 rotate-12",
        delayClass: "[animation-delay:0.6s]",
    },
    {
        src: "/Game Development.webp",
        alt: "spark",
        className:
            "top-[90%] lg:top-[80%] right-[10%] w-9 opacity-60 -rotate-12",
        delayClass: "[animation-delay:1.6s]",
    },
    {
        src: "/Freelancing.webp",
        alt: "spark",
        className:
            "top-[10%] right-[60%] lg:right-[80%] w-15 opacity-100 rotate-6",
        delayClass: "[animation-delay:1.6s]",
    },
    {
        src: "/Graphic.webp",
        alt: "spark",
        className:
            "top-[15%] right-[40%] w-9 opacity-60 -rotate-12",
        delayClass: "[animation-delay:1.6s]",
    },
];

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="antialiased flex flex-col" suppressHydrationWarning>
                <Navbar />
                {
                    decos.map((d) => (
                        <BackgroundDecor
                            key={d.src}
                            src={d.src}
                            alt={d.alt}
                            extraClass={d.className}
                        />
                    ))
                }
                {children}
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
