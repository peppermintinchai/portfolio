import { spawn } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ghpages = require('gh-pages');

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');
const branch = process.env.PAGES_BRANCH || process.env.GH_PAGES_BRANCH || 'gh-pages';
const repo = process.env.PAGES_REPO || undefined;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
      ...options
    });

    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

function publish() {
  return new Promise((resolve, reject) => {
    ghpages.publish(distDir, {
      branch,
      repo,
      dotfiles: true,
      message: `Deploy portfolio to GitHub Pages (${new Date().toISOString()})`
    }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

console.log('Building optimized dist/...');
await run('npm', ['run', 'build']);

console.log(`Publishing dist/ to ${branch}...`);
await publish();

console.log(`Deploy complete. GitHub Pages branch: ${branch}`);
