import { CommunityShell } from "@/components/community-shell";
import { FeedTabs } from "@/components/feed-tabs";
import { PostList } from "@/components/post-list";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getPopularPosts } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function PopularPage() {
  await requireInstalled();

  const [settings, user, posts] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPopularPosts(),
  ]);

  return (
    <CommunityShell settings={settings} user={user} activeNodeSlug={null}>
      <Card className="gap-0 py-0">
        <FeedTabs active="popular" />
        <PostList posts={posts} emptyText="暂时还没有热门主题。" embedded />
      </Card>
    </CommunityShell>
  );
}
