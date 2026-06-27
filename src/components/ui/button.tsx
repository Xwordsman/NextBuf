import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] text-sm font-medium transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-55",
  {
    variants: {
      variant: {
        primary:
          "bg-primary px-4 py-2.5 text-primary-foreground hover:bg-primary/90",
        secondary:
          "border border-border bg-panel px-4 py-2.5 text-foreground hover:bg-panel-muted",
        ghost: "px-3 py-2 text-muted hover:bg-panel-muted hover:text-foreground",
        danger: "bg-danger px-4 py-2.5 text-white hover:bg-danger/90",
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-xs",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export function buttonClassName(
  variants?: Parameters<typeof buttonVariants>[0],
) {
  return buttonVariants(variants);
}
