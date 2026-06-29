import { MessageSquare, Reply, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommunityShell } from "@/components/community-shell";
import { ContentActions } from "@/components/content-actions";
import { ReplyForm } from "@/components/forms/reply-form";
import { MarkdownContent } from "@/components/markdown-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, getInitial } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth";
import { getPostDetails } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

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
  const canReply = Boolean(user);

  return (
    <CommunityShell settings={settings} user={user} activeNodeId={post.rootNodeId}>
      <Card className="mb-4 gap-0 py-0">
        <CardHeader className="border-b border-border py-4">
          <div className="flex items-start gap-3">
            <Link
              href={`/users/${post.authorUsername}`}
              aria-label={`${post.authorUsername} 的个人主页`}
              className="shrink-0 rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <Avatar className="size-11 rounded-md after:rounded-md sm:size-12">
                <AvatarImage
                  src={post.authorAvatarUrl ?? undefined}
                  alt={`${post.authorUsername} 的头像`}
                  className="rounded-md"
                />
                <AvatarFallback className="rounded-md">
                  {getInitial(post.authorUsername)}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge asChild variant="secondary" className="h-5 px-1.5 text-[11px]">
                  <Link href={`/nodes/${post.nodeSlug}`}>{post.nodeName}</Link>
                </Badge>
                <span className="text-xs text-muted-foreground">·</span>
                <Link
                  href={`/users/${post.authorUsername}`}
                  className="text-xs font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {post.authorUsername}
                </Link>
                <span className="text-xs text-muted-foreground">·</span>
                <time
                  dateTime={post.createdAt.toISOString()}
                  className="text-xs text-muted-foreground"
                >
                  {formatDateTime(post.createdAt)}
                </time>
              </div>

              <h1 className="mt-3 text-[22px] font-semibold leading-8 text-foreground sm:text-2xl">
                {post.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare size={14} />
                  {post.replyCount} 回复
                </span>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp size={14} />
                  {post.likeCount} 赞
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="py-5">
          <MarkdownContent content={post.content} />
          <Separator className="mt-6" />
          <ContentActions
            targetType="post"
            targetId={post.id}
            postId={post.id}
            likeCount={post.likeCount}
            viewerHasLiked={post.viewerHasLiked}
            viewerHasBookmarked={post.viewerHasBookmarked}
            canInteract={canReply}
            canReport={Boolean(user && user.id !== post.authorId)}
          />
        </CardContent>
      </Card>

      <Card className="mb-4 gap-0 py-0">
        <CardHeader className="border-b border-border py-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">回复 {replies.length}</h2>
            {canReply ? (
              <Button asChild size="sm" variant="secondary">
                <a href="#reply-form">
                  <Reply size={14} />
                  参与回复
                </a>
              </Button>
            ) : null}
          </div>
        </CardHeader>

        {replies.length > 0 ? (
          <div className="divide-y divide-border">
            {replies.map((reply, index) => {
              const floor = index + 1;
              const replyAnchor = `reply-${floor}`;

              return (
                <article
                  id={replyAnchor}
                  key={reply.id}
                  className="scroll-mt-20 bg-card px-3 py-4 sm:px-4"
                >
                  <div className="flex items-start gap-3">
                    <Link
                      href={`/users/${reply.authorUsername}`}
                      aria-label={`${reply.authorUsername} 的个人主页`}
                      className="shrink-0 rounded-md transition-opacity duration-200 hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      <Avatar className="size-9 rounded-md after:rounded-md">
                        <AvatarImage
                          src={reply.authorAvatarUrl ?? undefined}
                          alt={`${reply.authorUsername} 的头像`}
                          className="rounded-md"
                        />
                        <AvatarFallback className="rounded-md">
                          {getInitial(reply.authorUsername)}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                        <Link
                          href={`/users/${reply.authorUsername}`}
                          className="font-medium text-foreground transition-colors duration-200 hover:text-muted-foreground"
                        >
                          {reply.authorUsername}
                        </Link>
                        <span>·</span>
                        <time dateTime={reply.createdAt.toISOString()}>
                          {formatDateTime(reply.createdAt)}
                        </time>
                        <span>·</span>
                        <a
                          href={`#${replyAnchor}`}
                          className="font-medium transition-colors duration-200 hover:text-foreground"
                        >
                          #{floor}
                        </a>
                      </div>

                      <MarkdownContent
                        content={reply.content}
                        compact
                        className="mt-3"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <ContentActions
                          targetType="reply"
                          targetId={reply.id}
                          postId={post.id}
                          likeCount={reply.likeCount}
                          viewerHasLiked={reply.viewerHasLiked}
                          canInteract={canReply}
                          canReport={Boolean(user && user.id !== reply.authorId)}
                        />
                        {canReply ? (
                          <Button asChild size="xs" variant="ghost">
                            <a href="#reply-form">
                              <Reply size={13} />
                              回复此楼
                            </a>
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            还没有回复，来留下第一条回复。
          </CardContent>
        )}
      </Card>

      <Card id="reply-form" className="scroll-mt-20">
        <CardContent>
          {user ? (
            <ReplyForm postId={post.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="font-medium text-foreground underline">
                登录
              </Link>
              后可以参与回复。
            </p>
          )}
        </CardContent>
      </Card>
    </CommunityShell>
  );
}
