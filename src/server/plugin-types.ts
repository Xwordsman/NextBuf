export type PluginPermission =
  | "read:user"
  | "read:post"
  | "write:post"
  | "read:report"
  | "write:notification"
  | "write:admin_nav"
  | "access:settings";

export type PluginHook =
  | "user.registered"
  | "user.login"
  | "post.beforeCreate"
  | "post.afterCreate"
  | "post.beforePublish"
  | "post.afterPublish"
  | "reply.afterCreate"
  | "report.created"
  | "moderation.resolved"
  | "notification.beforeSend"
  | "search.indexPost"
  | "admin.navItems"
  | "settings.sections";

export type PluginManifest = {
  id: string;
  name: string;
  slug: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  minNextbufVersion?: string;
  permissions: PluginPermission[];
  hooks: PluginHook[];
  settingsSchema?: Record<string, unknown>;
  enabledByDefault?: boolean;
};
