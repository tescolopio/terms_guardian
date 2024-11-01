# repair.ps1

function Write-Step {
    param($Message)
    Write-Host "`n► $Message" -ForegroundColor Cyan
}

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

Write-Step "Starting repair process..."

# 1. Clean up existing installations
Write-Step "Cleaning up old installations..."
if (Test-Path node_modules) {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path .yarn/cache) {
    Remove-Item -Recurse -Force .yarn/cache
}
if (Test-Path .yarn/install-state.gz) {
    Remove-Item -Force .yarn/install-state.gz
}
Write-Success "Cleanup complete"

# 2. Reset Yarn
Write-Step "Resetting Yarn..."
yarn set version 4.4.1
Write-Success "Yarn reset complete"

# 3. Clean Yarn's cache
Write-Step "Cleaning Yarn cache..."
yarn cache clean
Write-Success "Cache cleaned"

# 4. Install dependencies
Write-Step "Installing dependencies..."
yarn install --force
Write-Success "Base dependencies installed"

# 5. Add webpack specifically
Write-Step "Installing webpack..."
yarn add -D webpack@5.88.0 webpack-cli@5.1.4 --exact
Write-Success "Webpack installed"

# 6. Verify installation
Write-Step "Verifying installation..."
$webpackPath = ".\node_modules\.bin\webpack.cmd"
if (Test-Path $webpackPath) {
    Write-Success "Webpack found at: $webpackPath"
    Write-Host "Version: " -NoNewline
    & $webpackPath --version
} else {
    Write-Error "Webpack not found!"
}

Write-Step "Repair process complete!"