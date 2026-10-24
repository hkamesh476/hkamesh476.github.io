(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => root.classList.add('ready'));
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Menu ---------- */
  const menuBtn = document.querySelector('.menu-btn');
  const menu = document.getElementById('menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
    document.querySelector('.bar').classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- Entrances ---------- */
  const reveals = [...document.querySelectorAll('.reveal, .sign')];
  const groups = new Map();
  reveals.forEach((el) => {
    const host = el.closest('section, footer') || document.body;
    const i = groups.get(host) || 0;
    groups.set(host, i + 1);
    el.style.setProperty('--d', `${Math.min(i, 6) * 75}ms`);
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

  /* ---------- The message fills in word by word as it scrolls past ---------- */
  const statement = document.querySelector('[data-words]');
  const words = [];
  if (statement) {
    const wrap = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(part); return; }
            const s = document.createElement('span');
            s.className = 'w'; s.textContent = part;
            frag.append(s); words.push(s);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) {
          if (n.classList.contains('hl')) { n.classList.add('w'); words.push(n); } else wrap(n);
        }
      });
    };
    wrap(statement);
  }

  /* ---------- Collage parallax ---------- */
  const floaters = [...document.querySelectorAll('[data-speed]')];
  const wide = matchMedia('(min-width: 701px)');

  const bar = document.querySelector('.bar');
  const darks = [...document.querySelectorAll('.dark')];

  let ticking = false;
  const onScroll = () => {
    const vh = innerHeight;
    // The bar's logo flips to light over the dark sections
    const y = 40;
    bar.classList.toggle('scrolled', scrollY > 40);
    bar.classList.toggle('on-dark', darks.some((d) => { const r = d.getBoundingClientRect(); return r.top <= y && r.bottom >= y; }));
    if (words.length) {
      const r = statement.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('on', i < lit));
    }
    if (!reduce && wide.matches) {
      floaters.forEach((el) => {
        const speed = parseFloat(el.dataset.speed) || 0;
        if (!speed) return;
        const r = el.parentElement.getBoundingClientRect();
        const offset = (r.top + r.height / 2 - vh / 2) * speed;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      });
    }
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- Projects: the name crossing the centre owns the frame ---------- */
  const names = [...document.querySelectorAll('.work-list a')];
  const pics = [...document.querySelectorAll('.work-frame img')];
  const kind = document.querySelector('[data-fact="kind"]');
  const role = document.querySelector('[data-fact="role"]');
  const setCurrent = (a) => {
    names.forEach((n) => n.classList.toggle('is-current', n === a));
    pics.forEach((p) => p.classList.toggle('is-on', p.dataset.key === a.dataset.key));
    kind.textContent = a.dataset.kind;
    role.textContent = a.dataset.role;
  };
  if (names.length) {
    setCurrent(names[0]);
    const mid = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setCurrent(e.target); });
    }, { rootMargin: '-49% 0px -49% 0px' });
    names.forEach((n) => mid.observe(n));
  }

  /* ---------- Résumé ---------- */
  document.getElementById('print').addEventListener('click', () => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    print();
  });
})();
