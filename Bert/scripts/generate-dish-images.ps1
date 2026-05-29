$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$outDir = Join-Path $root "assets\dishes"
New-Item -ItemType Directory -Path $outDir -Force | Out-Null

$dishes = @(
  @{ File = "chili-pork.png"; Name = "Chili Pork"; Plate = "#f4e5ce"; Main = "#9b3b24"; Accent = "#287143"; Extra = "#d33c23"; Shape = "strips" },
  @{ File = "potato-shreds.png"; Name = "Potato Shreds"; Plate = "#f5e8d6"; Main = "#e5c25a"; Accent = "#df6c2d"; Extra = "#7fb25b"; Shape = "shreds" },
  @{ File = "scallion-beef.png"; Name = "Scallion Beef"; Plate = "#f2dfc4"; Main = "#7b3328"; Accent = "#2f8a5a"; Extra = "#f0efe6"; Shape = "beef" },
  @{ File = "seaweed-egg-soup.png"; Name = "Egg Soup"; Plate = "#f6efdf"; Main = "#dcb23e"; Accent = "#283b36"; Extra = "#f4d97a"; Shape = "soup" },
  @{ File = "lettuce-egg.png"; Name = "Lettuce Egg"; Plate = "#f5e9d2"; Main = "#7ebc59"; Accent = "#edc842"; Extra = "#f8f1db"; Shape = "chunks" },
  @{ File = "cauliflower-pot.png"; Name = "Cauliflower"; Plate = "#efe0c8"; Main = "#e9ddbb"; Accent = "#bf3829"; Extra = "#4d7c43"; Shape = "cauliflower" },
  @{ File = "edamame-pork.png"; Name = "Edamame Pork"; Plate = "#f4e6cf"; Main = "#68a64d"; Accent = "#a54932"; Extra = "#f3d071"; Shape = "beans" },
  @{ File = "crayfish.png"; Name = "Crayfish"; Plate = "#f0dcc1"; Main = "#c92821"; Accent = "#80221d"; Extra = "#f1c04c"; Shape = "crayfish" },
  @{ File = "greens.png"; Name = "Greens"; Plate = "#f7ecd9"; Main = "#3f9a53"; Accent = "#1f6f41"; Extra = "#e9f2d6"; Shape = "leaves" },
  @{ File = "chives.png"; Name = "Chives"; Plate = "#f3e4cc"; Main = "#2e8745"; Accent = "#d9b43f"; Extra = "#185a34"; Shape = "chives" },
  @{ File = "sprouts-beef.png"; Name = "Sprouts Beef"; Plate = "#f6ead6"; Main = "#f0e7ca"; Accent = "#8a3a2d"; Extra = "#78a14d"; Shape = "sprouts" }
)

function New-Brush($hex) {
  return [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($hex))
}

function Draw-RoundedRect($graphics, $brush, $x, $y, $w, $h, $r) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $r * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $w - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $w - $diameter, $y + $h - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $h - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  $graphics.FillPath($brush, $path)
  $path.Dispose()
}

