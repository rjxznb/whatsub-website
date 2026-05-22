# Generate public/og.png — Open Graph share card (1200x630).
# One-off composition tool. Run from project root:
#   pwsh scripts/generate-og.ps1
# Uses System.Drawing (Windows-only) to composite the wordmark onto a
# black canvas with the tagline + bottom info bar. The wordmark PNG has
# a baked-in black background which merges invisibly with the canvas.

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$wordmarkPath = Join-Path $root 'public\whatsub-wordmark.png'
$outPath = Join-Path $root 'public\og.png'

$w = 1200
$h = 630

$bmp = New-Object System.Drawing.Bitmap $w, $h
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Black canvas
$g.FillRectangle([System.Drawing.Brushes]::Black, 0, 0, $w, $h)

# Subtle accent glow centered behind the wordmark
$glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
$glowRect = New-Object System.Drawing.Rectangle(($w / 2 - 350), 160, 700, 280)
$glowPath.AddEllipse($glowRect)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(60, 59, 155, 255)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 0, 0, 0))
$g.FillPath($pgb, $glowPath)
$pgb.Dispose()
$glowPath.Dispose()

# Wordmark — load and scale to 560px wide
$wordmark = [System.Drawing.Image]::FromFile($wordmarkPath)
$wmW = 560
$wmH = [int]($wordmark.Height * ($wmW / $wordmark.Width))
$wmX = [int](($w - $wmW) / 2)
$wmY = 180
$g.DrawImage($wordmark, $wmX, $wmY, $wmW, $wmH)
$wordmark.Dispose()

# Tagline
$taglineFont = New-Object System.Drawing.Font('Microsoft YaHei', 36, [System.Drawing.FontStyle]::Bold)
$taglineBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$tagline = '让一句字幕，慢慢成为你的英语'
$taglineSize = $g.MeasureString($tagline, $taglineFont)
$taglineX = ($w - $taglineSize.Width) / 2
$taglineY = $wmY + $wmH + 36
$g.DrawString($tagline, $taglineFont, $taglineBrush, $taglineX, $taglineY)
$taglineFont.Dispose()
$taglineBrush.Dispose()

# Bottom info bar — three parts, accent-blue URL
$bottomFont = New-Object System.Drawing.Font('Microsoft YaHei', 14)
$mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(140, 255, 255, 255))
$accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 59, 155, 255))
$dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(60, 255, 255, 255))

$p1 = '双语字幕'
$dot = '  ·  '
$p2 = '词汇笔记'
$p3 = 'whatsub.eversay.cc'

$s1 = $g.MeasureString($p1, $bottomFont)
$sd = $g.MeasureString($dot, $bottomFont)
$s2 = $g.MeasureString($p2, $bottomFont)
$s3 = $g.MeasureString($p3, $bottomFont)

$totalW = $s1.Width + $sd.Width + $s2.Width + $sd.Width + $s3.Width
$bx = ($w - $totalW) / 2
$by = $h - 80

$g.DrawString($p1, $bottomFont, $mutedBrush, $bx, $by); $bx += $s1.Width
$g.DrawString($dot, $bottomFont, $dotBrush, $bx, $by); $bx += $sd.Width
$g.DrawString($p2, $bottomFont, $mutedBrush, $bx, $by); $bx += $s2.Width
$g.DrawString($dot, $bottomFont, $dotBrush, $bx, $by); $bx += $sd.Width
$g.DrawString($p3, $bottomFont, $accentBrush, $bx, $by)

$bottomFont.Dispose()
$mutedBrush.Dispose()
$accentBrush.Dispose()
$dotBrush.Dispose()

$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()

Write-Host "Generated $outPath ($w x $h)"
