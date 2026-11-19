// STAGECRAFT — shared header/footer, the photo tour controller (index), and the inner pages.
import { BRAND, NAV, SCENES, SERVICES, WORKS, WORK_TYPES, PROCESS, CREDITS, img, workTotal, baht } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const page = document.body.dataset.page;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const LOGO = 'STAGECRAFT';

// ---------- header / footer ----------
const here = location.pathname.split('/').pop() || 'index.html';
$('[data-header]')?.insertAdjacentHTML(
  'afterend',
  `<header class="site-head${page === 'home' ? '' : ' is-solid'}">
    <div class="wrap">
      <a class="logo" href="index.html" aria-label="${BRAND.name} หน้าแรก">${LOGO}</a>
      <nav class="site-nav" aria-label="เมนูหลัก">${NAV.map(([h, l]) => `<a href="${h}"${h === here ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
      <a class="btn btn-sm head-cta" href="contact.html">ขอใบเสนอราคา</a>
      <button class="menu-btn" type="button" aria-label="เปิดเมนู" aria-expanded="false"><span></span><span></span></button>
    </div>
  </header>
  <div class="drawer" aria-hidden="true">${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}<a class="btn" href="contact.html">ขอใบเสนอราคา ${arrow}</a></div>`,
);
const menuBtn = $('.menu-btn');
menuBtn?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menuBtn.setAttribute('aria-expanded', String(open));
  $('.drawer').setAttribute('aria-hidden', String(!open));
});

$('[data-footer]')?.insertAdjacentHTML(
  'afterend',
  `<footer class="site-foot">
    <div class="wrap">
      <div class="foot-grid">
        <div><a class="logo" href="index.html">${LOGO}</a><p>ทีมโปรดักชันเวที แสง สี เสียง และจอ LED สำหรับคอนเสิร์ต งานองค์กร นิทรรศการ และงานเลี้ยง</p></div>
        <div><h4>บริการ</h4><ul>${SERVICES.slice(0, 5).map((s) => `<li><a href="services.html#${s.id}">${s.th}</a></li>`).join('')}</ul></div>
        <div><h4>เว็บไซต์</h4><ul>${NAV.map(([h, l]) => `<li><a href="${h}">${l}</a></li>`).join('')}<li><a href="credits.html">เครดิตภาพ</a></li></ul></div>
        <div><h4>ติดต่อ</h4><ul><li>${BRAND.phone}</li><li>LINE ${BRAND.line}</li><li>${BRAND.email}</li><li>${BRAND.hours}</li></ul></div>
      </div>
      <div class="foot-bottom"><span>© 2026 ${BRAND.name} · เว็บไซต์ตัวอย่างโดย SOFT Z DIGITAL</span><span>ภาพจาก Unsplash · <a href="credits.html">ดูเครดิตทั้งหมด</a></span></div>
    </div>
  </footer>`,
);

// ---------- motion helpers (inner pages) ----------
function initMotion(root = document) {
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  $$('.reveal, .stagger, .lines', root).forEach((el) => io.observe(el));
  // Edge glow follows the cursor.
  $$('.glow', root).forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--gx', `${e.clientX - r.left}px`);
      el.style.setProperty('--gy', `${e.clientY - r.top}px`);
    });
  });
  // Magnetic buttons.
  if (!reducedMotion && matchMedia('(pointer: fine)').matches) {
    $$('.btn', root).forEach((b) => {
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      b.addEventListener('pointerleave', () => (b.style.transform = ''));
    });
  }
}

if (page !== 'home') {
  const head = $('.site-head');
  addEventListener('scroll', () => head.classList.toggle('is-solid', scrollY > 10 || page !== 'home'), { passive: true });
}

// ---------- home: the photo tour ----------
async function initHome() {
  const xp = $('.xp');
  const panels = $$('.panel');
  const rail = $('.rail');
  const counter = $('.counter b');
  const progress = $('.progress');
  const loader = $('.loader');
  const fallback = $('.xp-fallback');
  let index = 0;
  let locked = false;
  let stage = null;

  rail.innerHTML = SCENES.map((s, i) => `<button type="button" data-go="${i}" aria-label="ฉาก ${i + 1}: ${s.label}"><span>${s.label}</span><i></i></button>`).join('');
  $('.counter span').textContent = String(SCENES.length).padStart(2, '0');

  const show = (i) => {
    panels.forEach((p, k) => {
      p.classList.toggle('is-on', k === i);
      p.toggleAttribute('inert', k !== i);
    });
    xp.dataset.side = panels[i].dataset.side;
    $$('button', rail).forEach((b, k) => (k === i ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    counter.textContent = String(i + 1).padStart(2, '0');
    progress.style.width = `${((i + 1) / SCENES.length) * 100}%`;
    $$('img', fallback).forEach((im, k) => im.classList.toggle('is-on', k === i));
    $('.hint').style.opacity = i === SCENES.length - 1 ? '0' : '';
  };

  const go = (i) => {
    i = Math.max(0, Math.min(SCENES.length - 1, i));
    if (i === index || locked) return;
    index = i;
    locked = true;
    // Text leaves first, the camera flies, then the next text comes in near the end of the flight.
    panels.forEach((p) => p.classList.remove('is-on'));
    const ms = stage ? stage.goTo(i) : 600;
    setTimeout(() => show(i), Math.max(250, ms * 0.62));
    setTimeout(() => (locked = false), ms + 120);
    history.replaceState(null, '', i ? `#${SCENES[i].id}` : location.pathname);
  };

  // Input: one wheel gesture / key press / swipe = one scene.
  let wheelAcc = 0;
  let lastWheel = 0;
  addEventListener(
    'wheel',
    (e) => {
      if (document.body.classList.contains('menu-open')) return;
      e.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 260) wheelAcc = 0;
      lastWheel = now;
      if (locked) return;
      wheelAcc += e.deltaY;
      if (Math.abs(wheelAcc) > 40) {
        go(index + Math.sign(wheelAcc));
        wheelAcc = 0;
      }
    },
    { passive: false },
  );
  addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select')) return;
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) (e.preventDefault(), go(index + 1));
    if (['ArrowUp', 'PageUp'].includes(e.key)) (e.preventDefault(), go(index - 1));
    if (e.key === 'Home') go(0);
    if (e.key === 'End') go(SCENES.length - 1);
  });
  let touchY = null;
  addEventListener('touchstart', (e) => (touchY = e.touches[0].clientY), { passive: true });
  addEventListener(
    'touchmove',
    (e) => {
      if (touchY === null || e.target.closest('.drawer')) return;
      e.preventDefault();
      const dy = touchY - e.touches[0].clientY;
      if (Math.abs(dy) > 50) {
        go(index + Math.sign(dy));
        touchY = null;
      }
    },
    { passive: false },
  );
  addEventListener('touchend', () => (touchY = null));
  rail.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]');
    if (b) go(+b.dataset.go);
  });
  $$('[data-next]').forEach((b) => b.addEventListener('click', () => go(index + 1)));
  $$('[data-goto]').forEach((b) => b.addEventListener('click', () => go(SCENES.findIndex((s) => s.id === b.dataset.goto))));

  const done = () => loader.classList.add('is-done');
  try {
    const test = document.createElement('canvas').getContext('webgl2');
    if (!test) throw new Error('no webgl2');
    const { createStage } = await import('./cinema.js');
    await document.fonts.ready;
    stage = createStage($('.xp canvas'), { reducedMotion, onLoaded: done });
    setTimeout(done, 2500);
    document.addEventListener('visibilitychange', () => stage.pause(document.hidden));
  } catch (err) {
    console.warn('WebGL off, showing still photos:', err);
    document.documentElement.classList.add('no-webgl');
    fallback.innerHTML = SCENES.map((s) => `<img src="${img(s.photo)}" alt="">`).join('');
    done();
  }

  // Deep link: index.html#led opens on that scene.
  const start = SCENES.findIndex((s) => `#${s.id}` === location.hash);
  if (start > 0) {
    index = start;
    stage?.goTo(start);
  }
  show(index);
}

