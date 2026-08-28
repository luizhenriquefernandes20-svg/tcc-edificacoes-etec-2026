// Otimiza JPGs existentes + gera WebP paralelo em assets/img/**.
// Uso: node tools/optimize-images.mjs
// Requer: npm i --no-save sharp
import sharp from 'sharp';
import { readdir, stat, mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, relative, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

sharp.cache(false); // libera handles antes do write

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'assets', 'img');

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const p = join(dir, name);
    const s = await stat(p);
    if (s.isDirectory()) out.push(...await walk(p));
    else out.push(p);
  }
  return out;
}

const files = (await walk(ROOT)).filter(f => /\.(jpe?g)$/i.test(f));
console.log(`processando ${files.length} arquivos JPG...`);

let savedJpg = 0, savedWebp = 0, originalTotal = 0;

for (const src of files) {
  const original = (await stat(src)).size;
  originalTotal += original;

  try {
    // lê tudo pra memória antes de escrever (evita lock no Windows)
    const raw = await readFile(src);

    // otimiza JPG in-place: qualidade 82, mozjpeg
    const jpgBuf = await sharp(raw).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
    if (jpgBuf.length < original * 0.95) {
      await writeFile(src, jpgBuf);
      savedJpg += (original - jpgBuf.length);
    }

    // WebP paralelo
    const webpBuf = await sharp(raw).webp({ quality: 78 }).toBuffer();
    const webpPath = src.replace(/\.jpe?g$/i, '.webp');
    await writeFile(webpPath, webpBuf);
    savedWebp += Math.max(0, original - webpBuf.length);
  } catch (err) {
    console.warn(`falhou ${relative(ROOT, src)}: ${err.message}`);
  }
}

const fmt = (b) => (b / 1024 / 1024).toFixed(2) + ' MB';
console.log('');
console.log(`original total: ${fmt(originalTotal)}`);
console.log(`JPG otimizado: -${fmt(savedJpg)}`);
console.log(`WebP total gerado (economia vs JPG): -${fmt(savedWebp)}`);
console.log('done.');
