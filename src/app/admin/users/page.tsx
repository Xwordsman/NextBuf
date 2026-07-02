import { Pagination } from "@/components/pagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { updateUserGovernanceAction } from "@/server/actions/admin";
import { getAdminUsersPage, normalizePage } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const usersPage = await getAdminUsersPage(normalizePage(pageParam));

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">用户管理</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {usersPage.items.map((user) => (
          <div
            key={user.id}
            className="space-y-3 rounded-[var(--radius-control)] border border-border p-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{user.username}</span>
                <Badge variant="outline">UID {user.uid}</Badge>
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
              {user.statusReason ? (
                <p className="mt-2 rounded-[var(--radius-control)] bg-panel-muted p-2 text-xs text-muted-foreground">
                  {user.statusReason}
                </p>
              ) : null}
            </div>
            <form action={updateUserGovernanceAction} className="grid gap-3 md:grid-cols-[120px_120px_120px_minmax(0,1fr)_auto] md:items-start">
              <input type="hidden" name="id" value={user.id} />
              <NativeSelect name="role" defaultValue={user.role} className="w-full">
                <NativeSelectOption value="member">成员</NativeSelectOption>
                <NativeSelectOption value="moderator">版主</NativeSelectOption>
                <NativeSelectOption value="admin">管理员</NativeSelectOption>
              </NativeSelect>
              <Input
                name="trustLevel"
                type="number"
                min={0}
                max={4}
                defaultValue={user.trustLevel}
              />
              <NativeSelect name="status" defaultValue={user.status} className="w-full">
                <NativeSelectOption value="active">正常</NativeSelectOption>
                <NativeSelectOption value="muted">禁言</NativeSelectOption>
                <NativeSelectOption value="disabled">禁用</NativeSelectOption>
              </NativeSelect>
              <Textarea
                name="statusReason"
                rows={2}
                defaultValue={user.statusReason ?? ""}
                placeholder="禁言或禁用原因"
              />
              <Button type="submit" size="sm">
                保存
              </Button>
            </form>
          </div>
        ))}
        <Pagination
          basePath="/admin/users"
          page={usersPage.page}
          totalPages={usersPage.totalPages}
        />
      </CardContent>
    </Card>
  );
}
