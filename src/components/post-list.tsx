import Link from "next/link";
import { MessageSquare, ThumbsUp } from "lucide-react";

import type { PostListItem } from "@/server/queries";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type PostListProps = {
  posts: PostListItem[];
  emptyText?: string;
};

export function PostList({ posts, emptyText = "还没有帖子。" }: PostListProps) {
  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-muted">
        {emptyText}
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <article
          key={post.id}
          className="rounded-[var(--radius-base)] border border-border bg-panel p-4 transition-colors duration-200 hover:border-primary/40"
        >
          <div className="flex gap-3">
            <Avatar name={post.authorUsername} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/nodes/${post.nodeSlug}`}
                  className="shrink-0"
                >
                  <Badge tone="muted">{post.nodeName}</Badge>
                </Link>
                <span className="text-xs text-muted">
                  {post.authorUsername} · {formatDateTime(post.lastReplyAt)}
                </span>
              </div>
              <Link
                href={`/posts/${post.id}`}
                className="mt-2 block text-base font-semibold leading-6 hover:text-primary"
              >
                {post.title}
              </Link>
            </div>
            <div className="flex min-w-20 flex-col items-end justify-center gap-1 text-sm text-muted sm:flex-row sm:items-center">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp size={16} />
                {post.likeCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare size={16} />
                {post.replyCount}
              </span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
