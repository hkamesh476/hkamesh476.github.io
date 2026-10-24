(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  requestAnimationFrame(() => root.classList.add('ready'));
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Entrances: each section's parts arrive in turn ---------- */
  const reveals = [...document.querySelectorAll('.reveal')];
  const groups = new Map();
  reveals.forEach((el) => {
    const host = el.closest('section') || document.body;
    const i = groups.get(host) || 0;
    groups.set(host, i + 1);
    el.style.setProperty('--d', `${Math.min(i, 6) * 75}ms`);
  });
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('in'));
  }

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

  /* ---------- Bank of Begonia ---------- */
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

  const reset = () => {
    state = { bal: START, moved: 0, spent: Object.fromEntries(STALLS.map((s) => [s, 0])), tx: 0 };
    render();
    logEl.textContent = 'Scan at any stall to pay.';
  };

  const drawQR = (seed) => {
    // A deterministic QR-style pattern for this wallet: finder squares plus seeded modules
    const n = 25;
    let s = seed * 9301 + 49297;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    const cells = [];
    const finder = (x, y) => {
      cells.push([x, y, 7, 7, 'o'], [x + 2, y + 2, 3, 3, 'i']);
    };
    const inFinder = (x, y) => (x < 8 && y < 8) || (x > 16 && y < 8) || (x < 8 && y > 16);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      if (!inFinder(x, y) && rnd() > 0.52) cells.push([x, y, 1, 1]);
    }
    finder(0, 0); finder(18, 0); finder(0, 18);
    qr.innerHTML = cells.map(([x, y, w, h, t]) => t === 'o'
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}"/><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" style="fill:var(--bg)"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`).join('');
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

  const spend = (stall, cost, msg) => {
    if (state.bal < cost) return;
    state.bal -= cost; state.moved += cost; state.spent[stall] += cost; state.tx += 1;
    render(true);
    logEl.textContent = msg;
  };

  stallBtns.forEach((b) => b.addEventListener('click', () => {
    const cost = +b.dataset.cost;
    spend(b.dataset.stall, cost, `Paid ${cost} tickets at ${b.dataset.stall}.`);
    if (state.bal === 0) logEl.textContent += ' Wallet empty: time for the ticket booth.';
  }));
  sendBtn.addEventListener('click', () => spend('Sent to friends', 5, 'Sent 5 tickets to a friend. They arrive instantly in their wallet.'));
  document.getElementById('reset').addEventListener('click', reset);
  reset();

  /* ---------- A slow drift on the sport pictures ---------- */
  const drifters = [...document.querySelectorAll('.g img')];
  if (!reduce && drifters.length) {
    let ticking = false;
    const drift = () => {
      const vh = innerHeight;
      drifters.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1 around the centre
        img.style.setProperty('--drift', `${(p * -28).toFixed(1)}px`);
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* ---------- Résumé ---------- */
  document.getElementById('print').addEventListener('click', () => {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
    print();
  });
})();
