# verify-structure.ps1
$requiredFiles = @(
    "./config/webpack.config.js",
    "./package.json",
    "./.yarnrc.yml",
    "./src/background/service-worker.js",
    "./src/content/content.js",
    "./src/panel/sidepanel.js"
)

Write-Host "Verifying project structure..." -ForegroundColor Cyan

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
    }
}

Write-Host "`nChecking webpack installation..." -ForegroundColor Cyan
$webpackPath = "./node_modules/.bin/webpack.cmd"
if (Test-Path $webpackPath) {
    Write-Host "✅ Webpack found at: $webpackPath" -ForegroundColor Green
} else {
    Write-Host "❌ Webpack not found at expected location" -ForegroundColor Red
}

Write-Host "`nChecking Node.js and Yarn versions..." -ForegroundColor Cyan
node --version
yarn --version