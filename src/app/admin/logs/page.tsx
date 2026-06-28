import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminModerationLogs } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLogsPage() {
  const logs = await getAdminModerationLogs();

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">治理日志</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          记录管理员对用户、节点、主题、回复和举报的关键操作。
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {logs.length === 0 ? (
          <div className="rounded-[var(--radius-control)] border border-border p-6 text-center text-sm text-muted-foreground">
            暂时没有治理日志。
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{log.action}</Badge>
                  <Badge variant="secondary">{log.targetType}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {log.targetId.slice(0, 8)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {log.actorUsername ?? "系统"} · {formatDateTime(log.createdAt)}
                </p>
              </div>
              <pre className="max-w-full overflow-auto rounded-[var(--radius-control)] bg-panel-muted p-2 text-xs text-muted-foreground">
                {JSON.stringify(log.metadata)}
              </pre>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
