import Link from "next/link";

import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { buttonClassName } from "@/components/ui/button";
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
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">热门主题</h1>
            <p className="mt-1 text-sm text-muted">
              按点赞和回复综合排序，快速看到正在升温的讨论。
            </p>
          </div>
          <Link href="/" className={buttonClassName({ variant: "secondary" })}>
            返回最新
          </Link>
        </div>
        <PostList posts={posts} emptyText="暂时还没有热门主题。" />
      </main>
    </>
  );
}
