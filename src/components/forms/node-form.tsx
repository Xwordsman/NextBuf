"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { createNodeAction, updateNodeAction } from "@/server/actions/admin";
import type { NodeOption } from "@/server/queries";

type NodeFormProps = {
  roots: NodeOption[];
  node?: {
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    description: string | null;
    postingMode: string;
    status: string;
    sortOrder: number;
  };
};

export function NodeForm({ roots, node }: NodeFormProps) {
  const [state, action] = useActionState(
    node ? updateNodeAction : createNodeAction,
    emptyActionState,
  );
  const availableRoots = node ? roots.filter((root) => root.id !== node.id) : roots;

  return (
    <form action={action} className="space-y-4">
      {node ? <input type="hidden" name="id" value={node.id} /> : null}
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3 text-sm text-foreground">
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="name">节点名称</FieldLabel>
          <Input id="name" name="name" required defaultValue={node?.name} />
          <FieldError errors={toFieldErrors(state.errors?.name)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="slug">Slug</FieldLabel>
          <Input
            id="slug"
            name="slug"
            placeholder="openai-api"
            defaultValue={node?.slug}
          />
          <FieldDescription>留空时会尽量根据名称生成。</FieldDescription>
          <FieldError errors={toFieldErrors(state.errors?.slug)} />
        </Field>
      </div>
      <Field>
        <FieldLabel htmlFor="description">简介</FieldLabel>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={node?.description ?? ""}
        />
        <FieldError errors={toFieldErrors(state.errors?.description)} />
      </Field>
      <div className="grid gap-4 md:grid-cols-4">
        <Field>
          <FieldLabel htmlFor="parentId">所属一级节点</FieldLabel>
          <NativeSelect
            className="w-full"
            id="parentId"
            name="parentId"
            defaultValue={node?.parentId ?? ""}
          >
            <NativeSelectOption value="">作为一级节点</NativeSelectOption>
            {availableRoots.map((root) => (
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
            defaultValue={node?.postingMode ?? "open"}
          >
            <NativeSelectOption value="open">开放</NativeSelectOption>
            <NativeSelectOption value="moderated">需要审核</NativeSelectOption>
            <NativeSelectOption value="admin_only">仅管理员</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={toFieldErrors(state.errors?.postingMode)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="status">状态</FieldLabel>
          <NativeSelect
            className="w-full"
            id="status"
            name="status"
            defaultValue={node?.status ?? "active"}
          >
            <NativeSelectOption value="active">启用</NativeSelectOption>
            <NativeSelectOption value="hidden">隐藏</NativeSelectOption>
          </NativeSelect>
          <FieldError errors={toFieldErrors(state.errors?.status)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="sortOrder">排序</FieldLabel>
          <Input
            id="sortOrder"
            name="sortOrder"
            type="number"
            min={0}
            defaultValue={node?.sortOrder ?? 0}
          />
          <FieldError errors={toFieldErrors(state.errors?.sortOrder)} />
        </Field>
      </div>
      <SubmitButton pendingText={node ? "正在保存..." : "正在创建..."}>
        {node ? "保存节点" : "创建节点"}
      </SubmitButton>
    </form>
  );
}
