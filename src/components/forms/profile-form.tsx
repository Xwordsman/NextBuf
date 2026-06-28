"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/form-submit-button";
import { Field, FieldError, FieldHint, Label } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emptyActionState } from "@/server/action-state";
import { updateProfileAction } from "@/server/actions/community";

type ProfileFormProps = {
  profile: {
    avatarUrl: string | null;
    bio: string | null;
  };
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, action] = useActionState(updateProfileAction, emptyActionState);

  return (
    <form action={action} className="space-y-5">
      {state.message ? (
        <div className="rounded-[var(--radius-control)] border border-border bg-panel-muted p-3 text-sm">
          {state.message}
        </div>
      ) : null}

      <Field>
        <Label htmlFor="avatarUrl">头像 URL</Label>
        <Input
          id="avatarUrl"
          name="avatarUrl"
          type="url"
          placeholder="https://example.com/avatar.png"
          defaultValue={profile.avatarUrl ?? ""}
        />
        <FieldHint>可选。当前阶段先使用外链头像，后续再接对象存储上传。</FieldHint>
        <FieldError message={state.errors?.avatarUrl} />
      </Field>

      <Field>
        <Label htmlFor="bio">个人简介</Label>
        <Textarea
          id="bio"
          name="bio"
          rows={5}
          placeholder="简单介绍一下你自己"
          defaultValue={profile.bio ?? ""}
        />
        <FieldError message={state.errors?.bio} />
      </Field>

      <SubmitButton pendingText="正在保存...">保存资料</SubmitButton>
    </form>
  );
}
