import { notFound } from "next/navigation";

import { NodeNav } from "@/components/node-nav";
import { PostList } from "@/components/post-list";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import {
  getNodeBySlug,
  getNodeChildren,
  getPostsForNode,
  getRootNavigationNodes,
} from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function NodeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireInstalled();

  const { slug } = await params;
  const node = await getNodeBySlug(slug);

  if (!node) {
    notFound();
  }

  const [settings, user, children, posts, rootNodes] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getNodeChildren(node.id),
    getPostsForNode(node.id, !node.parentId),
    getRootNavigationNodes(),
  ]);
  const activeRootSlug = node.parentId
    ? rootNodes.find((root) => root.id === node.parentId)?.slug
    : node.slug;

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-4 px-4 py-5 lg:grid-cols-[160px_minmax(0,1fr)]">
        <NodeNav nodes={rootNodes} activeSlug={activeRootSlug} />

        <section>
          <Card className="mb-4">
            <CardContent>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <Badge variant={node.parentId ? "secondary" : "default"}>
                      {node.parentId ? "二级节点" : "一级节点"}
                    </Badge>
                    <Badge variant={node.postingMode === "admin_only" ? "default" : "secondary"}>
                      {node.postingMode === "admin_only" ? "仅管理员发帖" : "开放发帖"}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-semibold">{node.name}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                    {node.description ?? "这个节点还没有简介。"}
                  </p>
                </div>
              </div>
              {children.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                  {children.map((child) => (
                    <a
                      key={child.id}
                      href={`/nodes/${child.slug}`}
                      className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
                    >
                      {child.name}
                    </a>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
          <PostList posts={posts} emptyText="这个节点还没有主题。" />
        </section>
      </main>
    </>
  );
}
