"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState, toFieldErrors } from "@/server/action-state";
import { reportContentAction } from "@/server/actions/community";

type ReportFormProps = {
  targetType: "post" | "reply";
  targetId: string;
  postId: string;
};

export function ReportForm({ targetType, targetId, postId }: ReportFormProps) {
  const [state, action] = useActionState(reportContentAction, emptyActionState);

  return (
    <form action={action} className="mt-3 space-y-3">
      <input type="hidden" name="targetType" value={targetType} />
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="postId" value={postId} />

      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <Field>
        <FieldLabel htmlFor={`reason-${targetId}`}>举报原因</FieldLabel>
        <NativeSelect
          className="w-full"
          id={`reason-${targetId}`}
          name="reason"
          required
          defaultValue="spam"
        >
          <NativeSelectOption value="spam">垃圾广告</NativeSelectOption>
          <NativeSelectOption value="abuse">攻击辱骂</NativeSelectOption>
          <NativeSelectOption value="illegal">违法违规</NativeSelectOption>
          <NativeSelectOption value="off_topic">偏离主题</NativeSelectOption>
          <NativeSelectOption value="other">其他</NativeSelectOption>
        </NativeSelect>
        <FieldError errors={toFieldErrors(state.errors?.reason)} />
      </Field>

      <Field>
        <FieldLabel htmlFor={`detail-${targetId}`}>补充说明</FieldLabel>
        <Textarea
          id={`detail-${targetId}`}
          name="detail"
          rows={3}
          className="min-h-24"
          placeholder="可选，简要说明问题"
        />
        <FieldError errors={toFieldErrors(state.errors?.detail)} />
      </Field>

      <SubmitButton size="sm" variant="secondary" pendingText="正在提交...">
        提交举报
      </SubmitButton>
    </form>
  );
}
