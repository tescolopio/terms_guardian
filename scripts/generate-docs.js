/**
 * @file generate-docs.js
 * @description Documentation generator for Terms Guardian extension
 */

const fs = require('fs');
const path = require('path');
const jsdoc2md = require('jsdoc-to-markdown');
const glob = require('glob');
const prettier = require('prettier');
const { execSync } = require('child_process');

// Configuration for documentation generation
const config = {
  srcDir: path.join(process.cwd(), 'src'),
  docsDir: path.join(process.cwd(), 'docs'),
  apiDocsDir: path.join(process.cwd(), 'docs', 'api'),
  readmeTemplate: path.join(process.cwd(), 'scripts', 'templates', 'README.template.md'),
  categories: {
    analysis: 'Text Analysis Modules',
    background: 'Background Service',
    content: 'Content Scripts',
    utils: 'Utility Modules',
    panel: 'Side Panel UI'
  }
};

/**
 * Ensures all necessary directories exist
 */
function ensureDirectories() {
  [config.docsDir, config.apiDocsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Generates API documentation from JSDoc comments
 */
async function generateApiDocs() {
  console.log('📝 Generating API documentation...');

  const categories = Object.keys(config.categories);
  
  for (const category of categories) {
    const files = glob.sync(`src/${category}/**/*.js`);
    
    if (files.length === 0) continue;

    const output = await jsdoc2md.render({
      files: files,
      template: loadTemplate('api-category'),
      data: {
        category: config.categories[category],
        files: files.map(f => path.basename(f))
      }
    });

    const outputFile = path.join(config.apiDocsDir, `${category}.md`);
    fs.writeFileSync(outputFile, output);
    console.log(`✓ Generated documentation for ${category}`);
  }
}

/**
 * Generates directory structure documentation
 */
function generateDirectoryDocs() {
  console.log('📁 Generating directory structure documentation...');
  
  function generateTree(dir, prefix = '') {
    let tree = '';
    const items = fs.readdirSync(dir);
    
    items.sort((a, b) => {
      // Directories first
      const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
      const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    items.forEach((item, index) => {
      const isLast = index === items.length - 1;
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      const isDirectory = stat.isDirectory();
      
      // Skip node_modules, dist, and hidden directories
      if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
        return;
      }

      // Add item to tree
      tree += `${prefix}${isLast ? '└── ' : '├── '}${item}\n`;

      // Recursively process directories
      if (isDirectory) {
        tree += generateTree(fullPath, `${prefix}${isLast ? '    ' : '│   '}`);
      }
    });

    return tree;
  }

  const tree = generateTree(config.srcDir);
  fs.writeFileSync(
    path.join(config.docsDir, 'directory-structure.md'),
    '# Project Directory Structure\n\n```\n' + tree + '```\n'
  );
}

/**
 * Generates Chrome extension documentation
 */
function generateExtensionDocs() {
  console.log('🔌 Generating extension documentation...');

  const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'manifest.json')));
  const template = loadTemplate('extension');
  
  const extensionDocs = template
    .replace('{{name}}', manifest.name)
    .replace('{{version}}', manifest.version)
    .replace('{{description}}', manifest.description)
    .replace('{{permissions}}', manifest.permissions.join(', '));

  fs.writeFileSync(
    path.join(config.docsDir, 'extension.md'),
    extensionDocs
  );
}

/**
 * Generates setup and build documentation
 */
function generateBuildDocs() {
  console.log('🔨 Generating build documentation...');

  // Get Yarn dependencies
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
  
  const template = loadTemplate('build');
  const buildDocs = template
    .replace('{{dependencies}}', JSON.stringify(packageJson.dependencies, null, 2))
    .replace('{{devDependencies}}', JSON.stringify(packageJson.devDependencies, null, 2))
    .replace('{{scripts}}', JSON.stringify(packageJson.scripts, null, 2));

  fs.writeFileSync(
    path.join(config.docsDir, 'build.md'),
    buildDocs
  );
}

/**
 * Updates the main README.md file
 */
function updateReadme() {
  console.log('📄 Updating README.md...');

  const template = loadTemplate('readme');
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json')));
  
  let readme = template
    .replace('{{name}}', packageJson.name)
    .replace('{{description}}', packageJson.description)
    .replace('{{version}}', packageJson.version);

  // Format with Prettier
  readme = prettier.format(readme, { parser: 'markdown' });
  
  fs.writeFileSync(path.join(process.cwd(), 'README.md'), readme);
}

/**
 * Loads a documentation template
 */
function loadTemplate(name) {
  const templatePath = path.join(__dirname, 'templates', `${name}.template.md`);
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Main documentation generation function
 */
async function generateDocs() {
  try {
    console.log('🚀 Starting documentation generation...');
    
    // Ensure directories exist
    ensureDirectories();

    // Generate all documentation
    await generateApiDocs();
    generateDirectoryDocs();
    generateExtensionDocs();
    generateBuildDocs();
    updateReadme();

    console.log('✨ Documentation generated successfully!');
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

// Run the generator
generateDocs();