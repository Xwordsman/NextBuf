import Link from "next/link";
import { notFound } from "next/navigation";

import { CommunityShell } from "@/components/community-shell";
import { ReplyEditForm } from "@/components/forms/reply-edit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getEditableReply } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function EditReplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInstalled();
  const viewer = await requireUser();
  const { id } = await params;

  const [settings, user, reply] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getEditableReply(id),
  ]);

  if (!reply || (reply.authorId !== viewer.id && viewer.role !== "admin")) {
    notFound();
  }

  return (
    <CommunityShell settings={settings} user={user} activeNodeId={reply.rootNodeId}>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">编辑回复</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              来自主题「{reply.postTitle}」。
            </p>
          </div>
          <Button asChild variant="secondary" size="sm">
            <Link href={`/posts/${reply.postId}`}>返回主题</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <ReplyEditForm reply={reply} />
        </CardContent>
      </Card>
    </CommunityShell>
  );
}
