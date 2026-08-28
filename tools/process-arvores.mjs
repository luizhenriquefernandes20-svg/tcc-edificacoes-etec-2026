// Processa as fotos-raw das árvores: redimensiona pra 900px, gera .jpg + .webp otimizados.
import sharp from 'sharp';
import { readdir, writeFile, readFile, unlink } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

sharp.cache(false);
const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..', 'assets', 'img', 'arvores');

const items = [
  { raw: 'pau-brasil-raw.jpg',  out: 'pau-brasil' },
  { raw: 'pau-ferro-raw.jpg',   out: 'pau-ferro' },
  { raw: 'flamboyant-raw.jpg',  out: 'flamboyant' },
  { raw: 'espatodea-raw.jpg',   out: 'espatodea' },
];

for (const { raw, out } of items) {
  const src = join(DIR, raw);
  const buf = await readFile(src);
  // JPG otimizado 900px
  const jpg = await sharp(buf).resize(900, null, { fit: 'inside' })
    .jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
  await writeFile(join(DIR, out + '.jpg'), jpg);
  // WebP paralelo
  const webp = await sharp(buf).resize(900, null, { fit: 'inside' })
    .webp({ quality: 78 }).toBuffer();
  await writeFile(join(DIR, out + '.webp'), webp);
  // Remove raw
  await unlink(src);
  console.log(`${out}: ${(jpg.length/1024).toFixed(0)}kB jpg · ${(webp.length/1024).toFixed(0)}kB webp`);
}
console.log('done.');
