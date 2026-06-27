"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession } from "@/server/auth";
import type { ActionState } from "@/server/action-state";
import { hashPassword, verifyPassword } from "@/server/password";
import { getSiteSettings, requireInstalled } from "@/server/site";

const registerSchema = z.object({
  username: z.string().min(3, "用户名至少 3 个字符").max(40),
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(8, "密码至少 8 个字符"),
});

const loginSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export async function registerAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();

  const settings = await getSiteSettings();

  if (!settings?.allowRegistration) {
    return { message: "当前站点暂未开放注册。" };
  }

  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { username, email, password } = parsed.data;
  let userId = "";

  try {
    const [user] = await db
      .insert(users)
      .values({
        username,
        email: email.toLowerCase(),
        passwordHash: await hashPassword(password),
        role: "member",
        trustLevel: 0,
        status: "active",
      })
      .returning({ id: users.id });

    if (!user) {
      return { message: "注册失败，请稍后重试。" };
    }

    userId = user.id;
  } catch {
    return { message: "用户名或邮箱已存在。" };
  }

  await createSession(userId);
  redirect("/");
}

export async function loginAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, parsed.data.email.toLowerCase()),
        eq(users.status, "active"),
      ),
    )
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { message: "邮箱或密码不正确。" };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
