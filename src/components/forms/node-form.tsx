"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { createNodeAction } from "@/server/actions/admin";
import type { NodeOption } from "@/server/queries";

type NodeFormProps = {
  roots: NodeOption[];
};

export function NodeForm({ roots }: NodeFormProps) {
  const [state, action] = useActionState(createNodeAction, emptyActionState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3 text-sm text-foreground">
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">节点名称</FieldLabel>
          <Input id="name" name="name" required />
          <FieldError errors={toFieldErrors(state.errors?.name)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input id="slug" name="slug" placeholder="openai-api" />
          <FieldDescription>留空时会尽量根据名称生成。</FieldDescription>
          <FieldError errors={toFieldErrors(state.errors?.slug)} />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="description">简介</FieldLabel>
        <Textarea id="description" name="description" rows={3} />
        <FieldError errors={toFieldErrors(state.errors?.description)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-4">
        <Field>
          <FieldLabel htmlFor="parentId">所属一级节点</FieldLabel>
          <NativeSelect className="w-full" id="parentId" name="parentId">
            <NativeSelectOption value="">作为一级节点</NativeSelectOption>
            {roots.map((root) => (
              <NativeSelectOption key={root.id} value={root.id}>
                {root.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          <FieldError errors={toFieldErrors(state.errors?.parentId)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="postingMode">发帖策略</FieldLabel>
          <NativeSelect
            className="w-full"
            id="postingMode"
            name="postingMode"
            defaultValue="open"
          >
            <NativeSelectOption value="open">开放</NativeSelectOption>
            <NativeSelectOption value="admin_only">仅管理员</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={toFieldErrors(state.errors?.postingMode)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="status">状态</FieldLabel>
          <NativeSelect className="w-full" id="status" name="status" defaultValue="active">
            <NativeSelectOption value="active">启用</NativeSelectOption>
            <NativeSelectOption value="hidden">隐藏</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={toFieldErrors(state.errors?.status)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="sortOrder">排序</FieldLabel>
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} />
          <FieldError errors={toFieldErrors(state.errors?.sortOrder)} />
        </Field>
      </div>
      <SubmitButton pendingText="正在创建...">创建节点</SubmitButton>
    </form>
  );
}
