# Ferramentas do projeto

Scripts opcionais em Node/Bash. Não afetam o site em runtime — geram assets.

| Script | O que faz | Requer |
|---|---|---|
| `gen-qr.mjs` | Gera `assets/qr.svg` apontando pra URL passada. | `npm i --no-save qrcode` |
| `optimize-images.mjs` | Otimiza JPGs (mozjpeg q82) + gera `.webp` paralelos. | `npm i --no-save sharp` |
| `add-picture-tags.mjs` | Wrappa `<img>` do `index.html` em `<picture>` com fallback WebP. | Node built-in |
| `gen-pdf.mjs` | Exporta o site como PDF (aproveita `@media print`). | `npm i --no-save puppeteer` (~200 MB) |
| `gen-instagram-carousel.mjs` | Gera 8 slides 1080×1350 pra Instagram carousel em `assets/social/ig-carousel/`. | `npm i --no-save sharp` |
| `timelapse.sh` | Junta vídeos da obra em `assets/video/obra-timelapse.mp4` (8× speed). | `ffmpeg` no PATH |

## Fluxo típico após novas fotos da obra

```bash
# 1. depois de copiar novas fotos pra assets/img/obra/
node tools/optimize-images.mjs          # otimiza + gera .webp
node tools/add-picture-tags.mjs         # atualiza HTML se houver <img> novos
```

## Ativar viewer 3D

O site já suporta um viewer 3D nativo (Google `<model-viewer>`). Para ativar:

1. Converta o `.dwg` da vista 3D para `.glb`:
   - Abra o `.dwg` no Autodesk (Revit/AutoCAD) e exporte para FBX/OBJ.
   - Converta FBX → GLB no [Blender](https://www.blender.org/) (grátis): File → Import → FBX; File → Export → glTF (.glb).
   - Salve em `assets/model/vista-3d.glb` (ideal < 5 MB — decimation ajuda).
2. Baixe o script `model-viewer.min.js` (~400 KB) do CDN oficial e salve em `assets/js/`:
   ```bash
   mkdir -p assets/js
   curl -L https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js \
     -o assets/js/model-viewer.min.js
   ```
3. Recarregue o site — o placeholder é substituído automaticamente pelo viewer.

Se o `.glb` ou o script não existirem, o site continua mostrando a perspectiva estática sem erro.

## Fluxo pra apresentação

```bash
node tools/gen-qr.mjs "https://SUA-URL.vercel.app"   # regenera QR do footer

# PDF do relatório (após publicar):
npx serve . -p 3000 &
node tools/gen-pdf.mjs http://localhost:3000

# Timelapse dos vídeos:
bash tools/timelapse.sh

# Carrossel Instagram:
node tools/gen-instagram-carousel.mjs
```
