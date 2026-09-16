$ErrorActionPreference = "Stop"

$packageRoot = Split-Path -Parent $PSScriptRoot
$monsterRoot = Join-Path $packageRoot "files/monsters"
$normalizer = Join-Path $PSScriptRoot "normalize-monster-sprite.ps1"

$assets = @(
  @{ Folder = "ch01.git"; Source = "branch-merge-twins-lv2.png"; Target = "branch-merge-twins-lv2-v2.png" },
  @{ Folder = "ch02.linux"; Source = "permission-guard-lv3.png"; Target = "permission-guard-lv3-v2.png" },
  @{ Folder = "ch02.linux"; Source = "pipe-process-engineer-lv4.png"; Target = "pipe-process-engineer-lv4-v2.png" },
  @{ Folder = "ch02.linux"; Source = "kernel-guardian-lv5.png"; Target = "kernel-guardian-lv5-v2.png" }
)

foreach ($asset in $assets) {
  $directory = Join-Path $monsterRoot $asset.Folder
  & $normalizer `
    -InputPath (Join-Path $directory $asset.Source) `
    -OutputPath (Join-Path $directory $asset.Target) `
    -SafeMargin 20
}
