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
import { getInitial } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SiteHeaderProps = {
  settings: SiteSettings | null;
  user: CurrentUser | null;
  unreadNotificationCount?: number;
};

export function SiteHeader({
  settings,
  user,
  unreadNotificationCount = 0,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Link href="/" className="mr-2 flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-control)] bg-primary text-sm text-primary-foreground">
            N
          </span>
          <span>{settings?.siteName ?? "NextBuf"}</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 text-sm text-muted-foreground">
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
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
              >
                <Bell size={18} />
                {unreadNotificationCount > 0 ? (
                  <span className="absolute right-1 top-1 inline-flex min-w-4 justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
                    {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
                  </span>
                ) : null}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    aria-label="个人菜单"
                    title="个人菜单"
                  >
                    <Avatar size="sm">
                      <AvatarImage
                        src={user.avatarUrl ?? undefined}
                        alt={`${user.username} 的头像`}
                      />
                      <AvatarFallback>{getInitial(user.username)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="flex gap-3 px-3 py-3">
                    <Avatar size="lg">
                      <AvatarImage
                        src={user.avatarUrl ?? undefined}
                        alt={`${user.username} 的头像`}
                      />
                      <AvatarFallback>{getInitial(user.username)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground">
                        {user.username}
                      </div>
                      <div className="mt-1 font-mono text-xs text-muted-foreground">
                        UID {user.uid}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />
                  {user.role === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <LayoutDashboard size={16} />
                        管理后台
                      </Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem asChild>
                    <Link href={`/users/${user.username}`}>
                      <UserRound size={16} />
                      个人主页
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/me/settings">
                      <Settings size={16} />
                      设置
                    </Link>
                  </DropdownMenuItem>
                  <form action={logoutAction}>
                    <DropdownMenuItem asChild variant="destructive">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-1.5 text-left"
                      >
                        <LogOut size={16} />
                        退出
                      </button>
                    </DropdownMenuItem>
                  </form>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                href="/login"
                aria-label="登录"
                title="登录"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
              >
                <LogIn size={18} />
              </Link>
              <Link
                href="/register"
                aria-label="注册"
                title="注册"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-control)] text-muted-foreground transition-colors duration-200 hover:bg-panel-muted hover:text-foreground"
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
