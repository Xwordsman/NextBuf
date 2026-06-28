import { NodeForm } from "@/components/forms/node-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateNodeStatusAction } from "@/server/actions/admin";
import { getAllNodes } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminNodesPage() {
  const nodes = await getAllNodes();
  const roots = nodes.filter((node) => !node.parentId);

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
          {nodes.map((node) => (
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
                <p className="mt-1 text-xs text-muted-foreground">/{node.slug}</p>
              </div>
              <form action={updateNodeStatusAction}>
                <input type="hidden" name="id" value={node.id} />
                <input
                  type="hidden"
                  name="status"
                  value={node.status === "active" ? "hidden" : "active"}
                />
                <button className="min-h-9 rounded-[var(--radius-control)] border border-border px-3 text-sm hover:bg-panel-muted">
                  {node.status === "active" ? "隐藏" : "启用"}
                </button>
              </form>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
