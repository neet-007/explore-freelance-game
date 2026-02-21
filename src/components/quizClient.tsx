"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { startRun, submitScore } from "@/app/actions";
import { Answer, FinishReason, GameQuestion, INITIAL_STATS } from "@/lib/game-shared";

export default function QuizClient({
    questions,
    username,
    timeLimitSeconds,
}: {
    questions: GameQuestion[];
    username: string;
    timeLimitSeconds: number;
}) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [energy, setEnergy] = useState<number>(INITIAL_STATS.energy);
    const [money, setMoney] = useState<number>(INITIAL_STATS.money);
    const [rep, setRep] = useState<number>(INITIAL_STATS.rep);
    const [answers, setAnswers] = useState<Answer[]>([]);

    const [secondsLeft, setSecondsLeft] = useState(timeLimitSeconds);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasSavedScore, setHasSavedScore] = useState(false);
    const [finishReason, setFinishReason] = useState<FinishReason | null>(null);

    const [runToken, setRunToken] = useState<string | null>(null);
    const [expiresAtMs, setExpiresAtMs] = useState<number | null>(null);
    const [runError, setRunError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const res = await startRun(username, timeLimitSeconds);
            if (cancelled) return;

            if (!res.ok) {
                setRunError(res.error);
                return;
            }

            setRunToken(res.token);
            setExpiresAtMs(res.expiresAtMs);
        })();

        return () => {
            cancelled = true;
        };
    }, [username, timeLimitSeconds]);

    useEffect(() => {
        if (!expiresAtMs || finishReason) return;

        const timer = setInterval(() => {
            const left = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
            setSecondsLeft(left);
            if (left <= 0) setFinishReason("timer");
        }, 250);

        return () => clearInterval(timer);
    }, [expiresAtMs, finishReason]);

    useEffect(() => {
        if (!finishReason || hasSavedScore) return;
        if (!runToken) return;

        let cancelled = false;
        (async () => {
            const res = await submitScore(username, answers, runToken);
            if (cancelled) return;

            if (!res.ok) {
                setRunError(res.error);
            }

            setHasSavedScore(true);
        })();

        return () => {
            cancelled = true;
        };
    }, [answers, finishReason, hasSavedScore, username, runToken]);

    const currentQuestion = questions[currentIdx];
    const roundsPlayed = useMemo(() => answers.length, [answers.length]);

    const handleAnswer = (selected: "A" | "B") => {
        if (!currentQuestion || finishReason || isSubmitting) return;

        if (!runToken || !expiresAtMs) return;

        if (Date.now() > expiresAtMs) {
            setFinishReason("timer");
            return;
        }

        const selectedOption = selected === "A" ? currentQuestion.optionA : currentQuestion.optionB;
        if (!selectedOption) return;

        const newAnswers = [...answers, { id: currentQuestion.id, choice: selected }];
        const newMoney = money + selectedOption.money;
        const newEnergy = energy + selectedOption.energy;
        const newRep = rep + selectedOption.rep;

        setIsSubmitting(true);

        setMoney(newMoney);
        setEnergy(newEnergy);
        setRep(newRep);
        setAnswers(newAnswers);

        if (newMoney <= 0) {
            setFinishReason("money");
            setIsSubmitting(false);
            return;
        }
        if (newEnergy <= 0) {
            setFinishReason("energy");
            setIsSubmitting(false);
            return;
        }

        setCurrentIdx((prev) => (prev + 1) % questions.length);
        setIsSubmitting(false);
    };

    if (runError) {
        return (
            <div className="mx-auto w-full max-w-[420px] border-2 border-red-500 bg-[#1e1e1e] p-6 text-center text-red-200">
                <h2 className="mb-2 text-2xl font-bold">Session Error</h2>
                <p className="mb-4">{runError}</p>
                <Link
                    href="/"
                    className="inline-block border border-red-400 bg-[#2b0f0f] px-6 py-2 font-bold text-red-200 hover:bg-red-500 hover:text-black"
                >
                    GO_HOME
                </Link>
            </div>
        );
    }

    if (finishReason) {
        const title =
            finishReason === "money" ? "Bankruptcy" : finishReason === "energy" ? "Burnout" : "Time Over";
        const subtitle =
            finishReason === "money"
                ? "Your cash dropped to zero."
                : finishReason === "energy"
                    ? "Your energy dropped to zero."
                    : "The deadline reached zero.";

        return (
            <div className="mx-auto w-full max-w-[420px] border-2 border-[#00ff00] bg-[#1e1e1e] p-[0.5rem] text-center shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                <h2 className="mb-2 text-3xl font-bold text-red-400">GAME OVER</h2>
                <p className="mb-6 text-lg text-[#9ad79a]">{subtitle}</p>
                <div className="mb-6 grid grid-cols-3 gap-2 text-base">
                    <div className="border border-[#333] p-2">
                        <p className="text-[#9ad79a]">Money</p>
                        <p className="font-bold text-white">{money}</p>
                    </div>
                    <div className="border border-[#333] p-2">
                        <p className="text-[#9ad79a]">Energy</p>
                        <p className="font-bold text-white">{energy}</p>
                    </div>
                    <div className="border border-[#333] p-2">
                        <p className="text-[#9ad79a]">Rep</p>
                        <p className="font-bold text-white">{rep}</p>
                    </div>
                </div>
                <p className="mb-4 text-[#9ad79a]">Rounds survived: {roundsPlayed}</p>
                <p className="mb-5 text-xl font-bold text-[#00ff00]">{title.toUpperCase()}</p>
                <Link
                    href="/leaderboard"
                    className="inline-block border border-[#00ff00] bg-[#0f2b0f] px-[2rem] py-[0.5rem] text-xl font-bold text-[#00ff00] transition hover:bg-[#00ff00] hover:text-[#000000]"
                >
                    VIEW_RANKINGS
                </Link>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="mx-auto w-full max-w-[420px] border-2 border-[#00ff00] bg-[#1e1e1e] p-8 text-center text-[#9ad79a]">
                No questions available.
            </div>
        );
    }

    if (!runToken || !expiresAtMs) {
        return (
            <div className="mx-auto w-full max-w-[420px] border-2 border-[#00ff00] bg-[#1e1e1e] p-8 text-center text-[#9ad79a]">
                Starting session...
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[420px] border-2 border-[#00ff00] bg-[#1e1e1e] p-[0.5rem] shadow-[0_0_20px_rgba(0,255,0,0.2)]">
            <div className="mb-4 flex justify-between border-b border-[#333] pb-2 text-base font-bold text-white">
                <span>💰 ${money}</span>
                <span>☕ {energy}%</span>
                <span>⭐ {rep}</span>
                <span>⏱ {secondsLeft}s</span>
            </div>

            <div className="mb-4 border-b border-[#333] pb-2 text-base text-[#9ad79a]">
                ROUND {roundsPlayed + 1}
            </div>

            <div className="mb-6 min-h-[90px]">
                <h2 className="text-center text-2xl leading-relaxed text-[#00ff00]">
                    {currentQuestion.text}
                </h2>
            </div>

            <div className="grid gap-3">
                <button
                    onClick={() => handleAnswer("A")}
                    disabled={isSubmitting}
                    className="border border-[#00ff00] bg-[#0f2b0f] px-[2rem] py-[0.5rem] text-left text-xl text-[#00ff00] transition hover:bg-[#00ff00] hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {currentQuestion.optionA?.label ?? "Unavailable option"}
                </button>

                <button
                    onClick={() => handleAnswer("B")}
                    disabled={isSubmitting}
                    className="border border-[#00ff00] bg-[#0f2b0f] px-[2rem] py-[0.5rem] text-left text-xl text-[#00ff00] transition hover:bg-[#00ff00] hover:text-[#000000] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {currentQuestion.optionB?.label ?? "Unavailable option"}
                </button>
            </div>
        </div>
    );
}
