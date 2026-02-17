"use server";

import { db } from "@/db";
import { leaderboard } from "@/db/schema";
import {
  Answer,
  computeStatsFromAnswers,
  getScore,
} from "@/lib/game-shared";
import { getGameQuestions } from "@/lib/game";
import { desc } from "drizzle-orm";

export async function recalculateStats(answers: Answer[]) {
  const gameQuestions = await getGameQuestions();
  const stats = computeStatsFromAnswers(gameQuestions, answers);

  return {
    ...stats,
    isBroke: stats.money <= 0,
    isBurnedOut: stats.energy <= 0,
  };
}

export async function submitScore(username: string, answers: Answer[]) {
  const cleanUsername = username.trim();
  if (!cleanUsername) {
    return { ok: false as const, error: "Username is required." };
  }

  const gameQuestions = await getGameQuestions();
  const stats = computeStatsFromAnswers(gameQuestions, answers);
  const score = getScore(stats);

  await db.insert(leaderboard).values({ username: cleanUsername, score });

  return { ok: true as const, score };
}

export async function fetchMoreScores(offset: number, limit = 10) {
  return db
    .select()
    .from(leaderboard)
    .orderBy(desc(leaderboard.score), desc(leaderboard.id))
    .limit(limit)
    .offset(offset);
}
