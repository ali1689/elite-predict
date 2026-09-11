$ErrorActionPreference = 'Stop'
$project = $PSScriptRoot
$manifest = Get-Content -LiteralPath (Join-Path $project 'V2-rollback.json') -Raw | ConvertFrom-Json
$backup = $manifest.backup
if (!(Test-Path -LiteralPath $backup)) { throw "Original backup missing: $backup" }
$preserve = Join-Path (Split-Path $project -Parent) ('elite-predict-v2-before-rollback-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
# Validate every path before writing or removing any files.
foreach ($entry in $manifest.files) {
  $target = [IO.Path]::GetFullPath((Join-Path $project $entry.path))
  $source = [IO.Path]::GetFullPath((Join-Path $backup $entry.path))
  if (!$target.StartsWith($project + '\', [StringComparison]::OrdinalIgnoreCase) -or !$source.StartsWith($backup + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe rollback path.' }
  if ($entry.existed -and !(Test-Path -LiteralPath $source -PathType Leaf)) { throw "Missing original: $source" }
}
New-Item -ItemType Directory -Path $preserve | Out-Null
foreach ($entry in $manifest.files) {
  $target = Join-Path $project $entry.path
  if (Test-Path -LiteralPath $target -PathType Leaf) {
    $saved = Join-Path $preserve $entry.path
    New-Item -ItemType Directory -Force -Path (Split-Path $saved -Parent) | Out-Null
    Copy-Item -LiteralPath $target -Destination $saved
  }
}
foreach ($entry in $manifest.files) {
  $target = Join-Path $project $entry.path
  if ($entry.existed) {
    Copy-Item -LiteralPath (Join-Path $backup $entry.path) -Destination $target -Force
  } elseif (Test-Path -LiteralPath $target -PathType Leaf) {
    Remove-Item -LiteralPath $target
  }
}
Write-Host "Original frontend restored. Your V2 files were preserved in $preserve"
