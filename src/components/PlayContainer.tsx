"use client";
import { useState } from "react";
import QuizClient from "./quizClient";
import { GameQuestion } from "@/lib/game-shared";

export default function PlayContainer({
    questions,
    timeLimitSeconds,
}: {
    questions: GameQuestion[];
    timeLimitSeconds: number;
}) {
    const [username, setUsername] = useState("");
    const [isReady, setIsReady] = useState(false);
    const trimmedUsername = username.trim();

    if (!isReady) {
        return (
            <div className="mx-auto w-full max-w-[420px] border-2 border-[#00ff00] bg-[#1e1e1e] p-7 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                <h1 className="mb-6 text-center text-2xl font-bold text-[#00ff00]">IDENTITY VERIFICATION</h1>
                <p className="mb-4 text-base text-[#9ad79a]">
                    Enter your alias to begin. Session timer: {timeLimitSeconds}s.
                </p>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={30}
                    placeholder="USER_ALIAS"
                    className="mb-4 w-full border border-[#00ff00] bg-black py-[0.5rem] text-lg text-[#00ff00] outline-none"
                />
                <button
                    onClick={() => trimmedUsername.length > 0 && setIsReady(true)}
                    disabled={trimmedUsername.length === 0}
                    className="w-full border border-[#00ff00] bg-[#00ff00] px-[2rem] py-[0.5rem] text-xl font-bold text-black transition hover:bg-black hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    INITIALIZE_SESSION
                </button>
            </div>
        );
    }

    return (
        <QuizClient
            questions={questions}
            username={trimmedUsername}
            timeLimitSeconds={timeLimitSeconds}
        />
    );
}
