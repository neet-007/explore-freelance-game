import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-[80vh] flex flex-col items-center justify-center font-mono p-6">
            <div className="max-w-2xl w-full border-2 border-[#00ff00] bg-[#1e1e1e] p-10 shadow-[0_0_30px_rgba(0,255,0,0.15)] text-center">
                <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tighter text-[#00ff00]">
                    THE_FREELANCE_GRIND
                </h1>

                <div className="mb-8 text-left space-y-4 text-sm md:text-base border-l-2 border-[#333] pl-6 py-2">
                    <p className="text-white">
                        <span className="text-[#00ff00] tracking-widest">[SYSTEM]:</span> INCOMING CONNECTION DETECTED.
                    </p>
                    <p className="text-gray-400">
                        Welcome to the simulation. Your goal is simple: Survive the freelance market.
                        Manage your <span className="text-[#00ff00]">Money</span>, protect your <span className="text-[#00ff00]">Energy</span>, and build your <span className="text-[#00ff00]">Reputation</span>.
                    </p>
                    <p className="text-red-500 animate-pulse">
                        ! WARNING: Burnout or Bankruptcy will terminate your session.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Link
                        href="/play"
                        className="px-8 py-3 border-2 border-[#00ff00] text-[#00ff00] font-bold text-xl hover:bg-[#00ff00] hover:text-black transition-all duration-300"
                    >
                        INITIALIZE_GAME
                    </Link>

                    <Link
                        href="/leaderboard"
                        className="px-8 py-3 border border-white text-white font-bold text-xl hover:bg-white hover:text-black transition-all duration-300"
                    >
                        VIEW_RANKINGS
                    </Link>
                </div>
            </div>
        </main>
    );
}
