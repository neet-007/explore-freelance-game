import { db } from "@/db";
import { leaderboard } from "@/db/schema";
import { desc } from "drizzle-orm";
import LeaderboardList from "@/components/LeaderboardList";

export default async function LeaderboardPage() {
    const initialScores = await db
        .select()
        .from(leaderboard)
        .orderBy(desc(leaderboard.score))
        .limit(10);

    return (
        <main className="p-8 font-mono flex flex-col items-center">
            <div className="w-full max-w-xl border-2 border-[#00ff00] bg-[#1e1e1e] p-6 shadow-[0_0_15px_rgba(0,255,0,0.1)]">
                <h1 className="text-2xl text-center mb-6 text-[#00ff00] border-b border-[#333] pb-2">
                    GLOBAL_LEADERBOARD
                </h1>

                <LeaderboardList initialScores={initialScores} />

            </div>
        </main>
    );
}
