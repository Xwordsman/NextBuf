import { FeedTabs } from "@/components/feed-tabs";
import { NodeNav } from "@/components/node-nav";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getPopularPosts, getRootNavigationNodes } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function PopularPage() {
  await requireInstalled();

  const [settings, user, posts, rootNodes] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPopularPosts(),
    getRootNavigationNodes(),
  ]);

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto grid w-full max-w-5xl flex-1 gap-4 px-4 py-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <NodeNav nodes={rootNodes} />

        <section>
          <Card className="gap-0 py-0">
            <FeedTabs active="popular" />
            <PostList posts={posts} emptyText="暂时还没有热门主题。" embedded />
          </Card>
        </section>
      </main>
    </>
  );
}
