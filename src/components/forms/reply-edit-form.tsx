"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { MarkdownEditor } from "@/components/forms/markdown-editor";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { updateReplyAction } from "@/server/actions/community";

type ReplyEditFormProps = {
  reply: {
    id: string;
    content: string;
  };
};

export function ReplyEditForm({ reply }: ReplyEditFormProps) {
  const actionWithReply = updateReplyAction.bind(null, reply.id);
  const [state, action] = useActionState(actionWithReply, emptyActionState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}
      <Field>
        <FieldLabel htmlFor="content">回复内容</FieldLabel>
        <MarkdownEditor
          id="content"
          name="content"
          required
          density="compact"
          defaultValue={reply.content}
        />
        <FieldError errors={toFieldErrors(state.errors?.content)} />
      </Field>
      <SubmitButton pendingText="正在保存...">保存回复</SubmitButton>
    </form>
  );
}
