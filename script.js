// Menu mobile
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// Ano no footer
const yr = document.getElementById('yr');
if (yr) yr.textContent = new Date().getFullYear();

// Contador regressivo pra data-countdown="AAAA-MM-DD"
document.querySelectorAll('[data-countdown]').forEach(el => {
  const target = new Date(el.dataset.countdown + 'T00:00:00');
  const now = new Date();
  const days = Math.round((target - now) / 86_400_000);
  if (days > 0) el.textContent = `faltam ${days} dia${days === 1 ? '' : 's'}`;
  else if (days === 0) el.textContent = 'entrega hoje';
  else { el.textContent = 'entregue'; el.classList.add('past'); }
});

// Quiz
(() => {
  const quiz = document.querySelector('[data-quiz]');
  if (!quiz) return;
  const items = quiz.querySelectorAll('li');
  const result = document.querySelector('.quiz-result');
  const scoreEl = result?.querySelector('.quiz-score');
  const msgEl = result?.querySelector('.quiz-msg');
  let answered = 0, correct = 0;

  items.forEach(li => {
    const ans = li.dataset.answer;
    li.querySelectorAll('.quiz-opts button').forEach(btn => {
      btn.addEventListener('click', () => {
        if (li.classList.contains('answered')) return;
        li.classList.add('answered');
        li.querySelectorAll('.quiz-opts button').forEach(b => {
          b.disabled = true;
          if (b.dataset.v === ans) b.classList.add('correct');
          else if (b === btn) b.classList.add('wrong');
        });
        answered++;
        if (btn.dataset.v === ans) correct++;
        if (answered === items.length && result) {
          result.hidden = false;
          scoreEl.textContent = `${correct}/${items.length}`;
          const pct = correct / items.length;
          let msg;
          if (pct === 1)      msg = 'Perfeito. Você prestou atenção mesmo.';
          else if (pct >= .6) msg = 'Bem observado. Vale voltar em alguns pontos.';
          else                msg = 'Volta e lê com calma — cada seção tem detalhes que valem.';
          msgEl.textContent = msg;
          result.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
  });
})();

// Compartilhamento (copy link)
document.querySelectorAll('[data-share="copy"]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    try {
      await navigator.clipboard.writeText(url);
      const original = btn.textContent;
      btn.textContent = 'Copiado';
      btn.classList.add('copied');
      setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1800);
    } catch {
      btn.textContent = 'Copie: ' + url;
    }
  });
});

// Abas da galeria
document.querySelectorAll('.tabs').forEach(tabs => {
  const btns = tabs.querySelectorAll('.tab-btn');
  const panels = tabs.parentElement.querySelectorAll(':scope > .tab-panel');
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.toggle('active', b === btn));
    panels.forEach(p => p.classList.toggle('active', p.id === btn.dataset.panel));
  }));
});

// Nav com sombra ao rolar + back-to-top + parallax do water-mark
const nav = document.querySelector('.nav');
const toTop = document.getElementById('toTop');
if (nav || toTop) {
  if (toTop) toTop.removeAttribute('hidden');
  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 8);
    if (toTop) toTop.classList.toggle('visible', y > 1500);
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

// Sub-nav sticky do #tecnico: aparece só quando dentro dessa section
(() => {
  const subnav = document.getElementById('tecnicoSubnav');
  if (!subnav) return;
  const target = document.getElementById(subnav.dataset.of);
  if (!target) return;
  const anchors = subnav.querySelectorAll('a[href^="#"]');
  const anchorMap = new Map(Array.from(anchors).map(a => [a.getAttribute('href').slice(1), a]));

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      subnav.classList.toggle('is-visible', e.isIntersecting);
      subnav.setAttribute('aria-hidden', String(!e.isIntersecting));
    }, { rootMargin: '-100px 0px -60% 0px', threshold: 0 });
    io.observe(target);

    // Spy interno para os sub-ancoras
    const subTargets = Array.from(anchorMap.keys()).map(id => document.getElementById(id)).filter(Boolean);
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => {
        const a = anchorMap.get(e.target.id);
        if (!a) return;
        if (e.isIntersecting) {
          anchorMap.forEach(x => x.removeAttribute('aria-current'));
          a.setAttribute('aria-current', 'section');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    subTargets.forEach(t => spy.observe(t));
  }
})();

