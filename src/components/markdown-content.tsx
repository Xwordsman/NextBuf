"use client";

import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  content: string;
  className?: string;
  compact?: boolean;
};

const components: Components = {
  a({ href, children, ...props }) {
    if (!href) {
      return <span>{children}</span>;
    }

    const isInternal = href.startsWith("/") || href.startsWith("#");
    const className =
      "font-medium text-foreground underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-muted-foreground hover:decoration-foreground";

    if (isInternal) {
      return (
        <Link href={href} className={className}>
          {children}
        </Link>
      );
    }

    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </a>
    );
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote
        className="my-3 border-l-2 border-border bg-muted/45 px-3 py-2 text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  code({ children, className, ...props }) {
    const text = String(children);
    const isBlock = Boolean(className?.includes("language-") || text.includes("\n"));

    if (isBlock) {
      return (
        <code
          className={cn(
            "block whitespace-pre-wrap font-mono text-[13px] leading-6 text-foreground",
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <code
        className={cn(
          "rounded-[var(--radius-control)] bg-muted px-1.5 py-0.5 font-mono text-[0.92em]",
          className,
        )}
        {...props}
      >
        {children}
      </code>
    );
  },
  h1({ children, ...props }) {
    return (
      <h2 className="mt-6 mb-3 text-xl font-semibold leading-7" {...props}>
        {children}
      </h2>
    );
  },
  h2({ children, ...props }) {
    return (
      <h3 className="mt-5 mb-2 text-lg font-semibold leading-7" {...props}>
        {children}
      </h3>
    );
  },
  h3({ children, ...props }) {
    return (
      <h4 className="mt-4 mb-2 text-base font-semibold leading-6" {...props}>
        {children}
      </h4>
    );
  },
  hr(props) {
    return <hr className="my-5 border-border" {...props} />;
  },
  img({ alt, ...props }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt ?? ""}
        className="my-4 max-h-[520px] max-w-full rounded-[var(--radius-base)] border border-border object-contain"
        loading="lazy"
        {...props}
      />
    );
  },
  li({ children, ...props }) {
    return (
      <li className="pl-1" {...props}>
        {children}
      </li>
    );
  },
  ol({ children, ...props }) {
    return (
      <ol className="my-3 list-decimal space-y-1 pl-6" {...props}>
        {children}
      </ol>
    );
  },
  p({ children, ...props }) {
    return (
      <p className="my-3 first:mt-0 last:mb-0" {...props}>
        {children}
      </p>
    );
  },
  pre({ children, ...props }) {
    return (
      <pre
        className="my-4 overflow-x-auto rounded-[var(--radius-base)] border border-border bg-muted p-3 text-[13px] leading-6"
        {...props}
      >
        {children}
      </pre>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="my-4 overflow-x-auto rounded-[var(--radius-base)] border border-border">
        <table className="w-full min-w-max border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    );
  },
  td({ children, ...props }) {
    return (
      <td className="border-t border-border px-3 py-2 align-top" {...props}>
        {children}
      </td>
    );
  },
  th({ children, ...props }) {
    return (
      <th className="bg-muted px-3 py-2 text-left font-medium" {...props}>
        {children}
      </th>
    );
  },
  ul({ children, ...props }) {
    return (
      <ul className="my-3 list-disc space-y-1 pl-6" {...props}>
        {children}
      </ul>
    );
  },
};

export function MarkdownContent({
  content,
  className,
  compact = false,
}: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "content-body min-w-0 break-words text-foreground",
        compact ? "text-sm leading-7" : "text-[15px] leading-7",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
