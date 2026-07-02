import { Search } from "lucide-react";

import { CommunityShell } from "@/components/community-shell";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCurrentUser } from "@/server/auth";
import { normalizePage, searchVisiblePostsPage } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await requireInstalled();

  const { q, page: pageParam } = await searchParams;
  const keyword = typeof q === "string" ? q.trim() : "";
  const page = normalizePage(pageParam);
  const [settings, user, postsPage] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    keyword.length >= 2
      ? searchVisiblePostsPage(keyword, page)
      : Promise.resolve({
          items: [],
          page: 1,
          pageSize: 30,
          total: 0,
          totalPages: 1,
        }),
  ]);

  return (
    <CommunityShell settings={settings} user={user} activeNodeSlug={null}>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">搜索</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查找标题和正文中的公开主题。
        </p>
      </div>

      <Card className="mb-4">
        <CardContent>
          <form action="/search" className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={17}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                name="q"
                defaultValue={keyword}
                placeholder="输入至少 2 个字符"
                className="pl-9"
              />
            </div>
            <Button type="submit">搜索</Button>
          </form>
        </CardContent>
      </Card>

      {keyword.length > 0 && keyword.length < 2 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          请输入至少 2 个字符。
        </Card>
      ) : (
        <PostList
          posts={postsPage.items}
          emptyText={keyword ? "没有找到匹配的主题。" : "输入关键词开始搜索。"}
        />
      )}
      {keyword.length >= 2 ? (
        <Pagination
          basePath="/search"
          page={postsPage.page}
          totalPages={postsPage.totalPages}
          query={{ q: keyword }}
        />
      ) : null}
    </CommunityShell>
  );
}
