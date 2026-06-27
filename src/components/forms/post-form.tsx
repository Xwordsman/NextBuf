"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { NodeOption } from "@/server/queries";
import { emptyActionState } from "@/server/action-state";
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
        <Label htmlFor="nodeId">节点</Label>
        <Select id="nodeId" name="nodeId" required>
          <option value="">选择发布节点</option>
          {roots.map((root) => (
            <optgroup key={root.id} label={root.name}>
              <option value={root.id}>发到 {root.name}</option>
              {nodes
                .filter((node) => node.parentId === root.id)
                .map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </Select>
        <FieldHint>具体问题建议选择更精确的子节点。</FieldHint>
        <FieldError message={state.errors?.nodeId} />
      </Field>
      <Field>
        <Label htmlFor="title">标题</Label>
        <Input id="title" name="title" required maxLength={160} />
        <FieldError message={state.errors?.title} />
      </Field>
      <Field>
        <Label htmlFor="content">正文</Label>
        <Textarea id="content" name="content" required rows={12} />
        <FieldHint>第一阶段先使用纯文本/Markdown 风格输入。</FieldHint>
        <FieldError message={state.errors?.content} />
      </Field>
      <SubmitButton pendingText="正在发布...">发布主题</SubmitButton>
    </form>
  );
}
