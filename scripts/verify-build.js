/**
 * @file verify-build.js
 * @description Verifies build environment and dependencies
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function logHeader(message) {
  console.log('\n' + '='.repeat(50));
  console.log(message);
  console.log('='.repeat(50) + '\n');
}

function checkEnvironment() {
  logHeader('🔍 Build Environment Verification');

  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js Version: ${nodeVersion}`);

  // Check Yarn version
  const yarnVersion = execSync('yarn --version', { encoding: 'utf8' }).trim();
  console.log(`Yarn Version: ${yarnVersion}`);

  // Check webpack installation
  try {
    const webpackVersion = execSync('yarn webpack --version', { encoding: 'utf8' }).trim();
    console.log(`Webpack Version: ${webpackVersion}`);
  } catch (error) {
    throw new Error('Webpack not properly installed. Try running: yarn add -D webpack webpack-cli');
  }

  logHeader('📁 Required Files Check');

  // Check if necessary files exist
  const requiredFiles = [
    ['config/webpack.config.js', 'Webpack configuration'],
    ['package.json', 'Package configuration'],
    ['.yarnrc.yml', 'Yarn configuration'],
    ['src', 'Source directory']
  ];

  requiredFiles.forEach(([file, description]) => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`${exists ? '✓' : '✗'} ${description} (${file})`);
    
    if (!exists) {
      throw new Error(`Missing required file: ${file}`);
    }
  });

  logHeader('📦 Dependencies Check');

  // Check for necessary build dependencies
  const requiredDeps = [
    'webpack',
    'webpack-cli',
    'cross-env',
    'rimraf'
  ];

  const pkg = require(path.join(process.cwd(), 'package.json'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  requiredDeps.forEach(dep => {
    if (!allDeps[dep]) {
      throw new Error(`Missing required dependency: ${dep}`);
    }
    console.log(`✓ ${dep} found`);
  });

  logHeader('🔧 Webpack Config Check');

  // Verify webpack config can be required
  try {
    require(path.join(process.cwd(), 'config', 'webpack.config.js'));
    console.log('✓ Webpack config is valid');
  } catch (error) {
    throw new Error(`Invalid webpack config: ${error.message}`);
  }

  logHeader('✅ Verification Complete');
  console.log('All checks passed! You can now run: yarn build');
}

try {
  checkEnvironment();
} catch (error) {
  console.error('\n❌ Verification failed:');
  console.error(error.message);
  process.exit(1);
}