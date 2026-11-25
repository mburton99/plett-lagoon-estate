// Reads src/data/gallery.json and the photos in src/assets/gallery/, and checks they agree.
// Like the Documents list, this runs at build time: a mistake stops the build with a clear
// message instead of publishing a broken or inaccessible gallery.
import type { ImageMetadata } from 'astro';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import raw from '../data/gallery.json';

export interface GalleryEntry {
  /** File name inside src/assets/gallery/, for example "lagoon-sunrise-01.jpg". */
  file: string;
  /** Short description for people who cannot see the photo (screen readers). Required. */
  alt: string;
  /** Optional caption shown under the photo. */
  caption?: string;
  /** Set to true for architect's renders, so they are labelled "Architect's impression". */
  impression?: boolean;
}

export interface GalleryItem extends GalleryEntry {
  image: ImageMetadata;
}

const GALLERY_DIR = join(process.cwd(), 'src', 'assets', 'gallery');
const SUPPORTED = /\.(jpe?g|png|webp)$/i;

// Astro turns every matching file into an image it can resize at build time.
const modules = import.meta.glob<{ default: ImageMetadata }>('../assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}', {
  eager: true,
});
const byFile = new Map(Object.entries(modules).map(([path, mod]) => [path.split('/').pop()!, mod.default]));

export function getGallery(): GalleryItem[] {
  const entries = raw as GalleryEntry[];
  const seen = new Set<string>();

  const items = entries.map((entry, i) => {
    const label = `gallery.json entry ${i + 1} ("${entry.file ?? 'no file'}")`;
    if (!entry.file) throw new Error(`${label}: "file" is missing.`);
    if (seen.has(entry.file)) throw new Error(`${label}: this photo is listed twice. Remove one entry.`);
    seen.add(entry.file);
    if (!entry.alt || !entry.alt.trim()) {
      throw new Error(`${label}: "alt" is empty. Write a short description of the photo, for example "Sunrise over the lagoon from the north bank."`);
    }
    const image = byFile.get(entry.file);
    if (!image) {
      throw new Error(`${label}: src/assets/gallery/${entry.file} does not exist. Add the photo or fix the file name.`);
    }
    return { ...entry, image };
  });

  // The other direction: every file in the folder must be listed, so nothing is silently left out.
  if (existsSync(GALLERY_DIR)) {
    for (const file of readdirSync(GALLERY_DIR)) {
      if (file.startsWith('.')) continue; // .gitkeep and similar
      if (!SUPPORTED.test(file)) {
        throw new Error(`src/assets/gallery/${file} is not a supported photo type (use .jpg, .png or .webp).`);
      }
      if (!seen.has(file)) {
        throw new Error(
          `src/assets/gallery/${file} is not listed in src/data/gallery.json. Add an entry with a short "alt" description, or delete the photo.`,
        );
      }
    }
  }

  return items;
}
