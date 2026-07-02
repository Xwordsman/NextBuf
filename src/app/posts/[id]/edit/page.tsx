import Link from "next/link";
import { notFound } from "next/navigation";

import { CommunityShell } from "@/components/community-shell";
import { PostEditForm } from "@/components/forms/post-edit-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getEditablePost, getPublicNodes } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireInstalled();
  const viewer = await requireUser();
  const { id } = await params;

  const [settings, user, post, nodes] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getEditablePost(id),
    getPublicNodes(),
  ]);

  if (!post || (post.authorId !== viewer.id && viewer.role !== "admin")) {
    notFound();
  }

  return (
    <CommunityShell settings={settings} user={user} activeNodeId={post.rootNodeId}>
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">编辑主题</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              保存后会更新主题内容和编辑时间。
            </p>
          </div>
          {post.status === "published" ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/posts/${post.id}`}>返回主题</Link>
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <PostEditForm post={post} nodes={nodes} />
        </CardContent>
      </Card>
    </CommunityShell>
  );
}
