#!/usr/bin/env node

console.log('Starting basic verification...');

// Basic system info
console.log('\nSystem Information:');
console.log('------------------');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Current directory:', process.cwd());

// Try to load critical files
const fs = require('fs');
const path = require('path');

console.log('\nChecking Critical Files:');
console.log('----------------------');

const filesToCheck = [
    'package.json',
    '.yarnrc.yml',
    'config/webpack.config.js',
    'node_modules/webpack/package.json'
];

filesToCheck.forEach(file => {
    try {
        const exists = fs.existsSync(file);
        console.log(`${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    } catch (err) {
        console.log(`${file}: ERROR - ${err.message}`);
    }
});

// Try to access webpack
console.log('\nChecking Webpack:');
console.log('---------------');
try {
    const webpackPath = require.resolve('webpack');
    console.log('Webpack found at:', webpackPath);
    const webpackPackage = require('webpack/package.json');
    console.log('Webpack version:', webpackPackage.version);
} catch (err) {
    console.log('Webpack error:', err.message);
}

// Exit with a message
console.log('\nVerification complete!');