import { Bookmark, Flag, ThumbsUp } from "lucide-react";

import { ReportForm } from "@/components/forms/report-form";
import { Button } from "@/components/ui/button";
import {
  toggleBookmarkAction,
  togglePostLikeAction,
  toggleReplyLikeAction,
} from "@/server/actions/community";

type ContentActionsProps = {
  targetType: "post" | "reply";
  targetId: string;
  postId: string;
  likeCount: number;
  viewerHasLiked: boolean;
  viewerHasBookmarked?: boolean;
  canInteract: boolean;
  canReport: boolean;
};

export function ContentActions({
  targetType,
  targetId,
  postId,
  likeCount,
  viewerHasLiked,
  viewerHasBookmarked = false,
  canInteract,
  canReport,
}: ContentActionsProps) {
  const likeAction =
    targetType === "post"
      ? togglePostLikeAction.bind(null, postId)
      : toggleReplyLikeAction.bind(null, targetId, postId);

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {canInteract ? (
        <form action={likeAction}>
          <Button
            type="submit"
            size="sm"
            variant={viewerHasLiked ? "primary" : "secondary"}
          >
            <ThumbsUp size={15} />
            {viewerHasLiked ? "已赞" : "点赞"} {likeCount}
          </Button>
        </form>
      ) : (
        <span className="inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-control)] border border-border px-3 text-xs text-muted">
          <ThumbsUp size={15} />
          点赞 {likeCount}
        </span>
      )}

      {targetType === "post" && canInteract ? (
        <form action={toggleBookmarkAction.bind(null, postId)}>
          <Button
            type="submit"
            size="sm"
            variant={viewerHasBookmarked ? "primary" : "secondary"}
          >
            <Bookmark size={15} />
            {viewerHasBookmarked ? "已收藏" : "收藏"}
          </Button>
        </form>
      ) : null}

      {canReport ? (
        <details className="group w-full sm:w-auto">
          <summary className="inline-flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-[var(--radius-control)] border border-border px-3 text-xs font-medium text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground">
            <Flag size={15} />
            举报
          </summary>
          <div className="mt-2 rounded-[var(--radius-control)] border border-border bg-panel p-3 sm:w-80">
            <ReportForm targetType={targetType} targetId={targetId} postId={postId} />
          </div>
        </details>
      ) : null}
    </div>
  );
}
