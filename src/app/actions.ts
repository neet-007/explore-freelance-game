"use server";

import { db } from "@/db";
import { leaderboard } from "@/db/schema";
import { desc } from "drizzle-orm";

import { getGameQuestions } from "@/lib/game";
import { Answer, computeStatsFromAnswers, getScore } from "@/lib/game-shared";

import { createRunToken, verifyRunToken } from "@/lib/run-token";

function isChoice(x: unknown): x is "A" | "B" {
    return x === "A" || x === "B";
}

function computeMaxRounds(timeLimitSeconds: number) {
    const MAX_ANSWERS_PER_SECOND = 3;
    return Math.max(1, Math.floor(timeLimitSeconds * MAX_ANSWERS_PER_SECOND));
}

export async function startRun(username: string, timeLimitSeconds: number) {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
        return { ok: false as const, error: "Username is required." };
    }

    if (!Number.isFinite(timeLimitSeconds) || timeLimitSeconds <= 0) {
        return { ok: false as const, error: "Invalid time limit." };
    }

    const qs = await getGameQuestions();
    if (!qs.length) {
        return { ok: false as const, error: "No questions configured." };
    }

    const now = Date.now();
    const expiresAtMs = now + timeLimitSeconds * 1000;

    const token = createRunToken({
        v: 1,
        username: cleanUsername,
        startedAtMs: now,
        expiresAtMs,
        questionIds: qs.map((q) => q.id),
        maxRounds: computeMaxRounds(timeLimitSeconds),
    });

    return { ok: true as const, token, expiresAtMs };
}

export async function submitScore(username: string, answers: Answer[], token: string) {
    const cleanUsername = username.trim();
    if (!cleanUsername) {
        return { ok: false as const, error: "Username is required." };
    }

    const payload = verifyRunToken(token);
    if (!payload) {
        return { ok: false as const, error: "Invalid session token." };
    }

    if (payload.username !== cleanUsername) {
        return { ok: false as const, error: "Token username mismatch." };
    }

    const now = Date.now();
    if (now > payload.expiresAtMs) {
        return { ok: false as const, error: "Time over." };
    }

    if (!Array.isArray(answers)) {
        return { ok: false as const, error: "Invalid answers." };
    }

    if (answers.length > payload.maxRounds) {
        return { ok: false as const, error: "Too many answers for this time limit." };
    }

    // Validate each answer shape + choice
    for (const a of answers as any[]) {
        if (!a || typeof a !== "object") {
            return { ok: false as const, error: "Malformed answer." };
        }
        if (typeof a.id !== "number" || !isChoice(a.choice)) {
            return { ok: false as const, error: "Malformed answer fields." };
        }
    }

    // Validate IDs exist (prevents submitting answers for fake/nonexistent questions)
    const tokenIdSet = new Set(payload.questionIds);
    for (const a of answers) {
        if (!tokenIdSet.has(a.id)) {
            return { ok: false as const, error: "Answer references an invalid question." };
        }
    }

    // Compute final score from authoritative question data
    const gameQuestions = await getGameQuestions();

    // Optional extra sanity: token question IDs must exist in current question set too
    const knownIds = new Set(gameQuestions.map((q) => q.id));
    for (const id of payload.questionIds) {
        if (!knownIds.has(id)) {
            return { ok: false as const, error: "Session questions are not valid anymore." };
        }
    }

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
