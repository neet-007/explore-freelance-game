import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="border-b-2 border-[#00ff00] bg-[#121212] px-4 py-5">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
                <Link href="/" className="text-2xl font-bold text-[#00ff00] md:text-3xl">
                    THE FREELANCE GRIND
                </Link>
                <div className="flex items-center gap-3 text-lg md:gap-4 md:text-xl">
                    <Link
                        href="/play"
                        className="border border-transparent px-3 py-1 text-white transition hover:border-[#00ff00] hover:bg-[#00ff00] hover:text-[#ffffff]"
                    >
                        [ PLAY ]
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="border border-transparent px-3 py-1 text-white transition hover:border-[#00ff00] hover:bg-[#00ff00] hover:text-[#ffffff]"
                    >
                        [ RANKINGS ]
                    </Link>
                </div>
            </div>
        </nav>
    );
}
