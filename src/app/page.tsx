import Link from "next/link";
import { Activity, Network, Users } from "lucide-react";

import { NodeGrid } from "@/components/node-grid";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth";
import {
  getCommunityStats,
  getLatestPosts,
  getPopularPosts,
  getPublicNodes,
} from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireInstalled();

  const [settings, user, posts, popularPosts, nodes, stats] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getLatestPosts(),
    getPopularPosts(5),
    getPublicNodes(),
    getCommunityStats(),
  ]);

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-4 py-5 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">最新主题</h1>
              <p className="mt-1 text-sm text-muted">
                高效浏览社区最新讨论，先把内容流跑起来。
              </p>
            </div>
            {user ? (
              <Link href="/posts/new" className={buttonClassName({ variant: "primary" })}>
                发布主题
              </Link>
            ) : (
              <Link href="/login" className={buttonClassName({ variant: "secondary" })}>
                登录后发帖
              </Link>
            )}
          </div>
          <PostList posts={posts} emptyText="还没有主题，创建第一个节点后就可以发帖。" />
        </section>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <h2 className="font-semibold">{settings?.siteName ?? "NextBuf"}</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                {settings?.siteDescription ?? "轻量现代社区系统。"}
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <StatItem icon={Users} label="用户" value={stats.users} />
              <StatItem icon={Activity} label="主题" value={stats.posts} />
              <StatItem icon={Activity} label="回复" value={stats.replies} />
              <StatItem icon={Network} label="节点" value={stats.nodes} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <h2 className="font-semibold">节点</h2>
              <Link href="/nodes">
                <Badge tone="muted">全部</Badge>
              </Link>
            </CardHeader>
            <CardContent>
              <NodeGrid nodes={nodes.slice(0, 8)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <h2 className="font-semibold">热门</h2>
              <Link href="/popular">
                <Badge tone="muted">更多</Badge>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {popularPosts.length === 0 ? (
                <p className="text-sm text-muted">暂时没有热门主题。</p>
              ) : (
                popularPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block rounded-[var(--radius-control)] border border-border p-3 transition-colors duration-200 hover:border-primary/40"
                  >
                    <div className="line-clamp-2 text-sm font-medium">{post.title}</div>
                    <div className="mt-2 text-xs text-muted">
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

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3">
      <div className="flex items-center gap-2 text-xs text-muted">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