foreach ($dish in $dishes) {
  $bitmap = [System.Drawing.Bitmap]::new(900, 675)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#efe3cf"))

  $bgBrush = New-Brush "#d9b06f"
  $tableBrush = New-Brush "#7d5032"
  $graphics.FillRectangle($bgBrush, 0, 0, 900, 675)
  $graphics.FillRectangle($tableBrush, 0, 480, 900, 195)

  $plateShadow = New-Brush "#6b442b"
  $plateBrush = New-Brush $dish.Plate
  $rimBrush = New-Brush "#ffffff"
  $graphics.FillEllipse($plateShadow, 142, 92, 628, 476)
  $graphics.FillEllipse($rimBrush, 125, 70, 635, 475)
  $graphics.FillEllipse($plateBrush, 170, 112, 545, 392)

  $mainBrush = New-Brush $dish.Main
  $accentBrush = New-Brush $dish.Accent
  $extraBrush = New-Brush $dish.Extra
  $darkBrush = New-Brush "#38251f"

  switch ($dish.Shape) {
    "soup" {
      $soupBrush = New-Brush "#efd87b"
      $graphics.FillEllipse($soupBrush, 190, 122, 505, 365)
      for ($i = 0; $i -lt 19; $i++) {
        $x = 230 + (($i * 73) % 390)
        $y = 160 + (($i * 47) % 260)
        $graphics.FillEllipse($(if ($i % 2 -eq 0) { $accentBrush } else { $extraBrush }), $x, $y, 58, 30)
      }
    }
    "crayfish" {
      for ($i = 0; $i -lt 13; $i++) {
        $x = 220 + (($i * 61) % 390)
        $y = 150 + (($i * 43) % 250)
        $graphics.TranslateTransform($x + 38, $y + 24)
        $graphics.RotateTransform(($i * 23) % 90 - 45)
        $graphics.FillEllipse($mainBrush, -38, -18, 76, 36)
        $graphics.FillEllipse($accentBrush, 12, -12, 35, 24)
        $graphics.FillPie($mainBrush, -54, -20, 36, 30, 80, 170)
        $graphics.FillPie($mainBrush, -54, -8, 36, 30, 110, 170)
        $graphics.ResetTransform()
      }
    }
    "cauliflower" {
      for ($i = 0; $i -lt 22; $i++) {
        $x = 210 + (($i * 53) % 440)
        $y = 135 + (($i * 41) % 310)
        $graphics.FillEllipse($mainBrush, $x, $y, 66, 48)
        $graphics.FillEllipse($extraBrush, $x + 18, $y + 22, 42, 22)
      }
      for ($i = 0; $i -lt 10; $i++) {
        $graphics.FillEllipse($accentBrush, 225 + (($i * 83) % 390), 145 + (($i * 37) % 290), 34, 25)
      }
    }
    "leaves" {
      for ($i = 0; $i -lt 24; $i++) {
        $x = 210 + (($i * 67) % 410)
        $y = 135 + (($i * 47) % 310)
        $graphics.TranslateTransform($x + 45, $y + 22)
        $graphics.RotateTransform(($i * 31) % 140 - 70)
        $graphics.FillEllipse($(if ($i % 3 -eq 0) { $accentBrush } else { $mainBrush }), -45, -16, 90, 32)
        $graphics.ResetTransform()
      }
    }
    "chives" {
      for ($i = 0; $i -lt 40; $i++) {
        $penColor = if ($i % 3 -eq 0) { $dish.Accent } else { $dish.Main }
        $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($penColor), 13)
        $x = 190 + (($i * 33) % 480)
        $y = 150 + (($i * 29) % 300)
        $graphics.DrawLine($pen, $x, $y, $x + 115, $y + (($i * 17) % 60) - 30)
        $pen.Dispose()
      }
      for ($i = 0; $i -lt 8; $i++) {
        $graphics.FillEllipse($extraBrush, 260 + (($i * 61) % 320), 170 + (($i * 41) % 240), 44, 28)
      }
    }
    "sprouts" {
      for ($i = 0; $i -lt 33; $i++) {
        $pen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml($dish.Main), 9)
        $x = 205 + (($i * 47) % 440)
        $y = 145 + (($i * 31) % 295)
        $graphics.DrawArc($pen, $x, $y, 92, 38, 185, 145)
        $graphics.FillEllipse($mainBrush, $x + 82, $y + 3, 24, 20)
        $pen.Dispose()
      }
      for ($i = 0; $i -lt 12; $i++) {
        $graphics.FillEllipse($accentBrush, 240 + (($i * 71) % 360), 165 + (($i * 47) % 240), 70, 28)
      }
    }
    default {
      for ($i = 0; $i -lt 27; $i++) {
        $x = 205 + (($i * 57) % 430)
        $y = 135 + (($i * 43) % 310)
        $w = 84 + (($i * 7) % 34)
        $h = 26 + (($i * 5) % 22)
        $graphics.TranslateTransform($x + ($w / 2), $y + ($h / 2))
        $graphics.RotateTransform(($i * 29) % 120 - 60)
        $brush = if ($i % 3 -eq 0) { $accentBrush } elseif ($i % 3 -eq 1) { $mainBrush } else { $extraBrush }
        Draw-RoundedRect $graphics $brush (-$w / 2) (-$h / 2) $w $h 12
        $graphics.ResetTransform()
      }
    }
  }

  $font = [System.Drawing.Font]::new("Microsoft YaHei", 38, [System.Drawing.FontStyle]::Bold)
  $captionBrush = New-Brush "#fff8eb"
  Draw-RoundedRect $graphics $darkBrush 245 545 410 76 20
  $format = [System.Drawing.StringFormat]::new()
  $format.Alignment = [System.Drawing.StringAlignment]::Center
  $format.LineAlignment = [System.Drawing.StringAlignment]::Center
  $graphics.DrawString($dish.Name, $font, $captionBrush, [System.Drawing.RectangleF]::new(245, 545, 410, 76), $format)

  $path = Join-Path $outDir $dish.File
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

  $format.Dispose()
  $font.Dispose()
  $captionBrush.Dispose()
  $darkBrush.Dispose()
  $extraBrush.Dispose()
  $accentBrush.Dispose()
  $mainBrush.Dispose()
  $rimBrush.Dispose()
  $plateBrush.Dispose()
  $plateShadow.Dispose()
  $tableBrush.Dispose()
  $bgBrush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Write-Host "Generated dish images in $outDir"
