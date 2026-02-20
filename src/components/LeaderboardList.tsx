"use client";

import { useState } from "react";
import { fetchMoreScores } from "@/app/actions";

type ScoreEntry = {
    id: number;
    username: string;
    score: number;
};

export default function LeaderboardList({ initialScores }: { initialScores: ScoreEntry[] }) {
    const [scores, setScores] = useState(initialScores);
    const [offset, setOffset] = useState(initialScores.length);
    const [hasMore, setHasMore] = useState(initialScores.length >= 10);
    const [isLoading, setIsLoading] = useState(false);

    const loadMore = async () => {
        setIsLoading(true);
        const limit = 10;
        const newScores = await fetchMoreScores(offset, limit);

        if (newScores.length < limit) {
            setHasMore(false);
        }

        setScores((prev) => [...prev, ...newScores]);
        setOffset((prev) => prev + newScores.length);
        setIsLoading(false);
    };

    return (
        <>
            <table className="w-full table-fixed text-left text-base md:text-xl">
                <thead>
                    <tr className="text-base uppercase text-[#6ea66e] md:text-lg">
                        <th className="w-[5.5rem] pb-4 font-medium">Rank</th>
                        <th className="pb-4 font-medium">Alias</th>
                        <th className="w-[5.5rem] pb-4 text-right font-medium">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((entry, index) => (
                        <tr key={entry.id} className="border-t border-[#333] hover:bg-black/40">
                            <td className="py-3 text-[#6ea66e]">#{String(index + 1).padStart(2, "0")}</td>
                            <td className="py-3 pr-2 font-bold text-white break-all">{entry.username}</td>
                            <td className="py-3 text-right font-bold text-[#00ff00]">{entry.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {scores.length === 0 && (
                <p className="pt-3 text-lg text-[#6ea66e]">No scores yet. Be the first to finish a run.</p>
            )}

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="mt-6 w-full border border-[#00ff00] bg-[#0f2b0f] py-3 text-xl font-semibold text-[#00ff00] transition hover:bg-[#00ff00] hover:text-black hover:shadow-[0_0_14px_rgba(0,255,0,0.5)] disabled:opacity-50"
                >
                    {isLoading ? "Loading..." : "Load More"}
                </button>
            )}
        </>
    );
}
