# TCC Edificações — ETEC 2026

Site institucional do TCC do curso Técnico em Edificações.

**Tema padrão:** *Construção Sustentável com Materiais Reciclados em Habitação de Interesse Social* (edite `index.html` para trocar).

Site 100% estático (HTML + CSS + JS puro) — **sem build, sem dependência**.

---

## 🚀 Deploy na Vercel (30 segundos)

### Opção A — Arrastar e soltar
1. Acesse https://vercel.com/new
2. Clique em **"Deploy without a Git repo"** (ou similar)
3. Arraste esta pasta inteira para a janela
4. Aguarde ~10s → site no ar

### Opção B — Via Vercel CLI
```bash
npm i -g vercel
cd tcc-etec-2026-edificacoes
vercel        # primeira vez: faça login e escolha as opções padrão
vercel --prod # publica em produção
```

### Opção C — GitHub + Vercel (recomendado)
1. Crie um repositório no GitHub e envie esta pasta
2. Em vercel.com, **New Project → Import Git Repository**
3. Framework Preset: **Other** · Build Command: *(vazio)* · Output Dir: *(vazio)*
4. Deploy

Toda vez que fizer `git push`, a Vercel republica sozinha.

---

## ✏️ O que trocar antes de entregar

Todos os campos abaixo estão em `index.html`:

- **Título/tema** → seção `<h1>` do hero + `<title>`
- **Nomes da equipe** → seção `#equipe` (procure "Nome do colega")
- **Nome do orientador** → mesmo bloco
- **E-mail de contato** → seção `#contato`
- **Ano/módulo** → bloco `.meta` no hero
- **Referências bibliográficas** → seção "06 · Referências"
- **Cronograma** → ajuste os `--from` e `--to` nas barras do Gantt (`index.html`, seção `#cronograma`)

Para trocar o **tema do TCC** (ex.: Steel Frame, BIM, concreto permeável), reescreva os textos das seções mantendo a estrutura.

---

## 🎨 Personalizar cores

Em `styles.css`, no topo:

```css
:root {
  --brand: #ffb400;    /* amarelo de segurança */
  --brand-2: #ff8a00;  /* laranja construção */
  --bg: #0f1115;       /* fundo escuro */
}
```

Troque `--brand` e `--brand-2` pela paleta que quiser.

---

## 📁 Estrutura

```
tcc-etec-2026-edificacoes/
├── index.html      # todo o conteúdo do site
├── styles.css      # design system
├── script.js       # menu mobile, ano do rodapé, animações
├── vercel.json     # headers de segurança + cache
└── README.md
```

---

## 🖥️ Rodar localmente

Não precisa de servidor. Basta abrir `index.html` no navegador (duplo clique).

Se quiser um servidor local:
```bash
npx serve .
# ou
python -m http.server
```
