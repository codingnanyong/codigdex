"""Find or create the Linear issue associated with a feature branch."""

from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from typing import Any

LINEAR_API_URL = "https://api.linear.app/graphql"


def graphql(query: str, variables: dict | None = None) -> dict:
    request = urllib.request.Request(
        LINEAR_API_URL,
        data=json.dumps({"query": query, "variables": variables or {}}).encode(),
        headers={
            "Authorization": os.environ["LINEAR_API_KEY"],
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        details = exc.read().decode(errors="replace")
        raise SystemExit(f"Linear HTTP error: {exc}; response={details}") from exc


def data_or_die(body: dict) -> dict:
    if body.get("errors"):
        raise SystemExit(f"Linear API errors: {body['errors']}")
    data = body.get("data")
    if not data:
        raise SystemExit(f"Linear API returned no data: {body}")
    return data


def select_project(nodes: list[dict[str, Any]], slug: str, name: str) -> dict[str, Any]:
    for node in nodes:
        if node.get("slugId") == slug or node.get("id") == slug:
            return node
    matches = [node for node in nodes if node.get("name") == name]
    if len(matches) == 1:
        return matches[0]
    raise SystemExit(
        f"Linear project was not found for slug={slug!r} name={name!r}; "
        f"candidates={[node.get('name') for node in nodes]}"
    )


def validate_issue(issue: dict[str, Any], team_id: str, project_id: str) -> None:
    if (issue.get("team") or {}).get("id") != team_id:
        raise SystemExit(f"Linear issue {issue['identifier']} is not in the configured team")
    if (issue.get("project") or {}).get("id") != project_id:
        raise SystemExit(f"Linear issue {issue['identifier']} is not in the configured project")
    if (issue.get("state") or {}).get("type") in {"completed", "canceled"}:
        state_name = (issue.get("state") or {}).get("name", "closed")
        raise SystemExit(f"Linear issue {issue['identifier']} is already {state_name}")


def main() -> None:
    title = os.environ["LINEAR_ISSUE_TITLE"].strip()
    team_key = os.environ.get("LINEAR_TEAM_KEY", "COD")
    project_slug = os.environ["LINEAR_PROJECT_SLUG"]
    project_name = os.environ["LINEAR_PROJECT_NAME"]
    automation_key = os.environ["LINEAR_AUTOMATION_KEY"].strip()
    existing_identifier = os.environ.get("LINEAR_EXISTING_IDENTIFIER", "").strip()
    source_branch = os.environ["SOURCE_BRANCH"].strip()
    marker = f"Automation-Key: {automation_key}"

    teams = data_or_die(
        graphql(
            "query($key: String!) { teams(filter: { key: { eq: $key } }) { nodes { id key } } }",
            {"key": team_key},
        )
    )["teams"]["nodes"]
    if len(teams) != 1:
        raise SystemExit(f"Expected one Linear team for {team_key}, found {len(teams)}")
    team = teams[0]

    projects = data_or_die(
        graphql(
            """
            query($slug: String!) {
              projects(filter: { slugId: { eq: $slug } }) { nodes { id name slugId url } }
            }
            """,
            {"slug": project_slug},
        )
    )["projects"]["nodes"]
    if not projects:
        projects = data_or_die(
            graphql(
                """
                query($name: String!) {
                  projects(filter: { name: { eq: $name } }) { nodes { id name slugId url } }
                }
                """,
                {"name": project_name},
            )
        )["projects"]["nodes"]
    project = select_project(projects, project_slug, project_name)

    fields = """
      id identifier url title description
      team { id key }
      project { id name url }
      state { id name type }
    """
    issue: dict[str, Any] | None = None
    action = "reused"

    if existing_identifier:
        issue = data_or_die(
            graphql(
                f"query($id: String!) {{ issue(id: $id) {{ {fields} }} }}",
                {"id": existing_identifier},
            )
        ).get("issue")
        if not issue:
            raise SystemExit(f"Linear issue {existing_identifier} was not found")
    else:
        candidates = data_or_die(
            graphql(
                f"""
                query($marker: String!) {{
                  issues(first: 50, filter: {{ description: {{ contains: $marker }} }}) {{
                    nodes {{ {fields} }}
                  }}
                }}
                """,
                {"marker": marker},
            )
        )["issues"]["nodes"]
        matches = [
            candidate
            for candidate in candidates
            if marker in (candidate.get("description") or "")
            and (candidate.get("team") or {}).get("id") == team["id"]
        ]
        if len(matches) > 1:
            identifiers = [candidate["identifier"] for candidate in matches]
            raise SystemExit(f"Multiple Linear issues use {automation_key}: {identifiers}")
        if matches:
            issue = matches[0]

    if issue:
        validate_issue(issue, team["id"], project["id"])
    else:
        description = (
            "Automatically created before the draft pull request.\n\n"
            f"Source branch: `{source_branch}`\n\n"
            f"{marker}"
        )
        created = data_or_die(
            graphql(
                f"""
                mutation($input: IssueCreateInput!) {{
                  issueCreate(input: $input) {{
                    success
                    issue {{ {fields} }}
                  }}
                }}
                """,
                {
                    "input": {
                        "teamId": team["id"],
                        "projectId": project["id"],
                        "title": title,
                        "description": description,
                    }
                },
            )
        )["issueCreate"]
        if not created["success"] or not created["issue"]:
            raise SystemExit(f"Linear issueCreate failed: {created}")
        issue = created["issue"]
        validate_issue(issue, team["id"], project["id"])
        action = "created"

    print(
        json.dumps(
            {
                "action": action,
                "identifier": issue["identifier"],
                "url": issue["url"],
                "title": issue["title"],
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    sys.exit(main())
