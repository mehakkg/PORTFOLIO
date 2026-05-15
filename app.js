/* ---------- Mehak Garg portfolio — shared interactions ---------- */

(function () {
  // ---------- Custom cursor ----------
  const cursor = document.createElement('div');
  cursor.className = 'cursor';
  document.body.appendChild(cursor);
  const cursorLabel = document.createElement('div');
  cursorLabel.className = 'cursor-label';
  document.body.appendChild(cursorLabel);

  let cx = 0, cy = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    cursor.classList.add('visible');
  });
  document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
  function tick() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    cursorLabel.style.left = cx + 'px';
    cursorLabel.style.top = cy + 'px';
    requestAnimationFrame(tick);
  }
  tick();

  function bindHover() {
    document.querySelectorAll('[data-cursor]').forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = '1';
      const mode = el.dataset.cursor;
      const label = el.dataset.cursorLabel || '';
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        if (mode === 'text') cursor.classList.add('hover-text');
        if (label) {
          cursorLabel.textContent = label;
          cursorLabel.classList.add('visible');
        }
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover', 'hover-text');
        cursorLabel.classList.remove('visible');
      });
    });
  }
  bindHover();
  window.bindHover = bindHover;

  // ---------- Nav scrolled state ----------
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Scroll progress ----------
  const prog = document.querySelector('.scroll-progress');
  if (prog) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.width = ((window.scrollY / h) * 100) + '%';
    }, { passive: true });
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => io.observe(el));
  // Fallback: reveal anything already in viewport on load (above-the-fold safety net)
  function revealVisible() {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', revealVisible);
  } else {
    revealVisible();
  }
  // And one more after a tick in case fonts/layout shift
  setTimeout(revealVisible, 50);

  // ---------- Hero word stagger ----------
  document.querySelectorAll('.hero h1').forEach((h) => {
    if (h.dataset.split) return;
    h.dataset.split = '1';
    const html = h.innerHTML;
    const wrapped = html.replace(/(<[^>]+>|[^\s<]+)/g, (m) => {
      if (m.startsWith('<')) return m;
      return `<span class="word"><span class="word-inner">${m}</span></span>`;
    });
    h.innerHTML = wrapped;
    const words = h.querySelectorAll('.word-inner');
    words.forEach((w, i) => {
      w.style.display = 'inline-block';
      w.style.transform = 'translateY(110%)';
      w.style.transition = `transform 1.0s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.04}s`;
    });
    h.querySelectorAll('.word').forEach((wsp) => {
      wsp.style.display = 'inline-block';
      wsp.style.overflow = 'hidden';
      wsp.style.lineHeight = '1.05';
      wsp.style.paddingBottom = '0.04em';
    });
    // Force a reflow then flip transforms — some browsers skip rAF chains here
    void h.offsetWidth;
    setTimeout(() => {
      words.forEach((w) => (w.style.transform = 'translateY(0)'));
    }, 30);
  });

  // ---------- Theme persistence (so case studies inherit) ----------
  try {
    const saved = localStorage.getItem('mehak-theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);
    const accent = localStorage.getItem('mehak-accent');
    if (accent) document.documentElement.style.setProperty('--accent', accent);
    const dens = localStorage.getItem('mehak-density');
    if (dens) document.documentElement.setAttribute('data-density', dens);
    const font = localStorage.getItem('mehak-font');
    if (font) document.documentElement.setAttribute('data-font', font);
  } catch (e) {}
})();
