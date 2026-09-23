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
| `stl_para_glb.py` | Junta os STL exportados do AutoCAD num `.glb` com material por camada. | `python` |
| `dwg_para_glb.py` | Caminho antigo, direto do DXF. Só monta faces planas — deixa peça curva de fora. | `pip install ezdxf` |

## Fluxo típico após novas fotos da obra

```bash
# 1. depois de copiar novas fotos pra assets/img/obra/
node tools/optimize-images.mjs          # otimiza + gera .webp
node tools/add-picture-tags.mjs         # atualiza HTML se houver <img> novos
```

## Refazer o modelo 3D a partir do DWG

O modelo em `assets/model/espaco-gourmet-pergolado.glb` sai da vista 3D exportada
do Revit. O caminho é DWG → STL (um por camada) → GLB.

Quem triangula os sólidos é o próprio AutoCAD, pelo comando `STLOUT`. Isso importa:
o desenho traz sólidos ACIS, e as peças curvas — pilares roliços, cuba, torneira,
luminárias — não se reconstroem fora dele. Exportar uma vez por camada é o que
preserva o material, porque o STL sozinho não carrega cor.

1. Copiar o DWG para um caminho curto, por exemplo `C:\cadtmp\m.dwg`.
2. Rodar o AutoCAD sem interface, **pelo PowerShell** — no Git Bash os argumentos
   `/i` e `/s` viram caminhos do Windows e o console abre um desenho em branco:

   ```powershell
   & "C:\Program Files\Autodesk\AutoCAD 2027ccoreconsole.exe" `
       /i C:\cadtmp\m.dwg /s C:\cadtmp\export-stl.scr /l en-US
   ```

   O roteiro `tools/export-stl.scr` apaga a vegetação, explode os blocos **um a um**
   (`EXPLODE` nesta versão só aceita um objeto por chamada) e grava um STL por
   camada em `C:\cadtmp\stl\`. O processo não encerra sozinho: quando o último
   STL aparecer, pode fechar.

3. Montar o GLB:

   ```bash
   python tools/stl_para_glb.py C:/cadtmp/stl assets/model/espaco-gourmet-pergolado.glb
   ```

4. Trocar o `?v=` das três referências ao modelo no `index.html`. Sem isso a
   correção não chega a quem já visitou o site, porque `/assets/model/` é servido
   com cache de um ano.

A constante `BASE` no `stl_para_glb.py` é a rotação que põe o desenho de pé —
ele sai do Revit girado. Se um dia o export vier de outra vista, os números mudam:
as três famílias de faces do modelo formam o triedro, e a cobertura confere o
resultado, porque em relação ao vertical certo ela fica a 5,71° (10% de caimento).

O `model-viewer` já está em `assets/js/`. Se o `.glb` ou o script sumirem, o site
volta sozinho para a perspectiva estática, sem erro.

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
