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

// Abas da galeria
document.querySelectorAll('.tabs').forEach(tabs => {
  const btns = tabs.querySelectorAll('.tab-btn');
  const panels = tabs.parentElement.querySelectorAll(':scope > .tab-panel');
  btns.forEach(btn => btn.addEventListener('click', () => {
    btns.forEach(b => b.classList.toggle('active', b === btn));
    panels.forEach(p => p.classList.toggle('active', p.id === btn.dataset.panel));
  }));
});

// Lightbox
const lb = document.getElementById('lightbox');
if (lb) {
  const lbImg = lb.querySelector('img');
  const lbCap = lb.querySelector('.lb-caption');
  let items = [];
  let idx = 0;

  function show(i) {
    idx = (i + items.length) % items.length;
    const el = items[idx];
    lbImg.src = el.querySelector('img').src;
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

  document.querySelectorAll('.gallery').forEach(gal => {
    const list = Array.from(gal.querySelectorAll('.g-item'));
    list.forEach((el, i) => el.addEventListener('click', () => openLb(list, i)));
  });

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

// Reveal-on-scroll suave
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.section, .hero-copy, .hero-art').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity .7s ease, transform .7s ease';
  io.observe(el);
});
