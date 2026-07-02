import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/db";
import {
  moderationLogs,
  nodes,
  notifications,
  postBookmarks,
  postLikes,
  posts,
  replies,
  replyLikes,
  reports,
  siteSettings,
  users,
} from "@/db/schema";

const lastReplyUsers = alias(users, "last_reply_users");
export const PUBLIC_PAGE_SIZE = 30;
export const ADMIN_PAGE_SIZE = 20;

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export function normalizePage(value: string | number | undefined | null) {
  const page = Number(value);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function paginationMeta(total: number, page: number, pageSize: number) {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export type NodeOption = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  level: number;
  postingMode: string;
  status: string;
  sortOrder: number;
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
  authorAvatarUrl: string | null;
  authorTrustLevel: number;
  lastReplyUsername: string | null;
};

export type ReplyItem = {
  id: string;
  content: string;
  status: string;
  likeCount: number;
  createdAt: Date;
  editedAt: Date | null;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  authorTrustLevel: number;
  viewerHasLiked: boolean;
};

const postListSelection = {
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
  authorAvatarUrl: users.avatarUrl,
  authorTrustLevel: users.trustLevel,
  lastReplyUsername: lastReplyUsers.username,
};

export async function getPublicNodes(): Promise<NodeOption[]> {
  return db
    .select({
      id: nodes.id,
      parentId: nodes.parentId,
      name: nodes.name,
      slug: nodes.slug,
      description: nodes.description,
      level: nodes.level,
      postingMode: nodes.postingMode,
      status: nodes.status,
      sortOrder: nodes.sortOrder,
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
      description: nodes.description,
      level: nodes.level,
      postingMode: nodes.postingMode,
      status: nodes.status,
      sortOrder: nodes.sortOrder,
    })
    .from(nodes)
    .orderBy(asc(nodes.sortOrder), asc(nodes.name));
}

export async function getAllNodesPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
): Promise<PaginatedResult<NodeOption>> {
  const [total] = await db.select({ value: count() }).from(nodes);
  const items = await db
    .select({
      id: nodes.id,
      parentId: nodes.parentId,
      name: nodes.name,
      slug: nodes.slug,
      description: nodes.description,
      level: nodes.level,
      postingMode: nodes.postingMode,
      status: nodes.status,
      sortOrder: nodes.sortOrder,
    })
    .from(nodes)
    .orderBy(asc(nodes.sortOrder), asc(nodes.name))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getNodeForAdmin(id: string) {
  const [node] = await db
    .select()
    .from(nodes)
    .where(eq(nodes.id, id))
    .limit(1);

  return node ?? null;
}

export async function getRootNodes() {
  return db
    .select()
    .from(nodes)
    .where(isNull(nodes.parentId))
    .orderBy(asc(nodes.sortOrder), asc(nodes.name));
}

export async function getRootNavigationNodes(): Promise<NodeOption[]> {
  return db
    .select({
      id: nodes.id,
      parentId: nodes.parentId,
      name: nodes.name,
      slug: nodes.slug,
      description: nodes.description,
      level: nodes.level,
      postingMode: nodes.postingMode,
      status: nodes.status,
      sortOrder: nodes.sortOrder,
    })
    .from(nodes)
    .where(and(isNull(nodes.parentId), eq(nodes.status, "active")))
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
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.lastReplyAt), desc(posts.createdAt))
    .limit(limit);
}