// ---------- works ----------
function workCard(w, typeLabel, wide = false) {
  return `<a class="work glow reveal${wide ? ' wide' : ''}" href="work.html?id=${w.id}" data-type="${w.type}" data-id="${w.id}">
      <img src="${img(w.gallery[0][0])}" alt="${w.title}" loading="lazy">
      <span class="work-tag">${typeLabel[w.type]}</span>
      <span class="work-cap"><b>${w.title}</b><span>${w.meta}</span><em>งบงานนี้ ${baht(workTotal(w))}</em></span>
    </a>`;
}

function initWorks() {
  const grid = $('[data-works]');
  const chips = $('[data-chips]');
  chips.innerHTML = WORK_TYPES.map(([id, label]) => `<button class="chip" type="button" data-type="${id}" aria-pressed="${id === 'all'}">${label}</button>`).join('');
  const typeLabel = Object.fromEntries(WORK_TYPES);
  grid.innerHTML = WORKS.map((w) => workCard(w, typeLabel, w.wide)).join('');
  const setType = (type) => {
    $$('.chip', chips).forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.type === type)));
    $$('.work', grid).forEach((el) => {
      const on = type === 'all' || el.dataset.type === type;
      el.hidden = !on;
      el.classList.toggle('wide', on && type === 'all' && WORKS.find((w) => w.id === el.dataset.id).wide);
    });
    history.replaceState(null, '', type === 'all' ? location.pathname : `#${type}`);
  };
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('[data-type]');
    if (c) setType(c.dataset.type);
  });
  const fromHash = location.hash.slice(1);
  if (WORK_TYPES.some(([id]) => id === fromHash)) setType(fromHash);
}

