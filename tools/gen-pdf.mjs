// Gera relatorio-tcc.pdf a partir do site (aproveitando o @media print).
// Requer: npm i --no-save puppeteer  (~200 MB inclui Chromium)
// Uso:  node tools/serve.mjs &   # ou npx serve .
//       node tools/gen-pdf.mjs http://localhost:3000
import puppeteer from 'puppeteer';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const out = resolve(__dirname, '..', 'assets', 'docs', 'relatorio-tcc.pdf');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.emulateMediaType('print');
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
// espera imagens/fontes
await page.evaluate(async () => {
  await document.fonts.ready;
  const imgs = Array.from(document.images);
  await Promise.all(imgs.map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })));
});

await page.pdf({
  path: out,
  format: 'A4',
  printBackground: true,
  margin: { top: '18mm', right: '15mm', bottom: '18mm', left: '15mm' },
  displayHeaderFooter: true,
  headerTemplate: '<div style="font-family:system-ui;font-size:8px;color:#666;width:100%;padding:0 15mm;">TCC Edificações · ETEC Jundiaí 2026</div>',
  footerTemplate: '<div style="font-family:system-ui;font-size:8px;color:#666;width:100%;padding:0 15mm;text-align:right;">página <span class="pageNumber"></span> de <span class="totalPages"></span></div>',
});

await browser.close();
console.log(`gerado ${out}`);
