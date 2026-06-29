"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  Network,
  ShieldAlert,
  Settings,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/nodes", label: "节点", icon: Network },
  { href: "/admin/posts", label: "帖子", icon: FileText },
  { href: "/admin/replies", label: "回复", icon: MessageSquare },
  { href: "/admin/reports", label: "举报", icon: ShieldAlert },
  { href: "/admin/logs", label: "日志", icon: ListChecks },
  { href: "/admin/users", label: "用户", icon: Users },
  { href: "/admin/settings", label: "设置", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="后台导航"
      className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 flex-none items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors duration-200 md:w-full",
              active
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon size={16} className="shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
