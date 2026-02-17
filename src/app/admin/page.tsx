import { aliasedTable, eq } from "drizzle-orm";
import { db } from "@/db";
import { options, questions } from "@/db/schema";
import { ensureAdminTable, getAdminSession } from "@/lib/admin-auth";
import {
    addQuestionAction,
    adminLoginAction,
    adminLogoutAction,
    deleteQuestionAction,
    invalidateGameCacheAction,
} from "./actions";

async function getQuestionsWithOptions() {
    const optA = aliasedTable(options, "optA");
    const optB = aliasedTable(options, "optB");

    return db
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
}

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ error?: string }>;
}) {
    await ensureAdminTable();
    const session = await getAdminSession();
    const params = await searchParams;
    const error = params.error;

    if (!session) {
        return (
            <main className="page-shell flex items-center justify-center">
                <div className="w-full max-w-[500px] border-2 border-[#00ff00] bg-[#1e1e1e] p-8 shadow-[0_0_20px_rgba(0,255,0,0.2)]">
                    <h1 className="mb-6 text-center text-3xl font-bold text-[#00ff00]">ADMIN_LOGIN</h1>
                    {error && (
                        <p className="mb-4 border border-red-500 px-3 py-2 text-lg text-red-300">
                            Invalid username/password or missing fields.
                        </p>
                    )}
                    <form action={adminLoginAction} className="space-y-4">
                        <input
                            name="username"
                            placeholder="username"
                            className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none"
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="password"
                            className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none"
                        />
                        <button
                            type="submit"
                            className="w-full border border-[#00ff00] bg-[#00ff00] py-3 text-xl font-bold text-black transition hover:bg-black hover:text-[#00ff00]"
                        >
                            LOGIN
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    const rows = await getQuestionsWithOptions();

    return (
        <main className="page-shell">
            <div className="mx-auto mb-6 flex w-full max-w-5xl items-center justify-between border-2 border-[#00ff00] bg-[#1e1e1e] p-4">
                <h1 className="text-3xl font-bold text-[#00ff00]">ADMIN_PANEL</h1>
                <div className="flex items-center gap-3">
                    <form action={invalidateGameCacheAction}>
                        <button
                            type="submit"
                            className="border border-yellow-400 bg-[#2b260f] px-4 py-2 text-lg font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                        >
                            INVALIDATE_CACHE
                        </button>
                    </form>
                    <form action={adminLogoutAction}>
                        <button
                            type="submit"
                            className="border border-[#00ff00] bg-[#0f2b0f] px-4 py-2 text-lg font-bold text-[#00ff00] transition hover:bg-[#00ff00] hover:text-black"
                        >
                            LOGOUT
                        </button>
                    </form>
                </div>
            </div>

            <div className="mx-auto mb-6 w-full max-w-5xl border-2 border-[#00ff00] bg-[#1e1e1e] p-6">
                <h2 className="mb-4 text-2xl font-bold text-[#00ff00]">ADD_QUESTION</h2>
                <form action={addQuestionAction} className="space-y-3">
                    <input
                        name="text"
                        placeholder="Question text"
                        className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none"
                    />
                    <div className="grid gap-3 md:grid-cols-2">
                        <input name="optionALabel" placeholder="Option A label" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionBLabel" placeholder="Option B label" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionAMoney" type="number" placeholder="Option A money" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionBMoney" type="number" placeholder="Option B money" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionAEnergy" type="number" placeholder="Option A energy" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionBEnergy" type="number" placeholder="Option B energy" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionARep" type="number" placeholder="Option A rep" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                        <input name="optionBRep" type="number" placeholder="Option B rep" className="w-full border border-[#00ff00] bg-black px-3 py-3 text-lg text-[#00ff00] outline-none" />
                    </div>
                    <button
                        type="submit"
                        className="border border-[#00ff00] bg-[#00ff00] px-6 py-3 text-xl font-bold text-black transition hover:bg-black hover:text-[#00ff00]"
                    >
                        ADD_QUESTION
                    </button>
                </form>
            </div>

            <div className="mx-auto w-full max-w-5xl border-2 border-[#00ff00] bg-[#1e1e1e] p-6">
                <h2 className="mb-4 text-2xl font-bold text-[#00ff00]">ALL_QUESTIONS</h2>
                <div className="space-y-4">
                    {rows.map((q) => (
                        <div key={q.id} className="border border-[#00ff00] bg-black/30 p-4">
                            <p className="mb-2 text-xl font-bold text-white">
                                #{q.id} {q.text}
                            </p>
                            <p className="text-lg text-[#9ad79a]">
                                A: {q.optionA?.label} | money {q.optionA?.money}, energy {q.optionA?.energy}, rep {q.optionA?.rep}
                            </p>
                            <p className="text-lg text-[#9ad79a]">
                                B: {q.optionB?.label} | money {q.optionB?.money}, energy {q.optionB?.energy}, rep {q.optionB?.rep}
                            </p>
                            <div className="mb-3" />
                            <form action={deleteQuestionAction}>
                                <input type="hidden" name="questionId" value={q.id} />
                                <button
                                    type="submit"
                                    className="border border-red-500 bg-[#2a1212] px-4 py-2 text-lg font-bold text-red-300 transition hover:bg-red-500 hover:text-black"
                                >
                                    DELETE
                                </button>
                            </form>
                        </div>
                    ))}
                    {rows.length === 0 && <p className="text-lg text-[#9ad79a]">No questions found.</p>}
                </div>
            </div>
        </main>
    );
}
