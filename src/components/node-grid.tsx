import Link from "next/link";

import type { NodeOption } from "@/server/queries";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type NodeGridProps = {
  nodes: NodeOption[];
};

export function NodeGrid({ nodes }: NodeGridProps) {
  const roots = nodes.filter((node) => !node.parentId);

  if (roots.length === 0) {
    return <Card className="p-8 text-center text-sm text-muted">还没有节点。</Card>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {roots.map((root) => {
        const children = nodes.filter((node) => node.parentId === root.id);

        return (
          <Card key={root.id}>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <Link href={`/nodes/${root.slug}`} className="font-semibold hover:text-primary">
                {root.name}
              </Link>
              <Badge tone={root.postingMode === "admin_only" ? "accent" : "muted"}>
                {root.postingMode === "admin_only" ? "官方" : "开放"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/nodes/${root.slug}`}
                  className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
                >
                  发到 {root.name}
                </Link>
                {children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/nodes/${child.slug}`}
                    className="rounded-[var(--radius-control)] border border-border px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
