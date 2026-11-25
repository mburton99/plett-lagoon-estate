# How to update the website

You never upload files to the web host by hand. You change files in this project, push to GitHub, and the site rebuilds and goes live by itself (usually within a couple of minutes).

## Where things live
| What | Where |
|---|---|
| Gallery photos | `src/assets/gallery/` |
| Other images (hero, renders, logos) | `src/assets/` |
| Downloadable PDFs | `public/documents/` |
| The list shown on the Documents page | `src/data/documents.json` |
| Full-resolution originals (backup) | Google Drive, `Originals/` |

## Add a photo
1. Keep the original in Google Drive under `Originals/`.
2. Make a web copy: JPEG, about 2,400 px on the long edge, under about 1.5 MB. Name it in lowercase with hyphens, for example `lagoon-sunrise-01.jpg`. (Claude Code can do this for you.)
3. Put the web copy in `src/assets/gallery/`.
4. Commit and push.

## Remove a photo
Delete the file from `src/assets/gallery/`, then commit and push. The original stays safe in Drive.

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
The error message says what is wrong, for example a file name in `documents.json` that does not match a PDF, or a date that is not written like 2026-12-31. Fix it and push again. The live site stays unchanged until a build succeeds.

## Check before you push
```
npm run build
npm run check
```

## Launch checklist (later)
- Search engines are currently told **not** to list the site. This is set in `public/_headers`. When the site is ready to be found on Google, delete the `/*` rule in that file (or the whole file), then commit and push.
