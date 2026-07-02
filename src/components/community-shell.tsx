import Link from "next/link";
import type { ReactNode } from "react";

import {
  communityContentClassName,
  communityMainClassName,
  communitySidebarClassName,
  communityTwoColumnClassName,
} from "@/components/community-layout";
import { HomeUserCard } from "@/components/home-user-card";
import { NodeNav } from "@/components/node-nav";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SiteSettings } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { CurrentUser } from "@/server/auth";
import {
  getPopularPosts,
  getRootNavigationNodes,
  getUserSidebarStats,
} from "@/server/queries";

type UserSidebarStats = Awaited<ReturnType<typeof getUserSidebarStats>>;

type CommunityShellProps = {
  settings: SiteSettings | null;
  user: CurrentUser | null;
  children: ReactNode;
  activeNodeId?: string | null;
  activeNodeSlug?: string | null;
  contentClassName?: string;
  hideNodeNav?: boolean;
};

export async function CommunityShell({
  settings,
  user,
  children,
  activeNodeId,
  activeNodeSlug,
  contentClassName,
  hideNodeNav = false,
}: CommunityShellProps) {
  const [rootNodes, popularPosts, userStats] = await Promise.all([
    getRootNavigationNodes(),
    getPopularPosts(5),
    user ? getUserSidebarStats(user.id) : Promise.resolve<UserSidebarStats | null>(null),
  ]);
  const resolvedActiveSlug =
    activeNodeSlug !== undefined
      ? activeNodeSlug
      : activeNodeId
        ? rootNodes.find((node) => node.id === activeNodeId)?.slug
        : undefined;

  return (
    <>
      <SiteHeader
        settings={settings}
        user={user}
        unreadNotificationCount={userStats?.notifications ?? 0}
      />
      <main className={communityMainClassName}>
        {!hideNodeNav ? (
          <NodeNav
            nodes={rootNodes}
            activeSlug={resolvedActiveSlug}
            className="mb-4 xl:fixed xl:left-[max(1rem,calc((100vw-72rem)/2-8.75rem))] xl:top-[5.25rem] xl:mb-0 xl:w-32"
          />
        ) : null}

        <div className={communityTwoColumnClassName}>
          <section className={cn(communityContentClassName, contentClassName)}>
            {children}
          </section>
          <CommunitySidebar
            settings={settings}
            user={user}
            stats={userStats}
            popularPosts={popularPosts}
          />
        </div>
      </main>
    </>
  );
}

function CommunitySidebar({
  settings,
  user,
  stats,
  popularPosts,
}: {
  settings: SiteSettings | null;
  user: CurrentUser | null;
  stats: UserSidebarStats | null;
  popularPosts: Awaited<ReturnType<typeof getPopularPosts>>;
}) {
  return (
    <aside className={communitySidebarClassName}>
      <HomeUserCard settings={settings} user={user} stats={stats} />

      <Card size="sm">
        <CardHeader>
          <CardTitle>热门</CardTitle>
          <CardAction>
            <Badge asChild variant="secondary">
              <Link href="/popular">更多</Link>
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {popularPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂时没有热门主题。</p>
          ) : (
            popularPosts.map((post) => (
              <Link
                key={post.id}
                href={`/posts/${post.id}`}
                className="block rounded-[var(--radius-control)] border border-border p-3 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/45"
              >
                <div className="line-clamp-2 text-sm font-medium">{post.title}</div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {post.likeCount} 赞 · {post.replyCount} 回复
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
