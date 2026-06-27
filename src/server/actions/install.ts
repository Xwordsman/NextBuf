"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { siteSettings, themes, users } from "@/db/schema";
import { createSession } from "@/server/auth";
import type { ActionState } from "@/server/action-state";
import { hashPassword } from "@/server/password";
import { isInstalled } from "@/server/site";

const installSchema = z
  .object({
    siteName: z.string().min(2, "网站名称至少 2 个字符").max(120),
    siteUrl: z.string().url("请输入完整网站网址，例如 https://nextbuf.com"),
    siteDescription: z.string().max(300).optional(),
    username: z.string().min(3, "用户名至少 3 个字符").max(40),
    email: z.string().email("请输入有效邮箱"),
    password: z.string().min(8, "密码至少 8 个字符"),
    confirmPassword: z.string().min(8, "请再次输入密码"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的密码不一致",
  });

export async function installAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = installSchema.safeParse({
    siteName: formData.get("siteName"),
    siteUrl: formData.get("siteUrl"),
    siteDescription: formData.get("siteDescription") || undefined,
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (await isInstalled()) {
    return { message: "站点已经初始化，不能重复安装。" };
  }

  const { siteName, siteUrl, siteDescription, username, email, password } =
    parsed.data;

  let adminId = "";

  try {
    adminId = await db.transaction(async (tx) => {
      await tx
        .insert(themes)
        .values({
          name: "NextBuf Default",
          slug: "nextbuf-default",
          version: "0.1.0",
          description: "NextBuf 默认主题",
          author: "NextBuf",
          status: "active",
        })
        .onConflictDoUpdate({
          target: themes.slug,
          set: { status: "active", updatedAt: new Date() },
        });

      const [admin] = await tx
        .insert(users)
        .values({
          username,
          email: email.toLowerCase(),
          passwordHash: await hashPassword(password),
          role: "admin",
          trustLevel: 4,
          status: "active",
        })
        .returning({ id: users.id });

      if (!admin) {
        throw new Error("创建管理员失败");
      }

      await tx
        .insert(siteSettings)
        .values({
          id: "site",
          siteName,
          siteUrl,
          siteDescription,
          activeThemeId: "nextbuf-default",
          allowRegistration: true,
          installedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: {
            siteName,
            siteUrl,
            siteDescription,
            activeThemeId: "nextbuf-default",
            allowRegistration: true,
            installedAt: new Date(),
            updatedAt: new Date(),
          },
        });

      return admin.id;
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message.includes("duplicate")
        ? "管理员用户名或邮箱已存在，请更换后重试。"
        : "安装失败，请确认数据库迁移已执行并重试。";

    return { message };
  }

  await createSession(adminId);
  redirect("/admin");
}

export async function resetInstallForDevOnly() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  await db.delete(siteSettings).where(eq(siteSettings.id, "site"));
}
