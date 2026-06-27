import Link from "next/link";
import { notFound } from "next/navigation";

import { ReplyForm } from "@/components/forms/reply-form";
import { SiteHeader } from "@/components/site-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getPostDetails } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInstalled();

  const { id } = await params;
  const [settings, user, detail] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPostDetails(id),
  ]);

  if (!detail) {
    notFound();
  }

  const { post, replies } = detail;

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        <Card className="mb-4">
          <CardContent>
            <div className="flex gap-3">
              <Avatar name={post.authorUsername} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/nodes/${post.nodeSlug}`}>
                    <Badge tone="muted">{post.nodeName}</Badge>
                  </Link>
                  <span className="text-xs text-muted">
                    {post.authorUsername} · {formatDateTime(post.createdAt)}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold leading-8">{post.title}</h1>
                <div className="content-body mt-5 text-[15px] text-foreground">
                  {post.content}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">回复 {replies.length}</h2>
        </div>

        <div className="space-y-3">
          {replies.map((reply, index) => (
            <Card key={reply.id}>
              <CardContent>
                <div className="flex gap-3">
                  <Avatar name={reply.authorUsername} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="font-medium text-foreground">
                        {reply.authorUsername}
                      </span>
                      <span>#{index + 1}</span>
                      <span>{formatDateTime(reply.createdAt)}</span>
                    </div>
                    <div className="content-body mt-3 text-sm">{reply.content}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-4">
          <CardContent>
            {user ? (
              <ReplyForm postId={post.id} />
            ) : (
              <p className="text-sm text-muted">
                <Link href="/login" className="font-medium text-primary">
                  登录
                </Link>
                后可以参与回复。
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
