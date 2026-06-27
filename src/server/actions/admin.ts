"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { nodes, posts, replies, siteSettings, users } from "@/db/schema";
import { checkboxValue } from "@/server/action-state";
import type { ActionState } from "@/server/action-state";
import { requireAdmin } from "@/server/auth";
import { slugify } from "@/lib/utils";

const nodeSchema = z.object({
  name: z.string().min(2, "节点名称至少 2 个字符").max(80),
  slug: z.string().min(2, "节点 slug 至少 2 个字符").max(100),
  parentId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().max(300).optional(),
  postingMode: z.enum(["open", "admin_only"]),
  status: z.enum(["active", "hidden"]),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

const settingsSchema = z.object({
  siteName: z.string().min(2, "网站名称至少 2 个字符").max(120),
  siteUrl: z.string().url("请输入完整网站网址"),
  siteDescription: z.string().max(300).optional(),
});

export async function createNodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const rawSlug = String(formData.get("slug") || formData.get("name") || "");
  const parsed = nodeSchema.safeParse({
    name: formData.get("name"),
    slug: slugify(rawSlug),
    parentId: formData.get("parentId") || "",
    description: formData.get("description") || undefined,
    postingMode: formData.get("postingMode"),
    status: formData.get("status"),
    sortOrder: formData.get("sortOrder") || 0,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const parentId = parsed.data.parentId || null;

  try {
    await db.insert(nodes).values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      parentId,
      level: parentId ? 2 : 1,
      description: parsed.data.description,
      postingMode: parsed.data.postingMode,
      status: parsed.data.status,
      sortOrder: parsed.data.sortOrder,
      createdBy: admin.id,
    });
  } catch {
    return { message: "节点创建失败，可能是 slug 已存在。" };
  }

  revalidatePath("/");
  revalidatePath("/nodes");
  revalidatePath("/admin/nodes");
  return { message: "节点已创建。" };
}

export async function updateNodeStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "active");

  if (!id || !["active", "hidden"].includes(status)) {
    return;
  }

  await db
    .update(nodes)
    .set({ status, updatedAt: new Date() })
    .where(eq(nodes.id, id));

  revalidatePath("/");
  revalidatePath("/nodes");
  revalidatePath("/admin/nodes");
}

export async function updatePostStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "published");

  if (!id || !["published", "hidden"].includes(status)) {
    return;
  }

  await db
    .update(posts)
    .set({ status, updatedAt: new Date() })
    .where(eq(posts.id, id));

  revalidatePath("/");
  revalidatePath("/admin/posts");
}

export async function updateReplyStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "published");

  if (!id || !["published", "hidden"].includes(status)) {
    return;
  }

  await db
    .update(replies)
    .set({ status, updatedAt: new Date() })
    .where(eq(replies.id, id));

  revalidatePath("/admin/replies");
}

export async function updateUserStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "active");

  if (!id || !["active", "disabled"].includes(status)) {
    return;
  }

  await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.id, id));

  revalidatePath("/admin/users");
}

export async function updateSiteSettingsAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteUrl: formData.get("siteUrl"),
    siteDescription: formData.get("siteDescription") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(siteSettings)
    .set({
      ...parsed.data,
      allowRegistration: checkboxValue(formData, "allowRegistration"),
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, "site"));

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { message: "站点设置已保存。" };
}
