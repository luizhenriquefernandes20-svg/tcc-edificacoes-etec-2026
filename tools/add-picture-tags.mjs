// Converte cada <img src="…jpg"> do index.html em <picture> com <source srcset="…webp">.
// Só faz o wrap se o arquivo .webp correspondente existir.
// Uso: node tools/add-picture-tags.mjs
import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML = join(__dirname, '..', 'index.html');
const ROOT = join(__dirname, '..');

async function exists(rel) {
  try { await access(join(ROOT, rel)); return true; } catch { return false; }
}

let html = await readFile(HTML, 'utf8');
let count = 0, skipped = 0;

// Regex conservador: pega <img …src="algo.jpg" …/> não aninhado em picture.
const imgRegex = /<img([^>]*?)\ssrc="([^"]+\.jpe?g)"([^>]*?)\/?>/gi;
const chunks = [];
let lastIdx = 0;
const matches = [...html.matchAll(imgRegex)];

for (const m of matches) {
  const [full, pre, src, post] = m;
  const start = m.index;
  const before = html.slice(Math.max(0, start - 12), start);
  if (/<picture[^>]*>\s*$/i.test(before)) { skipped++; continue; } // já dentro de picture

  const webpRel = src.replace(/\.jpe?g$/i, '.webp');
  if (!await exists(webpRel)) { skipped++; continue; }

  chunks.push(html.slice(lastIdx, start));
  chunks.push(`<picture><source srcset="${webpRel}" type="image/webp"/><img${pre} src="${src}"${post}/></picture>`);
  lastIdx = start + full.length;
  count++;
}
chunks.push(html.slice(lastIdx));

await writeFile(HTML, chunks.join(''), 'utf8');
console.log(`${count} <img> convertidos em <picture>, ${skipped} ignorados.`);