// Scroll spy: marca link ativo do menu conforme a seção em vista
const spySections = ['projeto', 'arvores', 'tecnico', 'maquete', 'seguranca', 'cronograma', 'galeria', 'equipe']
  .map(id => document.getElementById(id))
  .filter(Boolean);
const spyLinks = new Map();
document.querySelectorAll('.menu a[href^="#"]').forEach(a => {
  const id = a.getAttribute('href').slice(1);
  if (id) spyLinks.set(id, a);
});
if (spySections.length && spyLinks.size && 'IntersectionObserver' in window) {
  const visible = new Set();
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)));
    spyLinks.forEach(l => l.removeAttribute('aria-current'));
    // primeira seção visível na ordem do documento
    const activeId = spySections.map(s => s.id).find(id => visible.has(id));
    if (activeId && spyLinks.get(activeId)) {
      spyLinks.get(activeId).setAttribute('aria-current', 'section');
    }
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  spySections.forEach(s => spy.observe(s));
}

// Hotspots interativos (planta baixa e corte)
(() => {
  const wraps = document.querySelectorAll('.plan-wrap, .section-svg-wrap');
  if (!wraps.length) return;

  const DICT = {
    // planta baixa
    pergolado: { idx: '00', title: 'Pergolado de eucalipto roliço', desc: 'Estrutura em eucalipto tratado, com trepadeiras (bougainvillea) para sombreamento vivo. Vãos de 40 cm entre vigas.' },
    cobertura: { idx: '00', title: 'Área coberta · 2,80 × 2,00 m', desc: 'Telha metálica leve sobre estrutura complementar ao pergolado, protegendo a zona da bancada e churrasqueira.' },
    bancada:   { idx: '01', title: 'Bancada com cuba', desc: 'Bancada em granito, altura 90 cm, 2,40 × 0,60 m. Cuba de inox embutida com sifão aparente e ponto de esgoto conforme NBR 5626.' },
    churrasqueira: { idx: '02', title: 'Churrasqueira em alvenaria refratária', desc: 'Corpo de 0,80 × 0,60 m em planta, tijolo e argamassa refratários. Braseiro a 60 cm de profundidade; grelha a 90 cm; chaminé de 2,70 m no total conforme NBR 14518.' },
    mesas:     { idx: '03', title: 'Área de mesas · até 24 pessoas', desc: 'Quatro mesas circulares (Ø 1,20 m) sob o pergolado, com banquetas móveis. Layout permite reorganizar em U para uso pedagógico.' },
    acesso:    { idx: '04', title: 'Acesso · vão livre 1,20 m', desc: 'Sem desnível, atendendo NBR 9050 (acessibilidade). Piso cerâmico antiderrapante, cor firme para orientação de baixa visão.' },
    // corte
    terreno:   { idx: '01', title: 'Terreno natural regularizado', desc: 'Solo original limpo, escavado e nivelado. Base do canteiro; recebe o lastro de brita.' },
    radier:    { idx: '02', title: 'Radier · 3,14 m³ de concreto', desc: '2,00 m³ escavados, 0,59 m³ de lastro de brita, 219,73 kg de aço estrutural. Fundação única distribuindo a carga da churrasqueira sobre toda a área.' },
    alvenaria: { idx: '03', title: 'Alvenaria refratária', desc: 'Tijolos e argamassa refratária nos pontos em contato com o braseiro. Amarração das fiadas conforme projeto. Espessura mínima de 12 cm.' },
    grelha:    { idx: '04', title: 'Grelha · h = 90 cm', desc: 'Suporte em blocos perfurados na parede de fundo. Grelha em aço inox 304, área interna dimensionada para 8 espetos giratórios simultâneos.' },
    coifa:     { idx: '05', title: 'Coifa · transição pra chaminé', desc: 'Redução em alvenaria refratária, ângulo interno de 45°. Concentra a fumaça pra fluxo ascendente eficiente.' },
    chamine:   { idx: '06', title: 'Chaminé · NBR 14518', desc: 'Altura mínima acima da cumeeira do telhado vizinho. Tampa em aço inox para chuva; abertura livre 15 × 15 cm.' },
  };

  wraps.forEach(wrap => {
    const info = wrap.querySelector('.plan-info');
    if (!info) return;
    const idxEl = info.querySelector('.plan-info-idx');
    const titleEl = info.querySelector('.plan-info-title');
    const descEl = info.querySelector('.plan-info-desc');
    const defaults = { idx: idxEl.textContent, title: titleEl.textContent, desc: descEl.textContent };

    const activate = (key) => {
      const d = DICT[key];
      if (!d) return;
      idxEl.textContent = d.idx;
      titleEl.textContent = d.title;
      descEl.textContent = d.desc;
      info.classList.add('is-active');
      wrap.querySelectorAll('[data-hot]').forEach(h => h.classList.toggle('is-active', h.dataset.hot === key));
    };
    const reset = () => {
      idxEl.textContent = defaults.idx;
      titleEl.textContent = defaults.title;
      descEl.textContent = defaults.desc;
      info.classList.remove('is-active');
      wrap.querySelectorAll('[data-hot]').forEach(h => h.classList.remove('is-active'));
    };

    wrap.querySelectorAll('[data-hot]').forEach(h => {
      const key = h.dataset.hot;
      h.addEventListener('mouseenter', () => activate(key));
      h.addEventListener('focus', () => activate(key));
      h.addEventListener('click', () => activate(key));
      h.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(key); } });
    });
    wrap.addEventListener('mouseleave', reset);
  });
})();

