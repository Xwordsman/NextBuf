import "server-only";

import { and, asc, count, desc, eq, isNull, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import { nodes, posts, replies, siteSettings, users } from "@/db/schema";

export type NodeOption = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  level: number;
  postingMode: string;
  status: string;
};

export type PostListItem = {
  id: string;
  title: string;
  status: string;
  replyCount: number;
  likeCount: number;
  lastReplyAt: Date;
  createdAt: Date;
  nodeName: string;
  nodeSlug: string;
  authorUsername: string;
  authorTrustLevel: number;
};

export type ReplyItem = {
  id: string;
  content: string;
  status: string;
  likeCount: number;
  createdAt: Date;
  authorUsername: string;
  authorTrustLevel: number;
};

export async function getPublicNodes(): Promise<NodeOption[]> {
  return db
    .select({
      id: nodes.id,
      parentId: nodes.parentId,
      name: nodes.name,
      slug: nodes.slug,
      level: nodes.level,
      postingMode: nodes.postingMode,
      status: nodes.status,
    })
    .from(nodes)
    .where(eq(nodes.status, "active"))
    .orderBy(asc(nodes.sortOrder), asc(nodes.name));
}

export async function getAllNodes(): Promise<NodeOption[]> {
  return db
    .select({
      id: nodes.id,
      parentId: nodes.parentId,
      name: nodes.name,
      slug: nodes.slug,
      level: nodes.level,
      postingMode: nodes.postingMode,
      status: nodes.status,
    })
    .from(nodes)
    .orderBy(asc(nodes.sortOrder), asc(nodes.name));
}

export async function getRootNodes() {
  return db
    .select()
    .from(nodes)
    .where(isNull(nodes.parentId))
    .orderBy(asc(nodes.sortOrder), asc(nodes.name));
}

export async function getNodeBySlug(slug: string) {
  const [node] = await db
    .select()
    .from(nodes)
    .where(and(eq(nodes.slug, slug), ne(nodes.status, "hidden")))
    .limit(1);

  return node ?? null;
}

export async function getLatestPosts(limit = 30): Promise<PostListItem[]> {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      replyCount: posts.replyCount,
      likeCount: posts.likeCount,
      lastReplyAt: posts.lastReplyAt,
      createdAt: posts.createdAt,
      nodeName: nodes.name,
      nodeSlug: nodes.slug,
      authorUsername: users.username,
      authorTrustLevel: users.trustLevel,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.lastReplyAt), desc(posts.createdAt))
    .limit(limit);
}

export async function getPostsForNode(nodeId: string, isRoot: boolean) {
  const condition = isRoot
    ? eq(posts.rootNodeId, nodeId)
    : eq(posts.nodeId, nodeId);

  return db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      replyCount: posts.replyCount,
      likeCount: posts.likeCount,
      lastReplyAt: posts.lastReplyAt,
      createdAt: posts.createdAt,
      nodeName: nodes.name,
      nodeSlug: nodes.slug,
      authorUsername: users.username,
      authorTrustLevel: users.trustLevel,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(condition, eq(posts.status, "published")))
    .orderBy(desc(posts.lastReplyAt), desc(posts.createdAt))
    .limit(50);
}

export async function getPostDetails(id: string) {
  const [post] = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      replyCount: posts.replyCount,
      likeCount: posts.likeCount,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      nodeId: posts.nodeId,
      nodeName: nodes.name,
      nodeSlug: nodes.slug,
      rootNodeId: posts.rootNodeId,
      authorUsername: users.username,
      authorTrustLevel: users.trustLevel,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.id, id), eq(posts.status, "published")))
    .limit(1);

  if (!post) {
    return null;
  }

  const postReplies = await db
    .select({
      id: replies.id,
      content: replies.content,
      status: replies.status,
      likeCount: replies.likeCount,
      createdAt: replies.createdAt,
      authorUsername: users.username,
      authorTrustLevel: users.trustLevel,
    })
    .from(replies)
    .innerJoin(users, eq(replies.authorId, users.id))
    .where(and(eq(replies.postId, id), eq(replies.status, "published")))
    .orderBy(asc(replies.createdAt));

  return { post, replies: postReplies };
}

