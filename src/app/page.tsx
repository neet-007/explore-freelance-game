import Link from "next/link";

export default function Home() {
    return (
        <main className="page-shell flex items-center justify-center">
            <div className="w-full max-w-3xl border-2 border-[#00ff00] bg-[#1e1e1e] p-8 text-center shadow-[0_0_30px_rgba(0,255,0,0.15)] md:p-10">
                <h1 className="mb-5 text-4xl font-bold text-[#00ff00] md:text-6xl">
                    THE FREELANCE GRIND
                </h1>
                <div className="mb-8 border-l-2 border-[#333] py-2 pl-5 text-left">
                    <p className="mb-3 text-lg text-white md:text-xl">
                        <span className="text-[#00ff00]">[SYSTEM]:</span> INCOMING CONNECTION DETECTED.
                    </p>
                    <p className="mb-3 text-lg text-[#9ad79a] md:text-xl">
                        Survive the market. Your choices adjust Money, Energy, and Reputation.
                    </p>
                    <p className="text-lg text-red-400 md:text-xl">
                        WARNING: Session ends when money or energy hits zero, or timer runs out.
                    </p>
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:justify-center">
                    <Link
                        href="/play"
                        className="border-2 border-[#00ff00] bg-[#0f2b0f] px-8 py-3 text-center text-xl font-bold text-[#00ff00] transition hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_14px_rgba(0,255,0,0.5)]"
                    >
                        INITIALIZE_GAME
                    </Link>
                    <Link
                        href="/leaderboard"
                        className="border border-[#00ff00] bg-[#0f2b0f] px-8 py-3 text-center text-xl font-bold text-[#00ff00] transition hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_14px_rgba(0,255,0,0.5)]"
                    >
                        VIEW_RANKINGS
                    </Link>
                </div>
            </div>
        </main>
    );
}
