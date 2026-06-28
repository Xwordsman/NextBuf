import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentActions } from "@/components/content-actions";
import { ReplyForm } from "@/components/forms/reply-form";
import { SiteHeader } from "@/components/site-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getPostDetails } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";
import { formatDateTime, getInitial } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInstalled();

  const { id } = await params;
  const [settings, user] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
  ]);
  const detail = await getPostDetails(id, user?.id);

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
              <Avatar>
                <AvatarFallback>{getInitial(post.authorUsername)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/nodes/${post.nodeSlug}`}>
                    <Badge variant="secondary">{post.nodeName}</Badge>
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {post.authorUsername} · {formatDateTime(post.createdAt)}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold leading-8">{post.title}</h1>
                <div className="content-body mt-5 text-[15px] text-foreground">
                  {post.content}
                </div>
                <ContentActions
                  targetType="post"
                  targetId={post.id}
                  postId={post.id}
                  likeCount={post.likeCount}
                  viewerHasLiked={post.viewerHasLiked}
                  viewerHasBookmarked={post.viewerHasBookmarked}
                  canInteract={Boolean(user)}
                  canReport={Boolean(user && user.id !== post.authorId)}
                />
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
                  <Avatar size="sm">
                    <AvatarFallback>{getInitial(reply.authorUsername)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {reply.authorUsername}
                      </span>
                      <span>#{index + 1}</span>
                      <span>{formatDateTime(reply.createdAt)}</span>
                    </div>
                    <div className="content-body mt-3 text-sm">{reply.content}</div>
                    <ContentActions
                      targetType="reply"
                      targetId={reply.id}
                      postId={post.id}
                      likeCount={reply.likeCount}
                      viewerHasLiked={reply.viewerHasLiked}
                      canInteract={Boolean(user)}
                      canReport={Boolean(user && user.id !== reply.authorId)}
                    />
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
              <p className="text-sm text-muted-foreground">
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