export async function getLatestPostsPage(
  page = 1,
  pageSize = PUBLIC_PAGE_SIZE,
): Promise<PaginatedResult<PostListItem>> {
  const condition = eq(posts.status, "published");
  const [total] = await db.select({ value: count() }).from(posts).where(condition);
  const items = await db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(condition)
    .orderBy(desc(posts.lastReplyAt), desc(posts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getPopularPosts(limit = 30): Promise<PostListItem[]> {
  return db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(eq(posts.status, "published"))
    .orderBy(
      desc(sql<number>`${posts.likeCount} * 2 + ${posts.replyCount}`),
      desc(posts.lastReplyAt),
    )
    .limit(limit);
}

export async function getPopularPostsPage(
  page = 1,
  pageSize = PUBLIC_PAGE_SIZE,
): Promise<PaginatedResult<PostListItem>> {
  const condition = eq(posts.status, "published");
  const [total] = await db.select({ value: count() }).from(posts).where(condition);
  const items = await db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(condition)
    .orderBy(
      desc(sql<number>`${posts.likeCount} * 2 + ${posts.replyCount}`),
      desc(posts.lastReplyAt),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getPostsForNode(nodeId: string, isRoot: boolean) {
  const condition = isRoot
    ? eq(posts.rootNodeId, nodeId)
    : eq(posts.nodeId, nodeId);

  return db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(and(condition, eq(posts.status, "published")))
    .orderBy(desc(posts.lastReplyAt), desc(posts.createdAt))
    .limit(50);
}

export async function getPostsForNodePage(
  nodeId: string,
  isRoot: boolean,
  page = 1,
  pageSize = PUBLIC_PAGE_SIZE,
): Promise<PaginatedResult<PostListItem>> {
  const nodeCondition = isRoot
    ? eq(posts.rootNodeId, nodeId)
    : eq(posts.nodeId, nodeId);
  const condition = and(nodeCondition, eq(posts.status, "published"));
  const [total] = await db.select({ value: count() }).from(posts).where(condition);
  const items = await db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(condition)
    .orderBy(desc(posts.lastReplyAt), desc(posts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getPostDetails(id: string, viewerId?: string) {
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
      editedAt: posts.editedAt,
      authorId: posts.authorId,
      nodeId: posts.nodeId,
      nodeName: nodes.name,
      nodeSlug: nodes.slug,
      rootNodeId: posts.rootNodeId,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
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
      editedAt: replies.editedAt,
      authorId: replies.authorId,
      authorUsername: users.username,
      authorAvatarUrl: users.avatarUrl,
      authorTrustLevel: users.trustLevel,
    })
    .from(replies)
    .innerJoin(users, eq(replies.authorId, users.id))
    .where(and(eq(replies.postId, id), eq(replies.status, "published")))
    .orderBy(asc(replies.createdAt));

  if (!viewerId) {
    return {
      post: { ...post, viewerHasLiked: false, viewerHasBookmarked: false },
      replies: postReplies.map((reply) => ({ ...reply, viewerHasLiked: false })),
    };
  }

  const [postLike] = await db
    .select({ postId: postLikes.postId })
    .from(postLikes)
    .where(and(eq(postLikes.postId, id), eq(postLikes.userId, viewerId)))
    .limit(1);

  const [bookmark] = await db
    .select({ postId: postBookmarks.postId })
    .from(postBookmarks)
    .where(and(eq(postBookmarks.postId, id), eq(postBookmarks.userId, viewerId)))
    .limit(1);

  const replyIds = postReplies.map((reply) => reply.id);
  const likedReplies =
    replyIds.length > 0
      ? await db
          .select({ replyId: replyLikes.replyId })
          .from(replyLikes)
          .where(
            and(
              eq(replyLikes.userId, viewerId),
              inArray(replyLikes.replyId, replyIds),
            ),
          )
      : [];
  const likedReplyIds = new Set(likedReplies.map((reply) => reply.replyId));

  return {
    post: {
      ...post,
      viewerHasLiked: Boolean(postLike),
      viewerHasBookmarked: Boolean(bookmark),
    },
    replies: postReplies.map((reply) => ({
      ...reply,
      viewerHasLiked: likedReplyIds.has(reply.id),
    })),
  };
}

export async function getEditablePost(id: string) {
  const [post] = await db
    .select({
      id: posts.id,
      nodeId: posts.nodeId,
      rootNodeId: posts.rootNodeId,
      authorId: posts.authorId,
      title: posts.title,
      content: posts.content,
      status: posts.status,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
      editedAt: posts.editedAt,
    })
    .from(posts)
    .where(and(eq(posts.id, id), ne(posts.status, "deleted")))
    .limit(1);

  return post ?? null;
}

export async function getEditableReply(id: string) {
  const [reply] = await db
    .select({
      id: replies.id,
      postId: replies.postId,
      postTitle: posts.title,
      rootNodeId: posts.rootNodeId,
      authorId: replies.authorId,
      content: replies.content,
      status: replies.status,
      createdAt: replies.createdAt,
      updatedAt: replies.updatedAt,
      editedAt: replies.editedAt,
    })
    .from(replies)
    .innerJoin(posts, eq(replies.postId, posts.id))
    .where(and(eq(replies.id, id), ne(replies.status, "deleted")))
    .limit(1);

  return reply ?? null;
}

export async function getUserProfile(username: string) {
  const [profile] = await db
    .select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      avatarUrl: users.avatarUrl,
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

  return { profile };
}

export async function getUserProfilePostsPage(
  userId: string,
  page = 1,
  pageSize = PUBLIC_PAGE_SIZE,
): Promise<PaginatedResult<PostListItem>> {
  const condition = and(eq(posts.authorId, userId), eq(posts.status, "published"));
  const [total] = await db.select({ value: count() }).from(posts).where(condition);
  const items = await db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(condition)
    .orderBy(desc(posts.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
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

export async function getUserSidebarStats(userId: string) {
  const [postCount] = await db
    .select({ value: count() })
    .from(posts)
    .where(and(eq(posts.authorId, userId), eq(posts.status, "published")));
  const [replyCount] = await db
    .select({ value: count() })
    .from(replies)
    .where(and(eq(replies.authorId, userId), eq(replies.status, "published")));
  const [bookmarkCount] = await db
    .select({ value: count() })
    .from(postBookmarks)
    .where(eq(postBookmarks.userId, userId));
  const [notificationCount] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return {
    posts: postCount?.value ?? 0,
    replies: replyCount?.value ?? 0,
    bookmarks: bookmarkCount?.value ?? 0,
    notifications: notificationCount?.value ?? 0,
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
  const [pendingReports] = await db
    .select({ value: count() })
    .from(reports)
    .where(eq(reports.status, "pending"));
  const [pendingPosts] = await db
    .select({ value: count() })
    .from(posts)
    .where(eq(posts.status, "pending"));
  const [pendingReplies] = await db
    .select({ value: count() })
    .from(replies)
    .where(eq(replies.status, "pending"));
  const [unreadNotifications] = await db
    .select({ value: count() })
    .from(notifications)
    .where(isNull(notifications.readAt));

  return {
    ...(await getCommunityStats()),
    hiddenPosts: hiddenPosts?.value ?? 0,
    hiddenReplies: hiddenReplies?.value ?? 0,
    disabledUsers: disabledUsers?.value ?? 0,
    pendingReports: pendingReports?.value ?? 0,
    pendingContent: (pendingPosts?.value ?? 0) + (pendingReplies?.value ?? 0),
    unreadNotifications: unreadNotifications?.value ?? 0,
  };
}

export async function getPendingModerationContent() {
  const pendingPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      createdAt: posts.createdAt,
      nodeName: nodes.name,
      authorUsername: users.username,
    })
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.status, "pending"))
    .orderBy(asc(posts.createdAt))
    .limit(50);

  const pendingReplies = await db
    .select({
      id: replies.id,
      content: replies.content,
      createdAt: replies.createdAt,
      postId: replies.postId,
      postTitle: posts.title,
      authorUsername: users.username,
    })
    .from(replies)
    .innerJoin(posts, eq(replies.postId, posts.id))
    .innerJoin(users, eq(replies.authorId, users.id))
    .where(eq(replies.status, "pending"))
    .orderBy(asc(replies.createdAt))
    .limit(50);

  return { posts: pendingPosts, replies: pendingReplies };
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

export async function getAdminPostsPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
) {
  const [total] = await db.select({ value: count() }).from(posts);
  const items = await db
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
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
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

export async function getAdminRepliesPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
) {
  const [total] = await db.select({ value: count() }).from(replies);
  const items = await db
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
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getAdminUsers() {
  return db
    .select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      email: users.email,
      role: users.role,
      trustLevel: users.trustLevel,
      status: users.status,
      statusReason: users.statusReason,
      statusUntil: users.statusUntil,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);
}

export async function getAdminUsersPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
) {
  const [total] = await db.select({ value: count() }).from(users);
  const items = await db
    .select({
      id: users.id,
      uid: users.uid,
      username: users.username,
      email: users.email,
      role: users.role,
      trustLevel: users.trustLevel,
      status: users.status,
      statusReason: users.statusReason,
      statusUntil: users.statusUntil,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getAdminReports() {
  return db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      postId: reports.postId,
      reason: reports.reason,
      detail: reports.detail,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterUsername: users.username,
      postTitle: posts.title,
      replyContent: replies.content,
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .leftJoin(posts, eq(reports.postId, posts.id))
    .leftJoin(
      replies,
      and(eq(reports.targetType, "reply"), eq(reports.targetId, replies.id)),
    )
    .orderBy(
      desc(sql<number>`case when ${reports.status} = 'pending' then 1 else 0 end`),
      desc(reports.createdAt),
    )
    .limit(100);
}

export async function getAdminReportsPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
) {
  const [total] = await db.select({ value: count() }).from(reports);
  const items = await db
    .select({
      id: reports.id,
      targetType: reports.targetType,
      targetId: reports.targetId,
      postId: reports.postId,
      reason: reports.reason,
      detail: reports.detail,
      status: reports.status,
      createdAt: reports.createdAt,
      reporterUsername: users.username,
      postTitle: posts.title,
      replyContent: replies.content,
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .leftJoin(posts, eq(reports.postId, posts.id))
    .leftJoin(
      replies,
      and(eq(reports.targetType, "reply"), eq(reports.targetId, replies.id)),
    )
    .orderBy(
      desc(sql<number>`case when ${reports.status} = 'pending' then 1 else 0 end`),
      desc(reports.createdAt),
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getAdminModerationLogs() {
  return db
    .select({
      id: moderationLogs.id,
      action: moderationLogs.action,
      targetType: moderationLogs.targetType,
      targetId: moderationLogs.targetId,
      metadata: moderationLogs.metadata,
      createdAt: moderationLogs.createdAt,
      actorUsername: users.username,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.actorId, users.id))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(100);
}

export async function getAdminModerationLogsPage(
  page = 1,
  pageSize = ADMIN_PAGE_SIZE,
) {
  const [total] = await db.select({ value: count() }).from(moderationLogs);
  const items = await db
    .select({
      id: moderationLogs.id,
      action: moderationLogs.action,
      targetType: moderationLogs.targetType,
      targetId: moderationLogs.targetId,
      metadata: moderationLogs.metadata,
      createdAt: moderationLogs.createdAt,
      actorUsername: users.username,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.actorId, users.id))
    .orderBy(desc(moderationLogs.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getAdminModerationLogDetails(id: string) {
  const [log] = await db
    .select({
      id: moderationLogs.id,
      action: moderationLogs.action,
      targetType: moderationLogs.targetType,
      targetId: moderationLogs.targetId,
      metadata: moderationLogs.metadata,
      createdAt: moderationLogs.createdAt,
      actorUsername: users.username,
    })
    .from(moderationLogs)
    .leftJoin(users, eq(moderationLogs.actorId, users.id))
    .where(eq(moderationLogs.id, id))
    .limit(1);

  return log ?? null;
}

export async function getUserBookmarks(userId: string): Promise<PostListItem[]> {
  return db
    .select(postListSelection)
    .from(postBookmarks)
    .innerJoin(posts, eq(postBookmarks.postId, posts.id))
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(and(eq(postBookmarks.userId, userId), eq(posts.status, "published")))
    .orderBy(desc(postBookmarks.createdAt))
    .limit(50);
}

export async function getUserBookmarksPage(
  userId: string,
  page = 1,
  pageSize = PUBLIC_PAGE_SIZE,
): Promise<PaginatedResult<PostListItem>> {
  const condition = and(eq(postBookmarks.userId, userId), eq(posts.status, "published"));
  const [total] = await db
    .select({ value: count() })
    .from(postBookmarks)
    .innerJoin(posts, eq(postBookmarks.postId, posts.id))
    .where(condition);
  const items = await db
    .select(postListSelection)
    .from(postBookmarks)
    .innerJoin(posts, eq(postBookmarks.postId, posts.id))
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(condition)
    .orderBy(desc(postBookmarks.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}

export async function getUserPosts(userId: string): Promise<PostListItem[]> {
  return db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(and(eq(posts.authorId, userId), eq(posts.status, "published")))
    .orderBy(desc(posts.createdAt))
    .limit(30);
}

export async function getUserReplies(userId: string) {
  return db
    .select({
      id: replies.id,
      content: replies.content,
      likeCount: replies.likeCount,
      createdAt: replies.createdAt,
      postId: replies.postId,
      postTitle: posts.title,
    })
    .from(replies)
    .innerJoin(posts, eq(replies.postId, posts.id))
    .where(and(eq(replies.authorId, userId), eq(replies.status, "published")))
    .orderBy(desc(replies.createdAt))
    .limit(30);
}

export async function getUserNotifications(userId: string) {
  const actor = users;

  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      message: notifications.message,
      postId: notifications.postId,
      replyId: notifications.replyId,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
      actorUsername: actor.username,
    })
    .from(notifications)
    .leftJoin(actor, eq(notifications.actorId, actor.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function getUnreadNotificationCount(userId: string) {
  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));

  return result?.value ?? 0;
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
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(
      and(
        eq(posts.status, "published"),
        or(sql`${posts.title} ilike ${normalized}`, sql`${posts.content} ilike ${normalized}`),
      ),
    )
    .orderBy(desc(posts.lastReplyAt))
    .limit(30);
}

export async function searchVisiblePostsPage(
  query: string,
  page = 1,
  pageSize = PUBLIC_PAGE_SIZE,
): Promise<PaginatedResult<PostListItem>> {
  const normalized = `%${query}%`;
  const condition = and(
    eq(posts.status, "published"),
    or(sql`${posts.title} ilike ${normalized}`, sql`${posts.content} ilike ${normalized}`),
  );
  const [total] = await db.select({ value: count() }).from(posts).where(condition);
  const items = await db
    .select(postListSelection)
    .from(posts)
    .innerJoin(nodes, eq(posts.nodeId, nodes.id))
    .innerJoin(users, eq(posts.authorId, users.id))
    .leftJoin(lastReplyUsers, eq(posts.lastReplyUserId, lastReplyUsers.id))
    .where(condition)
    .orderBy(desc(posts.lastReplyAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return { items, ...paginationMeta(total?.value ?? 0, page, pageSize) };
}
