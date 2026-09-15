$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$monsterRoot = Join-Path $repoRoot "packages/game-assets/files/monsters"
$processor = Join-Path $PSScriptRoot "prepare-pixel-specimens.ps1"

$families = @(
  @{ Folder = "ch03.html-css"; Prefix = "html-css"; Names = @("structure-sprout", "style-shell", "cascade-weaver", "breakpoint-knight", "responsive-layout-paladin") },
  @{ Folder = "ch04.javascript"; Prefix = "javascript"; Names = @("script-spark", "callback-fox", "event-spark", "promise-seer", "async-oracle") },
  @{ Folder = "ch05.http-api"; Prefix = "http-api"; Names = @("message-pair", "endpoint-messengers", "request-courier", "portal-wardens", "gateway-guardian") },
  @{ Folder = "ch06.python"; Prefix = "python"; Names = @("script-snake", "library-coil", "data-coil", "automation-engine", "automation-seraph") },
  @{ Folder = "ch07.sql"; Prefix = "sql"; Names = @("query-mole", "table-keeper", "join-mason", "schema-warden", "transaction-archivist") },
  @{ Folder = "ch08.network"; Prefix = "network"; Names = @("packet-crab", "router-weaver", "packet-relay", "network-orchestrator", "protocol-nexus") },
  @{ Folder = "ch09.testing"; Prefix = "testing"; Names = @("check-scout", "case-inspector", "assertion-hound", "suite-guardian", "regression-sentinel") },
  @{ Folder = "ch10.security-auth"; Prefix = "security-auth"; Names = @("key-scale", "identity-keeper", "identity-keywarden", "access-bastion", "zero-trust-bastion") },
  @{ Folder = "ch11.docker"; Prefix = "docker"; Names = @("image-whale", "container-tug", "container-carrier", "registry-carrier", "harbor-leviathan") },
  @{ Folder = "ch12.cicd"; Prefix = "cicd"; Names = @("build-runner", "test-relay", "pipeline-relay", "deployment-conductor", "release-conductor") },
  @{ Folder = "ch13.kubernetes"; Prefix = "kubernetes"; Names = @("pod-cadet", "cluster-pilot", "pod-helmsman", "fleet-commander", "cluster-admiral") },
  @{ Folder = "ch14.cloud-iac"; Prefix = "cloud-iac"; Names = @("resource-cloud", "plan-builder", "blueprint-builder", "infrastructure-architect", "infrastructure-titan") },
  @{ Folder = "ch15.monitoring"; Prefix = "monitoring"; Names = @("signal-owlet", "alert-scout", "metric-watcher", "telemetry-seer", "observability-oracle") },
  @{ Folder = "ch16.react"; Prefix = "react"; Names = @("state-sprout", "prop-pair", "component-weaver", "hook-conductor", "component-architect") },
  @{ Folder = "ch17.server-framework"; Prefix = "server-framework"; Names = @("route-scout", "middleware-pair", "controller-warden", "framework-orchestrator", "service-guardian") },
  @{ Folder = "ch18.data-pipeline"; Prefix = "data-pipeline"; Names = @("droplet-runner", "stream-courier", "transform-engineer", "pipeline-conductor", "flow-architect") },
  @{ Folder = "ch19.orchestration"; Prefix = "workflow-orchestration"; Names = @("task-spinner", "dependency-linker", "retry-weaver", "schedule-conductor", "workflow-maestro") },
  @{ Folder = "ch20.statistics"; Prefix = "statistics"; Names = @("sample-owl", "probability-reader", "distribution-scholar", "variance-oracle", "inference-guardian") },
  @{ Folder = "ch21.visualization"; Prefix = "visualization"; Names = @("bar-chameleon", "chart-caster", "plot-artisan", "dashboard-storyteller", "insight-prism") },
  @{ Folder = "ch22.bi-tools"; Prefix = "bi-tools"; Names = @("metric-firefly", "report-scout", "dashboard-keeper", "kpi-oracle", "decision-guardian") }
)

foreach ($family in $families) {
  $directory = Join-Path $monsterRoot $family.Folder
  $outputNames = @(
    "$($family.Names[0])-lv1",
    "$($family.Names[1])-lv2",
    "_unused-$($family.Prefix)",
    "$($family.Names[2])-lv3",
    "$($family.Names[3])-lv4",
    "$($family.Names[4])-lv5"
  )
  & $processor `
    -InputPath (Join-Path $directory "$($family.Prefix)-evolution-sheet-v1.png") `
    -OutputDirectory $directory `
    -Columns 3 `
    -Rows 2 `
    -Names $outputNames
}
