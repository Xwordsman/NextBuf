import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Network,
  Settings,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/nodes", label: "节点", icon: Network },
  { href: "/admin/posts", label: "帖子", icon: FileText },
  { href: "/admin/replies", label: "回复", icon: MessageSquare },
  { href: "/admin/users", label: "用户", icon: Users },
  { href: "/admin/settings", label: "设置", icon: Settings },
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-control)] border border-border bg-panel px-3 py-2 text-sm text-muted transition-colors duration-200 hover:border-primary/40 hover:text-foreground"
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
