import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { getAdminModerationLogDetails } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const log = await getAdminModerationLogDetails(id);

  if (!log) {
    notFound();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">治理日志详情</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {log.actorUsername ?? "系统"} · {formatDateTime(log.createdAt)}
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/logs">返回日志</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{log.action}</Badge>
          <Badge variant="secondary">{log.targetType}</Badge>
          <Badge variant="outline">{log.targetId}</Badge>
        </div>
        <pre className="max-h-[70vh] overflow-auto rounded-[var(--radius-base)] border border-border bg-panel-muted p-4 text-xs leading-6 text-foreground">
          {JSON.stringify(log.metadata, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
}
