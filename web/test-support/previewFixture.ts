import { test as base, expect } from "@playwright/test";

/** Bootstrap the authorized deployment cookie once, rather than attach the secret
 * to every browser request. Tracing is disabled for authenticated runs in config. */
export const test = base.extend<{ authorizedPreview: void }>({
  authorizedPreview: [async ({ context, baseURL }, use) => {
    const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (secret) {
      const url = new URL(baseURL!);
      const allowed = url.hostname === "codigdex.vercel.app" || /^codigdex-[a-z0-9-]+-codingnanyongs-projects[.]vercel[.]app$/.test(url.hostname);
      if (url.protocol !== "https:" || !allowed || url.username || url.password || url.port || url.search || url.hash || url.pathname !== "/") throw new Error("Invalid protected preview origin");
      const response = await context.request.get(url.origin, { headers: { "x-vercel-protection-bypass": secret, "x-vercel-set-bypass-cookie": "true" }, maxRedirects: 0 });
      if ([401, 403].includes(response.status())) throw new Error("Preview automation credential was rejected");
      const location = response.headers().location;
      if (location && new URL(location, url).origin !== url.origin) throw new Error("Protected preview redirected outside the deployment");
      await response.dispose();
    }
    await use();
  }, { auto: true }],
});
export { expect };
