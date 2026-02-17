import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "crypto";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";

const ADMIN_COOKIE = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function getSessionSecret() {
    return process.env.ADMIN_SESSION_SECRET ?? "dev-admin-secret-change-me";
}

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
    const digest = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${digest}`;
}

function verifyPasswordHash(stored: string, password: string) {
    const [salt, digest] = stored.split(":");
    if (!salt || !digest) return false;
    const computed = scryptSync(password, salt, 64).toString("hex");
    const left = Buffer.from(digest, "hex");
    const right = Buffer.from(computed, "hex");
    if (left.length !== right.length) return false;
    return timingSafeEqual(left, right);
}

function signPayload(payload: string) {
    return createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function createSessionToken(username: string) {
    const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
    const payload = `${username}.${exp}`;
    const sig = signPayload(payload);
    return `${payload}.${sig}`;
}

function readSessionToken(token: string) {
    const [username, expRaw, sig] = token.split(".");
    if (!username || !expRaw || !sig) return null;
    const payload = `${username}.${expRaw}`;
    if (signPayload(payload) !== sig) return null;
    const exp = Number.parseInt(expRaw, 10);
    if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    return { username };
}

export async function ensureAdminTable() {
    await db.run(sql`
        CREATE TABLE IF NOT EXISTS admins (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    `);

    const configuredUsername = process.env.ADMIN_USERNAME ?? "admin";
    const configuredPassword = process.env.ADMIN_PASSWORD ?? "admin123";

    const existing = await db.query.admins.findFirst({
        where: eq(admins.username, configuredUsername),
    });
    if (existing) return;

    const countRows = await db.select({ count: sql<number>`count(*)` }).from(admins);
    const adminCount = Number(countRows[0]?.count ?? 0);
    if (adminCount === 0) {
        await db.insert(admins).values({
            username: configuredUsername,
            passwordHash: hashPassword(configuredPassword),
        });
    }
}

export async function authenticateAdmin(username: string, password: string) {
    await ensureAdminTable();
    const admin = await db.query.admins.findFirst({
        where: eq(admins.username, username),
    });
    if (!admin) return false;
    return verifyPasswordHash(admin.passwordHash, password);
}

export async function setAdminSession(username: string) {
    const store = await cookies();
    store.set(ADMIN_COOKIE, createSessionToken(username), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
    });
}

export async function clearAdminSession() {
    const store = await cookies();
    store.delete(ADMIN_COOKIE);
}

export async function getAdminSession() {
    const store = await cookies();
    const token = store.get(ADMIN_COOKIE)?.value;
    if (!token) return null;
    return readSessionToken(token);
}
