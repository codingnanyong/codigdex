import { pathToFileURL } from 'node:url';

export function smokeTarget(value) {
  const url = new URL(value);
  const allowed = url.hostname === 'codigdex.vercel.app' || /^codigdex-[a-z0-9-]+-codingnanyongs-projects[.]vercel[.]app$/.test(url.hostname);
  if (url.protocol !== 'https:' || !allowed || url.username || url.password || url.port || url.search || url.hash || url.pathname !== '/') {
    throw new Error('Use a Codigdex production or team deployment HTTPS origin without credentials, path or query');
  }
  return url;
}

/** Never follow a redirect with the automation credential to another origin. */
export async function checkSmokeAccess(value, secret, fetcher = fetch) {
  const target = smokeTarget(value);
  let next = target;
  const headers = secret ? { 'x-vercel-protection-bypass': secret } : {};
  for (let count = 0; count < 5; count++) {
    const response = await fetcher(next, { headers, redirect: 'manual', signal: AbortSignal.timeout(15000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Deployment returned a redirect without Location');
      next = new URL(location, next);
      if (next.origin !== target.origin) throw new Error('Deployment protection redirected outside the deployment. Configure VERCEL_AUTOMATION_BYPASS_SECRET for an authorized preview.');
      continue;
    }
    if ([401, 403].includes(response.status)) throw new Error('Deployment access denied. Configure a valid VERCEL_AUTOMATION_BYPASS_SECRET for an authorized preview.');
    if (response.status !== 200) throw new Error(`Deployment home returned HTTP ${response.status}`);
    return;
  }
  throw new Error('Deployment redirect limit exceeded');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkSmokeAccess(process.env.PLAYWRIGHT_BASE_URL, process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
    console.log('Deployment access verified');
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
