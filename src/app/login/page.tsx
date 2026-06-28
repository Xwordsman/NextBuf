import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/auth-forms";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser } from "@/server/auth";
import { requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await requireInstalled();

  if (await getCurrentUser()) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold">登录 NextBuf</h1>
          <p className="mt-1 text-sm text-muted-foreground">回到社区继续讨论。</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
