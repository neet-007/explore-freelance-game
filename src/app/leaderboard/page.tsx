import { db } from "@/db";
import { leaderboard } from "@/db/schema";
import { desc } from "drizzle-orm";
import LeaderboardList from "@/components/LeaderboardList";

export default async function LeaderboardPage() {
    const initialScores = await db
        .select()
        .from(leaderboard)
        .orderBy(desc(leaderboard.score), desc(leaderboard.id))
        .limit(10);

    return (
        <main className="page-shell flex flex-col items-center">
            <div className="w-full max-w-2xl border-2 border-[#00ff00] bg-[#1e1e1e] p-6 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                <h1 className="mb-6 border-b border-[#333] pb-2 text-center text-3xl font-bold text-[#00ff00]">
                    LEADERBOARD
                </h1>

                <LeaderboardList initialScores={initialScores} />
            </div>
        </main>
    );
}
