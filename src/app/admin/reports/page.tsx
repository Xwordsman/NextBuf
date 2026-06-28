import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { handleReportAction } from "@/server/actions/admin";
import { getAdminReports } from "@/server/queries";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const reasonLabels: Record<string, string> = {
  spam: "垃圾广告",
  abuse: "攻击辱骂",
  illegal: "违法违规",
  off_topic: "偏离主题",
  other: "其他",
};

export default async function AdminReportsPage() {
  const reports = await getAdminReports();

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold">举报队列</h2>
        <p className="mt-1 text-sm text-muted">
          优先处理未决举报，必要时可直接隐藏相关内容。
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.length === 0 ? (
          <div className="rounded-[var(--radius-control)] border border-border p-6 text-center text-sm text-muted">
            暂时没有举报。
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.id}
              className="rounded-[var(--radius-control)] border border-border p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={report.status === "pending" ? "danger" : "muted"}>
                      {report.status}
                    </Badge>
                    <Badge tone="muted">{report.targetType}</Badge>
                    <span className="text-sm font-medium">
                      {reasonLabels[report.reason] ?? report.reason}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    举报人 {report.reporterUsername} · {formatDateTime(report.createdAt)}
                  </p>
                  <p className="mt-2 text-sm">
                    {report.targetType === "post"
                      ? report.postTitle ?? "主题已不可见"
                      : report.replyContent ?? "回复已不可见"}
                  </p>
                  {report.detail ? (
                    <p className="mt-2 rounded-[var(--radius-control)] bg-panel-muted p-3 text-sm text-muted">
                      {report.detail}
                    </p>
                  ) : null}
                  {report.postId ? (
                    <Link
                      href={`/posts/${report.postId}`}
                      className="mt-2 inline-flex text-sm font-medium text-primary hover:text-primary/80"
                    >
                      查看上下文
                    </Link>
                  ) : null}
                </div>

                {report.status === "pending" ? (
                  <div className="flex flex-wrap gap-2">
                    <ReportAction id={report.id} resolution="hide" label="隐藏内容" />
                    <ReportAction id={report.id} resolution="resolve" label="标记解决" />
                    <ReportAction id={report.id} resolution="ignore" label="忽略" />
                  </div>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function ReportAction({
  id,
  resolution,
  label,
}: {
  id: string;
  resolution: "hide" | "ignore" | "resolve";
  label: string;
}) {
  return (
    <form action={handleReportAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="resolution" value={resolution} />
      <Button
        type="submit"
        size="sm"
        variant={resolution === "hide" ? "danger" : "secondary"}
      >
        {label}
      </Button>
    </form>
  );
}
