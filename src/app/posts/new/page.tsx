import { CommunityShell } from "@/components/community-shell";
import { PostForm } from "@/components/forms/post-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getPublicNodes, getPublicTags } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireInstalled();
  await requireUser();

  const [settings, user, nodes, tags] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPublicNodes(),
    getPublicTags(),
  ]);

  return (
    <CommunityShell settings={settings} user={user}>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">发布主题</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            支持 Markdown 写作、分屏预览和常用排版快捷操作。
          </p>
        </CardHeader>
        <CardContent>
          <PostForm nodes={nodes} tags={tags} />
        </CardContent>
      </Card>
    </CommunityShell>
  );
}
