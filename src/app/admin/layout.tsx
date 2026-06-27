import Link from "next/link";

import { AdminNav } from "@/components/admin-nav";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser, requireAdmin } from "@/server/auth";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireInstalled();
  await requireAdmin();

  const [settings, user] = await Promise.all([getSiteSettings(), getCurrentUser()]);

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted">
              <Link href="/" className="hover:text-primary">
                返回前台
              </Link>
            </p>
            <h1 className="mt-1 text-2xl font-semibold">运营后台</h1>
          </div>
          <AdminNav />
        </div>
        {children}
      </main>
    </>
  );
}
