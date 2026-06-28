import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "default" | "muted" | "success" | "danger" | "accent";
};

const toneClassName = {
  default: "border-primary/20 bg-primary/5 text-primary",
  muted: "border-border bg-panel-muted text-muted",
  success: "border-success/25 bg-success/10 text-success",
  danger: "border-danger/25 bg-danger/10 text-danger",
  accent: "border-accent/20 bg-accent/10 text-accent",
};

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-6 items-center rounded-[var(--radius-control)] border px-2 text-xs font-medium",
        toneClassName[tone],
        className,
      )}
      {...props}
    />
  );
}
