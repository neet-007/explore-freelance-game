"use client";

import { useState } from "react";
import { submitScore } from "@/app/actions";
import Link from "next/link";

type Option = {
    id: number;
    label: string;
    money: number;
    energy: number;
    rep: number;
}

type Question = {
    id: number;
    text: string;
    optionA: Option | null;
    optionB: Option | null;
    correctOption: string;
}

type Answer = {
    id: number;
    choice: "A" | "B";
}

export default function QuizClient({ questions, username }: { questions: Question[], username: string }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [energy, setEnergy] = useState(100);
    const [money, setMoney] = useState(100);
    const [rep, setRep] = useState(100);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isFinished, setIsFinished] = useState<{ bool: boolean, reason: "money" | "energy" }>({ bool: false, reason: "money" });

    const currentQuestion = questions[currentIdx];

    const handleAnswer = async (selected: "A" | "B") => {
        const choice = selected === "A" ? currentQuestion.optionA : currentQuestion.optionB;

        const newMoney = money + choice!.money;
        const newEnergy = energy + choice!.energy;
        const newRep = rep + choice!.rep;
        const newAnswers = [...answers, { id: currentQuestion.id, choice: selected }];

        setMoney(newMoney);
        setEnergy(newEnergy);
        setRep(newRep);
        setAnswers(newAnswers);

        if (newMoney <= 0 || newEnergy <= 0) {
            setIsFinished({
                bool: true,
                reason: newMoney <= 0 ? "money" : "energy"
            });
            await submitScore(username, newAnswers);
        } else {
            setCurrentIdx(prev => (prev + 1) % questions.length);
        }
    };

    if (!currentQuestion) return <div>Loading...</div>;
    if (isFinished.bool) {
        if (isFinished.reason === "money") {
            return <div>
                <p className="text-center text-xl text-[#00ff00] font-bold">YOU RAN OUT OF MONEY!</p>
                <Link
                    href="/leaderboard"
                    className="px-8 py-3 border border-white text-white font-bold text-xl hover:bg-white hover:text-black transition-all duration-300"
                >
                    VIEW_RANKINGS
                </Link>
            </div>;
        } else {
            return <div>
                <p className="text-center text-xl text-[#00ff00] font-bold">YOU RAN OUT OF ENERGY!</p>
                <Link
                    href="/leaderboard"
                    className="px-8 py-3 border border-white text-white font-bold text-xl hover:bg-white hover:text-black transition-all duration-300"
                >
                    VIEW_RANKINGS
                </Link>
            </div>;
        }
    }

    return (
        <div className="flex justify-center items-center font-mono">
            <div className="w-[400px] p-5 border-2 border-[#00ff00] bg-[#1e1e1e] shadow-[0_0_20px_rgba(0,255,0,0.2)]">

                {/* Stats Header */}
                <div className="flex justify-around mb-5 pb-2 border-b border-[#333] text-sm font-bold">
                    <div className="text-white">💰 $<span className="text-[#00ff00]">{money}</span></div>
                    <div className="text-white">☕ Energy: <span className="text-[#00ff00]">{energy}%</span></div>
                    <div className="text-white">⭐ Reputation: <span className="text-[#00ff00]">{rep}</span></div>
                </div>

                {/* Question Text */}
                <div className="min-h-[100px] mb-6">
                    <h2 className="text-[#00ff00] text-lg leading-relaxed text-center italic">
                        {currentQuestion.text}
                    </h2>
                </div>

                {/* Choice Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleAnswer("A")}
                        className="group relative border border-[#00ff00] bg-transparent p-3 text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all duration-300 text-left pl-6"
                    >
                        <span className="opacity-0 group-hover:opacity-100 absolute left-2">{">"}</span>
                        {currentQuestion.optionA!.label}
                    </button>

                    <button
                        onClick={() => handleAnswer("B")}
                        className="group relative border border-[#00ff00] bg-transparent p-3 text-[#00ff00] hover:bg-[#00ff00] hover:text-black transition-all duration-300 text-left pl-6"
                    >
                        <span className="opacity-0 group-hover:opacity-100 absolute left-2">{">"}</span>
                        {currentQuestion.optionB!.label}
                    </button>
                </div>
            </div>
        </div>
    );
}
