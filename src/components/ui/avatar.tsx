import { getInitial } from "@/lib/utils";

type AvatarProps = {
  name: string;
  size?: "sm" | "md";
};

export function Avatar({ name, size = "md" }: AvatarProps) {
  const sizeClassName = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <span
      className={`${sizeClassName} inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-panel-muted font-semibold text-muted`}
      aria-hidden="true"
    >
      {getInitial(name)}
    </span>
  );
}
