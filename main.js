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

  /* ---------- Bank of Begonia demo ---------- */
  const START = 20;
  const balEl = document.getElementById('bal');
  const logEl = document.getElementById('log');
  const movedEl = document.getElementById('moved');
  const board = document.getElementById('board');
  const stallBtns = [...document.querySelectorAll('#stalls button')];
  const sendBtn = document.getElementById('send');
  const qr = document.getElementById('qr');

  const STALLS = stallBtns.map((b) => b.dataset.stall).concat('Sent to friends');
  // The other visitors at the carnival, so the board is not empty on arrival
  const CROWD = { 'Ring toss': 41, 'Cotton candy': 58, 'Face painting': 36, 'Dunk tank': 25, 'Sent to friends': 19 };
  let state;

  const drawQR = (seed) => {
    // A deterministic QR-style pattern for this wallet: finder squares plus seeded modules
    const n = 25;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const cells = [];
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && rnd() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    }
    [[0, 0], [18, 0], [0, 18]].forEach(([x, y]) => {
      cells.push(`<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" style="fill:#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`);
    });
    qr.innerHTML = cells.join('');
  };

  const render = (bump) => {
    balEl.textContent = state.bal;
    if (bump && !reduce) { balEl.classList.remove('bump'); void balEl.offsetWidth; balEl.classList.add('bump'); }
    movedEl.textContent = Object.values(CROWD).reduce((a, b) => a + b, 0) + state.moved;
    const totals = STALLS.map((s) => CROWD[s] + state.spent[s]);
    const max = Math.max(...totals);
    board.innerHTML = STALLS.map((s, i) =>
      `<li><span>${s}</span><span class="meter"><i style="--v:${(totals[i] / max).toFixed(3)}"></i></span><b>${totals[i]}</b></li>`).join('');
    stallBtns.forEach((b) => { b.disabled = state.bal < +b.dataset.cost; });
    sendBtn.disabled = state.bal < 5;
    drawQR(state.tx + 7);
  };

  const reset = () => {
    state = { bal: START, moved: 0, spent: Object.fromEntries(STALLS.map((s) => [s, 0])), tx: 0 };
    render();
    logEl.textContent = 'Scan at any stall to pay.';
  };

  const spend = (stall, cost, msg) => {
    if (state.bal < cost) return;
    state.bal -= cost; state.moved += cost; state.spent[stall] += cost; state.tx += 1;
    render(true);
    logEl.textContent = state.bal === 0 ? `${msg} Wallet empty: time for the ticket booth.` : msg;
  };

  stallBtns.forEach((b) => b.addEventListener('click', () => {
    spend(b.dataset.stall, +b.dataset.cost, `Paid ${b.dataset.cost} tickets at ${b.dataset.stall}.`);
  }));
  sendBtn.addEventListener('click', () => spend('Sent to friends', 5, 'Sent 5 tickets to a friend. They arrive instantly in their wallet.'));
  document.getElementById('reset').addEventListener('click', reset);
  reset();

  /* ---------- Résumé ---------- */
  document.getElementById('print').addEventListener('click', () => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    print();
  });
})();
