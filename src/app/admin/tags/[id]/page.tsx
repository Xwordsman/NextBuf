import Link from "next/link";
import { notFound } from "next/navigation";

import { TagForm } from "@/components/forms/tag-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getTagForAdmin } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminTagEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tag = await getTagForAdmin(id);

  if (!tag) {
    notFound();
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">编辑标签</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            修改标签名称、slug、简介和状态。
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href="/admin/tags">返回标签列表</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <TagForm tag={tag} />
      </CardContent>
    </Card>
  );
}
