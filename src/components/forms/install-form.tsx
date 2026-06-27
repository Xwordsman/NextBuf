"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState } from "@/server/action-state";
import { installAction } from "@/server/actions/install";

export function InstallForm() {
  const [state, action] = useActionState(installAction, emptyActionState);

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}

      <Field>
        <Label htmlFor="siteName">网站名称</Label>
        <Input id="siteName" name="siteName" required defaultValue="NextBuf" />
        <FieldError message={state.errors?.siteName} />
      </Field>

      <Field>
        <Label htmlFor="siteUrl">网站网址</Label>
        <Input
          id="siteUrl"
          name="siteUrl"
          required
          placeholder="https://nextbuf.com"
          type="url"
        />
        <FieldError message={state.errors?.siteUrl} />
      </Field>

      <Field>
        <Label htmlFor="siteDescription">网站简介</Label>
        <Textarea
          id="siteDescription"
          name="siteDescription"
          rows={3}
          placeholder="一句话说明这个社区的主题"
        />
        <FieldHint>后续可在后台设置中修改。</FieldHint>
        <FieldError message={state.errors?.siteDescription} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label htmlFor="username">管理员用户名</Label>
          <Input id="username" name="username" required autoComplete="username" />
          <FieldError message={state.errors?.username} />
        </Field>
        <Field>
          <Label htmlFor="email">管理员邮箱</Label>
          <Input id="email" name="email" required type="email" autoComplete="email" />
          <FieldError message={state.errors?.email} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <Label htmlFor="password">管理员密码</Label>
          <Input
            id="password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
          />
          <FieldError message={state.errors?.password} />
        </Field>
        <Field>
          <Label htmlFor="confirmPassword">确认密码</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            required
            type="password"
            autoComplete="new-password"
          />
          <FieldError message={state.errors?.confirmPassword} />
        </Field>
      </div>

      <SubmitButton className="w-full" pendingText="正在安装...">
        开始安装
      </SubmitButton>
    </form>
  );
}
