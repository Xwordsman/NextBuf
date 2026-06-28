import "server-only";

import { createHash, randomBytes } from "crypto";
import { and, eq, gt } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { sessions, users } from "@/db/schema";

const SESSION_COOKIE_NAME = "nextbuf_session";
const SESSION_DAYS = 30;

export type CurrentUser = {
  id: string;
  username: string;
  email: string;
  role: string;
  trustLevel: number;
  status: string;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function parseCookieSecureOverride() {
  const value = process.env.NEXTBUF_COOKIE_SECURE?.trim().toLowerCase();

  if (["1", "true", "yes", "on"].includes(value ?? "")) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(value ?? "")) {
    return false;
  }

  return null;
}

async function shouldUseSecureCookie() {
  const override = parseCookieSecureOverride();

  if (override !== null) {
    return override;
  }

  const headerStore = await headers();
  const forwardedProto = headerStore
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  if (headerStore.get("x-forwarded-ssl")?.toLowerCase() === "on") {
    return true;
  }

  const requestOrigin = headerStore.get("origin") ?? headerStore.get("referer");
  return requestOrigin?.toLowerCase().startsWith("https://") ?? false;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await shouldUseSecureCookie(),
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db
      .delete(sessions)
      .where(eq(sessions.tokenHash, hashSessionToken(token)));
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      trustLevel: users.trustLevel,
      status: users.status,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.tokenHash, hashSessionToken(token)),
        gt(sessions.expiresAt, new Date()),
        eq(users.status, "active"),
      ),
    )
    .limit(1);

  return user ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  return user;
}
