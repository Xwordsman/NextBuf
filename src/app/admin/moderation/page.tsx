import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import { handleModerationContentAction } from "@/server/actions/admin";
import { getPendingModerationContent } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage() {
  const pending = await getPendingModerationContent();
  const empty = pending.posts.length === 0 && pending.replies.length === 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="font-semibold">审核队列</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            来自“需要审核”节点的主题和回复会先进入这里，通过后才公开显示。
          </p>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="rounded-[var(--radius-control)] border border-border p-6 text-center text-sm text-muted-foreground">
              暂时没有待审核内容。
            </div>
          ) : null}
        </CardContent>
      </Card>

      {pending.posts.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">待审主题</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.posts.map((post) => (
              <div
                key={post.id}
                className="rounded-[var(--radius-control)] border border-border p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive">pending</Badge>
                      <Badge variant="secondary">{post.nodeName}</Badge>
                      <span className="font-medium">{post.title}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {post.authorUsername} · {formatDateTime(post.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {post.content}
                    </p>
                  </div>
                  <ModerationActions targetType="post" targetId={post.id} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      {pending.replies.length > 0 ? (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">待审回复</h3>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.replies.map((reply) => (
              <div
                key={reply.id}
                className="rounded-[var(--radius-control)] border border-border p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="destructive">pending</Badge>
                      <Link
                        href={`/posts/${reply.postId}`}
                        className="font-medium hover:text-primary"
                      >
                        {reply.postTitle}
                      </Link>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {reply.authorUsername} · {formatDateTime(reply.createdAt)}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {reply.content}
                    </p>
                  </div>
                  <ModerationActions targetType="reply" targetId={reply.id} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function ModerationActions({
  targetType,
  targetId,
}: {
  targetType: "post" | "reply";
  targetId: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <form action={handleModerationContentAction}>
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="resolution" value="approve" />
        <Button type="submit" size="sm">
          通过
        </Button>
      </form>
      <form action={handleModerationContentAction}>
        <input type="hidden" name="targetType" value={targetType} />
        <input type="hidden" name="targetId" value={targetId} />
        <input type="hidden" name="resolution" value="hide" />
        <Button type="submit" size="sm" variant="destructive">
          隐藏
        </Button>
      </form>
    </div>
  );
}
