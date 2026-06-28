import { getInitial } from "@/lib/utils";

type AvatarProps = {
  name: string;
  size?: "sm" | "md";
  src?: string | null;
};

export function Avatar({ name, size = "md", src }: AvatarProps) {
  const sizeClassName = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  if (src) {
    return (
      <span
        role="img"
        aria-label={`${name} 的头像`}
        className={`${sizeClassName} inline-flex shrink-0 rounded-full border border-border bg-cover bg-center`}
        style={{ backgroundImage: `url(${src})` }}
      />
    );
  }

  return (
    <span
      className={`${sizeClassName} inline-flex shrink-0 items-center justify-center rounded-full border border-border bg-panel-muted font-semibold text-muted`}
      aria-hidden="true"
    >
      {getInitial(name)}
    </span>
  );
}
