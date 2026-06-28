import "server-only";

import { cache } from "react";

type RequestMetrics = {
  startedAt: number;
  sqlCount: number;
};

const getRequestMetrics = cache(
  (): RequestMetrics => ({
    startedAt: performance.now(),
    sqlCount: 0,
  }),
);

export function recordSqlQuery() {
  getRequestMetrics().sqlCount += 1;
}

export function getRequestMetricsSnapshot() {
  const metrics = getRequestMetrics();

  return {
    elapsedSeconds: Math.max(0, (performance.now() - metrics.startedAt) / 1000),
    sqlCount: metrics.sqlCount,
  };
}
