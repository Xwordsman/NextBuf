import Link from "next/link";
import { notFound } from "next/navigation";

import { CommunityShell } from "@/components/community-shell";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime, getInitial } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth";
import {
  getUserProfile,
  getUserProfilePostsPage,
  getUserProfileReplies,
  getUserProfileStats,
  normalizePage,
} from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await requireInstalled();

  const { username } = await params;
  const { page: pageParam } = await searchParams;
  const page = normalizePage(pageParam);
  const [settings, user, profileData] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserProfile(username),
  ]);

  if (!profileData) {
    notFound();
  }

  const { profile } = profileData;
  const [postsPage, stats, recentReplies] = await Promise.all([
    getUserProfilePostsPage(profile.id, page),
    getUserProfileStats(profile.id),
    getUserProfileReplies(profile.id),
  ]);
  const statItems = [
    { label: "主题", value: stats.posts },
    { label: "回复", value: stats.replies },
    { label: "收藏", value: stats.bookmarks },
    { label: "获赞", value: stats.likesReceived },
  ];

  return (
    <CommunityShell settings={settings} user={user}>
      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 gap-3">
              <Avatar size="lg">
                <AvatarImage
                  src={profile.avatarUrl ?? undefined}
                  alt={`${profile.username} 的头像`}
                />
                <AvatarFallback>{getInitial(profile.username)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h1 className="truncate text-2xl font-semibold">
                  {profile.username}
                </h1>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  UID {profile.uid}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  加入于 {formatDateTime(profile.createdAt)}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground">
                  {profile.bio ?? "这个用户还没有填写简介。"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">L{profile.trustLevel}</Badge>
              {profile.role === "admin" ? <Badge>管理员</Badge> : null}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {statItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[var(--radius-control)] border border-border bg-muted/30 px-3 py-2"
              >
                <div className="text-lg font-semibold leading-6">{item.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <h2 className="font-semibold">最近回复</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {recentReplies.length === 0 ? (
            <div className="rounded-[var(--radius-control)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              这个用户还没有公开回复。
            </div>
          ) : (
            recentReplies.map((reply) => (
              <Link
                key={reply.id}
                href={`/posts/${reply.postId}`}
                className="block rounded-[var(--radius-control)] border border-border p-3 transition-colors duration-200 hover:border-foreground/20 hover:bg-muted/45"
              >
                <div className="line-clamp-2 text-sm leading-6">{reply.content}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDateTime(reply.createdAt)}</span>
                  <span>·</span>
                  <span>{reply.likeCount} 赞</span>
                  <span>·</span>
                  <span className="line-clamp-1">{reply.postTitle}</span>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <h2 className="mb-3 font-semibold">最近主题</h2>
      <PostList posts={postsPage.items} emptyText="这个用户还没有发布主题。" />
      <Pagination
        basePath={`/users/${profile.username}`}
        page={postsPage.page}
        totalPages={postsPage.totalPages}
      />
    </CommunityShell>
  );
}
