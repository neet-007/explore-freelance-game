import { aliasedTable, eq } from "drizzle-orm";
import { db } from "@/db";
import { options, questions } from "@/db/schema";
import { ensureAdminTable, getAdminSession } from "@/lib/admin-auth";
import {
    addQuestionAction,
    adminLoginAction,
    adminLogoutAction,
    deleteQuestionAction,
    importQuestionsJsonAction,
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
    searchParams: Promise<{ error?: string; section?: string; success?: string }>;
}) {
    await ensureAdminTable();
    const session = await getAdminSession();
    const params = await searchParams;
    const error = params.error;
    const success = params.success;
    const section = params.section === "json" ? "json" : "manual";

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
                        <label className="block text-base font-semibold text-white">
                            Username
                            <input
                                name="username"
                                placeholder="username"
                                className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-3 text-lg text-black outline-none placeholder:text-black"
                            />
                        </label>
                        <label className="block text-base font-semibold text-white">
                            Password
                            <input
                                type="password"
                                name="password"
                                placeholder="password"
                                className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-3 text-lg text-black outline-none placeholder:text-black"
                            />
                        </label>
                        <button
                            type="submit"
                            className="w-full cursor-pointer border border-[#00ff00] bg-[#00ff00] py-3 text-xl font-bold text-black transition hover:bg-black hover:text-[#00ff00]"
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
                <h1 className="text-3xl font-bold tracking-wide text-white">Admin Panel</h1>
                <div className="flex items-center gap-3">
                    <form action={invalidateGameCacheAction}>
                        <button
                            type="submit"
                            className="cursor-pointer border border-yellow-400 bg-[#2b260f] px-4 py-2 text-lg font-bold text-yellow-300 transition hover:bg-yellow-400 hover:text-black"
                        >
                            Invalidate Cache
                        </button>
                    </form>
                    <form action={adminLogoutAction}>
                        <button
                            type="submit"
                            className="cursor-pointer border border-[#00ff00] bg-[#0f2b0f] px-4 py-2 text-lg font-bold text-[#e9ffe9] transition hover:bg-[#00ff00] hover:text-black"
                        >
                            Logout
                        </button>
                    </form>
                </div>
            </div>

            <div className="mx-auto mb-6 w-full max-w-5xl border-2 border-[#00ff00] bg-[#1e1e1e] p-6">
                <h2 className="mb-4 text-2xl font-bold text-white">Add Questions</h2>
                <div className="mb-6 grid max-w-md gap-3">
                    <a
                        href="/admin?section=manual"
                        className={`cursor-pointer rounded border px-6 py-3 text-lg font-bold no-underline transition ${
                            section === "manual"
                                ? "border-[#00ff00] bg-[#102810] text-[#00ff00] hover:text-white active:text-white"
                                : "border-[#00ff00] bg-[#0f2b0f] text-[#00ff00] hover:text-white active:text-white"
                        }`}
                    >
                        Manual Entry
                    </a>
                    <a
                        href="/admin?section=json"
                        className={`cursor-pointer rounded border px-6 py-3 text-lg font-bold no-underline transition ${
                            section === "json"
                                ? "border-[#00ff00] bg-[#102810] text-[#00ff00] hover:text-white active:text-white"
                                : "border-[#00ff00] bg-[#0f2b0f] text-[#00ff00] hover:text-white active:text-white"
                        }`}
                    >
                        Paste JSON Array
                    </a>
                </div>

                {error && (
                    <p className="mb-4 border border-red-500 bg-[#2a1212] px-3 py-2 text-lg text-red-300">
                        {error === "invalid-question"
                            ? "Manual form is missing required fields."
                            : error === "empty-json"
                              ? "Paste a JSON array before importing."
                              : error === "invalid-json"
                                ? "Invalid JSON. Fix formatting and try again."
                                : error === "json-not-array"
                                  ? "JSON must be an array of question objects."
                                  : error.startsWith("invalid-question-at-")
                                    ? `Question ${error.replace("invalid-question-at-", "")} is invalid. Check text/options structure.`
                                    : "Operation failed. Check your input and try again."}
                    </p>
                )}
                {success && (
                    <p className="mb-4 border border-[#00ff00] bg-[#0f2b0f] px-3 py-2 text-lg text-white">
                        {success.startsWith("imported-")
                            ? `Imported ${success.replace("imported-", "")} questions successfully.`
                            : "Success."}
                    </p>
                )}

                {section === "manual" ? (
                    <form action={addQuestionAction} className="space-y-3">
                        <label className="block text-base font-semibold text-white">
                            Question Text
                            <input
                                name="text"
                                placeholder="Question text"
                                className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black"
                            />
                        </label>
                        <div className="grid gap-3 md:grid-cols-2">
                            <label className="block text-base font-semibold text-white">
                                Option A Label
                                <input name="optionALabel" placeholder="Option A label" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option B Label
                                <input name="optionBLabel" placeholder="Option B label" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option A Money
                                <input name="optionAMoney" type="number" placeholder="Option A money" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option B Money
                                <input name="optionBMoney" type="number" placeholder="Option B money" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option A Energy
                                <input name="optionAEnergy" type="number" placeholder="Option A energy" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option B Energy
                                <input name="optionBEnergy" type="number" placeholder="Option B energy" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option A Rep
                                <input name="optionARep" type="number" placeholder="Option A rep" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                            <label className="block text-base font-semibold text-white">
                                Option B Rep
                                <input name="optionBRep" type="number" placeholder="Option B rep" className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 text-xl text-black outline-none placeholder:text-black" />
                            </label>
                        </div>
                        <button
                            type="submit"
                            className="cursor-pointer border border-[#00ff00] bg-[#0f2b0f] px-10 py-4 text-2xl font-bold text-[#00ff00] transition hover:text-white active:text-white"
                        >
                            Add One Question
                        </button>
                    </form>
                ) : (
                    <form action={importQuestionsJsonAction} className="space-y-3">
                        <p className="text-lg text-white">
                            Paste a JSON array. Supported shape: text + optionA/optionB objects (or flat optionA/optionB fields).
                        </p>
                        <label className="block text-base font-semibold text-white">
                            Questions JSON Array
                            <textarea
                                name="questionsJson"
                                rows={14}
                                placeholder={`[\n  {\n    "text": "Choose your next move",\n    "optionA": { "label": "Build prototype", "money": -200, "energy": -10, "rep": 5 },\n    "optionB": { "label": "Run interviews", "money": -50, "energy": -5, "rep": 3 }\n  }\n]`}
                                className="mt-2 w-full border border-[#00ff00] bg-white px-4 py-4 font-mono text-lg text-black outline-none placeholder:text-black"
                            />
                        </label>
                        <button
                            type="submit"
                            className="cursor-pointer border border-[#00ff00] bg-[#00ff00] px-6 py-3 text-xl font-bold text-black transition hover:bg-black hover:text-[#00ff00]"
                        >
                            Import JSON Array
                        </button>
                    </form>
                )}
            </div>

            <div className="mx-auto w-full max-w-5xl border-2 border-[#00ff00] bg-[#1e1e1e] p-6">
                <h2 className="mb-2 text-2xl font-bold text-white">All Questions</h2>
                <p className="mb-4 text-lg text-white">{rows.length} total questions</p>
                <div className="space-y-4">
                    {rows.map((q) => (
                        <div key={q.id} className="border border-[#00ff00] bg-black/40 p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                                <p className="text-xl font-bold text-white">
                                    #{q.id} {q.text}
                                </p>
                                <form action={deleteQuestionAction}>
                                    <input type="hidden" name="questionId" value={q.id} />
                                    <button
                                        type="submit"
                                        title={`Remove question #${q.id}`}
                                        className="cursor-pointer rounded border border-red-500 bg-red-600 px-4 py-2 text-base font-extrabold text-white transition hover:bg-red-500"
                                    >
                                        Remove
                                    </button>
                                </form>
                            </div>
                            <p className="text-lg text-[#d8f3d8]">
                                <span className="font-bold text-white">Option A:</span> {q.optionA?.label} | money {q.optionA?.money}, energy {q.optionA?.energy}, rep {q.optionA?.rep}
                            </p>
                            <p className="text-lg text-[#d8f3d8]">
                                <span className="font-bold text-white">Option B:</span> {q.optionB?.label} | money {q.optionB?.money}, energy {q.optionB?.energy}, rep {q.optionB?.rep}
                            </p>
                        </div>
                    ))}
                    {rows.length === 0 && <p className="text-lg text-white">No questions found.</p>}
                </div>
            </div>
        </main>
    );
}
