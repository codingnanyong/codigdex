$ErrorActionPreference = "Stop"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '../../..')).Path
Push-Location -LiteralPath $repositoryRoot
try {
  & node (Join-Path $repositoryRoot 'node_modules/tsx/dist/cli.mjs') (Join-Path $repositoryRoot 'scripts/generate-dex-art-archive.mts')
  if ($LASTEXITCODE -ne 0) { throw 'Canonical dex archive generation failed.' }
} finally {
  Pop-Location
}