// Reveal on scroll + Staggered reveal + draw-in do Gantt + contadores stats + diff-hint
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll(
    '.section-head, .two-col, .downloads, .hero-photo, .plate, .risk-grid, .epi-list, .plan-wrap, .section-svg-wrap, .diff-list'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));

  // Containers de stagger: aplica --i em cada filho
  const staggerContainers = document.querySelectorAll('.stats, .species, .specs, .timeline, .gallery, .video-grid, .team, .gantt, .diff-list');
  staggerContainers.forEach(container => {
    container.classList.add('stagger');
    let i = 0;
    Array.from(container.children).forEach(child => {
      if (child.classList.contains('week-head') || child.classList.contains('gantt-head') ||
          child.tagName === 'HEADER') return; // headers não contam
      child.style.setProperty('--i', i++);
    });
  });

  const rev = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      rev.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  [...revealTargets, ...staggerContainers].forEach(el => rev.observe(el));

  // Draw-in das barras do Gantt: adiciona .draw quando a wrap entra em viewport
  const gantt = document.querySelector('.gantt-wrap');
  if (gantt) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        gantt.querySelectorAll('.bar').forEach((bar, i) => {
          bar.style.transition = 'transform var(--dur) var(--ease), box-shadow var(--dur) var(--ease), border-color var(--dur) var(--ease)';
          setTimeout(() => bar.classList.add('draw'), 120 + i * 60);
        });
        io.unobserve(gantt);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.15 });
    io.observe(gantt);
  }

  // Contadores animados nos stats: extrai número, anima de 0 até valor final
  const parseNumber = (txt) => {
    const m = txt.match(/([-+]?[\d.,]+)/);
    if (!m) return null;
    const n = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? { n, raw: m[1], full: txt } : null;
  };
  const format = (n, raw) => {
    if (raw.includes(',')) return n.toLocaleString('pt-BR', { minimumFractionDigits: (raw.split(',')[1] || '').length, maximumFractionDigits: (raw.split(',')[1] || '').length });
    if (Number.isInteger(n)) return String(Math.round(n));
    return n.toFixed(1);
  };
  document.querySelectorAll('.stat strong, .spec strong').forEach(el => {
    const parsed = parseNumber(el.textContent);
    if (!parsed || parsed.n <= 0) return;
    // preserva sufixo (ex.: " m³", " kg", " cm")
    const idx = el.textContent.indexOf(parsed.raw);
    const suffix = el.textContent.slice(idx + parsed.raw.length);
    const prefix = el.textContent.slice(0, idx);
    el.dataset.target = parsed.n;
    el.dataset.suffix = suffix;
    el.dataset.prefix = prefix;
    el.dataset.raw = parsed.raw;
    el.textContent = prefix + '0' + suffix;
  });
  const countIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const raw = el.dataset.raw;
      const suffix = el.dataset.suffix;
      const prefix = el.dataset.prefix;
      const dur = 900;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - t, 3);
        const cur = target * eased;
        el.textContent = prefix + format(cur, raw) + suffix;
        if (t < 1) requestAnimationFrame(tick);
        else el.textContent = prefix + raw + suffix;
      };
      requestAnimationFrame(tick);
      countIo.unobserve(el);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.4 });
  document.querySelectorAll('[data-target]').forEach(el => countIo.observe(el));

  // Diff hint: primeira vez que o comparador aparece, anima o slider
  const hintIo = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const frame = e.target;
      frame.classList.add('is-hint');
      setTimeout(() => frame.classList.remove('is-hint'), 1800);
      hintIo.unobserve(frame);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.diff-frame').forEach(f => hintIo.observe(f));
} else {
  // Sem animação: garante que barras do gantt já mostrem valor final
  document.querySelectorAll('.bar').forEach(b => b.classList.add('draw'));
}

