param([string]$NodeDirectory = '')
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$repository = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$destination = [IO.Path]::GetFullPath((Join-Path $repository 'mobile/.tmp-qa/codigdex-sprint04.zip'))
if (-not $destination.StartsWith($repository + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid artifact path' }
[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($destination)) | Out-Null
$files = @(& git -C $repository ls-files --cached --others --exclude-standard)
if ($LASTEXITCODE -ne 0) { throw 'Could not list source files' }
$stream = [IO.File]::Open($destination, [IO.FileMode]::Create)
$archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relative in $files) {
    # Package source only. Never include credentials, local environments, links, caches or build output.
    if ($relative -match '(^|/)(node_modules|\.git|\.expo|\.tmp-qa|\.tmp-expo-export|\.next|Pods|build|\.agents|\.codex)(/|$)' -or $relative -match '(^|/)\.env($|\.)|(^|/)(local\.properties|\.npmrc)$') { continue }
    $source = [IO.Path]::GetFullPath((Join-Path $repository $relative))
    if (-not $source.StartsWith($repository + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Source path escaped repository' }
    if ([IO.File]::Exists($source)) { [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $source, $relative.Replace('\','/'), [IO.Compression.CompressionLevel]::Optimal) | Out-Null }
  }
  if ($NodeDirectory) {
    $nodeRoot = (Resolve-Path -LiteralPath $NodeDirectory).Path
    if (-not (Test-Path -LiteralPath (Join-Path $nodeRoot 'node.exe'))) { throw 'Expected official portable Windows Node directory' }
    foreach ($file in Get-ChildItem -LiteralPath $nodeRoot -File -Recurse) {
      $entry = 'tools/node/' + $file.FullName.Substring($nodeRoot.Length + 1).Replace('\','/')
      [IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entry, [IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
} finally { $archive.Dispose(); $stream.Dispose() }
$item = Get-Item -LiteralPath $destination
Write-Output ('QA source kit: ' + $item.FullName + ' (' + $item.Length + ' bytes)')
