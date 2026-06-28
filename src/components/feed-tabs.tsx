import Link from "next/link";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    <Tabs value={active} className="gap-0 border-b border-border bg-muted/35 px-2 py-2">
      <TabsList aria-label="主题筛选" className="h-8 bg-transparent p-0">
        {feedTabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            asChild
            className="flex-none rounded-[var(--radius-control)] px-3 py-1.5"
          >
            <Link href={tab.href} aria-current={active === tab.key ? "page" : undefined}>
              {tab.label}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
