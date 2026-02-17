"use server"
import { db } from "@/db";
import { questions, options } from "@/db/schema";
import { eq, aliasedTable, desc } from "drizzle-orm";
import { leaderboard } from "@/db/schema";

type Answer = {
    id: number;
    choice: "A" | "B";
}

async function getGameQuestions() {
    const optA = aliasedTable(options, "optA");
    const optB = aliasedTable(options, "optB");

    const results = await db
        .select({
            id: questions.id,
            text: questions.text,
            optionA: {
                label: optA.label,
                money: optA.money,
                energy: optA.energy,
                rep: optA.rep,
            },
            optionB: {
                label: optB.label,
                money: optB.money,
                energy: optB.energy,
                rep: optB.rep,
            },
        })
        .from(questions)
        .leftJoin(optA, eq(questions.optionAId, optA.id))
        .leftJoin(optB, eq(questions.optionBId, optB.id));

    return results;
}

export async function submitScore(username: string, answers: Answer[]) {
    const questions = await getGameQuestions();
    let money = 100;
    let energy = 100;
    let rep = 100;

    for (const answer of answers) {
        const question = questions.find(q => q.id === answer.id);
        if (!question) continue;

        if (answer.choice === "A") {
            money += question.optionA!.money;
            energy += question.optionA!.energy;
            rep += question.optionA!.rep;
        } else {
            money += question.optionB!.money;
            energy += question.optionB!.energy;
            rep += question.optionB!.rep;
        }
    }

    const score = Math.max((money + energy + rep) / 3, 0);
    await db.insert(leaderboard).values({ username, score });

    console.log("Score saved!");
}

export async function fetchMoreScores(offset: number, limit: number = 10) {
    return await db
        .select()
        .from(leaderboard)
        .orderBy(desc(leaderboard.score))
        .limit(limit)
        .offset(offset);
}
