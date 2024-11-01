# build.ps1

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Step($message) {
    Write-ColorOutput Yellow "`n► $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "✓ $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "✗ $message"
}

# Main build process
Write-Step "Verifying environment..."
$env:NODE_ENV = "development"

# Check if webpack exists
if (-not (Test-Path ".\node_modules\.bin\webpack.cmd")) {
    Write-Step "Reinstalling webpack..."
    yarn add -D webpack webpack-cli
}

try {
    # Clean
    Write-Step "Cleaning previous build..."
    if (Test-Path ".\dist") {
        Remove-Item -Recurse -Force ".\dist"
    }
    Write-Success "Clean completed"

    # Build libraries
    Write-Step "Building libraries..."
    node .\scripts\build-libs.js
    if ($LASTEXITCODE -ne 0) { throw "Library build failed" }
    Write-Success "Libraries built"

    # Run webpack
    Write-Step "Running webpack build..."
    yarn run webpack "--config" "./config/webpack.config.js" "--mode" "development" "--progress"
    if ($LASTEXITCODE -ne 0) { throw "Webpack build failed" }
    Write-Success "Build completed successfully!"
}
catch {
    Write-Error "Build failed: $_"
    exit 1
}