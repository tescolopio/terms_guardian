const fs = require('fs');

console.log('Checking package.json configuration...\n');

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

console.log('Dependencies:', pkg.dependencies ?? {});
console.log('\nDevDependencies:', pkg.devDependencies ?? {});
console.log('\nScripts:', pkg.scripts ?? {});

if (!pkg.devDependencies?.webpack) {
    console.log('\n⚠️ webpack not found in devDependencies!');
}

if (!pkg.devDependencies?.['webpack-cli']) {
    console.log('\n⚠️ webpack-cli not found in devDependencies!');
}

if (pkg.dependencies?.webpack) {
    console.log('\n⚠️ webpack should be in devDependencies, not dependencies!');
}