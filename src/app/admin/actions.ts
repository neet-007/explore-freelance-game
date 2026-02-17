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
