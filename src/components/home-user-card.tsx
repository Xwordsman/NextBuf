import Link from "next/link";
import { Bell, Bookmark, MessageCircle, MessageSquare, PenLine } from "lucide-react";

import type { SiteSettings } from "@/db/schema";
import { cn, getInitial } from "@/lib/utils";
import type { CurrentUser } from "@/server/auth";
import type { getUserSidebarStats } from "@/server/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UserSidebarStats = Awaited<ReturnType<typeof getUserSidebarStats>>;

type HomeUserCardProps = {
  settings: SiteSettings | null;
  user: CurrentUser | null;
  stats: UserSidebarStats | null;
};

const guestDescription = "一个面向开发者、创作者与技术爱好者的开放社区";

export function HomeUserCard({ settings, user, stats }: HomeUserCardProps) {
  if (!user) {
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>{settings?.siteName ?? "NextBuf"}</CardTitle>
          <CardDescription className="leading-6">
            {settings?.siteDescription ?? guestDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Button
            asChild
            className={cn(!(settings?.allowRegistration ?? true) && "col-span-2")}
          >
            <Link href="/login">登录</Link>
          </Button>
          {settings?.allowRegistration ?? true ? (
            <Button asChild variant="secondary">
              <Link href="/register">注册</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const metricStats = stats ?? {
    posts: 0,
    replies: 0,
    bookmarks: 0,
    notifications: 0,
  };

  return (
    <Card size="sm">
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/users/${user.username}`}
            aria-label={`${user.username} 的个人主页`}
            className="shrink-0 rounded-full transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Avatar className="size-12">
              <AvatarImage
                src={user.avatarUrl ?? undefined}
                alt={`${user.username} 的头像`}
              />
              <AvatarFallback>{getInitial(user.username)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="min-w-0">
            <Link
              href={`/users/${user.username}`}
              className="block truncate font-semibold hover:text-foreground/70"
            >
              {user.username}
            </Link>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              UID {user.uid}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <ProfileMetric
            href="/me"
            icon={MessageSquare}
            label="主题"
            value={metricStats.posts}
          />
          <ProfileMetric
            href="/me"
            icon={MessageCircle}
            label="回复"
            value={metricStats.replies}
          />
          <ProfileMetric
            href="/me/bookmarks"
            icon={Bookmark}
            label="收藏"
            value={metricStats.bookmarks}
          />
          <ProfileMetric
            href="/me/notifications"
            icon={Bell}
            label="通知"
            value={metricStats.notifications}
          />
        </div>

        <Button asChild className="w-full">
          <Link href="/posts/new">
            <PenLine />
            发表主题
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileMetric({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: typeof MessageSquare;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="rounded-[var(--radius-control)] border border-border bg-muted/45 p-3 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div className="mt-2 text-xl font-semibold leading-none">{value}</div>
    </Link>
  );
}
