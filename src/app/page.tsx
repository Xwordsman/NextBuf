import { CommunityShell } from "@/components/community-shell";
import { FeedTabs } from "@/components/feed-tabs";
import { PostList } from "@/components/post-list";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getLatestPosts } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireInstalled();

  const [settings, user, posts] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getLatestPosts(),
  ]);

  return (
    <CommunityShell settings={settings} user={user} activeNodeSlug={null}>
      <Card className="gap-0 py-0">
        <FeedTabs active="latest" />
        <PostList
          posts={posts}
          emptyText="还没有主题，创建第一个节点后就可以发布。"
          embedded
        />
      </Card>
    </CommunityShell>
  );
}
