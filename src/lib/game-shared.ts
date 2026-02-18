export const INITIAL_STATS = {
    money: 100,
    energy: 100,
    rep: 100,
} as const;

export type Choice = "A" | "B";

export type Answer = {
    id: number;
    choice: Choice;
};

export type GameOption = {
    id: number;
    label: string;
    money: number;
    energy: number;
    rep: number;
};

export type GameQuestion = {
    id: number;
    text: string;
    optionA: GameOption | null;
    optionB: GameOption | null;
};

export type FinishReason = "money" | "energy" | "timer";

export function computeStatsFromAnswers(
    allQuestions: GameQuestion[],
    answers: Answer[]
) {
    let money = INITIAL_STATS.money;
    let energy = INITIAL_STATS.energy;
    let rep = INITIAL_STATS.rep;

    for (const answer of answers) {
        const question = allQuestions.find((q) => q.id === answer.id);
        if (!question) continue;

        const choice = answer.choice === "A" ? question.optionA : question.optionB;
        if (!choice) continue;

        money += choice.money;
        energy += choice.energy;
        rep += choice.rep;
    }

    return { money, energy, rep };
}

export function getScore(stats: { money: number; energy: number; rep: number }) {
    if (stats.money <= 0) return 0;
    return Math.max(Math.round((stats.money + stats.energy + stats.rep) / 3), 0);
}