// Contador "Semana X de 17" baseado na data atual em relação a S1 = 04/08/2026
(() => {
  const S1_START = new Date(2026, 7, 4);
  const TOTAL_WEEKS = 17;
  const now = new Date();
  const days = (now - S1_START) / 86_400_000;
  const weekIdx = Math.floor(days / 7) + 1; // 1-based
  const badge = document.querySelector('[data-week-badge]');
  if (!badge) return;
  const cur = badge.querySelector('[data-week-current]');
  const st = badge.querySelector('[data-week-status]');
  let label, mod;
  if (weekIdx < 1) {
    cur.textContent = '0';
    label = 'planejado';
    mod = '';
  } else if (weekIdx > TOTAL_WEEKS) {
    cur.textContent = TOTAL_WEEKS;
    label = 'concluído';
    mod = 'is-done';
  } else {
    cur.textContent = weekIdx;
    label = 'em execução';
    mod = 'is-active';
  }
  st.textContent = label;
  if (mod) badge.classList.add(mod);
})();

// Cronograma: hoje no Gantt + progresso executado + status das etapas da timeline
const S1_START = new Date(2026, 7, 4); // 04/08/2026 (mês 0-indexado)
const TOTAL_WEEKS = 17;
const NOW = new Date();
const WEEK_FLOAT = ((NOW - S1_START) / 86_400_000) / 7 + 1; // 1-based, fracional

// Progresso executado em cada barra: 0 se ainda não começou, 100 se terminou, X% se em curso.
function realPct(from, to) {
  if (WEEK_FLOAT <= from - 0.5) return 0;
  if (WEEK_FLOAT >= to + 0.5) return 100;
  const span = to - from + 1;
  const done = WEEK_FLOAT - (from - 0.5);
  return Math.max(0, Math.min(100, (done / span) * 100));
}

