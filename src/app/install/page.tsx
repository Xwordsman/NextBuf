import { InstallForm } from "@/components/forms/install-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireNotInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function InstallPage() {
  await requireNotInstalled();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-[var(--radius-base)] bg-primary text-lg font-semibold text-primary-foreground">
            N
          </div>
          <h1 className="text-2xl font-semibold">安装 NextBuf</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            填写站点信息并创建第一个管理员账号。
          </p>
        </div>
        <Card>
          <CardHeader>
            <h2 className="font-semibold">站点初始化</h2>
          </CardHeader>
          <CardContent>
            <InstallForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
