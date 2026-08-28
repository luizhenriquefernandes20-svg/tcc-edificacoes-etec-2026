# TCC Edificações — ETEC Vasco Antônio Venchiarutti · 2026

Site do Trabalho de Conclusão de Curso do Técnico em Edificações (noturno, turma 3º L).

**Tema:** Construção de um espaço de convivência com churrasqueira na integração
escolar e interdisciplinar dos alunos.

Site 100% estático (HTML + CSS + JS puro) — **sem build, sem dependência**.

---

## 🚀 Deploy na Vercel

### Via GitHub (recomendado — já configurado)
Todo `git push` para `main` republica o site automaticamente
(depois de importar o repositório em vercel.com/new → Framework: **Other**,
Build Command e Output Dir vazios).

### Via CLI
```bash
npm i -g vercel
vercel --prod
```

---

## 📁 Estrutura

```
├── index.html               # todo o conteúdo do site
├── styles.css               # design system + galeria/lightbox
├── script.js                # menu, abas, lightbox, animações
├── vercel.json              # headers de segurança + cache
└── assets/
    ├── img/
    │   ├── renders/         # maquete eletrônica (como vai ficar)
    │   ├── terreno/         # fotos do terreno antes da obra
    │   ├── projeto/         # pranchas, plantas e desenhos técnicos
    │   └── obra/            # fotos da execução
    ├── video/               # vídeos da obra e do projeto
    ├── docs/                # PDFs para download (cronograma, planta, laudo)
    └── manifest.json        # mapa arquivo original → arquivo do site
```

## ✏️ Como atualizar

- **Novas fotos da obra:** copie para `assets/img/obra/` seguindo a numeração
  (`obra-36.jpg`, `obra-37.jpg`…) e adicione um `<figure class="g-item">` na
  galeria correspondente em `index.html`.
- **Cronograma:** as barras do Gantt estão em `index.html` (seção Cronograma),
  cada uma com `--from` e `--to` indicando a semana inicial/final (S1 = 04/08).
- **Equipe / textos:** tudo em `index.html`, seções bem comentadas.

## 🖥️ Rodar localmente

Basta abrir `index.html` no navegador, ou:
```bash
npx serve .
```
