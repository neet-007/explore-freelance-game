import crypto from "crypto";

export type RunTokenPayload = {
    v: 1;
    username: string;
    startedAtMs: number;
    expiresAtMs: number;

    questionIds: number[];

    maxRounds: number;
};

const SECRET = process.env.RUN_TOKEN_SECRET;
if (!SECRET) {
    throw new Error("Missing RUN_TOKEN_SECRET env var");
}

function base64urlEncode(buf: Buffer) {
    return buf
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function base64urlDecode(str: string) {
    const padLen = (4 - (str.length % 4)) % 4;
    const padded = str + "=".repeat(padLen);
    const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    return Buffer.from(b64, "base64");
}

function sign(bodyB64Url: string) {
    return base64urlEncode(crypto.createHmac("sha256", SECRET!).update(bodyB64Url).digest());
}

export function createRunToken(payload: RunTokenPayload) {
    const json = JSON.stringify(payload);
    const body = base64urlEncode(Buffer.from(json, "utf8"));
    const sig = sign(body);
    return `${body}.${sig}`;
}

export function verifyRunToken(token: string): RunTokenPayload | null {
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [body, sig] = parts;
    const expected = sign(body);

    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;

    try {
        const json = base64urlDecode(body).toString("utf8");
        const payload = JSON.parse(json) as RunTokenPayload;

        if (!payload || payload.v !== 1) return null;
        if (typeof payload.username !== "string") return null;
        if (typeof payload.startedAtMs !== "number") return null;
        if (typeof payload.expiresAtMs !== "number") return null;
        if (!Array.isArray(payload.questionIds)) return null;
        if (typeof payload.maxRounds !== "number") return null;

        return payload;
    } catch {
        return null;
    }
}
