import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFile(path.join(root, file), 'utf8');
const original = JSON.parse(await read('content/original.json'));
const tailored = JSON.parse(await read('content/insight-admin.json'));
const cv = { ...original, ...tailored };
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list = items => `<ul>${items.map(item => `<li>${esc(item)}</li>`).join('')}</ul>`;
const section = (title, body) => `<section><h2>${title}</h2>${body}</section>`;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cv.name)} - CV</title><style>${await read('templates/cv.css')}</style></head>
<body><article class="page" aria-label="Curriculum vitae"><header><h1>${esc(cv.name)}</h1><p class="headline">${esc(cv.headline)}</p><div class="contact"><span>${esc(cv.location)}</span><span>${esc(cv.phone)}</span><a href="mailto:${esc(cv.email)}">${esc(cv.email)}</a></div></header>
<div class="columns"><aside aria-label="Skills, education and languages">
${section('Skills', list(cv.skills))}
${section('Education', cv.education.map(e => `<div class="education-item"><p class="qualification">${esc(e.qualification)}</p>${e.institution ? `<p>${esc(e.institution)}</p>` : ''}<p class="dates">${esc(e.dates)}</p></div>`).join(''))}
${section('Languages', list(cv.languages))}</aside>
<main>${section('Professional profile', `<p>${esc(cv.profile)}</p>`)}
${section('Relevant experience', cv.experience.map(job => `<article class="job"><div class="job-heading"><h3><strong>${esc(job.role)}</strong> - ${esc(job.employer)}</h3><span class="dates">${esc(job.dates)}</span></div>${job.context ? `<p class="context">${esc(job.context)}</p>` : ''}${list(job.bullets)}</article>`).join(''))}
${cv.technical ? section('Systems & remote working', `<p>${esc(cv.technical)}</p><p class="equipment">${esc(cv.equipment)}</p>`) : ''}
${cv.referenceNote ? `<p class="reference-note">${esc(cv.referenceNote)}</p>` : section('References', `<div class="references">${cv.references.map(r => `<div><strong>${esc(r.name)}</strong><p>${esc(r.description)}</p><p class="phone">${esc(r.phone)}</p></div>`).join('')}</div>`)}
</main></div></article></body></html>`;
await fs.mkdir(path.join(root, 'output/pdf'), { recursive: true });
const htmlPath = path.join(root, 'output/maggie-cv.html');
await fs.writeFile(htmlPath, html);
const letter = JSON.parse(await read('content/cover-letter.json'));
const signatureMarkup = letter.signatureStyle === 'abstract'
  ? `<img class="abstract-signature" src="data:image/svg+xml;base64,${Buffer.from(await read('templates/signature.svg')).toString('base64')}" alt="Stylised signature for ${esc(letter.signature)}">`
  : letter.signature ? `<p class="handwritten-signature" aria-label="Typed signature">${esc(letter.signature)}</p>` : '';
const letterHtml = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(cv.name)} - Cover letter</title><style>${await read('templates/cv.css')}</style></head><body><article class="page"><header><h1>${esc(cv.name)}</h1><p class="headline">${esc(cv.headline)}</p><div class="contact"><span>${esc(cv.location)}</span><span>${esc(cv.phone)}</span><a href="mailto:${esc(cv.email)}">${esc(cv.email)}</a></div></header><main class="letter-body"><div class="letter-meta"><div>${letter.recipient.map(esc).join('<br>')}</div><div>${esc(letter.date)}</div></div><h2>${esc(letter.subject)}</h2><p>${esc(letter.salutation)}</p>${letter.paragraphs.map(p => `<p>${esc(p)}</p>`).join('')}<p>${esc(letter.closing)}</p><p class="signature">${esc(cv.name)}</p>${signatureMarkup}</main></article></body></html>`;
await fs.writeFile(path.join(root, 'output/maggie-cover-letter.html'), letterHtml);
if (!process.argv.includes('--html-only')) {
  let playwright;
  try { playwright = (await import('playwright')).default; }
  catch (error) {
    if (!process.env.CODEX_NODE_MODULES) throw new Error('Install playwright (npm install --no-save playwright) or set CODEX_NODE_MODULES to the bundled node_modules folder.', { cause: error });
    playwright = createRequire(import.meta.url)(path.join(process.env.CODEX_NODE_MODULES, 'playwright'));
  }
  const options = process.env.CV_BROWSER ? { executablePath: process.env.CV_BROWSER } : { channel: 'chrome' };
  const browser = await playwright.chromium.launch({ ...options, headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1300 } });
    for (const [document, filename] of [[html, 'Maggie-Waigwe-Karanja-CV.pdf'], [letterHtml, 'Maggie-Waigwe-Karanja-Cover-Letter.pdf']]) {
      await page.setContent(document, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ path: path.join(root, 'output/pdf', filename), format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
    }
    console.log('Built editable HTML and PDFs for CV and cover letter.');
  } finally { await browser.close(); }
} else { console.log('Built editable HTML.'); }
