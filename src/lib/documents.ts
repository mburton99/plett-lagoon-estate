// Reads src/data/documents.json and checks it at build time.
// If an entry is wrong (missing file, bad date), the build fails with a clear message
// instead of publishing a broken download link.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import raw from '../data/documents.json';

export interface SiteDocument {
  title: string;
  description: string;
  /** File name inside public/documents/, for example "estate-rules.pdf". */
  file: string;
  /** Last updated date as YYYY-MM-DD, or YYYY-MM when only the month is known. */
  updated: string;
}

export interface DocumentView extends SiteDocument {
  url: string;
  updatedLabel: string;
  sizeLabel: string;
}

const DOCS_DIR = join(process.cwd(), 'public', 'documents');

function formatSize(bytes: number): string {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function getDocuments(): DocumentView[] {
  return (raw as SiteDocument[]).map((doc) => {
    const label = `documents.json entry "${doc.title}"`;
    if (!doc.file.toLowerCase().endsWith('.pdf')) {
      throw new Error(`${label}: "file" must be a .pdf file name, got "${doc.file}".`);
    }
    const path = join(DOCS_DIR, doc.file);
    if (!existsSync(path)) {
      throw new Error(`${label}: public/documents/${doc.file} does not exist. Add the PDF or fix the file name.`);
    }
    // Accept 2026-12-31, or 2026-12 when only the month is known.
    const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(doc.updated);
    const iso = match ? `${match[1]}-${match[2]}-${match[3] ?? '01'}` : '';
    const date = new Date(`${iso}T00:00:00Z`);
    // The last check rejects impossible dates such as 2026-02-31, which JavaScript would silently roll over.
    if (!match || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) {
      throw new Error(`${label}: "updated" must be a date like 2026-12-31 (or 2026-12 for a month), got "${doc.updated}".`);
    }
    const updatedLabel = date.toLocaleDateString('en-ZA', {
      day: match[3] ? 'numeric' : undefined,
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });
    return {
      ...doc,
      url: `/documents/${doc.file}`,
      updatedLabel,
      sizeLabel: formatSize(statSync(path).size),
    };
  });
}