(() => {
  const gantt = document.querySelector('.gantt-17');
  if (!gantt) return;

  // Preenchimento executado de cada barra + tooltip (semana + %)
  gantt.querySelectorAll('.bar').forEach(bar => {
    if (bar.classList.contains('cont')) {
      const from = parseFloat(bar.style.getPropertyValue('--from'));
      const to = parseFloat(bar.style.getPropertyValue('--to'));
      bar.dataset.tip = `Contingência · S${from}–S${to}`;
      return;
    }
    const from = parseFloat(bar.style.getPropertyValue('--from'));
    const to = parseFloat(bar.style.getPropertyValue('--to'));
    if (Number.isNaN(from) || Number.isNaN(to)) return;
    const pct = realPct(from, to);
    bar.style.setProperty('--real-pct', pct.toFixed(1) + '%');
    // Tooltip: S{de}–S{ate} · {pct}% executado
    const rangeTxt = from === to ? `S${from}` : `S${from}–S${to}`;
    const stat = pct >= 99.5 ? 'concluído' : pct <= 0.5 ? 'planejado' : `${pct.toFixed(0)}% executado`;
    bar.dataset.tip = `${rangeTxt} · ${stat}`;
  });

  // Linha vertical "hoje" (só se estiver dentro do cronograma)
  if (WEEK_FLOAT >= 0.5 && WEEK_FLOAT <= TOTAL_WEEKS + 0.5) {
    const head = gantt.querySelector('.gantt-head');
    if (!head) return;
    const cells = head.querySelectorAll('div');
    if (cells.length < 2) return;

    const positionLine = (line) => {
      const headRect = head.getBoundingClientRect();
      const firstWeek = cells[1].getBoundingClientRect();
      const labelWidth = firstWeek.left - headRect.left;
      const weekWidth = (headRect.width - labelWidth) / TOTAL_WEEKS;
      line.style.left = (labelWidth + (WEEK_FLOAT - 0.5) * weekWidth) + 'px';
    };

    const line = document.createElement('div');
    line.className = 'today-line';
    positionLine(line);
    gantt.appendChild(line);
    window.addEventListener('resize', () => positionLine(line), { passive: true });
  }
})();

// Status + filtro do roteiro construtivo (timeline)
(() => {
  const items = document.querySelectorAll('.timeline li[data-from][data-to]');
  if (!items.length) return;

  items.forEach(li => {
    const from = parseFloat(li.dataset.from);
    const to = parseFloat(li.dataset.to);
    let st = 'planned';
    if (WEEK_FLOAT > to + 0.5) st = 'done';
    else if (WEEK_FLOAT >= from - 0.5) st = 'active';
    li.dataset.status = st;
  });

  const btns = document.querySelectorAll('.tl-filter-btn');
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    items.forEach(li => {
      if (f === 'all' || li.dataset.status === f) li.removeAttribute('data-hidden');
      else li.setAttribute('data-hidden', '');
    });
  }));
})();

// Comparador antes/depois
document.querySelectorAll('[data-diff]').forEach(diff => {
  const frame = diff.querySelector('.diff-frame');
  const slider = diff.querySelector('.diff-slider');
  if (!frame || !slider) return;
  const set = v => frame.style.setProperty('--diff-pos', v + '%');
  set(slider.value);
  slider.addEventListener('input', () => set(slider.value));
  // Sincroniza teclado
  slider.addEventListener('keydown', e => {
    if (e.key === 'Home') { slider.value = 0; set(0); e.preventDefault(); }
    if (e.key === 'End')  { slider.value = 100; set(100); e.preventDefault(); }
  });
});

