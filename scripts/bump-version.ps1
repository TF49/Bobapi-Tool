param(
    [Parameter(Mandatory=$true)]
    [ValidateSet('major', 'minor', 'patch')]
    [string]$BumpType,
    
    [Parameter(Mandatory=$false)]
    [string]$Message
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "🔍 检查工作目录状态..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "⚠️  工作目录有未提交的更改:" -ForegroundColor Yellow
    git status --short
    $continue = Read-Host "`n是否继续？这些更改将被包含在新版本中 (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "❌ 已取消版本升级" -ForegroundColor Red
        exit 1
    }
}

# 读取当前版本
Write-Host "`n📖 读取当前版本..." -ForegroundColor Cyan
$packageJson = Get-Content -LiteralPath (Join-Path $repoRoot 'package.json') -Encoding UTF8 -Raw | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "当前版本: v$currentVersion" -ForegroundColor White

# 解析版本号
$versionParts = $currentVersion -split '\.'
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]

# 递增版本号
switch ($BumpType) {
    'major' {
        $major++
        $minor = 0
        $patch = 0
    }
    'minor' {
        $minor++
        $patch = 0
    }
    'patch' {
        $patch++
    }
}

$newVersion = "$major.$minor.$patch"
$newTag = "v$newVersion"

Write-Host "新版本: $newTag" -ForegroundColor Green

# 如果没有提供提交信息，提示用户输入
if (-not $Message) {
    Write-Host "`n📝 请输入版本更新说明（用于 git commit）:" -ForegroundColor Cyan
    $Message = Read-Host "描述"
    if (-not $Message) {
        $Message = "Release $newTag"
    }
}

Write-Host "`n🔄 更新版本号..." -ForegroundColor Cyan

# 更新 package.json
$packagePath = Join-Path $repoRoot 'package.json'
$packageContent = Get-Content -LiteralPath $packagePath -Encoding UTF8 -Raw
$packageContent = $packageContent -replace "`"version`":\s*`"$currentVersion`"", "`"version`": `"$newVersion`""
Set-Content -LiteralPath $packagePath -Value $packageContent -Encoding UTF8 -NoNewline
Write-Host "  ✓ package.json" -ForegroundColor Gray

# 更新 Cargo.toml
$cargoPath = Join-Path $repoRoot 'src-tauri/Cargo.toml'
$cargoContent = Get-Content -LiteralPath $cargoPath -Encoding UTF8 -Raw
$cargoContent = $cargoContent -replace "version = `"$currentVersion`"", "version = `"$newVersion`""
Set-Content -LiteralPath $cargoPath -Value $cargoContent -Encoding UTF8 -NoNewline
Write-Host "  ✓ src-tauri/Cargo.toml" -ForegroundColor Gray

# 更新 tauri.conf.json
$tauriConfigPath = Join-Path $repoRoot 'src-tauri/tauri.conf.json'
$tauriConfig = Get-Content -LiteralPath $tauriConfigPath -Encoding UTF8 -Raw | ConvertFrom-Json
$tauriConfig.version = $newVersion
$tauriConfig | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath $tauriConfigPath -Encoding UTF8
Write-Host "  ✓ src-tauri/tauri.conf.json" -ForegroundColor Gray

# 检查是否有 release notes 模板
$releaseNotesPath = Join-Path $repoRoot "docs/releases/$newTag.md"
if (-not (Test-Path -LiteralPath $releaseNotesPath)) {
    Write-Host "`n📄 创建 release notes 模板..." -ForegroundColor Cyan
    
    $releaseNotesContent = "# BobAPI Tool $newTag`n`n"
    $releaseNotesContent += "**发布日期**: $(Get-Date -Format 'yyyy-MM-dd')`n`n"
    $releaseNotesContent += "## 🎯 本次更新`n`n"
    $releaseNotesContent += "### 新增功能`n"
    $releaseNotesContent += "- TODO: 列出新增的功能`n`n"
    $releaseNotesContent += "### 🐛 Bug 修复`n"
    $releaseNotesContent += "- TODO: 列出修复的 bug`n`n"
    $releaseNotesContent += "### 🔧 改进`n"
    $releaseNotesContent += "- TODO: 列出改进的地方`n`n"
    $releaseNotesContent += "## 📦 下载`n`n"
    $releaseNotesContent += "- **Windows 安装程序**: ``BobAPI-Tool-$newTag-Windows-x64-Setup.exe```n"
    $releaseNotesContent += "- **Windows 便携版**: ``BobAPI-Tool-$newTag-Windows-x64-Standalone.zip```n`n"
    $releaseNotesContent += "## ✅ 校验和`n`n"
    $releaseNotesContent += "查看 ``SHA256SUMS.txt`` 文件验证下载完整性。`n`n"
    $releaseNotesContent += "## 🔄 从 v$currentVersion 升级`n`n"
    $releaseNotesContent += "直接安装新版本或替换便携版文件即可。`n`n"
    $releaseNotesContent += "---`n`n"
    $releaseNotesContent += "**上一版本**: [v$currentVersion](./v$currentVersion.md)`n"
    
    Set-Content -LiteralPath $releaseNotesPath -Value $releaseNotesContent -Encoding UTF8
    Write-Host "  ✓ $releaseNotesPath (需要手动编辑)" -ForegroundColor Yellow
    Write-Host "`n⚠️  请先编辑 release notes 后再继续!" -ForegroundColor Yellow
    
    # 打开 release notes 文件供编辑
    Start-Process notepad.exe -ArgumentList $releaseNotesPath
    
    $continue = Read-Host "`n编辑完成后，按 Enter 继续，或输入 'n' 取消"
    if ($continue -eq 'n' -or $continue -eq 'N') {
        Write-Host "❌ 已取消。版本号已更新但未提交。" -ForegroundColor Red
        Write-Host "💡 提示: 可以手动运行 git checkout . 撤销更改" -ForegroundColor Gray
        exit 1
    }
}

# 提交更改
Write-Host "`n📦 提交版本更新..." -ForegroundColor Cyan
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json "docs/releases/$newTag.md"
git commit -m "chore: bump version to $newTag`n`n$Message"

# 创建 tag
Write-Host "`n🏷️  创建 git tag..." -ForegroundColor Cyan
git tag -a $newTag -m "Release $newTag`n`n$Message"

Write-Host "`n✅ 版本升级完成!" -ForegroundColor Green
Write-Host "`n下一步:" -ForegroundColor Cyan
Write-Host "  1. 检查提交: git log -1" -ForegroundColor White
Write-Host "  2. 推送到 GitHub: git push && git push --tags" -ForegroundColor White
Write-Host "  3. GitHub Actions 将自动构建和发布 release" -ForegroundColor White

Write-Host "`n是否现在推送到 GitHub? (y/N)" -ForegroundColor Yellow -NoNewline
$push = Read-Host " "
if ($push -eq 'y' -or $push -eq 'Y') {
    Write-Host "`n🚀 推送到 GitHub..." -ForegroundColor Cyan
    git push
    git push --tags
    Write-Host "`n✅ 推送完成!" -ForegroundColor Green
    Write-Host "🔗 查看 GitHub Actions: https://github.com/$(git remote get-url origin | Select-String -Pattern '[\w-]+/[\w-]+(?=\.git|$)' | ForEach-Object { $_.Matches.Value })/actions" -ForegroundColor Cyan
} else {
    Write-Host "`n💡 提示: 稍后可以手动推送:" -ForegroundColor Gray
    Write-Host "   git push && git push --tags" -ForegroundColor White
}
