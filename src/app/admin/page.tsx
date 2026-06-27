import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getAdminOverview } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const stats = await getAdminOverview();

  const items = [
    ["用户", stats.users],
    ["节点", stats.nodes],
    ["主题", stats.posts],
    ["回复", stats.replies],
    ["隐藏主题", stats.hiddenPosts],
    ["隐藏回复", stats.hiddenReplies],
    ["禁用用户", stats.disabledUsers],
  ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {items.map(([label, value]) => (
        <Card key={label}>
          <CardHeader>
            <p className="text-sm text-muted">{label}</p>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
