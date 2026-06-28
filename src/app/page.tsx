import Link from "next/link";

import { FeedTabs } from "@/components/feed-tabs";
import { HomeUserCard } from "@/components/home-user-card";
import { NodeNav } from "@/components/node-nav";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import {
  getLatestPosts,
  getPopularPosts,
  getRootNavigationNodes,
  getUserSidebarStats,
} from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireInstalled();

  const [settings, user, posts, popularPosts, rootNodes] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getLatestPosts(),
    getPopularPosts(5),
    getRootNavigationNodes(),
  ]);
  const userStats = user ? await getUserSidebarStats(user.id) : null;

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-5 lg:grid-cols-[160px_minmax(0,1fr)_320px]">
        <NodeNav nodes={rootNodes} activeSlug={null} />

        <section>
          <Card className="gap-0 py-0">
            <FeedTabs active="latest" />
            <PostList
              posts={posts}
              emptyText="还没有主题，创建第一个节点后就可以发帖。"
              embedded
            />
          </Card>
        </section>

        <aside className="space-y-4">
          <HomeUserCard settings={settings} user={user} stats={userStats} />

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
                    className="block rounded-lg border border-border p-3 transition-colors duration-200 hover:border-primary/40 hover:bg-accent/50"
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
      </main>
    </>
  );
}
