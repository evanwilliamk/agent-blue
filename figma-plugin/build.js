// Build script for Figma plugin
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build plugin code (TypeScript → JavaScript)
esbuild.build({
  entryPoints: ['src/code.ts'],
  bundle: true,
  outfile: 'dist/code.js',
  platform: 'node',
  target: 'es2020',
  logLevel: 'info',
}).catch(() => process.exit(1));

// Copy UI HTML
fs.copyFileSync('src/ui.html', 'dist/ui.html');

// Copy manifest
fs.copyFileSync('manifest.json', 'dist/manifest.json');

console.log('✓ Build complete! Plugin ready in dist/');
