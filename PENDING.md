# Pendências antes/depois da entrega

Checklist do que ainda depende de dado real ou decisão humana. Nada aqui **quebra** o site — são substituições de placeholder.

---

## Rotina semanal (enquanto a obra corre)

Três coisas se atualizam sozinhas conforme os arquivos aparecem. Nenhuma exige editar HTML.

### Diário de obra → `assets/diario.json`
Registrar a semana nova copiando um bloco de `entradas` e ajustando os campos.
O próprio arquivo traz as instruções no topo. O status (concluída / em andamento /
prevista) sai da data, não precisa preencher.

### Fotos da maquete → `assets/img/maquete/`
Numerar em sequência: `maquete-01.jpg`, `maquete-02.jpg`… O site varre a pasta e
monta a galeria. Detalhes em `LEIA-ME.txt` dentro da pasta.

### Vídeos da maquete → `assets/video/maquete/`
Mesma lógica: `maquete-video-01.mp4`, `-02.mp4`…

### Fotos novas da obra → `assets/img/obra/`
Essas ainda entram manualmente no `index.html`, na aba "Obra" da galeria, seguindo
a numeração existente (`obra-36.jpg` em diante). Depois é só referenciar o caminho
no `diario.json` da semana correspondente.

---

## Precisam ser preenchidos antes do deploy final

### 1. Contatos dos autores (crítico)
No `index.html`, cada card de aluno tem:
```html
<span class="member-links">
  <a href="#" data-net="linkedin" title="Preencher com URL do LinkedIn">in</a>
  <a href="#" data-net="instagram" title="Preencher com URL do Instagram">ig</a>
</span>
```
Substituir `href="#"` pela URL real de cada aluno. Sem URL, o link fica com `opacity: 0.4` e `pointer-events: none` (CSS já cuida).

### 2. URL do site pro QR code (crítico)
O QR aponta pra `https://tcc-etec-2026-edificacoes.vercel.app` por padrão.
Após publicar, regenerar com a URL real:
```bash
node tools/gen-qr.mjs "https://SUA-URL-REAL.vercel.app"
```

### 3. Plantas de instalações prediais (importante)
A seção "Instalações prediais" (`#tec-instalacoes`) já existe com os dois botões de download,
mas os arquivos ainda não foram publicados. Colocar em `assets/docs/`:

- `planta-eletrica.pdf` — planta de instalações elétricas (NBR 5410)
- `planta-hidraulica.pdf` — planta de instalações hidrossanitárias (NBR 5626)

Os links **se habilitam sozinhos** assim que os arquivos existirem — o `script.js` faz um
`HEAD` em cada um e, se responder 200, remove o estado "em breve" e ainda preenche o tamanho
do arquivo automaticamente. Não precisa editar HTML.

### 4. Valores reais da Curva S (importante)
Em `index.html`, seção `#cronograma`, subtítulo "Curva S · físico-financeiro":
- **Total previsto**: `R$ 12.480,00` (estimativa) — trocar pelo orçamento real
- **Executado atual**: `R$ 2.180 · 17,5%` (estimativa) — trocar pelo real
- Os pontos do SVG (`<path d="M ..."`) desenham a curva. Se o real desviar muito, ajustar os pontos.

## Podem esperar (não bloqueiam deploy)

### 4. Fotos "bastidores" pro easter egg
Ainda não implementado. Se quiser adicionar Konami code revelando fotos casuais da turma, mandar 4-6 fotos informais.

### 5. Trilha sonora ambiente
Ainda não implementado. Precisa de MP3 curto (~30s em loop) ou skip definitivo.

### 6. Comparativo com TCCs anteriores
Ainda não implementado. Precisa da lista dos TCCs referência da ETEC.

### 7. Vista 3D interativa
Placeholder ativo. Pra ativar de verdade:
1. Converter `assets/cad/vista-3d.dwg` → `assets/model/vista-3d.glb` (Revit/Blender)
2. Baixar `model-viewer.min.js` pro `assets/js/`
3. Detalhes em `tools/README.md`

O placeholder mostra render estático até isso — não parece quebrado.

## Depois da entrega (04/12/2026)

- **Atualizar o cronograma** — remover contingência não usada, ou marcar entrega como concluída
- **Adicionar "Placa comemorativa"** — bloco com data de inauguração
- **Fotos finais** — do espaço em uso pela primeira vez
- **Depoimentos** — 2-3 falas curtas da turma sobre a experiência
- **PDF do relatório final** — gerado com `node tools/gen-pdf.mjs URL_REAL`

## Diário de campo — nota ética

As 3 notas semanais em `#galeria` foram escritas em **voz neutra** ("Diário de campo") pra não colocar palavras na boca do Prof. Radian sem validação. Se quiser assinar como Prof. Radian, revisar com ele primeiro e trocar o `<span class="week-note-lbl">` de "Diário de campo" para "Prof. Radian".
