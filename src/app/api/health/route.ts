import { sql } from "@/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await sql`select 1`;

    return Response.json({
      ok: true,
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        database: "error",
        message: error instanceof Error ? error.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
