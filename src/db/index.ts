import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgres://nextbuf:nextbuf@localhost:5432/nextbuf";

type Database = PostgresJsDatabase<typeof schema>;

declare global {
  var nextbufSql: postgres.Sql | undefined;
  var nextbufDb: Database | undefined;
}

const sql =
  globalThis.nextbufSql ??
  postgres(databaseUrl, {
    max: Number(process.env.DATABASE_MAX_CONNECTIONS ?? 10),
    prepare: false,
  });

export const db: Database =
  globalThis.nextbufDb ?? drizzle(sql, { schema, casing: "snake_case" });

if (process.env.NODE_ENV !== "production") {
  globalThis.nextbufSql = sql;
  globalThis.nextbufDb = db;
}

export { sql };
