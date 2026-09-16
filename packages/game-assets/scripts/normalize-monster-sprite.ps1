param(
  [Parameter(Mandatory = $true)] [string] $InputPath,
  [Parameter(Mandatory = $true)] [string] $OutputPath,
  [int] $SafeMargin = 20,
  [int] $CanvasSize = 192
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

function Get-AlphaBounds {
  param([System.Drawing.Bitmap] $Bitmap)

  $left = $Bitmap.Width
  $top = $Bitmap.Height
  $right = -1
  $bottom = -1
  for ($y = 0; $y -lt $Bitmap.Height; $y++) {
    for ($x = 0; $x -lt $Bitmap.Width; $x++) {
      if ($Bitmap.GetPixel($x, $y).A -eq 0) { continue }
      $left = [Math]::Min($left, $x)
      $top = [Math]::Min($top, $y)
      $right = [Math]::Max($right, $x)
      $bottom = [Math]::Max($bottom, $y)
    }
  }

  if ($right -lt $left -or $bottom -lt $top) {
    throw "The source image contains no visible pixels: $InputPath"
  }
  return [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 1, $bottom + 1)
}

$resolvedInput = (Resolve-Path -LiteralPath $InputPath).Path
$absoluteOutput = [System.IO.Path]::GetFullPath($OutputPath)
$source = New-Object System.Drawing.Bitmap($resolvedInput)
$output = New-Object System.Drawing.Bitmap(
  $CanvasSize,
  $CanvasSize,
  [System.Drawing.Imaging.PixelFormat]::Format32bppArgb
)
$graphics = [System.Drawing.Graphics]::FromImage($output)

try {
  $bounds = Get-AlphaBounds -Bitmap $source
  $availableWidth = $CanvasSize - (2 * $SafeMargin)
  $availableHeight = $CanvasSize - (2 * $SafeMargin)
  $scale = [Math]::Min($availableWidth / $bounds.Width, $availableHeight / $bounds.Height)
  $width = [Math]::Max(1, [int][Math]::Round($bounds.Width * $scale))
  $height = [Math]::Max(1, [int][Math]::Round($bounds.Height * $scale))
  $destination = [System.Drawing.Rectangle]::new(
    [int][Math]::Floor(($CanvasSize - $width) / 2),
    [int][Math]::Floor(($CanvasSize - $height) / 2),
    $width,
    $height
  )

  $graphics.Clear([System.Drawing.Color]::Transparent)
  $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
  $graphics.DrawImage($source, $destination, $bounds, [System.Drawing.GraphicsUnit]::Pixel)

  $directory = Split-Path -Parent $absoluteOutput
  New-Item -ItemType Directory -Path $directory -Force | Out-Null
  $output.Save($absoluteOutput, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $graphics.Dispose()
  $output.Dispose()
  $source.Dispose()
}

Write-Output "Wrote $absoluteOutput"
