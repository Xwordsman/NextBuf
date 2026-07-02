import Link from "next/link";

import { CommunityShell } from "@/components/community-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/server/actions/community";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getUserNotifications } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireInstalled();
  const viewer = await requireUser();
  const { status } = await searchParams;
  const activeStatus = status === "unread" || status === "read" ? status : "all";

  const [settings, user, notifications] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserNotifications(viewer.id),
  ]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;
  const visibleNotifications = notifications.filter((item) => {
    if (activeStatus === "unread") {
      return !item.readAt;
    }

    if (activeStatus === "read") {
      return Boolean(item.readAt);
    }

    return true;
  });
  const statusLinks = [
    { href: "/me/notifications", label: "全部", value: "all", count: notifications.length },
    {
      href: "/me/notifications?status=unread",
      label: "未读",
      value: "unread",
      count: unreadCount,
    },
    {
      href: "/me/notifications?status=read",
      label: "已读",
      value: "read",
      count: notifications.length - unreadCount,
    },
  ];

  return (
    <CommunityShell settings={settings} user={user}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">通知</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            回复和点赞会出现在这里，未读 {unreadCount} 条。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link href="/me/bookmarks">我的收藏</Link>
          </Button>
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="secondary">
              全部已读
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold">最近通知</h2>
          <div className="flex flex-wrap gap-2">
            {statusLinks.map((item) => (
              <Badge
                key={item.value}
                asChild
                variant={activeStatus === item.value ? "default" : "outline"}
              >
                <Link href={item.href}>
                  {item.label} {item.count}
                </Link>
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {visibleNotifications.length === 0 ? (
            <div className="rounded-[var(--radius-control)] border border-border p-6 text-center text-sm text-muted-foreground">
              暂时没有通知。
            </div>
          ) : (
            visibleNotifications.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3",
                  !item.readAt && "border-primary/20 bg-muted/40",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={item.readAt ? "secondary" : "default"}>
                      {item.readAt ? "已读" : "未读"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{item.message}</p>
                  {item.postId ? (
                    <Link
                      href={`/posts/${item.postId}`}
                      className="mt-2 inline-flex text-sm font-medium text-primary hover:text-primary/80"
                    >
                      查看相关主题
                    </Link>
                  ) : null}
                </div>
                {!item.readAt ? (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <Button type="submit" size="sm" variant="secondary">
                      标记已读
                    </Button>
                  </form>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </CommunityShell>
  );
}
