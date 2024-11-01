Write-Host "`nRunning Verification Script" -ForegroundColor Cyan

Write-Host "`nChecking Node.js..." -ForegroundColor Yellow
node --version

Write-Host "`nChecking Yarn..." -ForegroundColor Yellow
yarn --version

Write-Host "`nChecking Critical Files..." -ForegroundColor Yellow
$files = @(
    "package.json",
    ".yarnrc.yml",
    "config/webpack.config.js",
    "node_modules/webpack/package.json"
)

foreach ($file in $files) {
    $exists = Test-Path $file
    Write-Host "$file : " -NoNewline
    if ($exists) {
        Write-Host "EXISTS" -ForegroundColor Green
    } else {
        Write-Host "MISSING" -ForegroundColor Red
    }
}

Write-Host "`nChecking Webpack..." -ForegroundColor Yellow
$webpackCmd = ".\node_modules\.bin\webpack.cmd"
if (Test-Path $webpackCmd) {
    Write-Host "Webpack command found" -ForegroundColor Green
    Write-Host "Trying to get version..." -ForegroundColor Yellow
    & $webpackCmd --version
} else {
    Write-Host "Webpack command not found" -ForegroundColor Red
}

Write-Host "`nVerification complete!" -ForegroundColor Cyan