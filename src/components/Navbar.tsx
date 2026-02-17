import Link from "next/link";

export default function Navbar() {
    return (
        <nav className="border-b-2 border-[#00ff00] bg-[#121212] p-4 font-mono">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Link href="/" className="text-[#00ff00] text-xl font-bold tracking-tighter">
                    TERMINAL_QUIZ
                </Link>
                <div className="space-x-6">
                    <Link href="/play" className="text-white hover:text-[#00ff00] transition-colors">
                        [ PLAY ]
                    </Link>
                    <Link href="/leaderboard" className="text-white hover:text-[#00ff00] transition-colors">
                        [ RANKINGS ]
                    </Link>
                </div>
            </div>
        </nav>
    );
}
