import Link from "next/link";
import {
  Bell,
  Bookmark,
  LayoutDashboard,
  LogIn,
  LogOut,
  PenLine,
  Search,
  UserPlus,
} from "lucide-react";

import { logoutAction } from "@/server/actions/auth";
import type { CurrentUser } from "@/server/auth";
import type { SiteSettings } from "@/db/schema";
import { buttonClassName } from "@/components/ui/button";

type SiteHeaderProps = {
  settings: SiteSettings | null;
  user: CurrentUser | null;
};

export function SiteHeader({ settings, user }: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-2 flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-primary text-sm text-primary-foreground">
            N
          </span>
          <span>{settings?.siteName ?? "NextBuf"}</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 text-sm text-muted">
          <Link className="rounded-[var(--radius-control)] px-3 py-2 hover:bg-panel-muted hover:text-foreground" href="/nodes">
            节点
          </Link>
          <Link className="rounded-[var(--radius-control)] px-3 py-2 hover:bg-panel-muted hover:text-foreground" href="/">
            最新
          </Link>
          <Link className="rounded-[var(--radius-control)] px-3 py-2 hover:bg-panel-muted hover:text-foreground" href="/popular">
            热门
          </Link>
          <Link className="inline-flex items-center gap-1 rounded-[var(--radius-control)] px-3 py-2 hover:bg-panel-muted hover:text-foreground" href="/search">
            <Search size={14} />
            搜索
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/posts/new"
                className={buttonClassName({ variant: "primary", size: "sm" })}
              >
                <PenLine size={15} />
                发帖
              </Link>
              {user.role === "admin" ? (
                <Link
                  href="/admin"
                  className={buttonClassName({ variant: "secondary", size: "sm" })}
                >
                  <LayoutDashboard size={15} />
                  后台
                </Link>
              ) : null}
              <Link
                href="/me/notifications"
                className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted hover:bg-panel-muted hover:text-foreground"
              >
                <Bell size={15} />
                通知
              </Link>
              <Link
                href="/me/bookmarks"
                className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted hover:bg-panel-muted hover:text-foreground"
              >
                <Bookmark size={15} />
                收藏
              </Link>
              <Link
                href="/me"
                className="min-h-9 rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted hover:bg-panel-muted hover:text-foreground"
              >
                {user.username}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex min-h-9 items-center gap-1 rounded-[var(--radius-control)] px-3 py-2 text-sm text-muted hover:bg-panel-muted hover:text-foreground"
                >
                  <LogOut size={15} />
                  退出
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={buttonClassName({ variant: "secondary", size: "sm" })}
              >
                <LogIn size={15} />
                登录
              </Link>
              <Link
                href="/register"
                className={buttonClassName({ variant: "primary", size: "sm" })}
              >
                <UserPlus size={15} />
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
