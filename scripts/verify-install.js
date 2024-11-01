/**
 * @file verify-install.js
 * @description Enhanced verification script with PowerShell compatibility
 */

const fs = require('fs').promises;
const path = require('path');
const { spawnSync } = require('child_process');

async function runCommand(command, args) {
    const result = spawnSync(command, args, {
        encoding: 'utf8',
        shell: true,
        stdio: 'pipe'
    });

    return {
        success: result.status === 0,
        output: result.stdout || result.stderr,
        error: result.error
    };
}

async function checkPath(filepath) {
    try {
        const stats = await fs.stat(filepath);
        return {
            exists: true,
            size: stats.size,
            isDirectory: stats.isDirectory()
        };
    } catch {
        return { exists: false };
    }
}

async function verifyInstallation() {
    console.log('🔍 Starting Verification Process\n');

    // 1. Check Node.js
    console.log('Node.js Environment:');
    console.log('  Version:', process.version);
    console.log('  Platform:', process.platform);
    console.log('  Architecture:', process.arch);

    // 2. Check Yarn
    console.log('\nYarn Configuration:');
    const yarnResult = await runCommand('yarn', ['--version']);
    console.log('  Version:', yarnResult.success ? yarnResult.output.trim() : 'Not found');

    // 3. Check Project Structure
    console.log('\nProject Structure:');
    const criticalFiles = [
        '.yarnrc.yml',
        'package.json',
        'config/webpack.config.js',
        'src/background/service-worker.js',
        'src/content/content.js',
        'src/panel/sidepanel.js'
    ];

    for (const file of criticalFiles) {
        const status = await checkPath(file);
        console.log(`  ${status.exists ? '✅' : '❌'} ${file}`);
    }

    // 4. Check Webpack Installation
    console.log('\nWebpack Installation:');
    const webpackPaths = [
        'node_modules/.bin/webpack.cmd',
        'node_modules/.bin/webpack',
        'node_modules/webpack/bin/webpack.js',
        'node_modules/webpack/package.json'
    ];

    for (const webpackPath of webpackPaths) {
        const status = await checkPath(webpackPath);
        console.log(`  ${status.exists ? '✅' : '❌'} ${webpackPath}`);
    }

    // 5. Check Dependencies
    console.log('\nDependency Check:');
    const pkg = require('../package.json');
    console.log('  webpack:', pkg.devDependencies?.webpack || 'missing');
    console.log('  webpack-cli:', pkg.devDependencies?.['webpack-cli'] || 'missing');

    // 6. Try Webpack Command
    console.log('\nTesting Webpack:');
    const webpackTest = await runCommand('yarn', ['run', 'webpack', '--version']);
    console.log('  Command test:', webpackTest.success ? '✅ Successful' : '❌ Failed');
    if (!webpackTest.success) {
        console.log('  Error:', webpackTest.output);
    }

    // 7. Check node_modules structure
    console.log('\nNode Modules Structure:');
    const nodeModulesResult = await checkPath('node_modules');
    if (nodeModulesResult.exists) {
        console.log('  ✅ node_modules exists');
        // Check key packages
        const packages = ['webpack', 'webpack-cli'];
        for (const pkg of packages) {
            const pkgResult = await checkPath(`node_modules/${pkg}`);
            console.log(`  ${pkgResult.exists ? '✅' : '❌'} ${pkg}`);
        }
    } else {
        console.log('  ❌ node_modules missing');
    }

    // 8. Final Report
    console.log('\n📋 Verification Summary:');
    if (!nodeModulesResult.exists) {
        console.log('❌ Dependencies not properly installed. Try:');
        console.log('1. yarn cache clean');
        console.log('2. yarn install --force');
    } else if (!webpackTest.success) {
        console.log('❌ Webpack not properly configured. Try:');
        console.log('1. yarn remove webpack webpack-cli');
        console.log('2. yarn add -D webpack webpack-cli');
        console.log('3. yarn install');
    }
}

// Run verification
verifyInstallation().catch(error => {
    console.error('❌ Verification failed:', error);
    process.exit(1);
});