"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/db/schema";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { updateSiteSettingsAction } from "@/server/actions/admin";

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, action] = useActionState(
    updateSiteSettingsAction,
    emptyActionState,
  );

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3 text-sm text-foreground">
          {state.message}
        </div>
      ) : null}
      <Field>
        <FieldLabel htmlFor="siteName">网站名称</FieldLabel>
        <Input id="siteName" name="siteName" required defaultValue={settings.siteName} />
        <FieldError errors={toFieldErrors(state.errors?.siteName)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="siteUrl">网站网址</FieldLabel>
        <Input id="siteUrl" name="siteUrl" required type="url" defaultValue={settings.siteUrl} />
        <FieldError errors={toFieldErrors(state.errors?.siteUrl)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="siteDescription">网站简介</FieldLabel>
        <Textarea
          id="siteDescription"
          name="siteDescription"
          rows={4}
          defaultValue={settings.siteDescription ?? ""}
        />
        <FieldError errors={toFieldErrors(state.errors?.siteDescription)} />
      </Field>
      <FieldLabel className="flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] border border-border bg-panel px-3 text-sm">
        <input
          name="allowRegistration"
          type="checkbox"
          defaultChecked={settings.allowRegistration}
          className="h-4 w-4 accent-primary"
        />
        允许开放注册
      </FieldLabel>
      <FieldDescription>主题和插件第一阶段只预留数据结构，后续会在这里扩展配置入口。</FieldDescription>
      <SubmitButton pendingText="正在保存...">保存设置</SubmitButton>
    </form>
  );
}
