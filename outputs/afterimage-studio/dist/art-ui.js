// Volume 07 — Atelier interaction layer: kinetic gallery type, reveals, cursor, spotlight.
const doc = document;
const $ = (sel, root = doc) => root.querySelector(sel);
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const fine = window.matchMedia('(pointer: fine)');

/* ——— 展厅标题逐字拆分 ——— */
function splitHeroTitle() {
  const h2 = $('.gallery-hero h2');
  if (!h2 || h2.dataset.artSplit) return;
  h2.dataset.artSplit = '1';
  let index = 0;
  const walk = (node) => {
    if (node.nodeType === 3) {
      const text = node.textContent;
      if (!text.trim()) return;
      const frag = doc.createDocumentFragment();
      for (const char of text) {
        if (!char.trim()) { frag.append(char); continue; }
        const span = doc.createElement('span');
        span.className = 'art-char';
        span.textContent = char;
        span.style.setProperty('--i', index++);
        frag.append(span);
      }
      node.replaceWith(frag);
    } else if (node.nodeType === 1 && node.tagName !== 'BR' && !node.classList.contains('orbit-symbol')) {
      [...node.childNodes].forEach(walk);
    }
  };
  walk(h2);
}

/* ——— 展厅：滚动进度、跑马灯、逐张显现 ——— */
function setupGallery() {
  const dialog = $('#galleryDialog');
  if (!dialog) return;
  splitHeroTitle();

  const progress = doc.createElement('div');
  progress.className = 'art-progress';
  progress.setAttribute('aria-hidden', 'true');
  progress.innerHTML = '<i></i>';
  dialog.prepend(progress);

  const hero = $('.gallery-hero', dialog);
  if (hero && !$('.art-ticker', dialog)) {
    const words = 'AFTERIMAGE® <b>✳</b> IMAGE CULTURE <b>✳</b> 66 LOOKS <b>✳</b> 让照片偏离日常 <b>✳</b> ';
    const line = `<span>${words.repeat(3)}</span>`;
    const ticker = doc.createElement('div');
    ticker.className = 'art-ticker';
    ticker.setAttribute('aria-hidden', 'true');
    ticker.innerHTML = `<div class="art-ticker-track">${line}${line}</div>`;
    hero.after(ticker);
  }

  const bar = $('.art-progress i', dialog);
  let ticking = false;
  const syncProgress = () => {
    ticking = false;
    const max = dialog.scrollHeight - dialog.clientHeight;
    bar.style.width = (max > 4 ? Math.min(100, (dialog.scrollTop / max) * 100) : 0) + '%';
  };
  dialog.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(syncProgress);
  }, { passive: true });

  const open = $('#galleryOpen');
  open?.addEventListener('click', () => {
    dialog.classList.remove('art-anim');
    void dialog.offsetWidth;
    dialog.classList.add('art-anim');
    dialog.scrollTop = 0;
    requestAnimationFrame(syncProgress);
  });

  const observer = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('art-in');
      observer.unobserve(entry.target);
    }
  }, { root: dialog, rootMargin: '0px 0px -8% 0px', threshold: 0.06 }) : null;

  const reveal = (card) => {
    if (!observer || !card.classList.contains('gallery-card') || card.classList.contains('art-reveal')) return;
    card.classList.add('art-reveal');
    observer.observe(card);
  };
  dialog.querySelectorAll('.gallery-card').forEach(reveal);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        reveal(node);
        node.querySelectorAll?.('.gallery-card').forEach(reveal);
      }
    }
    syncProgress();
  }).observe(dialog, { childList: true, subtree: true });
}

/* ——— 指针光标 ——— */
function setupCursor() {
  if (!fine.matches || reduce.matches) return;
  const dot = doc.createElement('div');
  const ring = doc.createElement('div');
  dot.className = 'art-cursor-dot';
  ring.className = 'art-cursor-ring';
  dot.setAttribute('aria-hidden', 'true');
  ring.setAttribute('aria-hidden', 'true');
  doc.body.append(dot, ring);

  let targetX = innerWidth / 2, targetY = innerHeight / 2;
  let ringX = targetX, ringY = targetY;
  let moving = false;

  doc.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.style.transform = `translate3d(${targetX}px,${targetY}px,0)`;
    if (!moving) {
      moving = true;
      requestAnimationFrame(step);
    }
  }, { passive: true });

  doc.addEventListener('pointerover', (event) => {
    const active = event.target.closest?.('button,a,input,select,textarea,label,.gallery-card,.preset-card,.layer,[role=button]');
    ring.classList.toggle('is-active', Boolean(active));
  });
  doc.addEventListener('pointerleave', () => doc.body.classList.add('art-cursor-hidden'));
  doc.addEventListener('pointerenter', () => doc.body.classList.remove('art-cursor-hidden'));

  function step() {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    ring.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
    if (Math.abs(targetX - ringX) > 0.4 || Math.abs(targetY - ringY) > 0.4) {
      requestAnimationFrame(step);
    } else {
      moving = false;
    }
  }
  ring.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
}

/* ——— 画布环境光 ——— */
function setupSpotlight() {
  const area = $('.canvas-area');
  if (!area || !fine.matches || reduce.matches) return;
  const spot = doc.createElement('div');
  spot.className = 'art-spot';
  spot.setAttribute('aria-hidden', 'true');
  area.prepend(spot);
  let raf = 0;
  let px = 0, py = 0;
  area.addEventListener('pointermove', (event) => {
    const rect = area.getBoundingClientRect();
    px = event.clientX - rect.left - 260;
    py = event.clientY - rect.top - 260;
    if (!raf) raf = requestAnimationFrame(() => {
      raf = 0;
      spot.style.transform = `translate3d(${px}px,${py}px,0)`;
    });
  }, { passive: true });
}

/* ——— 磁吸按钮 ——— */
function setupMagnetic() {
  if (!fine.matches || reduce.matches) return;
  doc.querySelectorAll('.header-actions .primary, #galleryOpen, .gallery-sub button, #play').forEach((el) => {
    el.addEventListener('pointermove', (event) => {
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      el.style.translate = `${dx * 0.12}px ${dy * 0.16}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });
}

setupGallery();
setupCursor();
setupSpotlight();
setupMagnetic();
