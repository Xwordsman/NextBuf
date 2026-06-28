"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { createReplyAction } from "@/server/actions/community";

export function ReplyForm({ postId }: { postId: string }) {
  const actionWithPost = createReplyAction.bind(null, postId);
  const [state, action] = useActionState(actionWithPost, emptyActionState);

  return (
    <form action={action} className="space-y-4">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {state.message}
        </div>
      ) : null}
      <Field>
        <FieldLabel htmlFor="content">回复</FieldLabel>
        <Textarea id="content" name="content" required rows={5} />
        <FieldError errors={toFieldErrors(state.errors?.content)} />
      </Field>
      <SubmitButton pendingText="正在回复...">发布回复</SubmitButton>
    </form>
  );
}
