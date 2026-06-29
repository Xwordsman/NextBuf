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
      <main className="mx-auto grid w-full max-w-7xl flex-1 gap-4 px-4 py-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="min-w-0 md:sticky md:top-20 md:self-start">
          <div className="rounded-[var(--radius-base)] border border-border bg-panel p-2">
            <div className="mb-2 hidden px-2 py-2 md:block">
              <p className="text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground">
                  返回前台
                </Link>
              </p>
              <h1 className="mt-1 text-lg font-semibold">运营后台</h1>
            </div>
            <AdminNav />
          </div>
        </aside>
        <section className="min-w-0">{children}</section>
      </main>
    </>
  );
}
