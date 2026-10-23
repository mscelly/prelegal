# Prelegal Frontend

A Next.js app for drafting a [Common Paper Mutual NDA](https://commonpaper.com/standards/mutual-nda/1.0).
The user fills in the key details in a form, sees the completed agreement in a live preview,
and downloads it as a PDF.

The agreement text comes from the Markdown templates in [`../templates`](../templates), which are
read at build time and filled in by the pure functions in [`lib/nda.ts`](lib/nda.ts).

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # unit tests (Vitest)
npm run test:e2e  # browser smoke test (Playwright); first run: npx playwright install chromium
npm run lint
npm run typecheck
npm run build
```

## Download as PDF

"Download PDF" opens the browser's print dialog with a print stylesheet that shows only the
agreement. Choose **Save as PDF** as the destination. This keeps the text in the PDF selectable
and searchable without needing a PDF library.
