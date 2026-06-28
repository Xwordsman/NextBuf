import Link from "next/link";
import { Activity, MessageSquare, Network, PenLine, Users } from "lucide-react";

import { NodeGrid } from "@/components/node-grid";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-4 py-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3">
          <Card size="sm">
            <CardHeader className="gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">社区首页</Badge>
                  <span className="text-xs text-muted-foreground">
                    {stats.posts} 主题 / {stats.replies} 回复
                  </span>
                </div>
                <CardTitle className="text-xl">最新主题</CardTitle>
                <CardDescription>
                  按最后回复时间浏览社区讨论，快速进入正在发生的内容。
                </CardDescription>
              </div>
              <CardAction>
                <Button asChild variant={user ? "default" : "secondary"} size="lg">
                  <Link href={user ? "/posts/new" : "/login"}>
                    <PenLine />
                    {user ? "发布主题" : "登录后发帖"}
                  </Link>
                </Button>
              </CardAction>
            </CardHeader>
          </Card>
          <PostList posts={posts} emptyText="还没有主题，创建第一个节点后就可以发帖。" />
        </section>

        <aside className="space-y-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>{settings?.siteName ?? "NextBuf"}</CardTitle>
              <CardDescription>
                {settings?.siteDescription ?? "轻量现代社区系统。"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <StatItem icon={Users} label="用户" value={stats.users} />
              <StatItem icon={MessageSquare} label="主题" value={stats.posts} />
              <StatItem icon={Activity} label="回复" value={stats.replies} />
              <StatItem icon={Network} label="节点" value={stats.nodes} />
            </CardContent>
          </Card>

          <Card size="sm">
            <CardHeader>
              <CardTitle>节点</CardTitle>
              <CardAction>
                <Badge asChild variant="secondary">
                  <Link href="/nodes">全部</Link>
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <NodeGrid nodes={nodes.slice(0, 8)} />
            </CardContent>
          </Card>

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
    <div className="rounded-lg border border-border bg-muted/60 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon size={14} />
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
