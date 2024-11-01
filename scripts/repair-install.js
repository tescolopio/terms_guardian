#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function execCommand(command) {
    console.log(`\n► Running: ${command}`);
    try {
        execSync(command, { stdio: 'inherit' });
        return true;
    } catch (error) {
        console.error(`Failed to execute: ${command}`);
        console.error(error.message);
        return false;
    }
}

console.log('🔧 Starting repair process...\n');

// 1. Clean up
console.log('Cleaning up old installations...');
if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
}
if (fs.existsSync('.yarn/cache')) {
    fs.rmSync('.yarn/cache', { recursive: true, force: true });
}
if (fs.existsSync('.yarn/install-state.gz')) {
    fs.rmSync('.yarn/install-state.gz', { force: true });
}

// 2. Update package.json
console.log('\nUpdating package.json...');
const packageJson = require('../package.json');

// Ensure webpack is in devDependencies
packageJson.devDependencies = {
    ...packageJson.devDependencies,
    'webpack': '^5.88.0',
    'webpack-cli': '^5.1.4'
};

// Update scripts
packageJson.scripts = {
    ...packageJson.scripts,
    'webpack': 'webpack',
    'build': 'webpack --config ./config/webpack.config.js --mode development --progress',
    'build:prod': 'webpack --config ./config/webpack.config.js --mode production --progress'
};

fs.writeFileSync(
    path.join(process.cwd(), 'package.json'),
    JSON.stringify(packageJson, null, 2)
);

// 3. Run installation commands
const commands = [
    'yarn cache clean',
    'yarn install --force',
    'yarn add -D webpack webpack-cli --exact'
];

for (const command of commands) {
    if (!execCommand(command)) {
        process.exit(1);
    }
}

// 4. Verify installation
console.log('\nVerifying installation...');
try {
    const webpackPkg = require('webpack/package.json');
    console.log(`✅ Webpack version ${webpackPkg.version} installed successfully!`);
} catch (error) {
    console.error('❌ Webpack installation verification failed:', error.message);
    process.exit(1);
}

console.log('\n✨ Repair complete! Try running your build now.');