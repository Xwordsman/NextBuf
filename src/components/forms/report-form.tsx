"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, Label } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState } from "@/server/action-state";
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
        <Label htmlFor={`reason-${targetId}`}>举报原因</Label>
        <Select id={`reason-${targetId}`} name="reason" required defaultValue="spam">
          <option value="spam">垃圾广告</option>
          <option value="abuse">攻击辱骂</option>
          <option value="illegal">违法违规</option>
          <option value="off_topic">偏离主题</option>
          <option value="other">其他</option>
        </Select>
        <FieldError message={state.errors?.reason} />
      </Field>

      <Field>
        <Label htmlFor={`detail-${targetId}`}>补充说明</Label>
        <Textarea
          id={`detail-${targetId}`}
          name="detail"
          rows={3}
          className="min-h-24"
          placeholder="可选，简要说明问题"
        />
        <FieldError message={state.errors?.detail} />
      </Field>

      <SubmitButton size="sm" variant="secondary" pendingText="正在提交...">
        提交举报
      </SubmitButton>
    </form>
  );
}
