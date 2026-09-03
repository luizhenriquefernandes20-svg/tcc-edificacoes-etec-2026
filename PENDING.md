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

### Caderno do diário → `assets/docs/diario-de-obra.pdf`
Colocar o PDF do diário de obra com esse nome exato. O visualizador aparece
sozinho no fim da seção Diário, já com o tamanho do arquivo, botão de abrir em
nova aba e de baixar. Enquanto o arquivo não existir, fica um aviso no lugar.
Se o caderno for atualizado, é só substituir o arquivo.

### Fotos novas da obra → `assets/img/obra/`
Essas ainda entram manualmente no `index.html`, na aba "Obra" da galeria, seguindo
a numeração existente (`obra-36.jpg` em diante). Depois é só referenciar o caminho
no `diario.json` da semana correspondente.

---

## Precisam ser preenchidos antes do deploy final

### 1. Nome completo do integrante "Cesar" (crítico)
No documento assinado só consta o primeiro nome (a assinatura parece "Martins").
Confirmar o nome completo e corrigir em três lugares do `index.html`:
o `<h4>` dentro de `.pessoa`, a frente "Pintura e acabamento" em `.frentes`,
e a lista `creator` do JSON-LD no `<head>`. Em `banca.html`, corrigir a frente
"Pintura e acabamento".

### 2. Conferir a transcrição das responsabilidades (crítico)
As 41 responsabilidades foram transcritas da foto do termo assinado. Vale a turma
conferir nome por nome antes da banca — principalmente grafias como
"Jenifer Abigail", "Hadassa Francini", "Ivaneide Pereira Sobreira" e
"Pedrito de Jesus Santos".

### 3. URL do site pro QR code (crítico)
O QR aponta pra `https://tcc-etec-2026-edificacoes.vercel.app` por padrão.
Após publicar, regenerar com a URL real:
```bash
node tools/gen-qr.mjs "https://SUA-URL-REAL.vercel.app"
```

### 4. Plantas de instalações prediais (importante)
A seção "Instalações prediais" (`#tec-instalacoes`) já existe com os dois botões de download,
mas os arquivos ainda não foram publicados. Colocar em `assets/docs/`:

- `planta-eletrica.pdf` — planta de instalações elétricas (NBR 5410)
- `planta-hidraulica.pdf` — planta de instalações hidrossanitárias (NBR 5626)

Os links **se habilitam sozinhos** assim que os arquivos existirem — o `script.js` faz um
`HEAD` em cada um e, se responder 200, remove o estado "em breve" e ainda preenche o tamanho
do arquivo automaticamente. Não precisa editar HTML.

### 5. Valores reais da Curva S (importante)
Em `index.html`, seção `#cronograma`, subtítulo "Curva S · físico-financeiro":
- **Total previsto**: `R$ 12.480,00` (estimativa) — trocar pelo orçamento real
- **Executado atual**: `R$ 2.180 · 17,5%` (estimativa) — trocar pelo real
- Os pontos do SVG (`<path d="M ..."`) desenham a curva. Se o real desviar muito, ajustar os pontos.

## Podem esperar (não bloqueiam deploy)

### 6. Fotos "bastidores" pro easter egg
Ainda não implementado. Se quiser adicionar Konami code revelando fotos casuais da turma, mandar 4-6 fotos informais.

### 7. Trilha sonora ambiente
Ainda não implementado. Precisa de MP3 curto (~30s em loop) ou skip definitivo.

### 8. Comparativo com TCCs anteriores
Ainda não implementado. Precisa da lista dos TCCs referência da ETEC.

### 9. Contatos dos autores
Os links de LinkedIn/Instagram foram removidos junto com a estrutura antiga da ficha
técnica. Se quiser reintroduzir agora que são 16 pessoas, vale decidir antes se todos
querem ter perfil exposto no site.

## Depois da entrega (04/12/2026)

- **Atualizar o cronograma** — remover contingência não usada, ou marcar entrega como concluída
- **Adicionar "Placa comemorativa"** — bloco com data de inauguração
- **Fotos finais** — do espaço em uso pela primeira vez
- **Depoimentos** — 2-3 falas curtas da turma sobre a experiência
- **PDF do relatório final** — gerado com `node tools/gen-pdf.mjs URL_REAL`

## Textos escritos como rascunho — revisar com a turma

Três blocos foram redigidos como ponto de partida e estão marcados com `TODO` no
`index.html`. Não são falas de ninguém em particular; convém a turma reescrever
com a própria voz antes da apresentação.

- **Manifesto** (`#projeto`) — parágrafo de abertura sobre a motivação do grupo
- **Diário de obra** (`assets/diario.json`) — os relatos das semanas 1 a 3 foram
  deduzidos do que as fotos mostram, não de registro escrito pela turma
- **Etapas da maquete** (`#maquete`) — escala, base, materiais e o texto das quatro
  etapas são uma reconstrução plausível, não dados conferidos
