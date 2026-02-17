import PlayContainer from "@/components/PlayContainer";
import { db } from "@/db";
import { questions, options } from "@/db/schema";
import { eq, aliasedTable } from "drizzle-orm";

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

export default async function PlayPage() {
    const questions = await getGameQuestions();

    return (
        <main className="p-8">
            <PlayContainer questions={questions} />
        </main>
    );
}
