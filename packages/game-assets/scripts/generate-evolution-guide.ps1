param(
  [string] $OutputName = "all-monster-evolution-guide-v1.png"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$packageRoot = Split-Path -Parent $PSScriptRoot
$monsterRoot = Join-Path $packageRoot "files/monsters"
$outputPath = Join-Path $monsterRoot $OutputName

$canvasWidth = 1150
$outerMargin = 24
$headerHeight = 92
$labelWidth = 208
$cardWidth = 140
$cardHeight = 140
$columnGap = 10
$rowGap = 12
$spritePadding = 12

$folders = Get-ChildItem -LiteralPath $monsterRoot -Directory |
  Where-Object { $_.Name -match '^ch\d{2}\.' } |
  Sort-Object Name

$canvasHeight = $headerHeight + $outerMargin +
  ($folders.Count * ($cardHeight + $rowGap))

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

  if ($right -lt $left -or $bottom -lt $top) { return $null }
  return [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 1, $bottom + 1)
}

function Get-LatestLevelAsset {
  param(
    [System.IO.DirectoryInfo] $Folder,
    [int] $Level
  )

  $candidates = @(Get-ChildItem -LiteralPath $Folder.FullName -File |
    Where-Object { $_.Name -match "-lv$Level(?:-v(\d+))?\.png$" })
  if ($candidates.Count -eq 0) { return $null }

  return $candidates |
    Sort-Object @{ Expression = {
      if ($_.BaseName -match '-v(\d+)$') { [int] $Matches[1] } else { 1 }
    } }, Name |
    Select-Object -Last 1
}

function Get-CellAssets {
  param([System.IO.DirectoryInfo] $Folder)

  if ($Folder.Name -eq "ch00.tutorial") {
    return @($null, (Get-Item (Join-Path $Folder.FullName "loop-bug-v2.png")), $null, $null, $null, $null)
  }

  $specimen = Get-ChildItem -LiteralPath $Folder.FullName -File -Filter "*-specimen*.png" |
    Sort-Object @{ Expression = {
      if ($_.BaseName -match '-v(\d+)$') { [int] $Matches[1] } else { 1 }
    } }, Name |
    Select-Object -Last 1

  return @(
    $specimen,
    (Get-LatestLevelAsset -Folder $Folder -Level 1),
    (Get-LatestLevelAsset -Folder $Folder -Level 2),
    (Get-LatestLevelAsset -Folder $Folder -Level 3),
    (Get-LatestLevelAsset -Folder $Folder -Level 4),
    (Get-LatestLevelAsset -Folder $Folder -Level 5)
  )
}

$background = [System.Drawing.Color]::FromArgb(255, 20, 13, 9)
$panel = [System.Drawing.Color]::FromArgb(255, 17, 12, 9)
$border = [System.Drawing.Color]::FromArgb(255, 92, 48, 22)
$heading = [System.Drawing.Color]::FromArgb(255, 232, 210, 164)
$accent = [System.Drawing.Color]::FromArgb(255, 230, 103, 36)
$muted = [System.Drawing.Color]::FromArgb(255, 107, 73, 50)

$bitmap = New-Object System.Drawing.Bitmap($canvasWidth, $canvasHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.Clear($background)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::SingleBitPerPixelGridFit

$titleFont = New-Object System.Drawing.Font("Consolas", 17, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$headerFont = New-Object System.Drawing.Font("Consolas", 12, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$labelFont = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$naFont = New-Object System.Drawing.Font("Consolas", 10, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$headingBrush = New-Object System.Drawing.SolidBrush($heading)
$accentBrush = New-Object System.Drawing.SolidBrush($accent)
$mutedBrush = New-Object System.Drawing.SolidBrush($muted)
$panelBrush = New-Object System.Drawing.SolidBrush($panel)
$borderPen = New-Object System.Drawing.Pen($border, 2)

try {
  $graphics.DrawString("CODIGDEX  -  MONSTER EVOLUTION GUIDE", $titleFont, $headingBrush, $outerMargin, 18)

  $columnNames = @("SPECIMEN", "LV.1", "LV.2", "LV.3", "LV.4", "LV.5")
  $gridLeft = $outerMargin + $labelWidth
  for ($column = 0; $column -lt $columnNames.Count; $column++) {
    $x = $gridLeft + ($column * ($cardWidth + $columnGap))
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString($columnNames[$column], $headerFont, $accentBrush,
      [System.Drawing.RectangleF]::new($x, 54, $cardWidth, 20), $format)
    $format.Dispose()
  }

  for ($row = 0; $row -lt $folders.Count; $row++) {
    $folder = $folders[$row]
    $chapter, $technology = $folder.Name.Split('.', 2)
    $chapterNumber = $chapter.Substring(2)
    $label = "ch$chapterNumber - $technology"
    $y = $headerHeight + ($row * ($cardHeight + $rowGap))
    $labelRect = [System.Drawing.RectangleF]::new($outerMargin, $y, $labelWidth - 14, $cardHeight)
    $labelFormat = New-Object System.Drawing.StringFormat
    $labelFormat.LineAlignment = [System.Drawing.StringAlignment]::Center
    $graphics.DrawString($label, $labelFont, $headingBrush, $labelRect, $labelFormat)
    $labelFormat.Dispose()

    $assets = @(Get-CellAssets -Folder $folder)
    for ($column = 0; $column -lt 6; $column++) {
      $x = $gridLeft + ($column * ($cardWidth + $columnGap))
      $cardRect = [System.Drawing.Rectangle]::new($x, $y, $cardWidth, $cardHeight)
      $graphics.FillRectangle($panelBrush, $cardRect)
      $graphics.DrawRectangle($borderPen, $cardRect)
      $asset = $assets[$column]

      if ($null -eq $asset) {
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center
        $graphics.DrawString("N/A", $naFont, $mutedBrush,
          [System.Drawing.RectangleF]::new($x, $y, $cardWidth, $cardHeight), $format)
        $format.Dispose()
        continue
      }

      $sprite = New-Object System.Drawing.Bitmap($asset.FullName)
      try {
        $bounds = Get-AlphaBounds -Bitmap $sprite
        if ($null -eq $bounds) { continue }
        $availableWidth = $cardWidth - (2 * $spritePadding)
        $availableHeight = $cardHeight - (2 * $spritePadding)
        $scale = [Math]::Min($availableWidth / $bounds.Width, $availableHeight / $bounds.Height)
        $width = [Math]::Max(1, [int][Math]::Round($bounds.Width * $scale))
        $height = [Math]::Max(1, [int][Math]::Round($bounds.Height * $scale))
        $destination = [System.Drawing.Rectangle]::new(
          $x + [int][Math]::Floor(($cardWidth - $width) / 2),
          $y + [int][Math]::Floor(($cardHeight - $height) / 2),
          $width,
          $height
        )
        $graphics.DrawImage($sprite, $destination, $bounds, [System.Drawing.GraphicsUnit]::Pixel)
      }
      finally {
        $sprite.Dispose()
      }
    }
  }

  $bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
}
finally {
  $borderPen.Dispose()
  $panelBrush.Dispose()
  $mutedBrush.Dispose()
  $accentBrush.Dispose()
  $headingBrush.Dispose()
  $naFont.Dispose()
  $labelFont.Dispose()
  $headerFont.Dispose()
  $titleFont.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Output "Wrote $outputPath"
