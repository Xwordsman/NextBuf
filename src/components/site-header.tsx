import Link from "next/link";
import {
  Bell,
  LayoutDashboard,
  LogIn,
  LogOut,
  Search,
  Settings,
  UserRound,
  UserPlus,
} from "lucide-react";

import { logoutAction } from "@/server/actions/auth";
import type { CurrentUser } from "@/server/auth";
import type { SiteSettings } from "@/db/schema";
import { Avatar } from "@/components/ui/avatar";

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

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/me/notifications"
                aria-label="通知"
                title="通知"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
              >
                <Bell size={18} />
              </Link>

              <details className="group relative">
                <summary
                  aria-label="个人菜单"
                  title="个人菜单"
                  className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-[var(--radius-control)] transition-colors duration-200 hover:bg-panel-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"
                >
                  <Avatar name={user.username} src={user.avatarUrl} size="sm" />
                </summary>
                <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-[var(--radius-base)] border border-border bg-panel shadow-[0_12px_32px_rgb(15_23_42_/_0.14)]">
                  <div className="flex gap-3 border-b border-border p-4">
                    <Avatar name={user.username} src={user.avatarUrl} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {user.username}
                      </div>
                      <div className="mt-1 font-mono text-xs text-muted">
                        UID {user.id.slice(0, 8)}
                      </div>
                    </div>
                  </div>

                  <nav className="p-2 text-sm">
                    {user.role === "admin" ? (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
                      >
                        <LayoutDashboard size={16} />
                        管理后台
                      </Link>
                    ) : null}
                    <Link
                      href={`/users/${user.username}`}
                      className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
                    >
                      <UserRound size={16} />
                      个人主页
                    </Link>
                    <Link
                      href="/me/settings"
                      className="flex items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
                    >
                      <Settings size={16} />
                      设置
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="flex w-full cursor-pointer items-center gap-2 rounded-[var(--radius-control)] px-3 py-2 text-left text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
                      >
                        <LogOut size={16} />
                        退出
                      </button>
                    </form>
                  </nav>
                </div>
              </details>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="登录"
                title="登录"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
              >
                <LogIn size={18} />
              </Link>
              <Link
                href="/register"
                aria-label="注册"
                title="注册"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-muted transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
              >
                <UserPlus size={18} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
