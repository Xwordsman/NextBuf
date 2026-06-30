import "server-only";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export async function getSiteSettings() {
  try {
    const [settings] = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "site"))
      .limit(1);

    return settings ?? null;
  } catch {
    // Local dev or first boot may not have a database online yet.
    // Treat that as "not installed" so the install flow can render.
    return null;
  }
}

export async function isInstalled() {
  const settings = await getSiteSettings();

  return Boolean(settings?.installedAt);
}

export async function requireInstalled() {
  if (!(await isInstalled())) {
    redirect("/install");
  }
}

export async function requireNotInstalled() {
  if (await isInstalled()) {
    redirect("/admin");
  }
}
