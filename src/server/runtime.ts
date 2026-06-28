import "server-only";

import packageJson from "../../package.json";

export function getRuntimeInfo() {
  return {
    app: "nextbuf",
    version: packageJson.version,
    nodeEnv: process.env.NODE_ENV ?? "development",
    deploymentVersion: process.env.DEPLOYMENT_VERSION ?? "local",
    commit: process.env.NEXTBUF_COMMIT ?? null,
    buildTime: process.env.NEXTBUF_BUILD_TIME ?? null,
  };
}
