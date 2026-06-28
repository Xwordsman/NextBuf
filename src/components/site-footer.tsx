import Link from "next/link";
import { Code2, Languages } from "lucide-react";

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
  const commit = runtime.commit ? runtime.commit.slice(0, 7) : "local";
  const buildTime = runtime.buildTime ?? "unknown";

  return (
    <footer className="border-t border-border bg-panel text-xs text-muted">
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
              href="https://github.com/Xwordsman/NextBuf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-[var(--radius-control)] py-1 text-foreground/80 transition-colors duration-200 hover:text-primary"
            >
              <Code2 size={14} />
              GitHub
            </a>
          </nav>

          <div className="inline-flex items-center gap-2 text-muted">
            <Languages size={15} />
            <span>Select Language</span>
            <span className="text-border">·</span>
            <strong className="text-base font-semibold text-foreground">NextBuf</strong>
          </div>
        </div>

        <div className="space-y-2 leading-6">
          <p className="text-sm text-foreground/80">创作者们的轻社区</p>
          <p>NextBuf is powered by focused discussions.</p>
          <p className="font-mono uppercase tracking-normal text-muted">
            VERSION: {runtime.version} · ENV: {runtime.nodeEnv} · BUILD: {buildTime} ·
            COMMIT: {commit}
          </p>
          <p>Do have faith in what you&apos;re building.</p>
        </div>
      </div>
    </footer>
  );
}
