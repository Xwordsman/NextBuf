"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
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
        <FieldLabel htmlFor="siteName">网站名称</FieldLabel>
        <Input id="siteName" name="siteName" required defaultValue="NextBuf" />
        <FieldError errors={toFieldErrors(state.errors?.siteName)} />
      </Field>

      <Field>
        <FieldLabel htmlFor="siteUrl">网站网址</FieldLabel>
        <Input
          id="siteUrl"
          name="siteUrl"
          required
          placeholder="https://nextbuf.com"
          type="url"
        />
        <FieldError errors={toFieldErrors(state.errors?.siteUrl)} />
      </Field>

      <Field>
        <FieldLabel htmlFor="siteDescription">网站简介</FieldLabel>
        <Textarea
          id="siteDescription"
          name="siteDescription"
          rows={3}
          placeholder="一句话说明这个社区的主题"
        />
        <FieldDescription>后续可在后台设置中修改。</FieldDescription>
        <FieldError errors={toFieldErrors(state.errors?.siteDescription)} />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="username">管理员用户名</FieldLabel>
          <Input id="username" name="username" required autoComplete="username" />
          <FieldError errors={toFieldErrors(state.errors?.username)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">管理员邮箱</FieldLabel>
          <Input id="email" name="email" required type="email" autoComplete="email" />
          <FieldError errors={toFieldErrors(state.errors?.email)} />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="password">管理员密码</FieldLabel>
          <Input
            id="password"
            name="password"
            required
            type="password"
            autoComplete="new-password"
          />
          <FieldError errors={toFieldErrors(state.errors?.password)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">确认密码</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            required
            type="password"
            autoComplete="new-password"
          />
          <FieldError errors={toFieldErrors(state.errors?.confirmPassword)} />
        </Field>
      </div>

      <SubmitButton className="w-full" pendingText="正在安装...">
        开始安装
      </SubmitButton>
    </form>
  );
}
