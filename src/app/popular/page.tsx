import { CommunityShell } from "@/components/community-shell";
import { FeedTabs } from "@/components/feed-tabs";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getPopularPostsPage, normalizePage } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireInstalled();
  const { page: pageParam } = await searchParams;
  const page = normalizePage(pageParam);

  const [settings, user, postsPage] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPopularPostsPage(page),
  ]);

  return (
    <CommunityShell settings={settings} user={user} activeNodeSlug={null}>
      <Card className="gap-0 py-0">
        <FeedTabs active="popular" />
        <PostList posts={postsPage.items} emptyText="暂时还没有热门主题。" embedded />
      </Card>
      <Pagination
        basePath="/popular"
        page={postsPage.page}
        totalPages={postsPage.totalPages}
      />
    </CommunityShell>
  );
}
