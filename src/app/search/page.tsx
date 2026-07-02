import Link from "next/link";
import { Search } from "lucide-react";

import { CommunityShell } from "@/components/community-shell";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getCurrentUser } from "@/server/auth";
import {
  getPublicTags,
  normalizePage,
  searchVisiblePostsPage,
} from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; tag?: string }>;
}) {
  await requireInstalled();

  const { q, page: pageParam, tag } = await searchParams;
  const keyword = typeof q === "string" ? q.trim() : "";
  const tagSlug = typeof tag === "string" ? tag.trim() : "";
  const page = normalizePage(pageParam);
  const [settings, user, tags, postsPage] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPublicTags(),
    keyword.length >= 2 || tagSlug
      ? searchVisiblePostsPage(keyword, page, undefined, tagSlug || undefined)
      : Promise.resolve({
          items: [],
          page: 1,
          pageSize: 30,
          total: 0,
          totalPages: 1,
        }),
  ]);
  const selectedTag = tags.find((item) => item.slug === tagSlug);

  return (
    <CommunityShell settings={settings} user={user} activeNodeSlug={null}>
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">搜索</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查找公开主题，或按标签缩小范围。
        </p>
      </div>

      <Card className="mb-4">
        <CardContent>
          <form action="/search" className="grid gap-3 lg:grid-cols-[1fr_14rem_auto]">
            <div className="relative">
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
            <NativeSelect name="tag" defaultValue={tagSlug} className="w-full">
              <NativeSelectOption value="">全部标签</NativeSelectOption>
              {tags.map((item) => (
                <NativeSelectOption key={item.id} value={item.slug}>
                  {item.name}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button type="submit">搜索</Button>
          </form>

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 12).map((item) => (
                <Badge
                  key={item.id}
                  asChild
                  variant={item.slug === tagSlug ? "default" : "outline"}
                >
                  <Link href={`/search?tag=${item.slug}`}>{item.name}</Link>
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {keyword.length > 0 && keyword.length < 2 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          请输入至少 2 个字符，或直接选择一个标签。
        </Card>
      ) : (
        <PostList
          posts={postsPage.items}
          emptyText={
            keyword || selectedTag
              ? "没有找到匹配的主题。"
              : "输入关键词或选择标签开始搜索。"
          }
        />
      )}
      {keyword.length >= 2 || tagSlug ? (
        <Pagination
          basePath="/search"
          page={postsPage.page}
          totalPages={postsPage.totalPages}
          query={{ q: keyword, tag: tagSlug }}
        />
      ) : null}
    </CommunityShell>
  );
}
