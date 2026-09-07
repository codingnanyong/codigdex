import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // AGENTS.md is this repo's own agent policy file (see root AGENTS.md /
  // CLAUDE.md) — don't let `next dev`/`next build` append Next.js's
  // generated agent-rules block into it.
  agentRules: false,
  // Next dev blocks cross-origin requests to dev-only resources (HMR, RSC)
  // by default; 127.0.0.1 counts as cross-origin from localhost.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
