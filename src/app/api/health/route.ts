import { sql } from "@/db";
import { getRuntimeInfo } from "@/server/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime = getRuntimeInfo();

  try {
    await sql`select 1`;

    return Response.json({
      ok: true,
      database: "ok",
      runtime,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: "error",
        runtime,
        message: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
