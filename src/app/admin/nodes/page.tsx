import Link from "next/link";

import { NodeForm } from "@/components/forms/node-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Pagination } from "@/components/pagination";
import { updateNodeStatusAction } from "@/server/actions/admin";
import { getAllNodes, getAllNodesPage, normalizePage } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminNodesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = normalizePage(pageParam);
  const [allNodes, nodesPage] = await Promise.all([
    getAllNodes(),
    getAllNodesPage(page),
  ]);
  const roots = allNodes.filter((node) => !node.parentId);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold">创建节点</h2>
        </CardHeader>
        <CardContent>
          <NodeForm roots={roots} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">节点列表</h2>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodesPage.items.map((node) => (
            <div
              key={node.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">
                    {node.parentId ? "  " : ""}
                    {node.name}
                  </span>
                  <Badge
                    variant={node.status === "active" ? "outline" : "secondary"}
                    className={
                      node.status === "active"
                        ? "border-success/25 bg-success/10 text-success"
                        : undefined
                    }
                  >
                    {node.status}
                  </Badge>
                  <Badge variant="secondary">{node.postingMode}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  /{node.slug}
                  {node.description ? ` · ${node.description}` : ""}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/admin/nodes/${node.id}`}>编辑</Link>
                </Button>
                <form action={updateNodeStatusAction}>
                  <input type="hidden" name="id" value={node.id} />
                  <input
                    type="hidden"
                    name="status"
                    value={node.status === "active" ? "hidden" : "active"}
                  />
                  <Button type="submit" size="sm" variant="secondary">
                    {node.status === "active" ? "隐藏" : "启用"}
                  </Button>
                </form>
              </div>
            </div>
          ))}
          <Pagination
            basePath="/admin/nodes"
            page={nodesPage.page}
            totalPages={nodesPage.totalPages}
          />
        </CardContent>
      </Card>
    </div>
  );
}
