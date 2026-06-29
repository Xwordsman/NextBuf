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
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await requireInstalled();
  const viewer = await requireUser();

  const [settings, user, notifications] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserNotifications(viewer.id),
  ]);

  const unreadCount = notifications.filter((item) => !item.readAt).length;

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
        <CardHeader>
          <h2 className="font-semibold">最近通知</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.length === 0 ? (
            <div className="rounded-[var(--radius-control)] border border-border p-6 text-center text-sm text-muted-foreground">
              暂时没有通知。
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
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
