import Link from "next/link";

import {
  communityContentClassName,
  communityMainClassName,
  communitySidebarClassName,
  communityTwoColumnClassName,
} from "@/components/community-layout";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getUserBookmarks, getUserPosts, getUserReplies } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MePage() {
  await requireInstalled();
  const viewer = await requireUser();

  const [settings, user, posts, replies, bookmarks] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserPosts(viewer.id),
    getUserReplies(viewer.id),
    getUserBookmarks(viewer.id),
  ]);

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className={communityMainClassName}>
        <div className={communityTwoColumnClassName}>
          <section className={`${communityContentClassName} space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">我的空间</h1>
                <p className="mt-1 text-sm text-muted-foreground">查看你的主题、回复和收藏。</p>
              </div>
              <Button asChild variant="secondary">
                <Link href="/me/settings">编辑资料</Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <h2 className="font-semibold">我的主题</h2>
              </CardHeader>
              <CardContent>
                <PostList posts={posts} emptyText="你还没有发布主题。" />
              </CardContent>
            </Card>
          </section>

          <aside className={communitySidebarClassName}>
          <Card>
            <CardHeader>
              <h2 className="font-semibold">最近回复</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {replies.length === 0 ? (
                <p className="text-sm text-muted-foreground">你还没有回复。</p>
              ) : (
                replies.slice(0, 8).map((reply) => (
                  <Link
                    key={reply.id}
                    href={`/posts/${reply.postId}`}
                    className="block rounded-[var(--radius-control)] border border-border p-3 transition-colors duration-200 hover:border-primary/40"
                  >
                    <div className="line-clamp-2 text-sm">{reply.content}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="secondary">{reply.likeCount} 赞</Badge>
                      <span>{formatDateTime(reply.createdAt)}</span>
                    </div>
                    <div className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                      {reply.postTitle}
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <h2 className="font-semibold">收藏</h2>
              <Link href="/me/bookmarks">
                <Badge variant="secondary">全部</Badge>
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {bookmarks.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无收藏。</p>
              ) : (
                bookmarks.slice(0, 6).map((post) => (
                  <Link
                    key={post.id}
                    href={`/posts/${post.id}`}
                    className="block rounded-[var(--radius-control)] border border-border p-3 text-sm font-medium transition-colors duration-200 hover:border-primary/40"
                  >
                    {post.title}
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
          </aside>
        </div>
      </main>
    </>
  );
}
