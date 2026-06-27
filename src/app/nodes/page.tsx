import { NodeGrid } from "@/components/node-grid";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/server/auth";
import { getPublicNodes } from "@/server/queries";
import { getSiteSettings, requireInstalled } from "@/server/site";

export const dynamic = "force-dynamic";

export default async function NodesPage() {
  await requireInstalled();

  const [settings, user, nodes] = await Promise.all([
    getSiteSettings(),
    getCurrentUser(),
    getPublicNodes(),
  ]);

  return (
    <>
      <SiteHeader settings={settings} user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
        <div className="mb-5">
          <h1 className="text-2xl font-semibold">节点</h1>
          <p className="mt-1 text-sm text-muted">
            第一阶段支持两级节点，一级节点也可以直接发帖。
          </p>
        </div>
        <NodeGrid nodes={nodes} />
      </main>
    </>
  );
}
