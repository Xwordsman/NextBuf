import Link from "next/link";

import type { PostListItem } from "@/server/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatRelativeTime, getInitial } from "@/lib/utils";

type PostListProps = {
  posts: PostListItem[];
  emptyText?: string;
  embedded?: boolean;
};

export function PostList({
  posts,
  emptyText = "还没有帖子。",
  embedded = false,
}: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card
        className={
          embedded
            ? "rounded-none p-8 text-center text-sm text-muted-foreground ring-0"
            : "p-8 text-center text-sm text-muted-foreground"
        }
      >
        {emptyText}
      </Card>
    );
  }

  return (
    <div className={embedded ? "divide-y divide-border" : "space-y-2"}>
      {posts.map((post) => (
        <article
          key={post.id}
          className={
            embedded
              ? "bg-panel px-3 py-3 transition-colors duration-200 hover:bg-muted/45 sm:px-4"
              : "rounded-[var(--radius-base)] border border-border bg-panel p-4 transition-colors duration-200 hover:border-foreground/20"
          }
        >
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
              <Link
                href={`/posts/${post.id}`}
                className="block truncate text-[15px] font-medium leading-6 text-foreground transition-colors duration-200 hover:text-foreground/70 sm:text-base"
              >
                {post.title}
              </Link>

              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Link href={`/nodes/${post.nodeSlug}`} className="shrink-0">
                  <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                    {post.nodeName}
                  </Badge>
                </Link>
                <span className="text-xs text-muted-foreground">·</span>
                <Link
                  href={`/users/${post.authorUsername}`}
                  className="text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  {post.authorUsername}
                </Link>
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(post.lastReplyAt)}
                </span>
                {post.lastReplyUsername ? (
                  <>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">最后回复</span>
                    <Link
                      href={`/users/${post.lastReplyUsername}`}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground"
                    >
                      {post.lastReplyUsername}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>

            <Link
              href={`/posts/${post.id}`}
              aria-label={`${post.replyCount} 条回复`}
              className="mt-2 inline-flex min-w-9 shrink-0 justify-center rounded-[var(--radius-control)] bg-muted px-2 py-1 text-sm font-semibold leading-none text-muted-foreground transition-colors duration-200 hover:bg-secondary hover:text-foreground"
            >
              {post.replyCount}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
