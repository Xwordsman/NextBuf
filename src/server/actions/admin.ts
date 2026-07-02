"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import {
  moderationLogs,
  nodes,
  notifications,
  posts,
  replies,
  reports,
  siteSettings,
  users,
} from "@/db/schema";
import { checkboxValue } from "@/server/action-state";
import type { ActionState } from "@/server/action-state";
import { requireAdmin } from "@/server/auth";
import { slugify } from "@/lib/utils";

const nodeSchema = z.object({
  name: z.string().min(2, "节点名称至少 2 个字符").max(80),
  slug: z.string().min(2, "节点 slug 至少 2 个字符").max(100),
  parentId: z.string().uuid().optional().or(z.literal("")),
  description: z.string().max(300).optional(),
  postingMode: z.enum(["open", "moderated", "admin_only"]),
  status: z.enum(["active", "hidden"]),
  sortOrder: z.coerce.number().int().min(0).max(9999),
});

const settingsSchema = z.object({
  siteName: z.string().min(2, "网站名称至少 2 个字符").max(120),
  siteUrl: z.string().url("请输入完整网站网址"),
  siteDescription: z.string().max(300).optional(),
});

const userGovernanceSchema = z.object({
  role: z.enum(["member", "moderator", "admin"]),
  trustLevel: z.coerce.number().int().min(0).max(4),
  status: z.enum(["active", "muted", "disabled"]),
  statusReason: z.string().max(500, "原因最多 500 个字符").optional(),
});

async function refreshPostReplyMeta(postId: string) {
  const [post] = await db
    .select({ createdAt: posts.createdAt })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    return;
  }

  const [replyCount] = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(replies)
    .where(and(eq(replies.postId, postId), eq(replies.status, "published")));

  const [latestReply] = await db
    .select({
      authorId: replies.authorId,
      createdAt: replies.createdAt,
    })
    .from(replies)
    .where(and(eq(replies.postId, postId), eq(replies.status, "published")))
    .orderBy(desc(replies.createdAt))
    .limit(1);

  await db
    .update(posts)
    .set({
      replyCount: replyCount?.value ?? 0,
      lastReplyAt: latestReply?.createdAt ?? post.createdAt,
      lastReplyUserId: latestReply?.authorId ?? null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));
}

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

export async function updateNodeAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") || "");
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

  if (!id) {
    return { message: "节点不存在。" };
  }

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [current] = await db.select().from(nodes).where(eq(nodes.id, id)).limit(1);

  if (!current) {
    return { message: "节点不存在。" };
  }

  const parentId = parsed.data.parentId || null;

  if (parentId === id) {
    return { errors: { parentId: ["节点不能选择自己作为父节点。"] } };
  }

  if (parentId) {
    const [parent] = await db
      .select({ id: nodes.id, parentId: nodes.parentId })
      .from(nodes)
      .where(eq(nodes.id, parentId))
      .limit(1);

    if (!parent || parent.parentId) {
      return { errors: { parentId: ["只能选择一级节点作为父节点。"] } };
    }
  }

  if (!current.parentId && parentId) {
    const [child] = await db
      .select({ id: nodes.id })
      .from(nodes)
      .where(eq(nodes.parentId, id))
      .limit(1);

    if (child) {
      return {
        message: "这个一级节点已有子节点，不能直接改为二级节点。",
      };
    }
  }

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(nodes)
        .set({
          name: parsed.data.name,
          slug: parsed.data.slug,
          parentId,
          level: parentId ? 2 : 1,
          description: parsed.data.description,
          postingMode: parsed.data.postingMode,
          status: parsed.data.status,
          sortOrder: parsed.data.sortOrder,
          updatedAt: new Date(),
        })
        .where(eq(nodes.id, id));

      if (current.parentId !== parentId) {
        await tx
          .update(posts)
          .set({
            rootNodeId: parentId ?? id,
            updatedAt: new Date(),
          })
          .where(eq(posts.nodeId, id));
      }

      await tx.insert(moderationLogs).values({
        actorId: admin.id,
        action: "node_updated",
        targetType: "node",
        targetId: id,
        metadata: {
          before: {
            name: current.name,
            slug: current.slug,
            parentId: current.parentId,
            postingMode: current.postingMode,
            status: current.status,
            sortOrder: current.sortOrder,
          },
          after: parsed.data,
        },
      });
    });
  } catch {
    return { message: "节点保存失败，可能是 slug 已存在。" };
  }

  revalidatePath("/");
  revalidatePath("/nodes");
  revalidatePath(`/nodes/${current.slug}`);
  revalidatePath(`/nodes/${parsed.data.slug}`);
  revalidatePath("/admin/nodes");
  return { message: "节点已保存。" };
}

