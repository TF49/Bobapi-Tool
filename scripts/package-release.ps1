param([string]$Tag)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$package = Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Encoding UTF8 -Raw | ConvertFrom-Json
$tauri = Get-Content -LiteralPath (Join-Path $repoRoot 'src-tauri/tauri.conf.json') -Encoding UTF8 -Raw | ConvertFrom-Json
if (-not $Tag) { $Tag = "v$($package.version)" }
if ($Tag -cne "v$($package.version)" -or $tauri.version -cne $package.version) {
    throw 'Release tag, package.json and tauri.conf.json versions must match.'
}

$buildRoot = Join-Path $repoRoot 'src-tauri/target/release'
$installer = Join-Path $buildRoot "bundle/nsis/BobAPI Tool_$($package.version)_x64-setup.exe"
$binary = Join-Path $buildRoot 'bobapi-tool.exe'
foreach ($required in @($installer, $binary)) {
    if (-not (Test-Path -LiteralPath $required -PathType Leaf)) {
        throw "Missing release build: $required. Run pnpm tauri build --bundles nsis first."
    }
}

$assetRoot = Join-Path $repoRoot "release/$Tag"
$standaloneRoot = Join-Path $assetRoot 'standalone'
New-Item -ItemType Directory -Force -Path $standaloneRoot | Out-Null
$installerName = "BobAPI-Tool-$Tag-Windows-x64-Setup.exe"
$zipName = "BobAPI-Tool-$Tag-Windows-x64-Standalone.zip"
Copy-Item -LiteralPath $installer -Destination (Join-Path $assetRoot $installerName)
Copy-Item -LiteralPath $binary -Destination (Join-Path $standaloneRoot 'bobapi-tool.exe')
Copy-Item -LiteralPath (Join-Path $repoRoot 'LICENSE') -Destination (Join-Path $standaloneRoot 'LICENSE.txt')
Copy-Item -LiteralPath (Join-Path $repoRoot 'THIRD_PARTY_NOTICES.md') -Destination $standaloneRoot
Copy-Item -LiteralPath (Join-Path $repoRoot 'docs/standalone-readme.txt') -Destination (Join-Path $standaloneRoot 'README.txt')
Compress-Archive -LiteralPath @(
    (Join-Path $standaloneRoot 'bobapi-tool.exe'),
    (Join-Path $standaloneRoot 'LICENSE.txt'),
    (Join-Path $standaloneRoot 'THIRD_PARTY_NOTICES.md'),
    (Join-Path $standaloneRoot 'README.txt')
) -DestinationPath (Join-Path $assetRoot $zipName) -Force

$checksums = foreach ($name in @($installerName, $zipName)) {
    $hash = Get-FileHash -LiteralPath (Join-Path $assetRoot $name) -Algorithm SHA256
    "$($hash.Hash.ToLowerInvariant())  $name"
}
$checksums | Set-Content -LiteralPath (Join-Path $assetRoot 'SHA256SUMS.txt') -Encoding UTF8
Get-ChildItem -LiteralPath $assetRoot -File | Select-Object Name, Length
