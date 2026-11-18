// Astro configuration. Docs: https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Replace with the real domain once it is registered (used for sitemaps and share links).
  site: 'https://example.co.za',
  // 'static' means every page is built to plain HTML at build time. No server needed.
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
