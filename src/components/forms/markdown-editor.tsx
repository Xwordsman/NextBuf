"use client";

import { type ComponentProps, useDeferredValue, useRef, useState } from "react";
import {
  Bold,
  Code2,
  Eye,
  Heading1,
  Heading2,
  Heading3,
  Image,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  PencilLine,
  Quote,
  RemoveFormatting,
  SquareSplitHorizontal,
  Strikethrough,
  Table2,
} from "lucide-react";

import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type MarkdownMode = "edit" | "preview" | "split";

type MarkdownEditorProps = Omit<
  ComponentProps<"textarea">,
  "value" | "defaultValue" | "onChange"
> & {
  defaultValue?: string;
  density?: "regular" | "compact";
  toolbarClassName?: string;
  previewClassName?: string;
};

type SelectionRange = {
  start: number;
  end: number;
};

type SelectionContext = SelectionRange & {
  value: string;
  selected: string;
  lineStart: number;
  lineEnd: number;
};

function getCurrentLineRange(value: string, start: number, end: number) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const lineEndIndex = value.indexOf("\n", end);
  const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;

  return { lineStart, lineEnd };
}

function stripFormatting(text: string) {
  return text
    .split("\n")
    .map((line) =>
      line.replace(
        /^\s*(#{1,6}\s+|>\s+|[-*+]\s+|\d+\.\s+)/,
        "",
      ),
    )
    .join("\n")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/~~(.*?)~~/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

function ToolbarButton({
  label,
  icon: Icon,
  onClick,
  disabled = false,
}: {
  label: string;
  icon: typeof Bold;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="icon-xs"
      variant="ghost"
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      aria-label={label}
      title={label}
      className="rounded-md"
    >
      <Icon size={14} />
    </Button>
  );
}

export function MarkdownEditor({
  defaultValue = "",
  density = "regular",
  toolbarClassName,
  previewClassName,
  className,
  rows,
  ...textareaProps
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<MarkdownMode>("split");
  const [content, setContent] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pendingSelectionRef = useRef<SelectionRange | null>(null);
  const deferredContent = useDeferredValue(content);
  const isCompact = density === "compact";
  const editorMinHeightClassName = isCompact ? "min-h-[220px]" : "min-h-[420px]";
  const previewMaxHeightClassName = isCompact ? "max-h-[360px]" : "max-h-[70vh]";
  const resolvedRows = rows ?? (isCompact ? 8 : 14);

  const focusSelection = (selection: SelectionRange) => {
    pendingSelectionRef.current = selection;
    window.requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      const pending = pendingSelectionRef.current;

      if (!textarea || !pending) {
        return;
      }

      textarea.focus();
      textarea.setSelectionRange(pending.start, pending.end);
      pendingSelectionRef.current = null;
    });
  };

  const commitChange = (
    nextValue: string,
    selectionStart?: number,
    selectionEnd?: number,
  ) => {
    setContent(nextValue);

    if (
      typeof selectionStart === "number" &&
      typeof selectionEnd === "number"
    ) {
      focusSelection({ start: selectionStart, end: selectionEnd });
    }
  };

  const withSelection = (
    transform: (args: SelectionContext) => {
      nextValue: string;
      selectionStart: number;
      selectionEnd: number;
    } | null,
  ) => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? start;
    const { lineStart, lineEnd } = getCurrentLineRange(content, start, end);

    const result = transform({
      value: content,
      start,
      end,
      selected: content.slice(start, end),
      lineStart,
      lineEnd,
    });

    if (!result) {
      return;
    }

    commitChange(result.nextValue, result.selectionStart, result.selectionEnd);
  };

  const createWrapSelection = (
    before: string,
    after = before,
    placeholder = "内容",
  ) =>
    ({ value, start, end, selected }: SelectionContext) => {
      const inner = selected || placeholder;
      const nextValue =
        value.slice(0, start) + before + inner + after + value.slice(end);

      return {
        nextValue,
        selectionStart: start + before.length,
        selectionEnd: start + before.length + inner.length,
      };
    };

  const wrapSelection = (before: string, after = before, placeholder = "内容") =>
    withSelection(createWrapSelection(before, after, placeholder));

  const insertAtCursor = (snippet: string, cursorOffset?: number) =>
    withSelection(({ value, start, end }) => {
      const nextValue = value.slice(0, start) + snippet + value.slice(end);
      const cursor = start + (cursorOffset ?? snippet.length);

      return {
        nextValue,
        selectionStart: cursor,
        selectionEnd: cursor,
      };
    });

  const prefixLines = (
    prefix: string,
    placeholder = "内容",
    options?: { numbered?: boolean },
  ) =>
    withSelection(({ value, start, end, selected, lineStart, lineEnd }) => {
      const target = selected || value.slice(lineStart, lineEnd);
      const lines = target.split("\n");
      const nextBlock = target
        ? lines
            .map((line, index) => {
              if (options?.numbered) {
                return `${index + 1}. ${line || placeholder}`;
              }

              return `${prefix}${line || placeholder}`;
            })
            .join("\n")
        : `${options?.numbered ? "1. " : prefix}${placeholder}`;

      const replaceStart = selected ? start : lineStart;
      const replaceEnd = selected ? end : lineEnd;
      const nextValue =
        value.slice(0, replaceStart) + nextBlock + value.slice(replaceEnd);

      return {
        nextValue,
        selectionStart: replaceStart + (options?.numbered ? 3 : prefix.length),
        selectionEnd: replaceStart + nextBlock.length,
      };
    });

  const removeAllFormatting = () =>
    withSelection(({ value, start, end, selected, lineStart, lineEnd }) => {
      const hasSelection = Boolean(selected);
      const targetStart = hasSelection ? start : lineStart;
      const targetEnd = hasSelection ? end : lineEnd;
      const target = value.slice(targetStart, targetEnd);
      const nextBlock = stripFormatting(target);

      if (!target) {
        return null;
      }

      const nextValue =
        value.slice(0, targetStart) + nextBlock + value.slice(targetEnd);

      return {
        nextValue,
        selectionStart: targetStart,
        selectionEnd: targetStart + nextBlock.length,
      };
    });

  const insertLink = () =>
    wrapSelection("[", "](https://nextbuf.com)", "链接文本");

  const insertImage = () =>
    wrapSelection("![", "](https://nextbuf.com/image.png)", "图片说明");

  const insertCode = () =>
    withSelection(({ value, start, end, selected }) => {
      if (selected.includes("\n")) {
        const snippet = `\n\`\`\`\n${selected}\n\`\`\`\n`;
        const nextValue =
          value.slice(0, start) + snippet + value.slice(end);

        return {
          nextValue,
          selectionStart: start + 5,
          selectionEnd: start + 5 + selected.length,
        };
      }

      return createWrapSelection("`", "`", "代码")({
        value,
        start,
        end,
        selected,
        lineStart: start,
        lineEnd: end,
      });
    });

  const insertCodeBlock = () =>
    withSelection(({ value, start, end, selected }) => {
      const block = `\n\`\`\`\n${selected || ""}\n\`\`\`\n`;
      const nextValue = value.slice(0, start) + block + value.slice(end);
      const cursor = start + 5;

      return {
        nextValue,
        selectionStart: cursor,
        selectionEnd: cursor + (selected ? selected.length : 0),
      };
    });

  const insertDivider = () =>
    insertAtCursor("\n\n---\n\n", 2);

  const insertTable = () =>
    insertAtCursor(
      "\n| 标题 1 | 标题 2 |\n| --- | --- |\n| 内容 1 | 内容 2 |\n",
      1,
    );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-control)] border border-input bg-panel",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-2 border-b border-border px-3 py-2",
          toolbarClassName,
        )}
      >
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-1">
            <ToolbarButton
              label="加粗"
              icon={Bold}
              onClick={() => wrapSelection("**")}
            />
            <ToolbarButton
              label="斜体"
              icon={Italic}
              onClick={() => wrapSelection("*")}
            />
            <ToolbarButton
              label="删除线"
              icon={Strikethrough}
              onClick={() => wrapSelection("~~")}
            />
            <ToolbarButton
              label="行内代码"
              icon={Code2}
              onClick={insertCode}
            />
          </div>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <div className="flex items-center gap-1">
            <ToolbarButton
              label="引用"
              icon={Quote}
              onClick={() => prefixLines("> ")}
            />
            <ToolbarButton
              label="一级标题"
              icon={Heading1}
              onClick={() => prefixLines("# ", "标题")}
            />
            <ToolbarButton
              label="二级标题"
              icon={Heading2}
              onClick={() => prefixLines("## ", "标题")}
            />
            <ToolbarButton
              label="三级标题"
              icon={Heading3}
              onClick={() => prefixLines("### ", "标题")}
            />
          </div>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <div className="flex items-center gap-1">
            <ToolbarButton
              label="无序列表"
              icon={List}
              onClick={() => prefixLines("- ")}
            />
            <ToolbarButton
              label="有序列表"
              icon={ListOrdered}
              onClick={() => prefixLines("1. ", "列表项", { numbered: true })}
            />
            <ToolbarButton label="表格" icon={Table2} onClick={insertTable} />
            <ToolbarButton
              label="分割线"
              icon={Minus}
              onClick={insertDivider}
            />
          </div>
          <Separator orientation="vertical" className="mx-1 h-5" />
          <div className="flex items-center gap-1">
            <ToolbarButton label="链接" icon={Link2} onClick={insertLink} />
            <ToolbarButton label="图片" icon={Image} onClick={insertImage} />
            <ToolbarButton
              label="代码块"
              icon={PencilLine}
              onClick={insertCodeBlock}
            />
            <ToolbarButton
              label="清除格式"
              icon={RemoveFormatting}
              onClick={removeAllFormatting}
            />
          </div>
        </div>

        <div className="ml-auto">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as MarkdownMode)}
            className="w-auto"
          >
            <TabsList variant="line" className="bg-transparent p-0">
              <TabsTrigger value="edit" className="min-w-16">
                <PencilLine size={14} />
                写作
              </TabsTrigger>
              <TabsTrigger value="preview" className="min-w-16">
                <Eye size={14} />
                预览
              </TabsTrigger>
              <TabsTrigger value="split" className="min-w-16">
                <SquareSplitHorizontal size={14} />
                分屏
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div
        className={cn(
          "grid",
          editorMinHeightClassName,
          mode === "split" ? "gap-0 lg:grid-cols-2" : "grid-cols-1",
        )}
      >
        <div
          className={cn(
            editorMinHeightClassName,
            mode === "split"
              ? "border-b border-border lg:border-b-0 lg:border-r"
              : mode === "preview"
                ? "hidden"
                : "",
          )}
        >
          <textarea
            ref={textareaRef}
            rows={resolvedRows}
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
            }}
            onKeyDown={(event) => {
              if (!(event.metaKey || event.ctrlKey)) {
                return;
              }

              const key = event.key.toLowerCase();

              if (key === "b") {
                event.preventDefault();
                wrapSelection("**");
              }

              if (key === "i") {
                event.preventDefault();
                wrapSelection("*");
              }

              if (key === "k") {
                event.preventDefault();
                insertLink();
              }

              if (key === "e") {
                event.preventDefault();
                insertCode();
              }
            }}
            className={cn(
              "w-full resize-y border-0 bg-transparent px-4 py-4 font-mono text-[13px] leading-6 text-foreground outline-none placeholder:text-muted-foreground focus-visible:outline-none",
              editorMinHeightClassName,
              mode === "split"
                ? "rounded-none"
                : "rounded-b-[var(--radius-control)]",
            )}
            placeholder="支持 Markdown 语法"
            {...textareaProps}
          />
        </div>

        <div
          className={cn(
            "bg-panel",
            editorMinHeightClassName,
            mode === "edit" ? "hidden" : "",
            previewClassName,
          )}
        >
          <div className={cn("overflow-auto px-4 py-4", previewMaxHeightClassName)}>
            <MarkdownContent content={deferredContent} compact />
          </div>
        </div>
      </div>
    </div>
  );
}