export async function updateNodeStatusAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "active");

  if (!id || !["active", "hidden"].includes(status)) {
    return;
  }

  await db
    .update(nodes)
    .set({ status, updatedAt: new Date() })
    .where(eq(nodes.id, id));

  await writeModerationLog(admin.id, "node_status_updated", "node", id, {
    status,
  });

  revalidatePath("/");
  revalidatePath("/nodes");
  revalidatePath("/admin/nodes");
}

export async function updatePostStatusAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "published");

  if (!id || !["published", "hidden", "deleted"].includes(status)) {
    return;
  }

  await db
    .update(posts)
    .set({
      status,
      deletedAt: status === "deleted" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  await writeModerationLog(admin.id, "post_status_updated", "post", id, {
    status,
  });

  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/moderation");
  revalidatePath(`/posts/${id}`);
}

export async function updateReplyStatusAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "published");

  if (!id || !["published", "hidden", "deleted"].includes(status)) {
    return;
  }

  const [reply] = await db
    .select({ postId: replies.postId })
    .from(replies)
    .where(eq(replies.id, id))
    .limit(1);

  await db
    .update(replies)
    .set({
      status,
      deletedAt: status === "deleted" ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(replies.id, id));

  if (reply) {
    await refreshPostReplyMeta(reply.postId);
  }

  await writeModerationLog(admin.id, "reply_status_updated", "reply", id, {
    status,
  });

  revalidatePath("/admin/replies");
  revalidatePath("/admin/moderation");
}

export async function updateUserStatusAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "active");

  if (!id || id === admin.id || !["active", "disabled"].includes(status)) {
    return;
  }

  await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.id, id));

  await writeModerationLog(admin.id, "user_status_updated", "user", id, {
    status,
  });

  revalidatePath("/admin/users");
}

