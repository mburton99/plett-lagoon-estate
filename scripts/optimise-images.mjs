// Prepares photos for the website gallery.
//
// Usage:   npm run optimise -- <folder-with-originals> [--out src/assets/gallery] [--max 2400] [--force]
//
// For every photo it finds, it:
//   - fixes the rotation, then removes hidden metadata (including GPS location) for privacy
//   - converts to sRGB so colours look the same on every screen
//   - shrinks it so the longest edge is at most 2400 px (never enlarges small photos)
//   - saves it as a JPEG under about 1.5 MB, with a clean lowercase-hyphen file name
//   - adds an empty entry for it to src/data/gallery.json, so you only have to write the description
//
// Your originals are never changed. Existing files are skipped unless you pass --force.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const MAX_BYTES = 1.5 * 1024 * 1024;
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);
const GALLERY_JSON = resolve('src/data/gallery.json');

// --- read the command line -------------------------------------------------
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const valueFlags = new Set(['--out', '--max']);
const positional = args.filter((a, i) => !a.startsWith('--') && !valueFlags.has(args[i - 1]));

const inputDir = positional[0];
const outDir = resolve(option('--out', 'src/assets/gallery'));
const maxEdge = Number(option('--max', '2400'));
const force = flag('--force');

if (!inputDir || !existsSync(inputDir) || !statSync(inputDir).isDirectory()) {
  console.error('Please give the folder that holds your original photos, for example:');
  console.error('  npm run optimise -- ~/Pictures/new-photos');
  process.exit(1);
}
if (!Number.isFinite(maxEdge) || maxEdge < 400) {
  console.error('--max must be a number of pixels, such as 2400.');
  process.exit(1);
}

// "IMG 0042 (Final).JPG" -> "img-0042-final.jpg"
const cleanName = (file) =>
  basename(file, extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'photo';

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

// --- process each photo ------------------------------------------------------
mkdirSync(outDir, { recursive: true });
const sources = readdirSync(inputDir)
  .filter((f) => SOURCE_EXTENSIONS.has(extname(f).toLowerCase()))
  .sort();

if (sources.length === 0) {
  console.error(`No photos found in ${inputDir}. Supported: ${[...SOURCE_EXTENSIONS].join(', ')}`);
  process.exit(1);
}

const written = [];
const seenNames = new Set();
for (const file of sources) {
  const outName = `${cleanName(file)}.jpg`;
  const outPath = join(outDir, outName);

  if (seenNames.has(outName)) {
    console.warn(`SKIPPED  ${file}: another photo in this folder would also be called ${outName}. Rename one.`);
    continue;
  }
  seenNames.add(outName);
  if (existsSync(outPath) && !force) {
    console.warn(`SKIPPED  ${file}: ${outName} already exists. Use --force to replace it.`);
    continue;
  }

  const source = join(inputDir, file);
  const meta = await sharp(source).metadata();
  let quality = 82;
  let buffer;
  do {
    buffer = await sharp(source)
      .rotate() // apply the camera's rotation, then the metadata can go
      .resize({ width: maxEdge, height: maxEdge, fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' }) // PNGs with transparency become white
      .withIccProfile('srgb')
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    quality -= 6;
  } while (buffer.length > MAX_BYTES && quality >= 58);

  writeFileSync(outPath, buffer);
  const out = await sharp(buffer).metadata();
  const small = Math.max(out.width ?? 0, out.height ?? 0) < 1600;
  written.push(outName);
  console.log(
    `${small ? 'LOW-RES' : 'OK     '}  ${file} -> ${outName}  ${meta.width}x${meta.height} -> ${out.width}x${out.height}, ${kb(buffer.length)}` +
      (small ? '  (small original: will look soft on large screens)' : '') +
      (buffer.length > MAX_BYTES ? '  (still over 1.5 MB)' : ''),
  );
}

// --- add empty entries to gallery.json --------------------------------------
if (written.length > 0) {
  const list = existsSync(GALLERY_JSON) ? JSON.parse(readFileSync(GALLERY_JSON, 'utf8')) : [];
  const listed = new Set(list.map((entry) => entry.file));
  const added = written.filter((name) => !listed.has(name));
  for (const name of added) list.push({ file: name, alt: '' });
  writeFileSync(GALLERY_JSON, `${JSON.stringify(list, null, 2)}\n`);
  console.log(`\n${written.length} photo(s) saved to ${outDir}`);
  if (added.length > 0) {
    console.log(`Added ${added.length} new entr${added.length === 1 ? 'y' : 'ies'} to src/data/gallery.json.`);
    console.log('NEXT: open that file and write a short "alt" description for each new photo.');
    console.log('The build will stop until every photo has one. Entries show in the order they appear in the file.');
  }
}
