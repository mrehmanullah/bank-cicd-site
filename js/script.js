(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Theme (saved in localStorage, falls back to OS setting) */
  const root = document.documentElement;
  const themeBtn = $('#themeBtn');
  const saved = localStorage.getItem('theme');
  const startDark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const setTheme = (dark) => {
    root.dataset.theme = dark ? 'dark' : 'light';
    themeBtn.textContent = dark ? '\u2600' : '\u263E';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  };
  setTheme(startDark);
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme !== 'dark'));

  /* Mobile menu */
  const nav = $('#nav'), menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  }));

  /* Header shadow and back-to-top */
  const header = $('header'), toTop = $('#toTop');
  addEventListener('scroll', () => {
    header.classList.toggle('scrolled', scrollY > 10);
    toTop.classList.toggle('show', scrollY > 600);
  }, { passive: true });
  toTop.addEventListener('click', () => scrollTo({ top: 0 }));

  /* Highlight the nav link of the section in view */
  const links = $$('#nav a');
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* Loan calculator */
  const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const amt = $('#amt'), rate = $('#rate'), term = $('#term');
  function calc() {
    const P = +amt.value, n = +term.value, r = +rate.value / 100 / 12;
    const m = r === 0 ? P / n : (P * r) / (1 - Math.pow(1 + r, -n));
    $('#amtOut').textContent = fmt.format(P);
    $('#rateOut').textContent = rate.value + '%';
    $('#termOut').textContent = n + ' months';
    $('#monthly').textContent = fmt2.format(m);
    $('#interest').textContent = fmt.format(m * n - P);
    $('#total').textContent = fmt.format(m * n);
  }
  [amt, rate, term].forEach(el => el.addEventListener('input', calc));
  calc();

  /* Animated counters (run once when visible) */
  const counters = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = +el.dataset.count, dec = +(el.dataset.dec || 0);
      const suffix = el.dataset.suffix || '', t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => counters.observe(el));

  /* Service tabs */
  $$('.tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', false); });
    $$('.panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', true);
    $('#' + tab.dataset.tab).classList.add('active');
  }));

  /* Toast */
  const toast = $('#toast');
  let timer;
  function showToast(msg, isError = false) {
    toast.textContent = msg;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* Contact form validation */
  const form = $('#contactForm'), msg = $('#message');
  msg.addEventListener('input', () => { $('#count').textContent = msg.value.length + '/500'; });

  const rules = {
    name: (v) => v.trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address, like name@example.com.',
    message: (v) => v.trim().length >= 10 ? '' : 'Write at least 10 characters so we can help.'
  };
  function check(id) {
    const field = $('#' + id), error = rules[id](field.value);
    field.classList.toggle('invalid', !!error);
    $(`.err[data-for="${id}"]`).textContent = error;
    return !error;
  }
  Object.keys(rules).forEach(id => $('#' + id).addEventListener('blur', () => check(id)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const ok = Object.keys(rules).map(check).every(Boolean);
    if (!ok) return showToast('Fix the highlighted fields and send again.', true);
    // Demo only: replace with fetch('/api/contact', { method: 'POST', body: ... })
    form.reset();
    $('#count').textContent = '0/500';
    showToast('Message sent. We will reply within one business day.');
  });

  $('#year').textContent = new Date().getFullYear();
})();