import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const LINEAR_API_URL = "https://api.linear.app/graphql";
const NOTION_API_URL = "https://api.notion.com/v1";
const NOTION_VERSION = "2026-03-11";

function requireValue(value, name) {
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const responseBody = await response.text();
  let payload;
  try {
    payload = JSON.parse(responseBody);
  } catch {
    throw new Error(
      `${response.status} ${response.statusText}: expected JSON, received ${responseBody.slice(0, 500)}`
    );
  }
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${JSON.stringify(payload)}`);
  }
  return payload;
}

export function calculateCycleProgress(issues) {
  const scopedIssues = issues.filter(({ state }) => state?.type !== "canceled");
  const completed = scopedIssues.filter(({ state }) => state?.type === "completed").length;
  const total = scopedIssues.length;
  return { completed, total, progress: total === 0 ? 0 : completed / total };
}

export function statusForCycle({ progress, startsAt, endsAt }, now = new Date()) {
  if (progress >= 1) return "Completed";
  if (now < new Date(startsAt)) return "Planned";
  if (now > new Date(endsAt)) return "Delayed";
  return "In Progress";
}

export async function fetchCurrentLinearCycle({ apiKey, teamKey, projectName, now = new Date() }) {
  const cyclesQuery = `
    query CurrentTeamCycles($teamKey: String!) {
      teams(first: 1, filter: { key: { eq: $teamKey } }) {
        nodes {
          cycles(first: 50) {
            nodes {
              id
              number
              startsAt
              endsAt
            }
          }
        }
      }
    }
  `;
  const cyclesPayload = await requestJson(LINEAR_API_URL, {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ query: cyclesQuery, variables: { teamKey } }),
  });
  if (cyclesPayload.errors?.length) {
    throw new Error(`Linear API: ${JSON.stringify(cyclesPayload.errors)}`);
  }

  const cycles = cyclesPayload.data?.teams?.nodes?.[0]?.cycles?.nodes ?? [];
  const current = cycles.find(
    ({ startsAt, endsAt }) => new Date(startsAt) <= now && now <= new Date(endsAt)
  );
  if (!current) throw new Error(`No current Linear cycle found for team ${teamKey}`);

  const issuesQuery = `
    query CycleIssues($cycleId: String!, $projectName: String!) {
      cycle(id: $cycleId) {
        issues(first: 250, filter: { project: { name: { eq: $projectName } } }) {
          nodes { id state { type } }
          pageInfo { hasNextPage }
        }
      }
    }
  `;
  const issuesPayload = await requestJson(LINEAR_API_URL, {
    method: "POST",
    headers: { Authorization: apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: issuesQuery,
      variables: { cycleId: current.id, projectName },
    }),
  });
  if (issuesPayload.errors?.length) {
    throw new Error(`Linear API: ${JSON.stringify(issuesPayload.errors)}`);
  }

  const issues = issuesPayload.data?.cycle?.issues;
  if (!issues) throw new Error(`Linear cycle ${current.number} did not return issues`);
  if (issues.pageInfo?.hasNextPage) {
    throw new Error(`Linear cycle ${current.number} has more than 250 project issues`);
  }
  return { ...current, issues };
}

async function findNotionSprintPage({
  apiKey,
  dataSourceId,
  workspaceSlug,
  teamKey,
  cycleNumber,
}) {
  const cycleUrl = `https://linear.app/${workspaceSlug}/team/${teamKey}/cycle/${cycleNumber}`;
  const payload = await requestJson(`${NOTION_API_URL}/data_sources/${dataSourceId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      filter: { property: "Linear Cycle", url: { equals: cycleUrl } },
      page_size: 2,
    }),
  });
  if (payload.results.length === 0) {
    console.warn(`::warning::No Notion sprint found for ${cycleUrl}; skipping update`);
    return null;
  }
  if (payload.results.length > 1) {
    throw new Error(`Expected one Notion sprint for ${cycleUrl}, found ${payload.results.length}`);
  }
  return { pageId: payload.results[0].id, cycleUrl };
}

async function updateNotionSprint({ apiKey, pageId, progress, status, syncedAt }) {
  return requestJson(`${NOTION_API_URL}/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Notion-Version": NOTION_VERSION,
    },
    body: JSON.stringify({
      properties: {
        "Completion %": { number: progress },
        Status: { select: { name: status } },
        "Last Synced": { date: { start: syncedAt } },
        "Sync Status": { select: { name: "Ready" } },
      },
    }),
  });
}

export async function syncSprintProgress(env = process.env, now = new Date()) {
  const linearApiKey = requireValue(env.LINEAR_API_KEY, "LINEAR_API_KEY");
  const notionApiKey = requireValue(env.NOTION_API_KEY, "NOTION_API_KEY");
  const teamKey = requireValue(env.LINEAR_TEAM_KEY, "LINEAR_TEAM_KEY");
  const projectName = requireValue(env.LINEAR_PROJECT_NAME, "LINEAR_PROJECT_NAME");
  const workspaceSlug = requireValue(env.LINEAR_WORKSPACE_SLUG, "LINEAR_WORKSPACE_SLUG");
  const dataSourceId = requireValue(
    env.NOTION_SPRINT_DATA_SOURCE_ID,
    "NOTION_SPRINT_DATA_SOURCE_ID"
  );

  const cycle = await fetchCurrentLinearCycle({
    apiKey: linearApiKey,
    teamKey,
    projectName,
    now,
  });
  const progress = calculateCycleProgress(cycle.issues.nodes);
  const status = statusForCycle({ ...cycle, progress: progress.progress }, now);
  const sprint = await findNotionSprintPage({
    apiKey: notionApiKey,
    dataSourceId,
    workspaceSlug,
    teamKey,
    cycleNumber: cycle.number,
  });
  if (!sprint) {
    const result = { cycle: cycle.number, status, ...progress, skipped: true };
    writeOutputs(env.GITHUB_OUTPUT, result);
    return result;
  }
  await updateNotionSprint({
    apiKey: notionApiKey,
    pageId: sprint.pageId,
    progress: progress.progress,
    status,
    syncedAt: now.toISOString(),
  });

  const result = {
    cycle: cycle.number,
    status,
    ...progress,
    skipped: false,
    notionPageId: sprint.pageId,
  };
  writeOutputs(env.GITHUB_OUTPUT, result);
  return result;
}

function writeOutputs(outputPath, values) {
  if (!outputPath) return;
  appendFileSync(
    outputPath,
    Object.entries(values).map(([key, value]) => `${key}=${value}`).join("\n") + "\n"
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncSprintProgress()
    .then((result) => console.log(JSON.stringify(result)))
    .catch((error) => {
      console.error(error instanceof Error ? error.message : error);
      process.exitCode = 1;
    });
}
