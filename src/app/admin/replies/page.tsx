import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updateReplyStatusAction } from "@/server/actions/admin";
import { getAdminReplies } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminRepliesPage() {
  const replies = await getAdminReplies();

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">回复管理</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/posts/${reply.postId}`} className="font-medium hover:text-primary">
                  {reply.postTitle}
                </Link>
                <Badge
                  variant={reply.status === "published" ? "outline" : "secondary"}
                  className={
                    reply.status === "published"
                      ? "border-success/25 bg-success/10 text-success"
                      : undefined
                  }
                >
                  {reply.status}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{reply.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {reply.authorUsername} · {formatDateTime(reply.createdAt)}
              </p>
            </div>
            <form action={updateReplyStatusAction}>
              <input type="hidden" name="id" value={reply.id} />
              <input
                type="hidden"
                name="status"
                value={reply.status === "published" ? "hidden" : "published"}
              />
              <button className="min-h-9 rounded-[var(--radius-control)] border border-border px-3 text-sm hover:bg-panel-muted">
                {reply.status === "published" ? "隐藏" : "恢复"}
              </button>
            </form>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
