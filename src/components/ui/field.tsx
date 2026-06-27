import * as React from "react";

import { cn } from "@/lib/utils";

export function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function FieldHint({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-5 text-muted", className)} {...props} />;
}

export function FieldError({ message }: { message?: string | string[] }) {
  const text = Array.isArray(message) ? message.join(" ") : message;

  if (!text) {
    return null;
  }

  return (
    <p className="text-sm leading-5 text-danger" role="alert">
      {text}
    </p>
  );
}
