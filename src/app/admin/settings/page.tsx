import { SettingsForm } from "@/components/forms/settings-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSiteSettingsForAdmin } from "@/server/queries";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettingsForAdmin();

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">站点设置</h2>
        <p className="mt-1 text-sm text-muted">
          第一阶段提供站点基础信息和开放注册开关。
        </p>
      </CardHeader>
      <CardContent>
        <SettingsForm settings={settings} />
      </CardContent>
    </Card>
  );
}
