import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";
import BackgroundDecor from "@/components/BgDecor";

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
        src: "/AI.png",
        alt: "star",
        className: "top-[80%] right-[80%] w-9 opacity-60 -rotate-12",
        delayClass: "[animation-delay:0.2s]",
    },
    {
        src: "/Computer Vision.png",
        alt: "blob",
        className: "top-[30%] right-[10%] w-14 opacity-50 -rotate-6",
        delayClass: "[animation-delay:1.1s]",
    },
    {
        src: "/Cyber security.png",
        alt: "bolt",
        className: "top-[75%] right-[50%] w-12 opacity-50 rotate-12",
        delayClass: "[animation-delay:0.6s]",
    },
    {
        src: "/Game Development.png",
        alt: "spark",
        className: "top-[80%] right-[10%] w-9 opacity-60 -rotate-12",
        delayClass: "[animation-delay:1.6s]",
    },
    {
        src: "/Freelancing.png",
        alt: "spark",
        className: "top-[15%] right-[80%] w-15 opacity-100 rotate-6",
        delayClass: "[animation-delay:1.6s]",
    },
    {
        src: "/Graphic.png",
        alt: "spark",
        className: "top-[15%] right-[40%] w-9 opacity-60 -rotate-12",
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
            </body>
        </html>
    );
}
