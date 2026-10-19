# Maggie's CV and cover letter

Editable, self-contained HTML documents and matching one-page A4 PDFs, rebuilt from the surviving CV. The soft pink sidebar, rose headings and serif name treatment follow the original design. No hosted fonts, images or external services are needed to view the HTML.

## Edit and rebuild

- `content/original.json`: manually recovered original CV content. Keep this as the baseline.
- `content/insight-admin.json`: application-specific overrides. Edit the headline, profile, skills, experience, education and technical details here. An array replaces the entire corresponding baseline array.
- `content/cover-letter.json`: editable letter text, recipient and date. Update the date before sending later.
- `templates/cv.css`: shared colours, typography, spacing and print styles for both documents.
- `scripts/build.mjs`: combines the baseline and overrides, escapes the content, builds HTML and exports PDFs with Chromium.

Run `npm run build:html` with Node.js to regenerate the two HTML files without dependencies. For PDF export, install Playwright with `npm install --no-save playwright`, have Google Chrome installed, then run `npm run build`. Set `CV_BROWSER` to another Chromium executable if needed. Alternatively open the generated HTML in Chrome and print to PDF: A4 paper, no margins, background graphics on, browser headers and footers off, scale 100%.

In this Codex workspace, use the existing bundled Playwright rather than installing it:

```powershell
$env:CODEX_NODE_MODULES = 'C:\Users\Jessey\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
npm run build
```

Outputs:

- `output/maggie-cv.html`
- `output/maggie-cover-letter.html`
- `output/pdf/Maggie-Waigwe-Karanja-CV.pdf`
- `output/pdf/Maggie-Waigwe-Karanja-Cover-Letter.pdf`

Generated HTML is also directly editable and portable. Edit the JSON/CSS for changes that should survive the next build. Recheck page count and print layout after increasing text length; the build does not truncate or silently shrink content.

## Content provenance and review

See `PROVENANCE.md` for the evidence, reconstruction boundaries and details still to confirm. The original PDF is retained unchanged. This is a reconstructed source, not recovered original HTML. No application has been emailed or submitted.
