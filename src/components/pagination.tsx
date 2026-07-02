import Link from "next/link";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  query?: Record<string, string | number | undefined>;
};

export function Pagination({ basePath, page, totalPages, query = {} }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const createHref = (targetPage: number) => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== "") {
        params.set(key, String(value));
      }
    }

    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  };

  const previousPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);

  return (
    <nav
      aria-label="分页"
      className="mt-4 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Button asChild size="sm" variant="secondary">
          <Link href={createHref(previousPage)}>上一页</Link>
        </Button>
      ) : (
        <Button size="sm" variant="secondary" disabled>
          上一页
        </Button>
      )}
      <span className="inline-flex h-8 items-center rounded-[var(--radius-control)] border border-border px-3 text-xs text-muted-foreground">
        第 {page} / {totalPages} 页
      </span>
      {page < totalPages ? (
        <Button asChild size="sm" variant="secondary">
          <Link href={createHref(nextPage)}>下一页</Link>
        </Button>
      ) : (
        <Button size="sm" variant="secondary" disabled>
          下一页
        </Button>
      )}
    </nav>
  );
}
