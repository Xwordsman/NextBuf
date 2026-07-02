import { notFound } from "next/navigation";

import { CommunityShell } from "@/components/community-shell";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime, getInitial } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth";
import { getUserProfile, getUserProfilePostsPage, normalizePage } from "@/server/queries";
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
  const postsPage = await getUserProfilePostsPage(profile.id, page);

  return (
    <CommunityShell settings={settings} user={user}>
      <Card className="mb-4">
        <CardContent>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex gap-3">
              <Avatar size="lg">
                <AvatarImage
                  src={profile.avatarUrl ?? undefined}
                  alt={`${profile.username} 的头像`}
                />
                <AvatarFallback>{getInitial(profile.username)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold">{profile.username}</h1>
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