// Modo apresentação (F fullscreen · setas navegam seções · ESC sai)
(() => {
  const sections = Array.from(document.querySelectorAll('main > .section'));
  const hero = document.querySelector('main > .hero');
  const stops = hero ? [hero, ...sections] : sections;
  if (!stops.length) return;

  const hud = document.getElementById('presentHud');
  const idxEl = document.getElementById('presentIdx');
  const totalEl = document.getElementById('presentTotal');
  if (totalEl) totalEl.textContent = stops.length;
  let current = 0;
  let active = false;

  const showCurrent = () => {
    stops.forEach((s, i) => s.classList.toggle('is-current', i === current));
    if (idxEl) idxEl.textContent = current + 1;
    // scroll interno pro topo do bloco
    const cur = stops[current];
    if (cur) cur.scrollTop = 0;
  };
  const enter = () => {
    if (active) return;
    document.body.classList.add('present-mode');
    // determina qual seção começa (a mais visível hoje)
    const y = window.scrollY + window.innerHeight / 2;
    current = 0;
    stops.forEach((s, i) => {
      const t = s.offsetTop;
      if (t <= y) current = i;
    });
    active = true;
    showCurrent();
  };
  const exit = () => {
    if (!active) return;
    document.body.classList.remove('present-mode');
    stops.forEach(s => s.classList.remove('is-current'));
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    active = false;
  };
  const go = (delta) => {
    if (!active) return;
    current = Math.max(0, Math.min(stops.length - 1, current + delta));
    showCurrent();
  };

  document.addEventListener('keydown', e => {
    // não interceptar em inputs
    if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
    if (e.key === 'f' || e.key === 'F') {
      if (!active) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        }
        enter();
      } else {
        exit();
      }
      e.preventDefault();
    } else if (active) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { go(+1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(-1); e.preventDefault(); }
      else if (e.key === 'Home') { current = 0; showCurrent(); e.preventDefault(); }
      else if (e.key === 'End') { current = stops.length - 1; showCurrent(); e.preventDefault(); }
      else if (e.key === 'Escape') { exit(); }
    }
  });

  if (hud) {
    hud.addEventListener('click', e => {
      const nav = e.target.closest('[data-present-nav]');
      if (nav) go(nav.dataset.presentNav === 'next' ? +1 : -1);
      if (e.target.closest('[data-present-exit]')) exit();
    });
  }
})();

