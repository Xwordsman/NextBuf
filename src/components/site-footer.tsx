import Link from "next/link";
import { Code2 } from "lucide-react";

import { getRuntimeInfo } from "@/server/runtime";

const internalLinks = [
  { href: "/", label: "首页" },
  { href: "/nodes", label: "节点" },
  { href: "/popular", label: "热门" },
  { href: "/search", label: "搜索" },
  { href: "/api/health", label: "API" },
];

export function SiteFooter() {
  const runtime = getRuntimeInfo();

  return (
    <footer className="border-t border-border bg-panel text-xs text-muted-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <nav className="flex flex-wrap items-center gap-x-2 gap-y-1 font-medium">
            {internalLinks.map((item, index) => (
              <span key={item.href} className="inline-flex items-center gap-2">
                {index > 0 ? <span className="text-border">·</span> : null}
                <Link
                  href={item.href}
                  className="rounded-[var(--radius-control)] py-1 text-foreground/80 transition-colors duration-200 hover:text-primary"
                >
                  {item.label}
                </Link>
              </span>
            ))}
            <span className="text-border">·</span>
            <a
              href="https://www.nextbuf.com/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-[var(--radius-control)] py-1 text-foreground/80 transition-colors duration-200 hover:text-primary"
            >
              <Code2 size={14} />
              GitHub
            </a>
          </nav>

          <strong className="text-base font-semibold text-foreground">NextBuf</strong>
        </div>

        <div className="space-y-2 leading-6">
          <p className="font-mono tracking-normal text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.nextbuf.com/"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground/80 transition-colors duration-200 hover:text-primary"
            >
              NextBuf
            </a>{" "}
            · VERSION: {runtime.version}
          </p>
        </div>
      </div>
    </footer>
  );
}
