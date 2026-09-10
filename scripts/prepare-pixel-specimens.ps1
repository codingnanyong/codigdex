param(
  [Parameter(Mandatory = $true)] [string] $InputPath,
  [Parameter(Mandatory = $true)] [string] $OutputDirectory,
  [Parameter(Mandatory = $true)] [int] $Columns,
  [Parameter(Mandatory = $true)] [int] $Rows,
  [Parameter(Mandatory = $true)] [string[]] $Names
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

if ($Names.Count -ne ($Columns * $Rows)) {
  throw "Names count must equal Columns * Rows."
}

Add-Type -ReferencedAssemblies "System.Drawing.dll" -TypeDefinition @"
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public static class CodigdexSpriteProcessor
{
    private static bool IsBackgroundGray(Color color)
    {
        int max = Math.Max(color.R, Math.Max(color.G, color.B));
        int min = Math.Min(color.R, Math.Min(color.G, color.B));
        return color.A > 0 && min > 65 && max - min <= 20;
    }

    private static IEnumerable<Point> Neighbors(Point point, int width, int height)
    {
        if (point.X > 0) yield return new Point(point.X - 1, point.Y);
        if (point.X + 1 < width) yield return new Point(point.X + 1, point.Y);
        if (point.Y > 0) yield return new Point(point.X, point.Y - 1);
        if (point.Y + 1 < height) yield return new Point(point.X, point.Y + 1);
    }

    private static List<Point> CollectComponent(Bitmap bitmap, bool[,] seen, Point start, bool grayOnly)
    {
        var points = new List<Point>();
        var queue = new Queue<Point>();
        queue.Enqueue(start);
        seen[start.X, start.Y] = true;
        while (queue.Count > 0)
        {
            Point point = queue.Dequeue();
            points.Add(point);
            foreach (Point next in Neighbors(point, bitmap.Width, bitmap.Height))
            {
                if (seen[next.X, next.Y]) continue;
                Color color = bitmap.GetPixel(next.X, next.Y);
                bool matches = grayOnly ? IsBackgroundGray(color) : color.A > 0;
                if (!matches) continue;
                seen[next.X, next.Y] = true;
                queue.Enqueue(next);
            }
        }
        return points;
    }

    private static void RemoveGeneratedBackground(Bitmap bitmap)
    {
        var seen = new bool[bitmap.Width, bitmap.Height];
        var queue = new Queue<Point>();
        Action<int, int> enqueueEdge = (x, y) => {
            if (seen[x, y] || !IsBackgroundGray(bitmap.GetPixel(x, y))) return;
            seen[x, y] = true;
            queue.Enqueue(new Point(x, y));
        };

        for (int x = 0; x < bitmap.Width; x++) {
            enqueueEdge(x, 0);
            enqueueEdge(x, bitmap.Height - 1);
        }
        for (int y = 0; y < bitmap.Height; y++) {
            enqueueEdge(0, y);
            enqueueEdge(bitmap.Width - 1, y);
        }

        while (queue.Count > 0)
        {
            Point point = queue.Dequeue();
            bitmap.SetPixel(point.X, point.Y, Color.Transparent);
            foreach (Point next in Neighbors(point, bitmap.Width, bitmap.Height))
            {
                if (seen[next.X, next.Y] || !IsBackgroundGray(bitmap.GetPixel(next.X, next.Y))) continue;
                seen[next.X, next.Y] = true;
                queue.Enqueue(next);
            }
        }

        // Checkerboard pockets enclosed by a curled tail or prop are not edge-connected.
        // Their alternating gray values distinguish them from solid cream highlights.
        seen = new bool[bitmap.Width, bitmap.Height];
        for (int y = 0; y < bitmap.Height; y++)
        for (int x = 0; x < bitmap.Width; x++)
        {
            if (seen[x, y] || !IsBackgroundGray(bitmap.GetPixel(x, y))) continue;
            List<Point> component = CollectComponent(bitmap, seen, new Point(x, y), true);
            int darkest = 255;
            int lightest = 0;
            foreach (Point point in component)
            {
                Color color = bitmap.GetPixel(point.X, point.Y);
                int value = (color.R + color.G + color.B) / 3;
                darkest = Math.Min(darkest, value);
                lightest = Math.Max(lightest, value);
            }
            if (component.Count > 50 && lightest - darkest > 20)
                foreach (Point point in component) bitmap.SetPixel(point.X, point.Y, Color.Transparent);
        }
    }

    private static void RemoveSpeckles(Bitmap bitmap, int minimumPixels)
    {
        var seen = new bool[bitmap.Width, bitmap.Height];
        for (int y = 0; y < bitmap.Height; y++)
        for (int x = 0; x < bitmap.Width; x++)
        {
            if (seen[x, y] || bitmap.GetPixel(x, y).A == 0) continue;
            List<Point> component = CollectComponent(bitmap, seen, new Point(x, y), false);
            if (component.Count < minimumPixels)
                foreach (Point point in component) bitmap.SetPixel(point.X, point.Y, Color.Transparent);
        }
    }

    private static Rectangle AlphaBounds(Bitmap bitmap)
    {
        int left = bitmap.Width, top = bitmap.Height, right = -1, bottom = -1;
        for (int y = 0; y < bitmap.Height; y++)
        for (int x = 0; x < bitmap.Width; x++)
        {
            if (bitmap.GetPixel(x, y).A == 0) continue;
            left = Math.Min(left, x);
            top = Math.Min(top, y);
            right = Math.Max(right, x);
            bottom = Math.Max(bottom, y);
        }
        if (right < left || bottom < top) throw new InvalidOperationException("No sprite pixels remained after cleanup.");
        return Rectangle.FromLTRB(left, top, right + 1, bottom + 1);
    }

    public static void ProcessSheet(string inputPath, string outputDirectory, int columns, int rows, string[] names)
    {
        using (var sheet = new Bitmap(inputPath))
        {
            int cellWidth = sheet.Width / columns;
            int cellHeight = sheet.Height / rows;
            for (int index = 0; index < names.Length; index++)
            {
                var cellRect = new Rectangle((index % columns) * cellWidth, (index / columns) * cellHeight, cellWidth, cellHeight);
                using (var cell = sheet.Clone(cellRect, PixelFormat.Format32bppArgb))
                {
                    RemoveGeneratedBackground(cell);
                    RemoveSpeckles(cell, 24);
                    Rectangle bounds = AlphaBounds(cell);
                    using (var output = new Bitmap(192, 192, PixelFormat.Format32bppArgb))
                    using (Graphics graphics = Graphics.FromImage(output))
                    {
                        graphics.Clear(Color.Transparent);
                        graphics.CompositingMode = CompositingMode.SourceCopy;
                        graphics.InterpolationMode = InterpolationMode.NearestNeighbor;
                        graphics.PixelOffsetMode = PixelOffsetMode.Half;
                        double scale = Math.Min(168.0 / bounds.Width, 168.0 / bounds.Height);
                        int width = Math.Max(1, (int)Math.Round(bounds.Width * scale));
                        int height = Math.Max(1, (int)Math.Round(bounds.Height * scale));
                        var destination = new Rectangle((192 - width) / 2, (192 - height) / 2, width, height);
                        graphics.DrawImage(cell, destination, bounds, GraphicsUnit.Pixel);
                        output.Save(System.IO.Path.Combine(outputDirectory, names[index] + ".png"), ImageFormat.Png);
                    }
                }
            }
        }
    }
}
"@

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
[CodigdexSpriteProcessor]::ProcessSheet(
  (Resolve-Path -LiteralPath $InputPath),
  [System.IO.Path]::GetFullPath($OutputDirectory),
  $Columns,
  $Rows,
  $Names
)
