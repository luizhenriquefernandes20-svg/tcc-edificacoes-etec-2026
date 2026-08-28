// Gera assets/qr.svg apontando pra URL passada como argumento.
// Uso: node tools/gen-qr.mjs https://sua-url.vercel.app
// Requer: npm i --no-save qrcode
import QRCode from 'qrcode';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || 'https://tcc-etec-2026-edificacoes.vercel.app';
const out = resolve(__dirname, '..', 'assets', 'qr.svg');

const svg = await QRCode.toString(url, {
  type: 'svg',
  errorCorrectionLevel: 'M',
  margin: 1,
  color: { dark: '#1e1f21', light: '#00000000' },
});

// Reduz o SVG: remove header XML, deixa só o <svg>
const stripped = svg.replace(/<\?xml[^>]*\?>\s*/, '').trim();
await writeFile(out, stripped, 'utf8');
console.log(`gerado ${out} para ${url}`);
