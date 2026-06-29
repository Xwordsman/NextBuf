import { CommunityShell } from "@/components/community-shell";
import { PostForm } from "@/components/forms/post-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getPublicNodes } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  await requireInstalled();
  await requireUser();

  const [settings, user, nodes] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPublicNodes(),
  ]);

  return (
    <CommunityShell settings={settings} user={user}>
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">发布主题</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            第一阶段先保持简单，后续再补 Markdown 预览和附件上传。
          </p>
        </CardHeader>
        <CardContent>
          <PostForm nodes={nodes} />
        </CardContent>
      </Card>
    </CommunityShell>
  );
}
