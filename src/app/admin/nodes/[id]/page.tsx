import Link from "next/link";
import { notFound } from "next/navigation";

import { NodeForm } from "@/components/forms/node-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAllNodes, getNodeForAdmin } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminNodeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [node, nodes] = await Promise.all([getNodeForAdmin(id), getAllNodes()]);

  if (!node) {
    notFound();
  }

  const roots = nodes.filter((item) => !item.parentId);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">编辑节点</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            修改节点名称、层级、发帖策略、状态和排序。
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/nodes">返回节点列表</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <NodeForm roots={roots} node={node} />
      </CardContent>
    </Card>
  );
}
