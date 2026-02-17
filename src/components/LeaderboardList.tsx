"use client";

import { useState } from "react";
import { fetchMoreScores } from "@/app/actions";

export default function LeaderboardList({ initialScores }: { initialScores: any[] }) {
    const [scores, setScores] = useState(initialScores);
    const [offset, setOffset] = useState(initialScores.length);
    const [hasMore, setHasMore] = useState(true);
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
            <table className="w-full text-left">
                <thead>
                    <tr className="text-gray-500 text-xs uppercase">
                        <th className="pb-4">Rank</th>
                        <th className="pb-4">Alias</th>
                        <th className="pb-4 text-right">Score</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map((entry, index) => (
                        <tr key={entry.id} className="border-t border-[#333] hover:bg-black/40">
                            <td className="py-3 text-gray-500">#{String(index + 1).padStart(2, '0')}</td>
                            <td className="py-3 text-white font-bold">{entry.username}</td>
                            <td className="py-3 text-[#00ff00] text-right font-bold">${entry.score}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full mt-6 py-2 border border-[#00ff00] text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all disabled:opacity-50"
                >
                    {isLoading ? "FETCHING_DATA..." : "LOAD_MORE_RECORDS"}
                </button>
            )}
        </>
    );
}
