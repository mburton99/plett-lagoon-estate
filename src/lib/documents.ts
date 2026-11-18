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
  /** Last updated date as YYYY-MM-DD. */
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
    const date = new Date(`${doc.updated}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(doc.updated) || Number.isNaN(date.getTime())) {
      throw new Error(`${label}: "updated" must be a date like 2026-12-31, got "${doc.updated}".`);
    }
    return {
      ...doc,
      url: `/documents/${doc.file}`,
      updatedLabel: date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
      sizeLabel: formatSize(statSync(path).size),
    };
  });
}
