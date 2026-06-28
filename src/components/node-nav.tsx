import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NodeOption } from "@/server/queries";

type NodeNavProps = {
  nodes: NodeOption[];
  activeSlug?: string | null;
  className?: string;
};

export function NodeNav({ nodes, activeSlug, className }: NodeNavProps) {
  return (
    <nav
      aria-label="节点导航"
      className={cn("min-w-0 lg:sticky lg:top-20 lg:self-start", className)}
    >
      <div className="flex gap-1 overflow-x-auto rounded-[var(--radius-base)] border border-border bg-panel p-1 lg:max-h-[calc(100vh-6rem)] lg:flex-col lg:overflow-y-auto">
        <NodeNavLink href="/" active={activeSlug === null}>
          全部
        </NodeNavLink>
        {nodes.map((node) => (
          <NodeNavLink
            key={node.id}
            href={`/nodes/${node.slug}`}
            active={activeSlug === node.slug}
          >
            {node.name}
          </NodeNavLink>
        ))}
      </div>
    </nav>
  );
}

function NodeNavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      asChild
      variant={active ? "default" : "ghost"}
      size="sm"
      className={cn(
        "h-8 flex-none justify-start rounded-[var(--radius-control)] px-2.5 text-sm font-medium lg:w-full",
        !active && "text-muted-foreground hover:text-foreground",
      )}
    >
      <Link href={href} aria-current={active ? "page" : undefined}>
        <span className="truncate">{children}</span>
      </Link>
    </Button>
  );
}
