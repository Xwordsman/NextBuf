import { notFound } from "next/navigation";

import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getUserProfile } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  await requireInstalled();

  const { username } = await params;
  const [settings, user, profileData] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserProfile(username),
  ]);

  if (!profileData) {
    notFound();
  }

  const { profile, posts } = profileData;

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        <Card className="mb-4">
          <CardContent>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold">{profile.username}</h1>
                <p className="mt-2 text-sm text-muted">
                  加入于 {formatDateTime(profile.createdAt)}
                </p>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">
                  {profile.bio ?? "这个用户还没有填写简介。"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="muted">L{profile.trustLevel}</Badge>
                {profile.role === "admin" ? <Badge tone="accent">管理员</Badge> : null}
              </div>
            </div>
          </CardContent>
        </Card>
        <h2 className="mb-3 font-semibold">最近主题</h2>
        <PostList posts={posts} emptyText="这个用户还没有发布主题。" />
      </main>
    </>
  );
}
