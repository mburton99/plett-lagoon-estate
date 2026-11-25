# How to update the website

You never upload files to the web host by hand. You change files in this project, push to GitHub, and the site rebuilds and goes live by itself (usually within a couple of minutes).

## Where things live
| What | Where |
|---|---|
| Gallery photos | `src/assets/gallery/` |
| The gallery list (order, descriptions, captions) | `src/data/gallery.json` |
| Other images (hero, renders, logos) | `src/assets/` |
| Downloadable PDFs | `public/documents/` |
| The list shown on the Documents page | `src/data/documents.json` |
| Full-resolution originals (backup) | Google Drive, `Originals/` |

## Add photos
1. Keep the originals in Google Drive under `Originals/`. Copy them to a temporary folder on your computer (outside this project).
2. Make the web copies: `npm run optimise -- "path/to/that/folder"`. It resizes to 2,400 px on the long edge, converts to JPEG, keeps each file under about 1.5 MB, strips hidden data such as GPS location, and puts the copies in `src/assets/gallery/`. It never touches your originals. Photos that are too small are flagged `LOW-RES`; use a bigger original if you have one.
3. Open `src/data/gallery.json`. The command added an entry for each new photo with an empty `"alt"`. Write a short description of what the photo shows (for people using screen readers). Optionally add `"caption": "..."`.
4. The order of the entries in that file is the order on the page. Move an entry up or down to move the photo.
5. For an architect's render, add `"impression": true` so it is labelled "Architect's impression".
6. Run `npm run dev`, look at `/gallery`, then commit and push.

Example entry:
```
{ "file": "lagoon-sunrise-01.jpg", "alt": "Sunrise over the lagoon from the north bank.", "caption": "Sunrise from the north bank" }
```

## Remove a photo
Delete the file from `src/assets/gallery/` **and** its entry from `src/data/gallery.json`, then commit and push. The original stays safe in Drive.

## Add a new document
1. Put the PDF in `public/documents/`.
2. Add an entry to `src/data/documents.json`:
   ```json
   {
     "title": "Estate Rules",
     "description": "Rules for living at Plett Lagoon Estate.",
     "file": "estate-rules.pdf",
     "updated": "2026-12-01"
   }
   ```
3. Commit and push.

The `updated` date is written `2026-12-31`. If only the month is known, write `2026-12` and the site shows "December 2026". The date appears under the Download button, not in the title.

## Replace a document
1. Overwrite the PDF in `public/documents/` using the same file name.
2. Change the `updated` date in `documents.json` to today.
3. Commit and push. The download link stays the same.

## Remove a document
Delete its entry from `documents.json` and delete the PDF, then commit and push.

## If the build fails
The error message says what is wrong, for example a file name in `documents.json` that does not match a PDF, or a date that is not written like 2026-12-31, or a gallery photo with no description or no entry in `gallery.json`. Fix it and push again. The live site stays unchanged until a build succeeds.

## Check before you push
```
npm run build
npm run check
```

## Launch checklist (later)
- Search engines are currently told **not** to list the site. This is set in `public/_headers`. When the site is ready to be found on Google, delete the `/*` rule in that file (or the whole file), then commit and push.
