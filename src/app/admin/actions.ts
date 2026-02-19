"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import { options, questions } from "@/db/schema";
import {
    authenticateAdmin,
    clearAdminSession,
    getAdminSession,
    setAdminSession,
} from "@/lib/admin-auth";

function asInt(value: FormDataEntryValue | null) {
    return Number.parseInt(String(value ?? "0"), 10);
}

type ParsedOption = {
    label: string;
    money: number;
    energy: number;
    rep: number;
};

type ParsedQuestion = {
    text: string;
    optionA: ParsedOption;
    optionB: ParsedOption;
    correctOption: "A" | "B";
};

function asFiniteNumber(value: unknown, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function readOption(raw: unknown, prefix?: "A" | "B"): ParsedOption | null {
    const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : null;
    if (obj) {
        const label = String(obj.label ?? "").trim();
        if (!label) return null;
        return {
            label,
            money: asFiniteNumber(obj.money, 0),
            energy: asFiniteNumber(obj.energy, 0),
            rep: asFiniteNumber(obj.rep, 0),
        };
    }

    if (!prefix) return null;
    const flat = raw as Record<string, unknown> | null;
    if (!flat) return null;
    const label = String(flat[`option${prefix}Label`] ?? "").trim();
    if (!label) return null;
    return {
        label,
        money: asFiniteNumber(flat[`option${prefix}Money`], 0),
        energy: asFiniteNumber(flat[`option${prefix}Energy`], 0),
        rep: asFiniteNumber(flat[`option${prefix}Rep`], 0),
    };
}

function parseJsonQuestion(raw: unknown): ParsedQuestion | null {
    if (!raw || typeof raw !== "object") return null;
    const row = raw as Record<string, unknown>;
    const text = String(row.text ?? "").trim();
    if (!text) return null;

    const optionA = readOption(row.optionA, "A") ?? readOption(row, "A");
    const optionB = readOption(row.optionB, "B") ?? readOption(row, "B");
    if (!optionA || !optionB) return null;

    const correctRaw = String(row.correctOption ?? "A").toUpperCase();
    const correctOption: "A" | "B" = correctRaw === "B" ? "B" : "A";

    return { text, optionA, optionB, correctOption };
}

export async function adminLoginAction(formData: FormData) {
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    if (!username || !password) {
        redirect("/admin?error=missing");
    }

    const ok = await authenticateAdmin(username, password);
    if (!ok) {
        redirect("/admin?error=invalid");
    }

    await setAdminSession(username);
    redirect("/admin");
}

export async function adminLogoutAction() {
    await clearAdminSession();
    redirect("/admin");
}

export async function addQuestionAction(formData: FormData) {
    const session = await getAdminSession();
    if (!session) redirect("/admin");

    const text = String(formData.get("text") ?? "").trim();
    const optionALabel = String(formData.get("optionALabel") ?? "").trim();
    const optionAMoney = asInt(formData.get("optionAMoney"));
    const optionAEnergy = asInt(formData.get("optionAEnergy"));
    const optionARep = asInt(formData.get("optionARep"));
    const optionBLabel = String(formData.get("optionBLabel") ?? "").trim();
    const optionBMoney = asInt(formData.get("optionBMoney"));
    const optionBEnergy = asInt(formData.get("optionBEnergy"));
    const optionBRep = asInt(formData.get("optionBRep"));

    if (!text || !optionALabel || !optionBLabel) {
        redirect("/admin?error=invalid-question");
    }

    const [insertedA] = await db
        .insert(options)
        .values({
            label: optionALabel,
            money: optionAMoney,
            energy: optionAEnergy,
            rep: optionARep,
        })
        .returning();

    const [insertedB] = await db
        .insert(options)
        .values({
            label: optionBLabel,
            money: optionBMoney,
            energy: optionBEnergy,
            rep: optionBRep,
        })
        .returning();

    await db.insert(questions).values({
        text,
        optionAId: insertedA.id,
        optionBId: insertedB.id,
        correctOption: "A",
    });

    revalidateTag("game-questions", "max");
    revalidatePath("/play");
    revalidatePath("/admin");
    redirect("/admin");
}

export async function importQuestionsJsonAction(formData: FormData) {
    const session = await getAdminSession();
    if (!session) redirect("/admin");

    const rawJson = String(formData.get("questionsJson") ?? "").trim();
    if (!rawJson) {
        redirect("/admin?section=json&error=empty-json");
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawJson);
    } catch {
        redirect("/admin?section=json&error=invalid-json");
    }

    if (!Array.isArray(parsed)) {
        redirect("/admin?section=json&error=json-not-array");
    }

    const parsedQuestions = parsed.map(parseJsonQuestion);
    const firstInvalid = parsedQuestions.findIndex((q) => !q);
    if (firstInvalid !== -1) {
        redirect(`/admin?section=json&error=invalid-question-at-${firstInvalid + 1}`);
    }

    await db.transaction(async (tx) => {
        for (const q of parsedQuestions as ParsedQuestion[]) {
            const [insertedA] = await tx
                .insert(options)
                .values({
                    label: q.optionA.label,
                    money: q.optionA.money,
                    energy: q.optionA.energy,
                    rep: q.optionA.rep,
                })
                .returning();

            const [insertedB] = await tx
                .insert(options)
                .values({
                    label: q.optionB.label,
                    money: q.optionB.money,
                    energy: q.optionB.energy,
                    rep: q.optionB.rep,
                })
                .returning();

            await tx.insert(questions).values({
                text: q.text,
                optionAId: insertedA.id,
                optionBId: insertedB.id,
                correctOption: q.correctOption,
            });
        }
    });

    revalidateTag("game-questions", "max");
    revalidatePath("/play");
    revalidatePath("/admin");
    redirect(`/admin?section=json&success=imported-${parsedQuestions.length}`);
}

export async function deleteQuestionAction(formData: FormData) {
    const session = await getAdminSession();
    if (!session) redirect("/admin");

    const questionId = asInt(formData.get("questionId"));
    if (!questionId) redirect("/admin");

    const question = await db.query.questions.findFirst({
        where: eq(questions.id, questionId),
    });

    if (!question) redirect("/admin");

    await db.delete(questions).where(eq(questions.id, questionId));

    if (question.optionAId) {
        await db.delete(options).where(eq(options.id, question.optionAId));
    }
    if (question.optionBId) {
        await db.delete(options).where(eq(options.id, question.optionBId));
    }

    revalidateTag("game-questions", "max");
    revalidatePath("/play");
    revalidatePath("/admin");
    redirect("/admin");
}

export async function invalidateGameCacheAction() {
    const session = await getAdminSession();
    if (!session) redirect("/admin");

    revalidateTag("game-questions", "max");
    revalidatePath("/play");
    revalidatePath("/admin");
    redirect("/admin");
}
