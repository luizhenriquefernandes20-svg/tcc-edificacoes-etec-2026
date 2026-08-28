// Gera um carrossel 1080x1350 (retrato Instagram) com 8 slides do projeto.
// Slides: capa · projeto · árvores · técnico · gantt · antes/depois · obra · equipe
// Uso: node tools/gen-instagram-carousel.mjs
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'assets');
const OUT_DIR = join(ROOT, 'social', 'ig-carousel');
await mkdir(OUT_DIR, { recursive: true });

const W = 1080, H = 1350;
const PAPER = '#f4f4f1';
const INK = '#1e1f21';
const ACCENT = '#a8431f';

function textSvg(head, title, subtitle) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
      <rect width="100%" height="100%" fill="${PAPER}"/>
      <rect x="80" y="1200" width="920" height="4" fill="${ACCENT}"/>
      <text x="80" y="1250" font-family="monospace" font-size="24" fill="${INK}" letter-spacing="3">${head}</text>
      <text x="80" y="220" font-family="Arial" font-size="72" fill="${ACCENT}" letter-spacing="-2" font-weight="700">TCC · 26</text>
      <text x="80" y="270" font-family="monospace" font-size="22" fill="${INK}" letter-spacing="3">${(subtitle||'').toUpperCase()}</text>
      <text x="80" y="920" font-family="Arial" font-size="88" font-weight="700" fill="${INK}" letter-spacing="-3">
        ${title.split('\n').map((l,i) => `<tspan x="80" dy="${i===0?0:100}">${l}</tspan>`).join('')}
      </text>
    </svg>
  `);
}

async function slideCover() {
  const svg = textSvg('01 / 08 · CAPA', 'Espaço de\nconvivência\ncom\nchurrasqueira', 'ETEC Jundiaí');
  await sharp(svg).png().toFile(join(OUT_DIR, '01-capa.png'));
}

async function slidePhoto(idx, imgPath, head, title, subtitle) {
  const bg = await sharp(join(ROOT, 'img', imgPath)).resize(W, Math.round(H * 0.62), { fit: 'cover' }).toBuffer();
  const base = sharp({ create: { width: W, height: H, channels: 3, background: PAPER } });
  const overlay = textSvg(head, title, subtitle);

  await base
    .composite([
      { input: bg, top: 0, left: 0 },
      { input: overlay, top: 0, left: 0 },
    ])
    .png()
    .toFile(join(OUT_DIR, `${String(idx).padStart(2, '0')}-${head.split(' ').pop().toLowerCase()}.png`));
}

console.log('gerando slides…');
await slideCover();
await slidePhoto(2, 'renders/render-06.jpg', '02 / 08 · O PROJETO', 'Laboratório vivo\ndentro da escola', 'Alunos que executam');
await slidePhoto(3, 'terreno/terreno-01.jpg', '03 / 08 · ÁRVORES', '4 espécies\nprotegidas', 'DAP ≥ 5 cm');
await slidePhoto(4, 'projeto/projeto-x-01.jpg', '04 / 08 · TÉCNICO', 'Da prancheta\nao canteiro', 'Revit + AutoCAD');
await slidePhoto(5, 'renders/render-11.jpg', '05 / 08 · CHURRASQUEIRA', 'Alvenaria\nrefratária', '2,70 m de altura');
await slidePhoto(6, 'obra/obra-14.jpg', '06 / 08 · CANTEIRO', 'Semana 3\nde 17', 'Escavação em curso');
await slidePhoto(7, 'renders/render-04.jpg', '07 / 08 · PROJEÇÃO', 'Como vai\nficar', 'Entrega 04/12/2026');
await slidePhoto(8, 'obra/obra-02.jpg', '08 / 08 · EQUIPE', 'Turma B\nnoturno', '6 alunos + 1 orientador');
console.log(`gerados 8 slides em ${OUT_DIR}`);
