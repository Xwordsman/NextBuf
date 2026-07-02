"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { MarkdownEditor } from "@/components/forms/markdown-editor";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { updatePostAction } from "@/server/actions/community";
import type { NodeOption } from "@/server/queries";

type PostEditFormProps = {
  post: {
    id: string;
    nodeId: string;
    title: string;
    content: string;
  };
  nodes: NodeOption[];
};

export function PostEditForm({ post, nodes }: PostEditFormProps) {
  const actionWithPost = updatePostAction.bind(null, post.id);
  const [state, action] = useActionState(actionWithPost, emptyActionState);
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
        <NativeSelect
          className="w-full"
          id="nodeId"
          name="nodeId"
          required
          defaultValue={post.nodeId}
        >
          {roots.map((root) => (
            <NativeSelectOptGroup key={root.id} label={root.name}>
              <NativeSelectOption value={root.id}>{root.name}</NativeSelectOption>
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
        <FieldDescription>调整节点后，主题会移动到新的节点列表中。</FieldDescription>
        <FieldError errors={toFieldErrors(state.errors?.nodeId)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="title">标题</FieldLabel>
        <Input id="title" name="title" required maxLength={160} defaultValue={post.title} />
        <FieldError errors={toFieldErrors(state.errors?.title)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="content">正文</FieldLabel>
        <MarkdownEditor
          id="content"
          name="content"
          required
          defaultValue={post.content}
        />
        <FieldError errors={toFieldErrors(state.errors?.content)} />
      </Field>
      <SubmitButton pendingText="正在保存...">保存主题</SubmitButton>
    </form>
  );
}
