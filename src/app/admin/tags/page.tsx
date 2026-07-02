import Link from "next/link";

import { TagForm } from "@/components/forms/tag-form";
import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateTagStatusAction } from "@/server/actions/admin";
import { getAllTagsPage, normalizePage } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = normalizePage(pageParam);
  const tagsPage = await getAllTagsPage(page);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold">创建标签</h2>
        </CardHeader>
        <CardContent>
          <TagForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">标签列表</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {tagsPage.items.length === 0 ? (
            <div className="rounded-[var(--radius-control)] border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              暂无标签。
            </div>
          ) : (
            tagsPage.items.map((tag) => (
              <div
                key={tag.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{tag.name}</span>
                    <Badge
                      variant={tag.status === "active" ? "outline" : "secondary"}
                      className={
                        tag.status === "active"
                          ? "border-success/25 bg-success/10 text-success"
                          : undefined
                      }
                    >
                      {tag.status}
                    </Badge>
                    <Badge variant="secondary">{tag.postCount} 主题</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    /{tag.slug}
                    {tag.description ? ` · ${tag.description}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tag.status === "active" ? (
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/tags/${tag.slug}`}>查看</Link>
                    </Button>
                  ) : null}
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/admin/tags/${tag.id}`}>编辑</Link>
                  </Button>
                  <form action={updateTagStatusAction}>
                    <input type="hidden" name="id" value={tag.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={tag.status === "active" ? "hidden" : "active"}
                    />
                    <Button type="submit" size="sm" variant="secondary">
                      {tag.status === "active" ? "隐藏" : "启用"}
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
          <Pagination
            basePath="/admin/tags"
            page={tagsPage.page}
            totalPages={tagsPage.totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
