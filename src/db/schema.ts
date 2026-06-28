import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const createdAt = timestamp("created_at", { withTimezone: true })
  .notNull()
  .defaultNow();

const updatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow();

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    uid: serial("uid").notNull(),
    username: varchar("username", { length: 40 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    trustLevel: integer("trust_level").notNull().default(0),
    role: varchar("role", { length: 24 }).notNull().default("member"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("users_username_unique").on(table.username),
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_uid_unique").on(table.uid),
    index("users_status_idx").on(table.status),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt,
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const themes = pgTable(
  "themes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    version: varchar("version", { length: 40 }).notNull().default("0.1.0"),
    description: text("description"),
    author: varchar("author", { length: 80 }),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("themes_slug_unique").on(table.slug)],
);

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 32 }).primaryKey().default("site"),
  siteName: varchar("site_name", { length: 120 }).notNull(),
  siteUrl: text("site_url").notNull(),
  siteDescription: text("site_description"),
  activeThemeId: varchar("active_theme_id", { length: 80 })
    .notNull()
    .default("nextbuf-default"),
  allowRegistration: boolean("allow_registration").notNull().default(true),
  installedAt: timestamp("installed_at", { withTimezone: true }),
  createdAt,
  updatedAt,
});

export const nodes = pgTable(
  "nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id").references((): AnyPgColumn => nodes.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 80 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull(),
    description: text("description"),
    level: integer("level").notNull().default(1),
    postingMode: varchar("posting_mode", { length: 32 }).notNull().default("open"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdBy: uuid("created_by").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt,
    updatedAt,
  },
  (table) => [
    uniqueIndex("nodes_slug_unique").on(table.slug),
    index("nodes_parent_idx").on(table.parentId),
    index("nodes_status_idx").on(table.status),
    index("nodes_sort_idx").on(table.sortOrder),
  ],
);

export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nodeId: uuid("node_id")
      .notNull()
      .references(() => nodes.id, { onDelete: "restrict" }),
    rootNodeId: uuid("root_node_id")
      .notNull()
      .references(() => nodes.id, { onDelete: "restrict" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 160 }).notNull(),
    content: text("content").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("published"),
    replyCount: integer("reply_count").notNull().default(0),
    likeCount: integer("like_count").notNull().default(0),
    lastReplyAt: timestamp("last_reply_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastReplyUserId: uuid("last_reply_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("posts_root_last_reply_idx").on(table.rootNodeId, table.lastReplyAt),
    index("posts_node_last_reply_idx").on(table.nodeId, table.lastReplyAt),
    index("posts_author_created_idx").on(table.authorId, table.createdAt),
    index("posts_status_idx").on(table.status),
  ],
);

export const replies = pgTable(
  "replies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    content: text("content").notNull(),
    status: varchar("status", { length: 24 }).notNull().default("published"),
    likeCount: integer("like_count").notNull().default(0),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("replies_post_created_idx").on(table.postId, table.createdAt),
    index("replies_author_created_idx").on(table.authorId, table.createdAt),
    index("replies_status_idx").on(table.status),
  ],
);

export const postLikes = pgTable(
  "post_likes",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.userId] }),
    index("post_likes_user_idx").on(table.userId),
  ],
);

export const replyLikes = pgTable(
  "reply_likes",
  {
    replyId: uuid("reply_id")
      .notNull()
      .references(() => replies.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.replyId, table.userId] }),
    index("reply_likes_user_idx").on(table.userId),
  ],
);

export const postBookmarks = pgTable(
  "post_bookmarks",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt,
  },
  (table) => [
    primaryKey({ columns: [table.postId, table.userId] }),
    index("post_bookmarks_user_idx").on(table.userId),
  ],
);

export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetType: varchar("target_type", { length: 24 }).notNull(),
    targetId: uuid("target_id").notNull(),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    reason: varchar("reason", { length: 80 }).notNull(),
    detail: text("detail"),
    status: varchar("status", { length: 24 }).notNull().default("pending"),
    resolvedBy: uuid("resolved_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt,
    updatedAt,
  },
  (table) => [
    index("reports_status_created_idx").on(table.status, table.createdAt),
    index("reports_target_idx").on(table.targetType, table.targetId),
    index("reports_reporter_idx").on(table.reporterId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    type: varchar("type", { length: 40 }).notNull(),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    replyId: uuid("reply_id").references(() => replies.id, { onDelete: "cascade" }),
    message: text("message").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt,
  },
  (table) => [
    index("notifications_user_created_idx").on(table.userId, table.createdAt),
    index("notifications_user_read_idx").on(table.userId, table.readAt),
  ],
);

export const moderationLogs = pgTable(
  "moderation_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: uuid("actor_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 60 }).notNull(),
    targetType: varchar("target_type", { length: 24 }).notNull(),
    targetId: uuid("target_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt,
  },
  (table) => [
    index("moderation_logs_actor_idx").on(table.actorId),
    index("moderation_logs_target_idx").on(table.targetType, table.targetId),
    index("moderation_logs_created_idx").on(table.createdAt),
  ],
);

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 60 }).notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 24 }).notNull().default("active"),
    createdAt,
    updatedAt,
  },
  (table) => [uniqueIndex("tags_slug_unique").on(table.slug)],
);

export const postTags = pgTable(
  "post_tags",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.postId, table.tagId] })],
);

export const plugins = pgTable(
  "plugins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    version: varchar("version", { length: 40 }).notNull().default("0.1.0"),
    status: varchar("status", { length: 24 }).notNull().default("disabled"),
    source: varchar("source", { length: 40 }).notNull().default("builtin"),
    config: jsonb("config").$type<Record<string, unknown>>().notNull().default({}),
    installedAt: timestamp("installed_at", { withTimezone: true }),
    updatedAt,
  },
  (table) => [uniqueIndex("plugins_slug_unique").on(table.slug)],
);

export type User = typeof users.$inferSelect;
export type Node = typeof nodes.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Reply = typeof replies.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type Report = typeof reports.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
