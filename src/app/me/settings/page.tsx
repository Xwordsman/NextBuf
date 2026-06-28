import Link from "next/link";
import { notFound } from "next/navigation";

import { ProfileForm } from "@/components/forms/profile-form";
import { SiteHeader } from "@/components/site-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUser, requireUser } from "@/server/auth";
import { getUserProfile } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function ProfileSettingsPage() {
  await requireInstalled();
  const viewer = await requireUser();

  const [settings, user, profileData] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getUserProfile(viewer.username),
  ]);

  if (!profileData) {
    notFound();
  }

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">资料设置</h1>
            <p className="mt-1 text-sm text-muted">维护你的公开头像和简介。</p>
          </div>
          <Link href="/me" className={buttonClassName({ variant: "secondary" })}>
            返回我的空间
          </Link>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">公开资料</h2>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profileData.profile} />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
