# Plett Lagoon Estate website

Informational website for Plett Lagoon Estate, Plettenberg Bay. Static site: no backend, no database.

## Stack
- Astro (static output), Tailwind CSS v4, TypeScript (strict).
- Deployed to Cloudflare (Workers static assets) from the `main` branch. Config: `wrangler.jsonc`.

## Commands
- `npm install` once, then `npm run dev` for a local preview (http://localhost:4321).
- `npm run build` builds into `dist/`. `npm run check` type-checks. Run both before pushing.

## Layout
- `src/pages/` one file per page (index, estate, gallery, developers, documents).
- `src/layouts/Layout.astro` shared header, navigation and footer.
- `src/assets/gallery/` gallery photos (processed by Astro into web sizes at build time).
- `src/data/gallery.json` order, alt text and captions for the gallery. `src/lib/gallery.ts` validates it at build time (every photo listed, alt text required). `src/components/Gallery.astro` is the grid and lightbox.
- `scripts/optimise-images.mjs` (`npm run optimise -- <folder>`) turns originals into the 2,400 px web copies and adds gallery.json entries.
- `src/assets/hero/` cover images for each page, `src/assets/brand/` transparent logo masks (the logo takes the text colour), `src/assets/` renders.
- `public/documents/` downloadable PDFs, served as-is at `/documents/<file>`.
- `src/data/documents.json` list shown on the Documents page. `src/lib/documents.ts` validates it at build time.

## Rules
- Keep the site static. Do not add a server, database or tracking without discussing it first.
- Documents: the PDF name in `documents.json` must match a file in `public/documents/`. Keep file names stable (for example `estate-rules.pdf`) so links never break. Update the `updated` date when replacing a file.
- Photos in the repo are resized copies (about 2,400 px on the long edge, JPEG, under about 1.5 MB). Full-resolution originals live in Google Drive, never in this repo.
- Concept renders must be captioned as an architect's impression. Do not state facts (plot counts, sizes, dates, contact details) that are not confirmed; use clearly marked placeholders such as [DATE].
- Use semantic HTML, alt text on every image, and keep layouts working at phone width.
- Work on a branch and open a pull request for anything beyond a small content change.

## Search engines
- `public/_headers` currently tells search engines not to index anything (`X-Robots-Tag: noindex`). This is deliberate while the site is unfinished. Remove the rule at launch, and only when Michael says so.

## Design concepts (temporary)
- Five design directions share one set of pages: `<html data-theme="1..5">` in `src/styles/global.css` (Tide, Off-shutter, Sandbank, Fynbos, Last light). The bar at the bottom of every page switches between them (`?concept=3` also works).
- All five keep: full-screen home cover with slow zoom, header that turns solid on scroll, one page per section.
- Once Michael picks one, delete the other four themes, the switcher bar and the theme bootstrap script in `Layout.astro`, and fold the chosen tokens into plain CSS. Do not let the preview scaffolding reach launch.
- Copy and photos in the concepts are placeholders (marked with dashed `[brackets]`). Hero images in `src/assets/hero/` are copies of the AI placeholder photos.

## Status
Foundation plus design concepts for review. Visual design is not final and all current content is placeholder.
