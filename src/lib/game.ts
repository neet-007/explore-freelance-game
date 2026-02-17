import { db } from "@/db";
import { options, questions } from "@/db/schema";
import { aliasedTable, eq } from "drizzle-orm";
import { GameQuestion } from "@/lib/game-shared";
import { unstable_cache } from "next/cache";

const DEFAULT_TIME_LIMIT_SECONDS = 90;

export function getGameTimeLimitSeconds() {
  const raw = process.env.GAME_TIME_LIMIT_SECONDS;
  if (!raw) return DEFAULT_TIME_LIMIT_SECONDS;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TIME_LIMIT_SECONDS;
}

const fetchGameQuestions = async (): Promise<GameQuestion[]> => {
  const optA = aliasedTable(options, "optA");
  const optB = aliasedTable(options, "optB");

  const rows = await db
    .select({
      id: questions.id,
      text: questions.text,
      optionA: {
        id: optA.id,
        label: optA.label,
        money: optA.money,
        energy: optA.energy,
        rep: optA.rep,
      },
      optionB: {
        id: optB.id,
        label: optB.label,
        money: optB.money,
        energy: optB.energy,
        rep: optB.rep,
      },
    })
    .from(questions)
    .leftJoin(optA, eq(questions.optionAId, optA.id))
    .leftJoin(optB, eq(questions.optionBId, optB.id));

  return rows;
};

const getCachedGameQuestions = unstable_cache(fetchGameQuestions, ["game-questions"], {
  revalidate: false,
  tags: ["game-questions"],
});

export async function getGameQuestions(): Promise<GameQuestion[]> {
  return getCachedGameQuestions();
}
