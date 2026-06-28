import { FeedTabs } from "@/components/feed-tabs";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
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
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        <Card className="gap-0 py-0">
          <FeedTabs active="popular" />
          <PostList posts={posts} emptyText="暂时还没有热门主题。" embedded />
        </Card>
      </main>
    </>
  );
}
