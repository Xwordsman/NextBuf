import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateUserStatusAction } from "@/server/actions/admin";
import { getAdminUsers } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">用户管理</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{user.username}</span>
                <Badge
                  variant={user.status === "active" ? "outline" : "secondary"}
                  className={
                    user.status === "active"
                      ? "border-success/25 bg-success/10 text-success"
                      : undefined
                  }
                >
                  {user.status}
                </Badge>
                <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
                <Badge variant="secondary">L{user.trustLevel}</Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {user.email} · {formatDateTime(user.createdAt)}
              </p>
            </div>
            {user.role !== "admin" ? (
              <form action={updateUserStatusAction}>
                <input type="hidden" name="id" value={user.id} />
                <input
                  type="hidden"
                  name="status"
                  value={user.status === "active" ? "disabled" : "active"}
                />
                <button className="min-h-9 rounded-[var(--radius-control)] border border-border px-3 text-sm hover:bg-panel-muted">
                  {user.status === "active" ? "禁用" : "启用"}
                </button>
              </form>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
