"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { nodes, posts, replies } from "@/db/schema";
import type { ActionState } from "@/server/action-state";
import { requireUser } from "@/server/auth";
import { requireInstalled } from "@/server/site";

const postSchema = z.object({
  nodeId: z.string().uuid("请选择节点"),
  title: z.string().min(3, "标题至少 3 个字符").max(160),
  content: z.string().min(5, "正文至少 5 个字符"),
});

const replySchema = z.object({
  content: z.string().min(2, "回复至少 2 个字符"),
});

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  const parsed = postSchema.safeParse({
    nodeId: formData.get("nodeId"),
    title: formData.get("title"),
    content: formData.get("content"),
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

  const rootNodeId = node.parentId ?? node.id;
  const now = new Date();
  const [post] = await db
    .insert(posts)
    .values({
      nodeId: node.id,
      rootNodeId,
      authorId: user.id,
      title: parsed.data.title,
      content: parsed.data.content,
      status: "published",
      lastReplyAt: now,
      lastReplyUserId: user.id,
    })
    .returning({ id: posts.id });

  if (!post) {
    return { message: "发布失败，请稍后重试。" };
  }

  revalidatePath("/");
  revalidatePath(`/nodes/${node.slug}`);
  redirect(`/posts/${post.id}`);
}

export async function createReplyAction(
  postId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireInstalled();
  const user = await requireUser();

  const parsed = replySchema.safeParse({
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, postId), eq(posts.status, "published")))
    .limit(1);

  if (!post) {
    return { message: "帖子不存在或不可回复。" };
  }

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

  revalidatePath(`/posts/${postId}`);
  redirect(`/posts/${postId}`);
}
