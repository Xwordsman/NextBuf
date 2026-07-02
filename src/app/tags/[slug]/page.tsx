import { notFound } from "next/navigation";

import { CommunityShell } from "@/components/community-shell";
import { Pagination } from "@/components/pagination";
import { PostList } from "@/components/post-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import {
  getPostsForTagPage,
  getTagBySlug,
  normalizePage,
} from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await requireInstalled();

  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = normalizePage(pageParam);
  const [settings, user, tag] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getTagBySlug(slug),
  ]);

  if (!tag) {
    notFound();
  }

  const postsPage = await getPostsForTagPage(tag.id, page);

  return (
    <CommunityShell settings={settings} user={user}>
      <Card className="mb-4">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{tag.name}</h1>
                <Badge variant="outline">/{tag.slug}</Badge>
              </div>
              {tag.description ? (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tag.description}
                </p>
              ) : null}
            </div>
            <Badge variant="secondary">{postsPage.total} 主题</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <PostList
            posts={postsPage.items}
            emptyText="这个标签下还没有主题。"
            embedded
          />
        </CardContent>
      </Card>
      <Pagination
        basePath={`/tags/${tag.slug}`}
        page={postsPage.page}
        totalPages={postsPage.totalPages}
      />
    </CommunityShell>
  );
}
