import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

import { getCurrentUser } from "@/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/png", ".png"],
  ["image/jpeg", ".jpg"],
  ["image/gif", ".gif"],
  ["image/webp", ".webp"],
]);

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "请先登录后再上传图片。" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "请选择要上传的图片。" }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);

  if (!extension) {
    return NextResponse.json(
      { error: "仅支持 PNG、JPG、GIF、WebP 图片。" },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json({ error: "图片不能超过 5MB。" }, { status: 400 });
  }

  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const filename = `${randomUUID()}${extension}`;
  const uploadDir = join(process.cwd(), "public", "uploads", year, month);

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({
    url: `/uploads/${year}/${month}/${filename}`,
  });
}