export async function getUserProfile(username: string) {
  const [profile] = await db
    .select({
      id: users.id,
      username: users.username,
      bio: users.bio,
      trustLevel: users.trustLevel,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (!profile) {
    return null;
  }

  const userPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      replyCount: posts.replyCount,
      likeCount: posts.likeCount,
      lastReplyAt: posts.lastReplyAt,
      createdAt: posts.createdAt,
      nodeName: nodes.name,
      nodeSlug: nodes.slug,
      authorUsername: users.username,
      authorTrustLevel: users.trustLevel,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(and(eq(posts.authorId, profile.id), eq(posts.status, "published")))
    .orderBy(desc(posts.createdAt))
    .limit(20);

  return { profile, posts: userPosts };
}

export async function getCommunityStats() {
  const [userCount] = await db.select({ value: count() }).from(users);
  const [postCount] = await db.select({ value: count() }).from(posts);
  const [replyCount] = await db.select({ value: count() }).from(replies);
  const [nodeCount] = await db.select({ value: count() }).from(nodes);

  return {
    users: userCount?.value ?? 0,
    posts: postCount?.value ?? 0,
    replies: replyCount?.value ?? 0,
    nodes: nodeCount?.value ?? 0,
  };
}

export async function getAdminOverview() {
  const [hiddenPosts] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.status, "hidden"));
  const [hiddenReplies] = await db
    .select({ value: count() })
    .from(replies)
    .where(eq(replies.status, "hidden"));
  const [disabledUsers] = await db
    .select({ value: count() })
    .from(users)
    .where(eq(users.status, "disabled"));

  return {
    ...(await getCommunityStats()),
    hiddenPosts: hiddenPosts?.value ?? 0,
    hiddenReplies: hiddenReplies?.value ?? 0,
    disabledUsers: disabledUsers?.value ?? 0,
  };
}

export async function getAdminPosts() {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      replyCount: posts.replyCount,
      createdAt: posts.createdAt,
      nodeName: nodes.name,
      authorUsername: users.username,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
    .limit(100);
}

export async function getAdminReplies() {
  return db
    .select({
      id: replies.id,
      content: replies.content,
      status: replies.status,
      createdAt: replies.createdAt,
      postId: replies.postId,
      postTitle: posts.title,
      authorUsername: users.username,
    })
    .from(replies)
    .innerJoin(posts, eq(replies.postId, posts.id))
    .innerJoin(users, eq(replies.authorId, users.id))
    .orderBy(desc(replies.createdAt))
    .limit(100);
}

export async function getAdminUsers() {
  return db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      trustLevel: users.trustLevel,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);
}

export async function getSiteSettingsForAdmin() {
  const [settings] = await db.select().from(siteSettings).limit(1);

  return settings ?? null;
}

export async function getNodeChildren(parentId: string) {
  return db
    .select()
    .from(nodes)
    .where(eq(nodes.parentId, parentId))
    .orderBy(asc(nodes.sortOrder), asc(nodes.name));
}

export async function searchVisiblePosts(query: string) {
  const normalized = `%${query}%`;

  return db
    .select({
      id: posts.id,
      title: posts.title,
      status: posts.status,
      replyCount: posts.replyCount,
      likeCount: posts.likeCount,
      lastReplyAt: posts.lastReplyAt,
      createdAt: posts.createdAt,
      nodeName: nodes.name,
      nodeSlug: nodes.slug,
      authorUsername: users.username,
      authorTrustLevel: users.trustLevel,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(
      and(
        eq(posts.status, "published"),
        or(sql`${posts.title} ilike ${normalized}`, sql`${posts.content} ilike ${normalized}`),
      ),
    )
    .orderBy(desc(posts.lastReplyAt))
    .limit(30);
}
