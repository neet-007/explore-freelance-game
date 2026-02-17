"use client";
import { useState } from "react";
import QuizClient from "./quizClient";

export default function PlayContainer({ questions }: { questions: any[] }) {
    const [username, setUsername] = useState("");
    const [isReady, setIsReady] = useState(false);

    if (!isReady) {
        return (
            <div className="max-w-md mx-auto mt-20 border-2 border-[#00ff00] p-8 bg-[#1e1e1e] font-mono shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                <h1 className="text-xl mb-6 text-center underline">IDENTITY VERIFICATION</h1>
                <p className="text-xs mb-4 text-gray-400">Enter your alias to begin the freelance grind...</p>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="USER_ALIAS"
                    className="w-full bg-black border border-[#00ff00] p-2 text-[#00ff00] outline-none mb-4 focus:ring-1 ring-[#00ff00]"
                />
                <button
                    onClick={() => username.length > 2 && setIsReady(true)}
                    className="w-full bg-[#00ff00] text-black font-bold py-2 hover:bg-black hover:text-[#00ff00] border border-[#00ff00] transition-all"
                >
                    INITIALIZE_SESSION
                </button>
            </div>
        );
    }

    // Pass the username to the QuizClient so it can submit the score later
    return <QuizClient questions={questions} username={username} />;
}
