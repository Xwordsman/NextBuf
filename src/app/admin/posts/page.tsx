import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { updatePostStatusAction } from "@/server/actions/admin";
import { getAdminPosts } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await getAdminPosts();

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">帖子管理</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-control)] border border-border p-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/posts/${post.id}`} className="font-medium hover:text-primary">
                  {post.title}
                </Link>
                <Badge tone={post.status === "published" ? "success" : "muted"}>
                  {post.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted">
                {post.nodeName} · {post.authorUsername} · {formatDateTime(post.createdAt)}
              </p>
            </div>
            <form action={updatePostStatusAction}>
              <input type="hidden" name="id" value={post.id} />
              <input
                type="hidden"
                name="status"
                value={post.status === "published" ? "hidden" : "published"}
              />
              <button className="min-h-9 rounded-[var(--radius-control)] border border-border px-3 text-sm hover:bg-panel-muted">
                {post.status === "published" ? "隐藏" : "恢复"}
              </button>
            </form>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
