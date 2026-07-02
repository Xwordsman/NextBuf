"use server";

import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import {
  nodes,
  notifications,
  postBookmarks,
  postLikes,
  postTags,
  posts,
  replies,
  replyLikes,
  reports,
  tags,
  users,
} from "@/db/schema";
import { formValue, type ActionState } from "@/server/action-state";
import { requireUser } from "@/server/auth";
import { requireInstalled } from "@/server/site";

const postSchema = z.object({
  nodeId: z.string().uuid("请选择节点"),
  title: z.string().min(3, "标题至少 3 个字符").max(160),
  content: z.string().min(5, "正文至少 5 个字符"),
  tagIds: z.array(z.string().uuid()).max(5, "最多选择 5 个标签"),
});

const replySchema = z.object({
  content: z.string().min(2, "回复至少 2 个字符"),
});

const postUpdateSchema = z.object({
  nodeId: z.string().uuid("请选择节点"),
  title: z.string().min(3, "标题至少 3 个字符").max(160),
  content: z.string().min(5, "正文至少 5 个字符"),
  tagIds: z.array(z.string().uuid()).max(5, "最多选择 5 个标签"),
});

const replyUpdateSchema = z.object({
  content: z.string().min(2, "回复至少 2 个字符"),
});

const reportSchema = z.object({
  targetType: z.enum(["post", "reply"]),
  targetId: z.string().uuid("举报对象不正确"),
  postId: z.string().uuid("帖子不存在"),
  reason: z.enum(["spam", "abuse", "illegal", "off_topic", "other"]),
  detail: z.string().max(500, "补充说明最多 500 个字符").optional(),
});

const profileSchema = z.object({
  avatarUrl: z.string().url("请输入完整头像 URL").optional().or(z.literal("")),
  bio: z.string().max(500, "个人简介最多 500 个字符").optional(),
});

function canManageContent(user: { id: string; role: string }, authorId: string) {
  return user.role === "admin" || user.id === authorId;
}

function parseTagIds(formData: FormData) {
  return Array.from(
    new Set(
      formData
        .getAll("tagIds")
        .map((value) => String(value))
        .filter(Boolean),
    ),
  );
}

