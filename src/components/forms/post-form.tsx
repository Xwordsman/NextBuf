"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { NodeOption } from "@/server/queries";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { createPostAction } from "@/server/actions/community";

type PostFormProps = {
  nodes: NodeOption[];
};

export function PostForm({ nodes }: PostFormProps) {
  const [state, action] = useActionState(createPostAction, emptyActionState);
  const roots = nodes.filter((node) => !node.parentId);

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}
      <Field>
        <FieldLabel htmlFor="nodeId">节点</FieldLabel>
        <NativeSelect className="w-full" id="nodeId" name="nodeId" required>
          <NativeSelectOption value="">选择发布节点</NativeSelectOption>
          {roots.map((root) => (
            <NativeSelectOptGroup key={root.id} label={root.name}>
              <NativeSelectOption value={root.id}>发到 {root.name}</NativeSelectOption>
              {nodes
                .filter((node) => node.parentId === root.id)
                .map((child) => (
                  <NativeSelectOption key={child.id} value={child.id}>
                    {child.name}
                  </NativeSelectOption>
                ))}
            </NativeSelectOptGroup>
          ))}
        </NativeSelect>
        <FieldDescription>具体问题建议选择更精确的子节点。</FieldDescription>
        <FieldError errors={toFieldErrors(state.errors?.nodeId)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="title">标题</FieldLabel>
        <Input id="title" name="title" required maxLength={160} />
        <FieldError errors={toFieldErrors(state.errors?.title)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="content">正文</FieldLabel>
        <Textarea id="content" name="content" required rows={12} />
        <FieldDescription>第一阶段先使用纯文本/Markdown 风格输入。</FieldDescription>
        <FieldError errors={toFieldErrors(state.errors?.content)} />
      </Field>
      <SubmitButton pendingText="正在发布...">发布主题</SubmitButton>
    </form>
  );
}
