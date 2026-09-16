$ErrorActionPreference = "Stop"

$packageRoot = Split-Path -Parent $PSScriptRoot
$monsterRoot = Join-Path $packageRoot "files/monsters"

$copies = @(
  @{ Folder = "ch07.sql"; Source = "table-keeper-lv2-v2.png"; Target = "query-mole-lv1-v2.png" },
  @{ Folder = "ch07.sql"; Source = "query-mole-lv1.png"; Target = "table-keeper-lv2-v3.png" },
  @{ Folder = "ch13.kubernetes"; Source = "cluster-pilot-lv2.png"; Target = "pod-cadet-lv1-v2.png" },
  @{ Folder = "ch13.kubernetes"; Source = "pod-cadet-lv1.png"; Target = "cluster-pilot-lv2-v2.png" },
  @{ Folder = "ch14.cloud-iac"; Source = "plan-builder-lv2.png"; Target = "resource-cloud-lv1-v2.png" },
  @{ Folder = "ch14.cloud-iac"; Source = "resource-cloud-lv1.png"; Target = "plan-builder-lv2-v2.png" },
  @{ Folder = "ch16.react"; Source = "prop-pair-lv2.png"; Target = "state-sprout-lv1-v2.png" },
  @{ Folder = "ch16.react"; Source = "state-sprout-lv1.png"; Target = "prop-pair-lv2-v2.png" },
  @{ Folder = "ch19.orchestration"; Source = "schedule-conductor-lv4-v2.png"; Target = "schedule-conductor-lv4-v3.png" }
)

foreach ($copy in $copies) {
  $directory = Join-Path $monsterRoot $copy.Folder
  Copy-Item `
    -LiteralPath (Join-Path $directory $copy.Source) `
    -Destination (Join-Path $directory $copy.Target) `
    -Force
}

Write-Output "Wrote $($copies.Count) corrected monster-order assets."