// Carrega a lib model-viewer uma única vez, sob demanda
let modelViewerPromise = null;
function loadModelViewer() {
  if (customElements.get('model-viewer')) return Promise.resolve(true);
  if (modelViewerPromise) return modelViewerPromise;
  modelViewerPromise = new Promise(resolve => {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = 'assets/js/model-viewer.min.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return modelViewerPromise;
}

// Maquete 3D no hero: a foto aparece primeiro, o modelo assume quando carregar
(() => {
  const fig = document.querySelector('[data-hero3d]');
  if (!fig) return;
  const model = fig.dataset.model;
  const poster = fig.dataset.poster || '';

  const start = async () => {
    try {
      const head = await fetch(model, { method: 'HEAD' });
      if (!head.ok) return;
    } catch { return; }

    if (!(await loadModelViewer())) return;

    const mv = document.createElement('model-viewer');
    mv.setAttribute('src', model);
    if (poster) mv.setAttribute('poster', poster);
    mv.setAttribute('alt', 'Maquete 3D navegável do espaço de convivência: pergolado, área coberta e churrasqueira');
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('touch-action', 'pan-y');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('auto-rotate-delay', '2500');
    mv.setAttribute('rotation-per-second', '12deg');
    mv.setAttribute('interaction-prompt', 'none');
    mv.setAttribute('shadow-intensity', '0.9');
    mv.setAttribute('shadow-softness', '0.8');
    mv.setAttribute('exposure', '1.05');
    mv.setAttribute('environment-image', 'neutral');
    // modelo tem ~9,4 m de frente: 15 m dá um enquadramento cheio sem cortar
    mv.setAttribute('camera-orbit', '35deg 70deg 15m');
    mv.setAttribute('min-camera-orbit', 'auto 20deg 7m');
    mv.setAttribute('max-camera-orbit', 'auto 88deg 28m');
    mv.setAttribute('field-of-view', '32deg');
    mv.setAttribute('loading', 'eager');

    // controles e dica
    const ctrl = document.createElement('div');
    ctrl.className = 'hero3d-ctrl';
    ctrl.innerHTML =
      '<button type="button" data-3d="reset" aria-label="Recentralizar a maquete" title="Recentralizar">⟲</button>' +
      '<button type="button" data-3d="full" aria-label="Ver em tela cheia" title="Tela cheia">⤢</button>';

    const hint = document.createElement('span');
    hint.className = 'hero3d-hint';
    hint.textContent = 'arraste para girar · role para aproximar';

    fig.insertBefore(mv, fig.firstElementChild);
    fig.appendChild(ctrl);
    fig.appendChild(hint);
    fig.classList.add('is-3d');

    const label = fig.querySelector('[data-hero3d-label]');
    if (label) label.textContent = 'Maquete 3D · arraste para girar';

    // a dica some no primeiro contato
    const dismiss = () => {
      hint.classList.add('is-gone');
      mv.removeEventListener('pointerdown', dismiss);
      mv.removeEventListener('wheel', dismiss);
    };
    mv.addEventListener('pointerdown', dismiss, { once: true });
    mv.addEventListener('wheel', dismiss, { once: true, passive: true });

    ctrl.addEventListener('click', e => {
      const b = e.target.closest('[data-3d]');
      if (!b) return;
      if (b.dataset['3d'] === 'reset') {
        mv.cameraOrbit = '35deg 70deg 15m';
        mv.cameraTarget = 'auto auto auto';
        mv.fieldOfView = '32deg';
      } else if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        fig.requestFullscreen?.().catch(() => {});
      }
    });
  };

  // só busca o modelo depois que a página estiver pronta, pra não competir com o LCP
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
})();

// Legendas das fotos da maquete. A chave é o número do arquivo
// (maquete-03.jpg → '03'). Sem entrada aqui, a foto entra só com o número.
const LEGENDAS_MAQUETE = {
  // '01': 'Corte da base em MDF e marcação dos eixos',
  // '02': 'Transferência da planta baixa em escala',
};

// Descobre quantos arquivos numerados existem numa pasta, testando em paralelo
async function descobrirMidia(dir, prefixo, max, extensoes) {
  const testar = async n => {
    const num = String(n).padStart(2, '0');
    for (const ext of extensoes) {
      const url = `${dir}/${prefixo}${num}.${ext}`;
      try {
        const r = await fetch(url, { method: 'HEAD' });
        if (r.ok) return { num, url, ext };
      } catch { /* segue */ }
    }
    return null;
  };
  const encontrados = await Promise.all(
    Array.from({ length: max }, (_, i) => testar(i + 1))
  );
  return encontrados.filter(Boolean);
}

// Galeria da maquete: monta a partir dos arquivos que existirem na pasta
(async () => {
  const box = document.querySelector('[data-media-gallery]');
  if (!box) return;
  const { dir, prefix, max } = box.dataset;
  const fotos = await descobrirMidia(dir, prefix, Number(max) || 24, ['jpg', 'jpeg', 'png', 'webp']);
  if (!fotos.length) return; // mantém o aviso de pasta vazia

  const galeria = document.createElement('div');
  galeria.className = 'gallery';
  fotos.forEach(({ num, url, ext }) => {
    const legenda = LEGENDAS_MAQUETE[num] || `Montagem da maquete · registro ${num}`;
    const fig = document.createElement('figure');
    fig.className = 'g-item';
    const webp = url.replace(new RegExp(`\\.${ext}$`), '.webp');
    fig.innerHTML =
      `<picture><source srcset="${webp}" type="image/webp"/>` +
      `<img src="${url}" loading="lazy" alt="${legenda}"></picture>` +
      `<figcaption>${legenda}</figcaption>`;
    galeria.appendChild(fig);
  });

  box.innerHTML = '';
  box.appendChild(galeria);
  box.classList.add('is-filled');
  ligarLightbox(galeria);
})();

// Vídeos da maquete: mesma lógica
(async () => {
  const box = document.querySelector('[data-media-video]');
  if (!box) return;
  const { dir, prefix, max } = box.dataset;
  const videos = await descobrirMidia(dir, prefix, Number(max) || 8, ['mp4', 'webm', 'mov']);
  if (!videos.length) return;

  const grid = document.createElement('div');
  grid.className = 'video-grid';
  videos.forEach(({ num, url }) => {
    const v = document.createElement('video');
    v.src = url;
    v.controls = true;
    v.preload = 'none';
    v.title = `Montagem da maquete · vídeo ${num}`;
    grid.appendChild(v);
  });

  box.innerHTML = '';
  box.appendChild(grid);
  box.classList.add('is-filled');
})();

// Viewers 3D (seção técnica e maquete): só ativam se o .glb existir.
document.querySelectorAll('[data-viewer3d]').forEach(async el => {
  const model = el.dataset.model;
  try {
    const resp = await fetch(model, { method: 'HEAD' });
    if (!resp.ok) return;
  } catch { return; }

  if (!(await loadModelViewer())) return;

  el.innerHTML = '';
  const mv = document.createElement('model-viewer');
  mv.setAttribute('src', model);
  mv.setAttribute('camera-controls', '');
  mv.setAttribute('touch-action', 'pan-y');
  mv.setAttribute('auto-rotate', '');
  mv.setAttribute('exposure', '.9');
  mv.setAttribute('shadow-intensity', '.6');
  mv.setAttribute('interaction-prompt', 'none');
  mv.setAttribute('alt', 'Modelo 3D do espaço de convivência');
  el.appendChild(mv);
});

// Downloads opcionais: só ficam clicáveis se o arquivo realmente existir no servidor
document.querySelectorAll('.dl[data-optional-file]').forEach(async link => {
  try {
    const resp = await fetch(link.getAttribute('href'), { method: 'HEAD' });
    if (!resp.ok) return;
    link.classList.add('is-available');
    const size = Number(resp.headers.get('content-length'));
    if (size > 0) {
      const small = link.querySelector('small');
      const label = size > 1024 * 1024
        ? (size / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB'
        : Math.round(size / 1024) + ' KB';
      if (small) small.textContent = small.textContent + ' · ' + label;
    }
  } catch { /* arquivo ainda não publicado */ }
});

// Lazy videos: só carrega metadata quando o vídeo entrar em viewport
(() => {
  const vids = document.querySelectorAll('video[preload="none"]');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const v = e.target;
      v.preload = 'metadata';
      io.unobserve(v);
    });
  }, { rootMargin: '250px 0px' });
  vids.forEach(v => io.observe(v));
})();

// Lightbox
// Declarada aqui para que galerias montadas depois (maquete) também possam usar.
let ligarLightbox = () => {};

const lb = document.getElementById('lightbox');
if (lb) {
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('.lb-caption');
  let items = [];
  let idx = 0;

  function show(i) {
    idx = (i + items.length) % items.length;
    const el = items[idx];
    const thumb = el.querySelector('img');
    lbImg.src = thumb.src;
    lbImg.alt = thumb.alt || 'Imagem ampliada';
    lbCap.textContent = el.querySelector('figcaption')?.textContent || '';
  }
  function openLb(list, i) {
    items = list;
    show(i);
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  ligarLightbox = (gal) => {
    const list = Array.from(gal.querySelectorAll('.g-item'));
    list.forEach((el, i) => el.addEventListener('click', () => openLb(list, i)));
  };
  document.querySelectorAll('.gallery').forEach(ligarLightbox);

  lb.querySelector('.lb-close').addEventListener('click', closeLb);
  lb.querySelector('.lb-prev').addEventListener('click', e => { e.stopPropagation(); show(idx - 1); });
  lb.querySelector('.lb-next').addEventListener('click', e => { e.stopPropagation(); show(idx + 1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });
}