// ---------- one work: gallery, facts, budget, gear, similar ----------
function initWork() {
  const w = WORKS.find((x) => x.id === new URLSearchParams(location.search).get('id')) || WORKS[0];
  const typeLabel = Object.fromEntries(WORK_TYPES);
  const total = workTotal(w);
  document.title = `${w.title} — STAGECRAFT`;
  const credit = (key) => {
    const [name, user] = CREDITS[key];
    return `ภาพโดย <a href="https://unsplash.com/@${user}" target="_blank" rel="noopener">${name}</a> · Unsplash`;
  };

  $('[data-work]').innerHTML = `
    <a class="back" href="works.html">← ผลงานทั้งหมด</a>
    <div class="wd">
      <div class="wd-gallery">
        <button class="wd-main" type="button" data-open aria-label="ดูภาพขนาดเต็ม">
          <img src="${img(w.gallery[0][0])}" alt="${w.title} — ${w.gallery[0][1]}">
          <span class="wd-label" data-label>${w.gallery[0][1]}</span>
          <span class="wd-count"><b data-n>1</b> / ${w.gallery.length}</span>
        </button>
        <div class="wd-thumbs" style="--n:${Math.max(w.gallery.length, 4)}">
          ${w.gallery.map(([key, label], i) => `<button type="button" data-shot="${i}" aria-label="${label}"${i === 0 ? ' aria-current="true"' : ''}><img src="${img(key)}" alt="" loading="lazy"></button>`).join('')}
        </div>
        <p class="wd-credit" data-credit>${credit(w.gallery[0][0])}</p>
      </div>
      <aside class="wd-side">
        <span class="eyebrow">${typeLabel[w.type]}</span>
        <h1 class="display wd-title">${w.title}</h1>
        <p class="lead">${w.place} · ${w.date}</p>
        <dl class="wd-facts">${w.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
        <div class="wd-budget">
          <div class="wd-total"><span>งบประมาณงานนี้</span><b>${baht(total)}</b></div>
          <ul>${w.budget.map(([k, v]) => `<li><span>${k}</span><b>${baht(v)}</b><i style="--w:${((v / total) * 100).toFixed(1)}%"></i></li>`).join('')}</ul>
          <p class="wd-note">ราคารวมอุปกรณ์ ทีมงาน ติดตั้ง และรื้อถอน ไม่รวม VAT 7% · งานของคุณประเมินตามขนาดและวันจริง</p>
        </div>
        <div class="wd-actions">
          <a class="btn" href="contact.html?ref=${w.id}">ขอราคางานแบบนี้</a>
          <a class="btn btn-ghost" href="https://line.me/" target="_blank" rel="noopener">คุยทาง LINE</a>
        </div>
      </aside>
    </div>
    <div class="wd-more">
      <div class="reveal">
        <span class="eyebrow">About the show</span>
        <p class="wd-summary">${w.summary}</p>
      </div>
      <dl class="wd-gear reveal">${w.gear.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
    </div>`;

  // Gallery: thumbnails swap the main shot; the main shot opens the lightbox.
  let shot = 0;
  const main = $('.wd-main img');
  const show = (i) => {
    shot = (i + w.gallery.length) % w.gallery.length;
    const [key, label] = w.gallery[shot];
    main.style.opacity = '0';
    setTimeout(() => {
      main.src = img(key);
      main.alt = `${w.title} — ${label}`;
      main.style.opacity = '';
    }, 180);
    $('[data-label]').textContent = label;
    $('[data-n]').textContent = shot + 1;
    $('[data-credit]').innerHTML = credit(key);
    $$('.wd-thumbs button').forEach((b, k) => (k === shot ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
  };
  $('.wd-thumbs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-shot]');
    if (b) show(+b.dataset.shot);
  });

  const lb = $('[data-lightbox]');
  const render = () => {
    const [key, label] = w.gallery[shot];
    lb.querySelector('img').src = img(key);
    lb.querySelector('img').alt = `${w.title} — ${label}`;
    lb.querySelector('figcaption').innerHTML = `<span><b>${w.title}</b> · ${label}</span><span>${credit(key)}</span>`;
  };
  $('[data-open]').addEventListener('click', () => {
    render();
    lb.classList.add('is-open');
    lb.querySelector('.lb-close').focus();
  });
  const close = () => lb.classList.remove('is-open');
  const step = (d) => {
    show(shot + d);
    render();
  };
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => step(-1));
  lb.querySelector('.lb-next').addEventListener('click', () => step(1));
  lb.addEventListener('click', (e) => e.target === lb && close());
  addEventListener('keydown', (e) => {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    } else if (!e.target.closest('input, textarea')) {
      if (e.key === 'ArrowRight') show(shot + 1);
      if (e.key === 'ArrowLeft') show(shot - 1);
    }
  });

  // Similar works: same type first, then others, three cards.
  const similar = [...WORKS.filter((x) => x.type === w.type && x.id !== w.id), ...WORKS.filter((x) => x.type !== w.type)].slice(0, 3);
  $('[data-similar]').innerHTML = similar.map((x) => workCard(x, typeLabel)).join('');
}

