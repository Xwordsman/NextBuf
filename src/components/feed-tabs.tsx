import Link from "next/link";

import { cn } from "@/lib/utils";

type FeedTabKey = "latest" | "popular";

const feedTabs: Array<{
  key: FeedTabKey;
  label: string;
  href: string;
}> = [
  { key: "latest", label: "最新", href: "/" },
  { key: "popular", label: "热门", href: "/popular" },
];

type FeedTabsProps = {
  active: FeedTabKey;
};

export function FeedTabs({ active }: FeedTabsProps) {
  return (
    <nav
      aria-label="主题筛选"
      className="flex gap-1 overflow-x-auto border-b border-border bg-muted/35 px-2 py-2"
    >
      {feedTabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          aria-current={active === tab.key ? "page" : undefined}
          className={cn(
            "shrink-0 rounded-[var(--radius-control)] px-3 py-1.5 text-sm transition-colors duration-200",
            active === tab.key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-background hover:text-foreground",
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
