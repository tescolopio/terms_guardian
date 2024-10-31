/**
 * @file build-libs.js
 * @description Copies and prepares library files for the extension, optimized for Yarn
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Get yarn's global cache directory for package resolution
function getYarnPackagePath(packageName) {
  try {
    // Use yarn to find the package path
    const result = execSync('yarn why ' + packageName, { encoding: 'utf8' });
    const lines = result.split('\n');
    for (const line of lines) {
      if (line.includes('Disk size')) {
        const match = line.match(/Located at (.+)$/);
        if (match) {
          return match[1].replace(/"/g, '');
        }
      }
    }
    throw new Error(`Could not find package path for ${packageName}`);
  } catch (error) {
    // Fallback to node_modules (for non-PnP installations)
    return path.join(process.cwd(), 'node_modules', packageName);
  }
}

// Ensure target directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Download file from URL
async function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(destination);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', error => {
      fs.unlink(destination, () => {});
      reject(error);
    });
  });
}

async function copyLibraryFiles() {
  try {
    // Setup directories
    const libDir = path.join(process.cwd(), 'src', 'lib');
    ensureDirectoryExists(libDir);

    console.log('🚀 Setting up library files...');

    // Get package paths
    const pdfjsPath = getYarnPackagePath('pdfjs-dist');
    const mammothPath = getYarnPackagePath('mammoth');

    // Copy PDF.js files
    const pdfjsFiles = [
      {
        src: path.join(pdfjsPath, 'build', 'pdf.js'),
        dest: 'pdf.js'
      },
      {
        src: path.join(pdfjsPath, 'build', 'pdf.worker.js'),
        dest: 'pdf.worker.js'
      },
      {
        src: path.join(pdfjsPath, 'web', 'pdf_viewer.js'),
        dest: 'pdf_viewer.js'
      },
      {
        src: path.join(pdfjsPath, 'web', 'pdf_viewer.css'),
        dest: 'pdf_viewer.css'
      }
    ];

    for (const file of pdfjsFiles) {
      try {
        fs.copyFileSync(file.src, path.join(libDir, file.dest));
        console.log(`✓ Copied ${file.dest}`);
      } catch (error) {
        console.error(`⚠️ Error copying ${file.dest}:`, error.message);
      }
    }

    // Copy Mammoth
    try {
      fs.copyFileSync(
        path.join(mammothPath, 'mammoth.browser.min.js'),
        path.join(libDir, 'mammoth.browser.min.js')
      );
      console.log('✓ Copied mammoth.browser.min.js');
    } catch (error) {
      console.error('⚠️ Error copying mammoth:', error.message);
    }

    // Copy PDF.js cmaps
    const cmapsDir = path.join(libDir, 'cmaps');
    ensureDirectoryExists(cmapsDir);
    
    try {
      const cmapsSource = path.join(pdfjsPath, 'cmaps');
      const cmapFiles = fs.readdirSync(cmapsSource);
      cmapFiles.forEach(file => {
        fs.copyFileSync(
          path.join(cmapsSource, file),
          path.join(cmapsDir, file)
        );
      });
      console.log('✓ Copied PDF.js cmaps');
    } catch (error) {
      console.error('⚠️ Error copying cmaps:', error.message);
    }

    // Handle CDN dependencies
    const CDN_DEPS = {
      'cheerio.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/cheerio/1.0.0/cheerio.min.js',
      'compromise.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/compromise/14.14.0/compromise.min.js'
    };

    for (const [filename, url] of Object.entries(CDN_DEPS)) {
      const destination = path.join(libDir, filename);
      if (!fs.existsSync(destination)) {
        try {
          console.log(`⬇️ Downloading ${filename}...`);
          await downloadFile(url, destination);
          console.log(`✓ Downloaded ${filename}`);
        } catch (error) {
          console.error(`⚠️ Error downloading ${filename}:`, error.message);
        }
      } else {
        console.log(`✓ ${filename} already exists`);
      }
    }

    console.log('\n✨ Library setup complete!\n');

    // Print summary
    const files = fs.readdirSync(libDir);
    console.log('📚 Installed libraries:');
    files.forEach(file => {
      if (file !== 'cmaps') {
        console.log(`  - ${file}`);
      }
    });
    console.log('\nYou can now build your extension with: yarn build');

  } catch (error) {
    console.error('\n❌ Error setting up libraries:', error);
    process.exit(1);
  }
}

// Run the script
copyLibraryFiles();