// ---------- services ----------
function initServices() {
  $('[data-services]').innerHTML = SERVICES.map(
    (s) => `<article class="svc reveal" id="${s.id}">
      <span class="svc-no">${s.no}</span>
      <div><h3>${s.title}</h3><span>${s.th}</span></div>
      <div><p>${s.body}</p><ul>${s.points.map((p) => `<li>${p}</li>`).join('')}</ul></div>
      <div class="svc-img glow"><img src="${img(s.photo)}" alt="${s.th}" loading="lazy"></div>
    </article>`,
  ).join('');
  $('[data-process]').innerHTML = PROCESS.map(([n, t, d]) => `<div class="step glow"><b>${n}</b><h3>${t}</h3><p>${d}</p></div>`).join('');
}

// ---------- contact ----------
function initContact() {
  const form = $('[data-quote]');
  const topic = new URLSearchParams(location.search).get('service');
  if (topic) {
    const box = form.querySelector(`input[value="${CSS.escape(topic)}"]`);
    if (box) box.checked = true;
  }
  // Coming from a case study: note which show the request is based on.
  const ref = WORKS.find((w) => w.id === new URLSearchParams(location.search).get('ref'));
  if (ref) form.querySelector('textarea').value = `อยากได้งานแบบ ${ref.title} (${baht(workTotal(ref))}) `;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    form.classList.add('is-sent');
    form.querySelector('.form-done').focus?.();
  });
}

// ---------- credits ----------
function initCredits() {
  $('[data-credits]').innerHTML = Object.entries(CREDITS)
    .map(
      ([key, [name, user, slug]]) =>
        `<li><img src="${img(key)}" alt="" loading="lazy"><span>ภาพโดย <a href="https://unsplash.com/@${user}" target="_blank" rel="noopener">${name}</a><br><a href="https://unsplash.com/photos/${slug}" target="_blank" rel="noopener">ดูบน Unsplash</a></span></li>`,
    )
    .join('');
}

if (page === 'home') initHome();
if (page === 'works') initWorks();
if (page === 'work') initWork();
if (page === 'services') initServices();
if (page === 'contact') initContact();
if (page === 'credits') initCredits();
if (page !== 'home') initMotion();
