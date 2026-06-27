"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { emptyActionState } from "@/server/action-state";
import { loginAction, registerAction } from "@/server/actions/auth";

function FormMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
      {message}
    </div>
  );
}

export function LoginForm() {
  const [state, action] = useActionState(loginAction, emptyActionState);

  return (
    <form action={action} className="space-y-5">
      <FormMessage message={state.message} />
      <Field>
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError message={state.errors?.email} />
      </Field>
      <Field>
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        <FieldError message={state.errors?.password} />
      </Field>
      <SubmitButton className="w-full" pendingText="正在登录...">
        登录
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-primary">
          注册
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action] = useActionState(registerAction, emptyActionState);

  return (
    <form action={action} className="space-y-5">
      <FormMessage message={state.message} />
      <Field>
        <Label htmlFor="username">用户名</Label>
        <Input id="username" name="username" required autoComplete="username" />
        <FieldError message={state.errors?.username} />
      </Field>
      <Field>
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError message={state.errors?.email} />
      </Field>
      <Field>
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        <FieldError message={state.errors?.password} />
      </Field>
      <SubmitButton className="w-full" pendingText="正在注册...">
        注册
      </SubmitButton>
      <p className="text-center text-sm text-muted">
        已有账号？{" "}
        <Link href="/login" className="font-medium text-primary">
          登录
        </Link>
      </p>
    </form>
  );
}
