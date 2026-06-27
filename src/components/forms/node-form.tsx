"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState } from "@/server/action-state";
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
          <Label htmlFor="name">节点名称</Label>
          <Input id="name" name="name" required />
          <FieldError message={state.errors?.name} />
        </Field>
        <Field>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" placeholder="openai-api" />
          <FieldHint>留空时会尽量根据名称生成。</FieldHint>
          <FieldError message={state.errors?.slug} />
        </Field>
      </div>
      <Field>
        <Label htmlFor="description">简介</Label>
        <Textarea id="description" name="description" rows={3} />
        <FieldError message={state.errors?.description} />
      </Field>
      <div className="grid gap-4 md:grid-cols-4">
        <Field>
          <Label htmlFor="parentId">所属一级节点</Label>
          <Select id="parentId" name="parentId">
            <option value="">作为一级节点</option>
            {roots.map((root) => (
              <option key={root.id} value={root.id}>
                {root.name}
              </option>
            ))}
          </Select>
          <FieldError message={state.errors?.parentId} />
        </Field>
        <Field>
          <Label htmlFor="postingMode">发帖策略</Label>
          <Select id="postingMode" name="postingMode" defaultValue="open">
            <option value="open">开放</option>
            <option value="admin_only">仅管理员</option>
          </Select>
          <FieldError message={state.errors?.postingMode} />
        </Field>
        <Field>
          <Label htmlFor="status">状态</Label>
          <Select id="status" name="status" defaultValue="active">
            <option value="active">启用</option>
            <option value="hidden">隐藏</option>
          </Select>
          <FieldError message={state.errors?.status} />
        </Field>
        <Field>
          <Label htmlFor="sortOrder">排序</Label>
          <Input id="sortOrder" name="sortOrder" type="number" min={0} defaultValue={0} />
          <FieldError message={state.errors?.sortOrder} />
        </Field>
      </div>
      <SubmitButton pendingText="正在创建...">创建节点</SubmitButton>
    </form>
  );
}
