"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { createTagAction, updateTagAction } from "@/server/actions/admin";

type TagFormProps = {
  tag?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    status: string;
  };
};

export function TagForm({ tag }: TagFormProps) {
  const [state, action] = useActionState(
    tag ? updateTagAction : createTagAction,
    emptyActionState,
  );

  return (
    <form action={action} className="space-y-4">
      {tag ? <input type="hidden" name="id" value={tag.id} /> : null}
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3 text-sm text-foreground">
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">标签名称</FieldLabel>
          <Input id="name" name="name" required defaultValue={tag?.name} />
          <FieldError errors={toFieldErrors(state.errors?.name)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input id="slug" name="slug" placeholder="nextjs" defaultValue={tag?.slug} />
          <FieldDescription>留空时会根据名称生成。</FieldDescription>
          <FieldError errors={toFieldErrors(state.errors?.slug)} />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="description">简介</FieldLabel>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={tag?.description ?? ""}
        />
        <FieldError errors={toFieldErrors(state.errors?.description)} />
      </Field>
      <Field className="max-w-xs">
        <FieldLabel htmlFor="status">状态</FieldLabel>
        <NativeSelect
          id="status"
          name="status"
          className="w-full"
          defaultValue={tag?.status ?? "active"}
        >
          <NativeSelectOption value="active">启用</NativeSelectOption>
          <NativeSelectOption value="hidden">隐藏</NativeSelectOption>
        </NativeSelect>
        <FieldError errors={toFieldErrors(state.errors?.status)} />
      </Field>
      <SubmitButton pendingText={tag ? "正在保存..." : "正在创建..."}>
        {tag ? "保存标签" : "创建标签"}
      </SubmitButton>
    </form>
  );
}