async function resolveActiveTags(tagIds: string[]) {
  if (tagIds.length === 0) {
    return [];
  }

  return db
    .select({ id: tags.id, slug: tags.slug })
    .from(tags)
    .where(and(inArray(tags.id, tagIds), eq(tags.status, "active")));
}

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

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  if (user.status === "muted") {
    return { message: "你的账号当前处于禁言状态，暂时不能发布主题。" };
  }

  const parsed = postSchema.safeParse({
    nodeId: formData.get("nodeId"),
    title: formData.get("title"),
    content: formData.get("content"),
    tagIds: parseTagIds(formData),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [node] = await db
    .select()
    .from(nodes)
    .where(and(eq(nodes.id, parsed.data.nodeId), eq(nodes.status, "active")))
    .limit(1);

  if (!node) {
    return { message: "节点不存在或不可用。" };
  }

  if (node.postingMode === "admin_only" && user.role !== "admin") {
    return { message: "该节点仅管理员可以发帖。" };
  }

  const selectedTags = await resolveActiveTags(parsed.data.tagIds);

  if (selectedTags.length !== parsed.data.tagIds.length) {
    return { message: "标签不存在或已停用，请重新选择。" };
  }

  const rootNodeId = node.parentId ?? node.id;
  const status =
    node.postingMode === "moderated" && user.role !== "admin"
      ? "pending"
      : "published";
  const [post] = await db.transaction(async (tx) => {
    const created = await tx
      .insert(posts)
      .values({
        nodeId: node.id,
        rootNodeId,
        authorId: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        status,
      })
      .returning({ id: posts.id });

    if (created[0] && selectedTags.length > 0) {
      await tx.insert(postTags).values(
        selectedTags.map((tag) => ({
          postId: created[0].id,
          tagId: tag.id,
        })),
      );
    }

    return created;
  });

  if (!post) {
    return { message: "发布失败，请稍后重试。" };
  }

  if (status === "pending") {
    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    revalidatePath("/me");
    return { message: "主题已提交审核，通过后会出现在前台列表。" };
  }

  revalidatePath("/");
  revalidatePath(`/nodes/${node.slug}`);
  for (const tag of selectedTags) {
    revalidatePath(`/tags/${tag.slug}`);
  }
  redirect(`/posts/${post.id}`);
}

export async function createReplyAction(
  postId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  if (user.status === "muted") {
    return { message: "你的账号当前处于禁言状态，暂时不能回复。" };
  }

  const parsed = replySchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      authorId: posts.authorId,
      replyCount: posts.replyCount,
      nodePostingMode: nodes.postingMode,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .where(and(eq(posts.id, postId), eq(posts.status, "published")))
    .limit(1);

  if (!post) {
    return { message: "帖子不存在或不可回复。" };
  }

  const status =
    post.nodePostingMode === "moderated" && user.role !== "admin"
      ? "pending"
      : "published";

  if (status === "pending") {
    await db.insert(replies).values({
      postId,
      authorId: user.id,
      content: parsed.data.content,
      status,
    });

    revalidatePath(`/posts/${postId}`);
    revalidatePath("/admin");
    revalidatePath("/admin/moderation");
    return { message: "回复已提交审核，通过后会显示在主题下方。" };
  }

  const replyNumber = post.replyCount + 1;

  await db.transaction(async (tx) => {
    await tx.insert(replies).values({
      postId,
      authorId: user.id,
      content: parsed.data.content,
      status: "published",
    });

    await tx
      .update(posts)
      .set({
        replyCount: sql`${posts.replyCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyUserId: user.id,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));
  });

  if (post.authorId !== user.id) {
    await db.insert(notifications).values({
      userId: post.authorId,
      actorId: user.id,
      type: "reply_created",
      postId,
      message: `${user.username} 回复了你的主题「${post.title}」。`,
    });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me/notifications");
  redirect(`/posts/${postId}#reply-${replyNumber}`);
}

export async function updatePostAction(
  postId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  const parsed = postUpdateSchema.safeParse({
    nodeId: formData.get("nodeId"),
    title: formData.get("title"),
    content: formData.get("content"),
    tagIds: parseTagIds(formData),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      status: posts.status,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.status === "deleted") {
    return { message: "主题不存在或已被删除。" };
  }

  if (!canManageContent(user, post.authorId)) {
    return { message: "你没有权限编辑这个主题。" };
  }

  const [node] = await db
    .select()
    .from(nodes)
    .where(and(eq(nodes.id, parsed.data.nodeId), eq(nodes.status, "active")))
    .limit(1);

  if (!node) {
    return { message: "节点不存在或不可用。" };
  }

  if (node.postingMode === "admin_only" && user.role !== "admin") {
    return { message: "该节点仅管理员可以发帖。" };
  }

  const selectedTags = await resolveActiveTags(parsed.data.tagIds);

  if (selectedTags.length !== parsed.data.tagIds.length) {
    return { message: "标签不存在或已停用，请重新选择。" };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(posts)
      .set({
        nodeId: node.id,
        rootNodeId: node.parentId ?? node.id,
        title: parsed.data.title,
        content: parsed.data.content,
        editedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    await tx.delete(postTags).where(eq(postTags.postId, postId));

    if (selectedTags.length > 0) {
      await tx.insert(postTags).values(
        selectedTags.map((tag) => ({
          postId,
          tagId: tag.id,
        })),
      );
    }
  });

  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath(`/nodes/${node.slug}`);
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/admin/posts");
  for (const tag of selectedTags) {
    revalidatePath(`/tags/${tag.slug}`);
  }

  if (post.status === "published") {
    redirect(`/posts/${postId}`);
  }

  redirect("/me");
}

export async function updateReplyAction(
  replyId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  const parsed = replyUpdateSchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [reply] = await db
    .select({
      id: replies.id,
      postId: replies.postId,
      authorId: replies.authorId,
      status: replies.status,
    })
    .from(replies)
    .where(eq(replies.id, replyId))
    .limit(1);

  if (!reply || reply.status === "deleted") {
    return { message: "回复不存在或已被删除。" };
  }

  if (!canManageContent(user, reply.authorId)) {
    return { message: "你没有权限编辑这条回复。" };
  }

  await db
    .update(replies)
    .set({
      content: parsed.data.content,
      editedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(replies.id, replyId));

  revalidatePath(`/posts/${reply.postId}`);
  revalidatePath("/admin/replies");
  redirect(`/posts/${reply.postId}`);
}

export async function deletePostAction(formData: FormData) {
  await requireInstalled();
  const user = await requireUser();
  const postId = String(formData.get("id") || "");

  const [post] = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      status: posts.status,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.status === "deleted" || !canManageContent(user, post.authorId)) {
    return;
  }

  await db
    .update(posts)
    .set({
      status: "deleted",
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  revalidatePath("/");
  revalidatePath("/popular");
  revalidatePath("/me");
  revalidatePath("/admin/posts");
  redirect("/");
}

export async function deleteReplyAction(formData: FormData) {
  await requireInstalled();
  const user = await requireUser();
  const replyId = String(formData.get("id") || "");

  const [reply] = await db
    .select({
      id: replies.id,
      postId: replies.postId,
      authorId: replies.authorId,
      status: replies.status,
    })
    .from(replies)
    .where(eq(replies.id, replyId))
    .limit(1);

  if (!reply || reply.status === "deleted" || !canManageContent(user, reply.authorId)) {
    return;
  }

  await db
    .update(replies)
    .set({
      status: "deleted",
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(replies.id, replyId));

  await refreshPostReplyMeta(reply.postId);

  revalidatePath(`/posts/${reply.postId}`);
  revalidatePath("/admin/replies");
  redirect(`/posts/${reply.postId}`);
}

export async function togglePostLikeAction(postId: string) {
  await requireInstalled();
  const user = await requireUser();

  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      authorId: posts.authorId,
      status: posts.status,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.status !== "published") {
    return;
  }

  const [existing] = await db
    .select({ postId: postLikes.postId })
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)))
    .limit(1);

  if (existing) {
    await db.transaction(async (tx) => {
      await tx
        .delete(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, user.id)));
      await tx
        .update(posts)
        .set({
          likeCount: sql<number>`greatest(${posts.likeCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(postLikes).values({ postId, userId: user.id });
      await tx
        .update(posts)
        .set({
          likeCount: sql<number>`${posts.likeCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    });

    if (post.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: post.authorId,
        actorId: user.id,
        type: "post_liked",
        postId,
        message: `${user.username} 赞了你的主题「${post.title}」。`,
      });
    }
  }

  revalidatePath("/");
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/popular");
  revalidatePath("/me/notifications");
}

export async function toggleReplyLikeAction(replyId: string, postId: string) {
  await requireInstalled();
  const user = await requireUser();

  const [reply] = await db
    .select({
      id: replies.id,
      postId: replies.postId,
      authorId: replies.authorId,
      status: replies.status,
    })
    .from(replies)
    .where(eq(replies.id, replyId))
    .limit(1);

  if (!reply || reply.status !== "published" || reply.postId !== postId) {
    return;
  }

  const [post] = await db
    .select({ title: posts.title })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  const [existing] = await db
    .select({ replyId: replyLikes.replyId })
    .from(replyLikes)
    .where(and(eq(replyLikes.replyId, replyId), eq(replyLikes.userId, user.id)))
    .limit(1);

  if (existing) {
    await db.transaction(async (tx) => {
      await tx
        .delete(replyLikes)
        .where(and(eq(replyLikes.replyId, replyId), eq(replyLikes.userId, user.id)));
      await tx
        .update(replies)
        .set({
          likeCount: sql<number>`greatest(${replies.likeCount} - 1, 0)`,
          updatedAt: new Date(),
        })
        .where(eq(replies.id, replyId));
    });
  } else {
    await db.transaction(async (tx) => {
      await tx.insert(replyLikes).values({ replyId, userId: user.id });
      await tx
        .update(replies)
        .set({
          likeCount: sql<number>`${replies.likeCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(replies.id, replyId));
    });

    if (reply.authorId !== user.id) {
      await db.insert(notifications).values({
        userId: reply.authorId,
        actorId: user.id,
        type: "reply_liked",
        postId,
        replyId,
        message: `${user.username} 赞了你在「${post?.title ?? "主题"}」下的回复。`,
      });
    }
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me/notifications");
}

export async function toggleBookmarkAction(postId: string) {
  await requireInstalled();
  const user = await requireUser();

  const [post] = await db
    .select({ id: posts.id, status: posts.status })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.status !== "published") {
    return;
  }

  const [existing] = await db
    .select({ postId: postBookmarks.postId })
    .from(postBookmarks)
    .where(and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, user.id)))
    .limit(1);

  if (existing) {
    await db
      .delete(postBookmarks)
      .where(and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, user.id)));
  } else {
    await db.insert(postBookmarks).values({ postId, userId: user.id });
  }

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/me/bookmarks");
}

export async function reportContentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  const parsed = reportSchema.safeParse({
    targetType: formData.get("targetType"),
    targetId: formData.get("targetId"),
    postId: formData.get("postId"),
    reason: formData.get("reason"),
    detail: formValue(formData, "detail") || undefined,
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (
    parsed.data.targetType === "post" &&
    parsed.data.targetId !== parsed.data.postId
  ) {
    return { message: "举报对象不正确。" };
  }

  const targetExists =
    parsed.data.targetType === "post"
      ? await db
          .select({ id: posts.id })
          .from(posts)
          .where(
            and(
              eq(posts.id, parsed.data.targetId),
              eq(posts.status, "published"),
            ),
          )
          .limit(1)
      : await db
          .select({ id: replies.id })
          .from(replies)
          .where(
            and(
              eq(replies.id, parsed.data.targetId),
              eq(replies.postId, parsed.data.postId),
              eq(replies.status, "published"),
            ),
          )
          .limit(1);

  if (targetExists.length === 0) {
    return { message: "举报对象不存在或已被处理。" };
  }

  const [existing] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.reporterId, user.id),
        eq(reports.targetType, parsed.data.targetType),
        eq(reports.targetId, parsed.data.targetId),
        eq(reports.status, "pending"),
      ),
    )
    .limit(1);

  if (existing) {
    return { message: "你已经举报过该内容，管理员会尽快处理。" };
  }

  await db.insert(reports).values({
    reporterId: user.id,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    postId: parsed.data.postId,
    reason: parsed.data.reason,
    detail: parsed.data.detail,
    status: "pending",
  });

  revalidatePath("/admin/reports");
  return { message: "举报已提交，感谢你帮助维护社区秩序。" };
}

export async function markNotificationReadAction(formData: FormData) {
  await requireInstalled();
  const user = await requireUser();
  const id = String(formData.get("id") || "");

  if (!id) {
    return;
  }

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  revalidatePath("/me/notifications");
}

export async function markAllNotificationsReadAction() {
  await requireInstalled();
  const user = await requireUser();

  await db
    .update(notifications)
    .set({ readAt: new Date() })
    .where(and(eq(notifications.userId, user.id), sql`${notifications.readAt} is null`));

  revalidatePath("/me/notifications");
}

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    avatarUrl: formValue(formData, "avatarUrl"),
    bio: formValue(formData, "bio"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(users)
    .set({
      avatarUrl: parsed.data.avatarUrl || null,
      bio: parsed.data.bio || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  revalidatePath("/me");
  revalidatePath("/me/settings");
  revalidatePath(`/users/${user.username}`);
  return { message: "个人资料已保存。" };
}
