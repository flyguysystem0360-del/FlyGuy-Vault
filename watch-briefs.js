#!/usr/bin/env node

/**
 * Windows 11 & Cross-Platform Brief Watcher Script
 * Continuously monitors the ./briefs/ directory for incoming JSON brief files
 * and automatically triggers compilation via brand-compiler-cli.js or Docker.
 * 
 * Setup:
 * 1. Create a folder named "briefs" in your project root.
 * 2. Drop any brief JSON file (e.g., client-01.json) into ./briefs/
 * 3. The watcher automatically compiles the result into ./output/
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const BRIEFS_DIR = path.join(process.cwd(), 'briefs');
const OUTPUT_DIR = path.join(process.cwd(), 'output');
const PROCESSED_DIR = path.join(process.cwd(), 'briefs', 'processed');

// Ensure required directories exist
[BRIEFS_DIR, OUTPUT_DIR, PROCESSED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('====================================================');
console.log('🤖 Windows 11 Real-Time Brief Watcher Active');
console.log(`📁 Watching directory: ${BRIEFS_DIR}`);
console.log(`🚀 Compiled outputs:   ${OUTPUT_DIR}`);
console.log('====================================================\n');

function processBriefFile(filename) {
  const filePath = path.join(BRIEFS_DIR, filename);

  // Skip directories or non-json files
  if (filename === 'processed' || !filename.endsWith('.json')) return;

  // Give Windows file system a short delay to finalize writing the file
  setTimeout(() => {
    if (!fs.existsSync(filePath)) return;

    console.log(`\n⚡ New brief detected: ${filename}`);

    try {
      const rawData = fs.readFileSync(filePath, 'utf8');
      const briefData = JSON.parse(rawData);

      const brandName = briefData.name || briefData.brandName || 'Custom Brand';
      const vertical = briefData.vertical || 'fashion';
      const briefText = briefData.brief || '';
      const palette = briefData.palette ? `--palette "${briefData.palette}"` : '';
      const outputFilename = briefData.output || `output-${Date.now()}-${vertical}.html`;
      const finalOutputPath = path.join(OUTPUT_DIR, outputFilename);

      let command = '';
      if (briefText) {
        command = `node brand-compiler-cli.js --brief "${briefText.replace(/"/g, '\\"')}" --output "${finalOutputPath}"`;
      } else {
        command = `node brand-compiler-cli.js --vertical "${vertical}" --name "${brandName.replace(/"/g, '\\"')}" ${palette} --output "${finalOutputPath}"`;
      }

      console.log(`🛠️ Executing compilation: ${command}`);

      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Compilation error: ${error.message}`);
          return;
        }

        console.log(stdout.trim());
        console.log(`🎉 Successfully generated: ${finalOutputPath}`);

        // Move processed brief to ./briefs/processed/
        const destPath = path.join(PROCESSED_DIR, filename);
        fs.renameSync(filePath, destPath);
        console.log(`📦 Moved brief to: ${destPath}\n`);
      });

    } catch (err) {
      console.error(`⚠️ Failed to parse JSON brief ${filename}: ${err.message}`);
    }
  }, 300);
}

// Watch directory for changes
fs.watch(BRIEFS_DIR, (eventType, filename) => {
  if (filename && eventType === 'rename') {
    const fullPath = path.join(BRIEFS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      processBriefFile(filename);
    }
  }
});
