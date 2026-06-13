import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { minify as minifyHtml } from 'html-minifier-terser';
import CleanCSS from 'clean-css';
import { minify as minifyJs } from 'terser';
import sharp from 'sharp';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(rootDir, 'dist');

const skippedDirs = new Set(['.git', 'node_modules', 'dist', 'scripts']);
const skippedRootFiles = new Set([
  'DEPLOYMENT.md',
  'PROJECT_OVERVIEW.md',
  'package.json',
  'package-lock.json',
  'serve.py'
]);
const videoExts = new Set(['.mp4', '.mov', '.m4v', '.webm', '.ogv']);
const imageExts = new Set(['.jpg', '.jpeg', '.png']);
const minifyExts = new Set(['.html', '.css', '.js']);

const stats = {
  copied: 0,
  minified: 0,
  optimizedImages: 0,
  preservedVideos: 0,
  savedBytes: 0
};

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function removeDist() {
  if (await exists(distDir)) {
    await fs.rm(distDir, { recursive: true, force: true });
  }
  await fs.mkdir(distDir, { recursive: true });
}

async function sha256(filePath) {
  const buffer = await fs.readFile(filePath);
  return createHash('sha256').update(buffer).digest('hex');
}

async function copyFile(src, dest, count = true) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.copyFile(src, dest);
  if (count) stats.copied += 1;
}

async function preserveVideo(src, dest) {
  const before = await sha256(src);
  await copyFile(src, dest, false);
  const after = await sha256(dest);

  if (before !== after) {
    throw new Error(`Video preservation failed checksum verification: ${path.relative(rootDir, src)}`);
  }

  stats.preservedVideos += 1;
}

async function minifyTextAsset(src, dest, ext) {
  const original = await fs.readFile(src, 'utf8');
  let output = original;

  if (ext === '.html') {
    output = await minifyHtml(original, {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      minifyCSS: true,
      minifyJS: true
    });
  }

  if (ext === '.css') {
    output = new CleanCSS({ level: 2 }).minify(original).styles;
  }

  if (ext === '.js') {
    const result = await minifyJs(original, {
      compress: true,
      mangle: true,
      format: { comments: false }
    });
    output = result.code ?? original;
  }

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, output);
  stats.minified += 1;
  stats.savedBytes += Buffer.byteLength(original) - Buffer.byteLength(output);
}

async function optimizeImage(src, dest, ext) {
  const before = (await fs.stat(src)).size;
  let pipeline = sharp(src).rotate();

  if (ext === '.png') {
    pipeline = pipeline.png({
      compressionLevel: 9,
      adaptiveFiltering: true,
      palette: true
    });
  } else {
    pipeline = pipeline.jpeg({
      quality: 84,
      mozjpeg: true
    });
  }

  await fs.mkdir(path.dirname(dest), { recursive: true });
  await pipeline.toFile(dest);

  const after = (await fs.stat(dest)).size;
  if (after > before) {
    await fs.copyFile(src, dest);
  } else {
    stats.savedBytes += before - after;
  }

  stats.optimizedImages += 1;
}

async function processFile(src) {
  const rel = path.relative(rootDir, src);
  if (!rel.includes(path.sep) && skippedRootFiles.has(rel)) return;

  const dest = path.join(distDir, rel);
  const ext = path.extname(src).toLowerCase();

  if (videoExts.has(ext)) {
    await preserveVideo(src, dest);
    return;
  }

  if (minifyExts.has(ext)) {
    await minifyTextAsset(src, dest, ext);
    return;
  }

  if (imageExts.has(ext)) {
    await optimizeImage(src, dest, ext);
    return;
  }

  await copyFile(src, dest);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') || skippedDirs.has(entry.name)) continue;

    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(absolute);
    } else if (entry.isFile()) {
      await processFile(absolute);
    }
  }
}

await removeDist();
await walk(rootDir);

console.log('Build complete: dist/');
console.log(`Minified text assets: ${stats.minified}`);
console.log(`Optimized images: ${stats.optimizedImages}`);
console.log(`Videos copied without modification: ${stats.preservedVideos}`);
console.log(`Other files copied: ${stats.copied}`);
console.log(`Approx bytes saved: ${stats.savedBytes}`);