export async function updateUserGovernanceAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") || "");
  const parsed = userGovernanceSchema.safeParse({
    role: formData.get("role"),
    trustLevel: formData.get("trustLevel"),
    status: formData.get("status"),
    statusReason: String(formData.get("statusReason") || "").trim() || undefined,
  });

  if (!id || !parsed.success) {
    return;
  }

  if (
    id === admin.id &&
    (parsed.data.role !== "admin" || parsed.data.status === "disabled")
  ) {
    return;
  }

  const [target] = await db
    .select({
      id: users.id,
      role: users.role,
      trustLevel: users.trustLevel,
      status: users.status,
      statusReason: users.statusReason,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!target) {
    return;
  }

  await db
    .update(users)
    .set({
      role: parsed.data.role,
      trustLevel: parsed.data.trustLevel,
      status: parsed.data.status,
      statusReason:
        parsed.data.status === "active" ? null : parsed.data.statusReason ?? null,
      statusUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  await writeModerationLog(admin.id, "user_governance_updated", "user", id, {
    before: target,
    after: parsed.data,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function handleReportAction(formData: FormData) {
  const admin = await requireAdmin();

  const id = String(formData.get("id") || "");
  const resolution = String(formData.get("resolution") || "");

  if (!id || !["hide", "ignore", "resolve"].includes(resolution)) {
    return;
  }

  const [report] = await db.select().from(reports).where(eq(reports.id, id)).limit(1);

  if (!report || report.status !== "pending") {
    return;
  }

  await db.transaction(async (tx) => {
    if (resolution === "hide") {
      if (report.targetType === "post") {
        await tx
          .update(posts)
          .set({ status: "hidden", updatedAt: new Date() })
          .where(eq(posts.id, report.targetId));
      }

      if (report.targetType === "reply") {
        await tx
          .update(replies)
          .set({ status: "hidden", updatedAt: new Date() })
          .where(eq(replies.id, report.targetId));
      }
    }

    await tx
      .update(reports)
      .set({
        status: resolution === "ignore" ? "ignored" : "resolved",
        resolvedBy: admin.id,
        resolvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(reports.id, id));

    await tx.insert(moderationLogs).values({
      actorId: admin.id,
      action: `report_${resolution}`,
      targetType: report.targetType,
      targetId: report.targetId,
      metadata: {
        reportId: report.id,
        reason: report.reason,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath("/admin");
  revalidatePath("/admin/reports");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/replies");

  if (report.targetType === "reply" && report.postId) {
    await refreshPostReplyMeta(report.postId);
  }

  if (report.postId) {
    revalidatePath(`/posts/${report.postId}`);
  }
}

export async function handleModerationContentAction(formData: FormData) {
  const admin = await requireAdmin();

  const targetType = String(formData.get("targetType") || "");
  const targetId = String(formData.get("targetId") || "");
  const resolution = String(formData.get("resolution") || "");

  if (
    !["post", "reply"].includes(targetType) ||
    !targetId ||
    !["approve", "hide"].includes(resolution)
  ) {
    return;
  }

  const nextStatus = resolution === "approve" ? "published" : "hidden";
  let postId: string | null = null;

  if (targetType === "post") {
    const [post] = await db
      .select({ id: posts.id, status: posts.status })
      .from(posts)
      .where(eq(posts.id, targetId))
      .limit(1);

    if (!post || post.status !== "pending") {
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(posts)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(eq(posts.id, targetId));

      await tx.insert(moderationLogs).values({
        actorId: admin.id,
        action: `post_${resolution}`,
        targetType,
        targetId,
        metadata: { from: "pending", to: nextStatus },
      });
    });

    postId = post.id;
  }

  if (targetType === "reply") {
    const [reply] = await db
      .select({
        id: replies.id,
        status: replies.status,
        postId: replies.postId,
        authorId: replies.authorId,
        postAuthorId: posts.authorId,
        postTitle: posts.title,
      })
      .from(replies)
      .innerJoin(posts, eq(replies.postId, posts.id))
      .where(eq(replies.id, targetId))
      .limit(1);

    if (!reply || reply.status !== "pending") {
      return;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(replies)
        .set({ status: nextStatus, updatedAt: new Date() })
        .where(eq(replies.id, targetId));

      await tx.insert(moderationLogs).values({
        actorId: admin.id,
        action: `reply_${resolution}`,
        targetType,
        targetId,
        metadata: { from: "pending", to: nextStatus, postId: reply.postId },
      });

      if (resolution === "approve" && reply.postAuthorId !== reply.authorId) {
        await tx.insert(notifications).values({
          userId: reply.postAuthorId,
          actorId: reply.authorId,
          type: "reply_created",
          postId: reply.postId,
          replyId: reply.id,
          message: `你的主题「${reply.postTitle}」有一条新回复。`,
        });
      }
    });

    postId = reply.postId;
    await refreshPostReplyMeta(reply.postId);
  }

  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath("/admin");
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/replies");

  if (postId) {
    revalidatePath(`/posts/${postId}`);
  }
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

async function writeModerationLog(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown>,
) {
  await db.insert(moderationLogs).values({
    actorId,
    action,
    targetType,
    targetId,
    metadata,
  });
}
