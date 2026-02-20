import Link from "next/link";

export default function Navbar() {
    return (
        <div className="flex flex-col gap-4">
            <nav className="border-b-2 border-[#00ff00] bg-[#121212] px-[1rem] py-[0.5rem]">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="min-w-0 truncate text-xl font-bold text-[#00ff00] sm:text-2xl md:text-3xl"
                        title="THE FREELANCE GRIND"
                    >
                        THE FREELANCE GRIND
                    </Link>

                    <div className="flex flex-wrap items-center justify-end gap-2 text-sm sm:gap-3 sm:text-base md:gap-4 md:text-xl">
                        <Link
                            href="/play"
                            className="whitespace-nowrap border border-transparent px-2 py-1 text-[#00ff00] transition hover:border-[#00ff00] hover:bg-[#00ff00] hover:text-[#000000] sm:px-3 no-underline"
                        >
                            [ PLAY ]
                        </Link>
                        <Link
                            href="/leaderboard"
                            className="whitespace-nowrap border border-transparent px-2 py-1 text-[#00ff00] transition hover:border-[#00ff00] hover:bg-[#00ff00] hover:text-[#000000] sm:px-3 no-underline"
                        >
                            [ RANKINGS ]
                        </Link>
                    </div>
                </div>
            </nav>

            <img
                src="/EEEXPLORE-logo.webp"
                alt="EEExplore Logo"
                className="ml-[1rem] mt-[1rem] w-[12rem] h-auto"
            />
        </div>
    );
}
