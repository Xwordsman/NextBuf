import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminOverview } from "@/server/queries";
import { getRuntimeInfo } from "@/server/runtime";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminOverview();
  const runtime = getRuntimeInfo();

  const items = [
    ["用户", stats.users],
    ["节点", stats.nodes],
    ["主题", stats.posts],
    ["回复", stats.replies],
    ["隐藏主题", stats.hiddenPosts],
    ["隐藏回复", stats.hiddenReplies],
    ["禁用用户", stats.disabledUsers],
    ["待处理举报", stats.pendingReports],
    ["未读通知", stats.unreadNotifications],
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {items.map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <p className="text-sm text-muted-foreground">{label}</p>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">运行信息</h2>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <RuntimeItem label="版本" value={runtime.version} />
          <RuntimeItem label="部署标识" value={runtime.deploymentVersion} />
          <RuntimeItem label="提交" value={runtime.commit ?? "local"} />
          <RuntimeItem label="构建时间" value={runtime.buildTime ?? "unknown"} />
        </CardContent>
      </Card>
    </div>
  );
}

function RuntimeItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-all font-mono text-sm">{value}</p>
    </div>
  );
}
