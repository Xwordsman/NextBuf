import { existsSync } from "fs";
import { join } from "path";

const requiredPaths = [
  "src/app/install/page.tsx",
  "src/app/admin/page.tsx",
  "src/db/schema.ts",
  "drizzle/0000_woozy_slyde.sql",
  "Dockerfile",
  "docker-compose.yml",
  ".github/workflows/docker.yml",
];

const missing = requiredPaths.filter((path) => !existsSync(join(process.cwd(), path)));

if (missing.length > 0) {
  console.error("Missing required files:");
  for (const path of missing) {
    console.error(`- ${path}`);
  }
  process.exit(1);
}

console.log("NextBuf smoke check passed.");
