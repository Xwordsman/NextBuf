import Link from "next/link";

import { CommunityShell } from "@/components/community-shell";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Button } from "@/components/ui/button";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getUserBookmarksPage, normalizePage } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function BookmarksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requireInstalled();
  const viewer = await requireUser();
  const { page: pageParam } = await searchParams;
  const page = normalizePage(pageParam);

  const [settings, user, postsPage] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserBookmarksPage(viewer.id, page),
  ]);

  return (
    <CommunityShell settings={settings} user={user}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">我的收藏</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            集中查看你收藏过的主题。
          </p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/me/notifications">查看通知</Link>
        </Button>
      </div>
      <PostList posts={postsPage.items} emptyText="你还没有收藏任何主题。" />
      <Pagination
        basePath="/me/bookmarks"
        page={postsPage.page}
        totalPages={postsPage.totalPages}
      />
    </CommunityShell>
  );
}
