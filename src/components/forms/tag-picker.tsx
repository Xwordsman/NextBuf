"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import type { TagOption } from "@/server/queries";

type TagPickerProps = {
  tags: TagOption[];
  defaultSelectedIds?: string[];
  max?: number;
};

export function TagPicker({
  tags,
  defaultSelectedIds = [],
  max = 5,
}: TagPickerProps) {
  const selected = new Set(defaultSelectedIds);

  if (tags.length === 0) {
    return (
      <p className="rounded-[var(--radius-control)] border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
        暂无可用标签，管理员可以在后台创建。
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const inputId = `tag-${tag.id}`;
        const isSelected = selected.has(tag.id);

        return (
          <label
            key={tag.id}
            htmlFor={inputId}
            className={cn(
              "group inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-[var(--radius-control)] border border-border bg-panel px-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:border-foreground/20 hover:text-foreground",
              "has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
            )}
            title={tag.description ?? tag.name}
          >
            <input
              id={inputId}
              type="checkbox"
              name="tagIds"
              value={tag.id}
              defaultChecked={isSelected}
              className="peer sr-only"
              aria-label={tag.name}
            />
            <Check
              size={13}
              className="hidden text-primary-foreground peer-checked:block"
            />
            <span>{tag.name}</span>
          </label>
        );
      })}
      <span className="self-center text-xs text-muted-foreground">最多 {max} 个</span>
    </div>
  );
}
