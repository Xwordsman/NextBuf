import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/forms/auth-forms";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await requireInstalled();

  if (await getCurrentUser()) {
    redirect("/");
  }

  const settings = await getSiteSettings();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold">注册账号</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {settings?.allowRegistration ? "创建账号后即可发帖回复。" : "当前站点暂未开放注册。"}
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </main>
  );
}
