/* =========================================================
   For The Most Beautiful Girl In My World ❤️
   script.js — vanilla JS, no frameworks
   ========================================================= */
'use strict';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[(Math.random() * arr.length) | 0];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   CONFIG — edit freely
   ========================================================= */

// Birth: 06 November 2002, 09:15 AM (local time)
const BIRTH = new Date(2002, 10, 6, 9, 15, 0);

// REPLACE LOVE LETTER TEXT HERE
const LETTERS = [
  { title: 'Where It All Began', stamp: '🌷', doodle: '🧸', text: 'My favorite story began the moment life quietly decided our paths would cross.' },
  { title: 'My Favorite Memories', stamp: '📸', doodle: '☁️', text: 'A page filled with my favorite memories of U and the moments that made me smile without reason.' },
  { title: 'Everything About U', stamp: '🌸', doodle: '✨', text: 'Everything special about U has slowly become everything important to me.' },
  { title: 'The Little Things', stamp: '🎀', doodle: '🍓', text: 'The little things U do, the way U smile, the way U care, and the way U make ordinary moments beautiful.' },
  { title: 'My Promises', stamp: '💍', doodle: '🌙', text: 'My promises to U, written not with ink, but with sincerity from the deepest part of my heart.' },
  { title: 'Tomorrow, With U', stamp: '🌈', doodle: '🌻', text: 'My dreams about tomorrow, where every beautiful possibility somehow includes U.' },
];

// REPLACE GALLERY PHOTOS + CAPTIONS HERE
const PHOTOS = [
  { src: 'assets/images/photo1.jpeg', cap: 'that smile ♡' },
  { src: 'assets/images/photo2.jpeg', cap: 'lost in the clouds' },
  { src: 'assets/images/photo3.jpeg', cap: 'my favorite glow' },
  { src: 'assets/images/photo4.jpeg', cap: 'sunshine in green' },
  { src: 'assets/images/photo5.png', cap: 'pure happiness' },
  { src: 'assets/images/photo6.png', cap: 'a quiet little dream' },
  { src: 'assets/images/photo7.png', cap: 'forever my favorite' },
];

// Decorative stickers per page: [glyph, x%, y%, size px]
const STICKERS = {
  p1: [['🌸', 5, 6, 40], ['🧸', 88, 9, 48], ['☁️', 10, 30, 56], ['✨', 92, 54, 30], ['🎀', 6, 86, 38], ['💗', 90, 80, 34],
       ['⭐', 20, 16, 22], ['🌷', 80, 44, 32], ['♡', 15, 50, 30, 1], ['✿', 84, 66, 30, 1], ['☆', 94, 24, 26, 1], ['♡', 4, 72, 24, 1]],
  p2: [['💌', 6, 30, 42], ['🧸', 90, 12, 50], ['🌸', 88, 42, 36], ['☁️', 4, 60, 58], ['🌼', 92, 88, 34], ['🍓', 8, 88, 32],
       ['✨', 20, 8, 26], ['♡', 78, 6, 30, 1], ['✿', 14, 74, 28, 1], ['☆', 86, 62, 26, 1]],
  p3: [['🌙', 88, 2, 52], ['⭐', 8, 4, 26], ['✨', 94, 14, 24], ['🧸', 5, 22, 44], ['💫', 90, 38, 30], ['☁️', 6, 46, 50],
       ['🌸', 92, 66, 32], ['⭐', 4, 72, 22], ['♡', 12, 12, 26, 1], ['☆', 82, 26, 24, 1], ['✿', 94, 82, 26, 1]],
};

/* =========================================================
   FX — canvas particles (hearts, sparkles, stars, lanterns)
   ========================================================= */
const FX = (() => {
  const cvs = $('#fx');
  const ctx = cvs.getContext('2d');
  let W = 0, H = 0, parts = [], stars = [], mode = 'day', last = performance.now();
  const acc = {};
  const DAY = ['#ff8fb1', '#ffb3c9', '#f78fb8', '#c9a8f5', '#ffc1a3', '#ff6f9a'];
  const NIGHT = ['#ff9fbe', '#ffd1e0', '#d9c6ff', '#ffe2b8', '#ff7fa6'];
  const RATES = {
    day:    { heart: 1.6, sparkle: 4, orb: 1.2, lantern: 0, shoot: 0 },
    night:  { heart: .7, sparkle: 2.5, orb: .4, lantern: .45, shoot: .12 },
    finale: { heart: 4, sparkle: 9, orb: 1, lantern: 2.2, shoot: .9 },
  };
  const scale = reduceMotion ? .25 : 1;
  const MAX = 220;

  // Pre-rendered lantern sprite
  const lantern = document.createElement('canvas');
  (function drawLantern() {
    const S = 120; lantern.width = S; lantern.height = S * 1.3;
    const c = lantern.getContext('2d'), cx = S / 2, cy = S * .65;
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, S * .6);
    g.addColorStop(0, 'rgba(255,190,120,.55)'); g.addColorStop(1, 'rgba(255,140,110,0)');
    c.fillStyle = g; c.fillRect(0, 0, S, S * 1.3);
    const b = c.createLinearGradient(0, cy - 26, 0, cy + 26);
    b.addColorStop(0, '#ffe0a8'); b.addColorStop(1, '#ff8a6b');
    c.fillStyle = b; c.beginPath();
    c.moveTo(cx - 16, cy - 22); c.quadraticCurveTo(cx, cy - 31, cx + 16, cy - 22);
    c.lineTo(cx + 12, cy + 20); c.quadraticCurveTo(cx, cy + 25, cx - 12, cy + 20);
    c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,225,.95)'; c.beginPath(); c.arc(cx, cy + 15, 4, 0, 7); c.fill();
  })();

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    cvs.style.width = W + 'px'; cvs.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.min(220, (W * H) / 7000) | 0 }, () => ({
      x: Math.random() * W, y: Math.random() * H, r: rand(.4, 1.5), ph: Math.random() * 6.28, sp: rand(.01, .04),
    }));
  }

  function heartPath(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s * .25);
    ctx.bezierCurveTo(-s * .5, -s * .8, -s * 1.15, -s * .05, 0, s * .6);
    ctx.bezierCurveTo(s * 1.15, -s * .05, s * .5, -s * .8, 0, -s * .25);
    ctx.fill();
  }
  function sparklePath(s) {
    ctx.beginPath();
    ctx.moveTo(0, -s); ctx.quadraticCurveTo(0, 0, s, 0); ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0); ctx.quadraticCurveTo(0, 0, 0, -s); ctx.fill();
  }
  const palette = () => (mode === 'day' ? DAY : NIGHT);

  function add(p) { if (parts.length < MAX) parts.push(Object.assign({ age: 0, rot: 0, vr: 0, g: 0, a: 1, ph: Math.random() * 6.28 }, p)); }

  const spawn = {
    heart: () => add({ t: 'heart', x: rand(0, W), y: H + 20, vx: 0, vy: -rand(.4, 1.1), s: rand(6, 15), c: pick(palette()), a: rand(.35, .8), sway: rand(.3, 1), life: 1e9 }),
    sparkle: () => add({ t: 'sparkle', x: rand(0, W), y: rand(0, H), vx: 0, vy: 0, s: rand(3, 8), c: mode === 'day' ? pick(['#fff', '#ffd1e0', '#e3d4ff']) : pick(['#fff', '#ffe2b8', '#ffd1e0']), life: rand(60, 140) }),
    orb: () => add({ t: 'orb', x: rand(0, W), y: H + 30, vx: rand(-.2, .2), vy: -rand(.2, .5), s: rand(10, 26), c: pick(palette()), a: rand(.15, .35), sway: .4, life: 1e9 }),
    lantern: () => add({ t: 'lantern', x: rand(W * .05, W * .95), y: H + 60, vx: 0, vy: -rand(.35, .8), s: rand(.35, .75), a: rand(.7, 1), sway: rand(.2, .6), life: 1e9 }),
    shoot: () => add({ t: 'shoot', x: rand(W * .3, W * 1.1), y: rand(-20, H * .35), vx: -rand(9, 13), vy: rand(3.5, 5), s: 1, life: 55 }),
  };

  function burst(x, y, n = 36, opts = {}) {
    for (let i = 0; i < n * scale; i++) {
      const ang = rand(0, Math.PI * 2), sp = rand(2, opts.power || 7);
      add({
        t: Math.random() < .6 ? 'heart' : 'sparkle', x, y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1.5, g: .09, drag: .97,
        s: rand(5, 13), c: pick(opts.colors || DAY.concat(['#fff'])), life: rand(70, 120), vr: rand(-.1, .1), fade: true,
      });
    }
  }
  function rise(x, y) {
    add({ t: 'heart', x, y, vx: rand(-.4, .4), vy: -rand(.6, 1.3), s: rand(5, 10), c: pick(DAY), a: .85, sway: .6, life: rand(90, 150), fade: true });
  }
  function sparkleAt(x, y) {
    add({ t: 'sparkle', x, y, vx: 0, vy: 0, s: rand(5, 11), c: pick(['#fff', '#ffd1e0', '#e3d4ff']), life: rand(50, 90) });
  }

  function tick(now) {
    const dt = Math.min((now - last) / 16.67, 3); last = now;
    if (!document.hidden) {
      const r = RATES[mode];
      for (const k in r) {
        acc[k] = (acc[k] || 0) + r[k] * scale * dt / 60;
        while (acc[k] >= 1) { spawn[k](); acc[k]--; }
      }
    }
    ctx.clearRect(0, 0, W, H);

    if (mode !== 'day') {
      ctx.fillStyle = '#fff';
      for (const s of stars) {
        s.ph += s.sp * dt;
        ctx.globalAlpha = .35 + Math.sin(s.ph) * .35 + .3;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
    }

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.age += dt;
      if (p.drag) { p.vx *= Math.pow(p.drag, dt); p.vy *= Math.pow(p.drag, dt); }
      p.vy += p.g * dt;
      p.x += (p.vx + (p.sway ? Math.sin(p.age * .03 + p.ph) * p.sway : 0)) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const lifeK = p.age / p.life;
      if (lifeK >= 1 || p.y < -80 || p.x < -100 || p.x > W + 100 || p.y > H + 120) { parts.splice(i, 1); continue; }

      let alpha = p.a;
      if (p.fade) alpha *= 1 - lifeK;
      if (p.t === 'sparkle') alpha = Math.sin(lifeK * Math.PI);
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.save();
      ctx.translate(p.x, p.y);
      switch (p.t) {
        case 'heart':
          ctx.rotate(p.rot + Math.sin(p.age * .04 + p.ph) * .25);
          ctx.fillStyle = p.c; heartPath(p.s); break;
        case 'sparkle':
          ctx.rotate(p.age * .02);
          ctx.fillStyle = p.c; sparklePath(p.s);
          ctx.globalAlpha *= .35; ctx.beginPath(); ctx.arc(0, 0, p.s * 1.4, 0, 7); ctx.fill(); break;
        case 'orb': {
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
          g.addColorStop(0, p.c); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, p.s, 0, 7); ctx.fill(); break;
        }
        case 'lantern':
          ctx.rotate(Math.sin(p.age * .02 + p.ph) * .08);
          ctx.globalAlpha = alpha * (.85 + Math.sin(p.age * .1 + p.ph) * .15);
          ctx.drawImage(lantern, -60 * p.s, -78 * p.s, 120 * p.s, 156 * p.s); break;
        case 'shoot': {
          const g = ctx.createLinearGradient(0, 0, -p.vx * 9, -p.vy * 9);
          g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,200,230,0)');
          ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineCap = 'round';
          ctx.globalAlpha = 1 - lifeK;
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-p.vx * 9, -p.vy * 9); ctx.stroke(); break;
        }
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }

  function setMode(m) {
    if (m === mode) return;
    mode = m;
    if (m === 'day') parts = parts.filter((p) => p.t !== 'lantern' && p.t !== 'shoot');
    if (m !== 'day') for (let i = 0; i < 6 * scale; i++) { spawn.lantern(); parts[parts.length - 1].y = rand(H * .3, H); }
  }

  addEventListener('resize', resize);
  resize();
  for (let i = 0; i < 14 * scale; i++) { spawn.heart(); parts[parts.length - 1].y = rand(0, H); }
  requestAnimationFrame(tick);
  return { burst, rise, sparkleAt, setMode };
})();

/* =========================================================
   Helpers
   ========================================================= */
function scatterStickers() {
  $$('.stickers').forEach((box) => {
    (STICKERS[box.dataset.set] || []).forEach(([g, x, y, s, doodle]) => {
      const el = document.createElement('span');
      el.className = 'sticker' + (doodle ? ' doodle' : '');
      el.textContent = g;
      el.style.cssText = `--x:${x}%;--y:${y}%;--s:${s}px;--d:${rand(5, 9).toFixed(1)}s;--dl:${(-rand(0, 6)).toFixed(1)}s`;
      box.append(el);
    });
  });
}

function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.innerHTML = words.map((w, i) => `<span class="w" style="--i:${i}"><span class="ink" style="--i:${i}">${w}</span></span>`).join(' ')
    + ` <span class="w" style="--i:${words.length}">❤️</span>`;
}

// Graceful placeholders for photos that aren't added yet
function watchImage(img, onFail) {
  const fail = () => onFail(img);
  if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
  else img.addEventListener('error', fail, { once: true });
}
function markMissing(img) { img.closest('.photo')?.classList.add('missing'); }

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: .15, rootMargin: '0px 0px -6% 0px' });

/* =========================================================
   Page navigation + magical transition
   ========================================================= */
let current = 1, busy = false;
const onEnter = {};

function showPage(n) {
  $$('.page').forEach((p) => p.classList.toggle('is-active', p.id === 'page' + n));
  current = n;
  document.body.classList.toggle('theme-night', n === 3);
  document.body.classList.toggle('theme-day', n !== 3);
  $('meta[name="theme-color"]').content = n === 3 ? '#15122e' : '#ffe3ec';
  window.scrollTo(0, 0);
  FX.setMode(n === 3 ? 'night' : 'day');
  onEnter[n] && onEnter[n]();
}

function transitionTo(n, x = innerWidth / 2, y = innerHeight / 2) {
  if (busy) return;
  busy = true;
  const b = $('#bloom');
  b.style.setProperty('--x', x + 'px');
  b.style.setProperty('--y', y + 'px');
  b.className = 'bloom' + (n === 3 ? ' to-night' : '');
  void b.offsetWidth;
  b.classList.add('grow');
  FX.burst(x, y, 48, { power: 9 });
  setTimeout(() => {
    showPage(n);
    b.classList.add('fade');
    setTimeout(() => { b.className = 'bloom'; busy = false; }, 950);
  }, reduceMotion ? 250 : 1100);
}

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

/* =========================================================
   PAGE 1 — Landing
   ========================================================= */
function lifeSpan(from, to) {
  const addMonths = (d, n) => {
    const r = new Date(d), day = r.getDate();
    r.setDate(1); r.setMonth(r.getMonth() + n);
    r.setDate(Math.min(day, new Date(r.getFullYear(), r.getMonth() + 1, 0).getDate()));
    return r;
  };
  let total = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  let anchor = addMonths(from, total);
  if (anchor > to) anchor = addMonths(from, --total);
  let d = 0;
  for (;;) {
    const nxt = new Date(anchor); nxt.setDate(nxt.getDate() + 1);
    if (nxt > to) break;
    anchor = nxt; d++;
  }
  let ms = to - anchor;
  const h = Math.floor(ms / 36e5); ms -= h * 36e5;
  const mi = Math.floor(ms / 6e4); ms -= mi * 6e4;
  return { y: Math.floor(total / 12), m: total % 12, d, h, mi, s: Math.floor(ms / 1000) };
}

function initLanding() {
  splitWords($('#heroTitle'));

  // Birthday-aware eyebrow
  const now = new Date();
  if (now.getMonth() === BIRTH.getMonth() && now.getDate() === BIRTH.getDate()) {
    $('#eyebrow').innerHTML = '<span>✿</span> happy birthday, my love 🎂 <span>✿</span>';
  }

  // Live timer
  const nums = {};
  $$('.t-num').forEach((el) => (nums[el.dataset.k] = el));
  const pad = (v, k) => (k === 'y' || k === 'd' || k === 'm' ? String(v) : String(v).padStart(2, '0'));
  const update = () => {
    const t = lifeSpan(BIRTH, new Date());
    for (const k in nums) {
      const v = pad(t[k], k);
      if (nums[k].textContent !== v) {
        nums[k].textContent = v;
        nums[k].classList.remove('tick'); void nums[k].offsetWidth; nums[k].classList.add('tick');
      }
    }
  };
  update();
  setTimeout(() => { update(); setInterval(update, 1000); }, 1000 - (Date.now() % 1000));

  // Sparkle reveal across the title
  setTimeout(() => {
    const r = $('#heroTitle').getBoundingClientRect();
    for (let i = 0; i < 22; i++) setTimeout(() => FX.sparkleAt(rand(r.left, r.right), rand(r.top, r.bottom)), i * 60);
  }, 1300);

  // Heart particles from the portrait
  const portrait = $('#portrait');
  setInterval(() => {
    if (current !== 1 || document.hidden) return;
    const r = portrait.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    FX.rise(rand(r.left + r.width * .15, r.right - r.width * .15), r.top + r.height * rand(.5, .9));
  }, 420);

  $('#openHeart').addEventListener('click', (e) => transitionTo(2, ...centerOf(e.currentTarget)));
}

/* =========================================================
   PAGE 2 — Love letter carousel
   ========================================================= */
const Letters = (() => {
  const carousel = $('#carousel'), track = $('#track'), dots = $('#dots'), count = $('#count');
  const prev = $('#prevBtn'), next = $('#nextBtn'), surprise = $('#surprise');
  const tilts = [-2.5, 2, -1.5, 2.5, -2, 1.5];
  const heartSvg = '<svg viewBox="0 0 100 90" aria-hidden="true"><path d="M50 88C20 66 0 48 0 26 0 11 12 0 27 0c10 0 18 5 23 13C55 5 63 0 73 0c15 0 27 11 27 26 0 22-20 40-50 62Z"/></svg>';
  let idx = 0, sw = 420, gap = 28, readTimer = null, revealed = false, built = false;

  function build() {
    track.innerHTML = LETTERS.map((l, i) => `
      <div class="slide" data-i="${i}" style="--tilt:${tilts[i % tilts.length]}deg" role="group" aria-label="Letter ${i + 1} of ${LETTERS.length}">
        <div class="letter-wrap">
          <span class="tape" aria-hidden="true"></span>
          <article class="letter">
            <span class="l-stamp" aria-hidden="true">${l.stamp}</span>
            <p class="l-no">letter ${i + 1} of ${LETTERS.length}</p>
            <h3 class="l-title">${l.title}</h3>
            <p class="l-text">${l.text}</p>
            <p class="l-sign">— forever yours ♡</p>
            <span class="l-doodle" aria-hidden="true">${l.doodle}</span>
          </article>
          <div class="env" aria-hidden="true">
            <div class="env-back"></div>
            <div class="env-pocket"><span>for U ♡</span></div>
            <div class="env-flap"></div>
            <span class="env-seal">♥</span>
          </div>
        </div>
      </div>`).join('');
    dots.innerHTML = LETTERS.map((_, i) => `<button class="dot" type="button" data-i="${i}" aria-label="Go to letter ${i + 1}">${heartSvg}</button>`).join('');
    built = true;
  }

  function layout() {
    const vw = carousel.clientWidth;
    sw = Math.min(vw * .84, 440);
    gap = vw < 600 ? 14 : 30;
    track.style.setProperty('--sw', sw + 'px');
    track.style.gap = gap + 'px';
    setX(0);
  }
  const baseX = () => carousel.clientWidth / 2 - (idx * (sw + gap) + sw / 2);
  const setX = (dx) => { track.style.transform = `translate3d(${baseX() + dx}px,0,0)`; };

  function go(i) {
    idx = Math.max(0, Math.min(LETTERS.length - 1, i));
    $$('.slide', track).forEach((s, k) => s.classList.toggle('active', k === idx));
    $$('.dot', dots).forEach((d, k) => {
      d.classList.toggle('active', k === idx);
      if (k < idx) d.classList.add('read');
    });
    count.textContent = `Letter ${idx + 1}/${LETTERS.length}`;
    prev.disabled = idx === 0;
    next.disabled = idx === LETTERS.length - 1;
    setX(0);

    const slide = $$('.slide', track)[idx];
    setTimeout(() => slide.classList.add('opened'), 380);

    // Hidden surprise: only after 5s on the last letter
    clearTimeout(readTimer);
    if (idx === LETTERS.length - 1 && !revealed) readTimer = setTimeout(revealSurprise, 5000);
  }

  function revealSurprise() {
    if (revealed || current !== 2) return;
    revealed = true;
    surprise.hidden = false;
    void surprise.offsetWidth;
    surprise.classList.add('show');
    requestAnimationFrame(() => {
      const [x, y] = centerOf($('#surpriseBtn'));
      FX.burst(x, y, 60, { power: 10 });
      setTimeout(() => FX.burst(x, y, 30, { power: 6 }), 250);
      const top = surprise.getBoundingClientRect().top + scrollY - innerHeight * .45;
      if (surprise.getBoundingClientRect().bottom > innerHeight) window.scrollTo({ top, behavior: 'smooth' });
    });
  }

  // Swipe / drag
  let startX = 0, dx = 0, dragging = false, moved = false, startT = 0;
  carousel.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; moved = false; startX = e.clientX; dx = 0; startT = performance.now();
    carousel.classList.add('dragging');
    carousel.setPointerCapture(e.pointerId);
  });
  carousel.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    dx = e.clientX - startX;
    if (Math.abs(dx) > 6) moved = true;
    const edge = (idx === 0 && dx > 0) || (idx === LETTERS.length - 1 && dx < 0);
    setX(edge ? dx * .35 : dx);
  });
  const end = () => {
    if (!dragging) return;
    dragging = false;
    carousel.classList.remove('dragging');
    const v = dx / Math.max(1, performance.now() - startT);
    if (dx < -70 || v < -.5) go(idx + 1);        // swipe left → next
    else if (dx > 70 || v > .5) go(idx - 1);     // swipe right → previous
    else setX(0);
  };
  carousel.addEventListener('pointerup', end);
  carousel.addEventListener('pointercancel', end);
  track.addEventListener('click', (e) => {
    if (moved) return;
    const s = e.target.closest('.slide');
    if (s && +s.dataset.i !== idx) go(+s.dataset.i);
  });

  prev.addEventListener('click', () => go(idx - 1));
  next.addEventListener('click', () => go(idx + 1));
  dots.addEventListener('click', (e) => { const d = e.target.closest('.dot'); if (d) go(+d.dataset.i); });
  addEventListener('keydown', (e) => {
    if (current !== 2) return;
    if (e.key === 'ArrowRight') go(idx + 1);
    if (e.key === 'ArrowLeft') go(idx - 1);
  });
  addEventListener('resize', () => current === 2 && layout());

  $('#surpriseBtn').addEventListener('click', (e) => {
    startSong();   // starts inside the tap so browsers allow it
    transitionTo(3, ...centerOf(e.currentTarget));
  });

  return {
    enter() {
      if (!built) build();
      requestAnimationFrame(() => { layout(); go(idx); });
    },
    leave() { clearTimeout(readTimer); },
  };
})();

/* =========================================================
   PAGE 3 — Music player
   ========================================================= */
// Song starts when she lands on the last page, fading in gently
function startSong() {
  const audio = $('#song');
  const target = +$('#vol').value;
  audio.volume = 0;
  audio.play().then(() => {
    let v = 0;
    const fade = setInterval(() => {
      v = Math.min(target, v + target / 40);
      audio.volume = v;
      if (v >= target) clearInterval(fade);
    }, 100);
  }).catch(() => { audio.volume = target; });
}

function initPlayer() {
  const audio = $('#song'), player = $('#player'), playBtn = $('#playBtn');
  const seek = $('#seek'), vol = $('#vol'), cur = $('#cur'), dur = $('#dur');
  const status = $('#pStatus'), notes = $('#notes');
  let noteTimer = null, seeking = false;

  const fmt = (t) => (isFinite(t) ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}` : '0:00');
  const paint = (input) => input.style.setProperty('--p', ((input.value - input.min) / (input.max - input.min)) * 100 + '%');

  audio.volume = +vol.value; paint(vol);

  function spawnNote() {
    const n = document.createElement('span');
    n.className = 'note';
    n.textContent = pick(['♪', '♫', '♬', '♩', '♡']);
    n.style.left = rand(15, 75) + '%';
    n.style.setProperty('--dx', rand(-70, 70) + 'px');
    notes.append(n);
    setTimeout(() => n.remove(), 3000);
  }

  function setPlaying(on) {
    player.classList.toggle('playing', on);
    playBtn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    clearInterval(noteTimer);
    if (on && !reduceMotion) noteTimer = setInterval(spawnNote, 550);
  }

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => { status.textContent = ''; }).catch(() => {
        status.textContent = 'add your song at assets/music/our-song.mp3 ♡';
      });
    } else audio.pause();
  });
  audio.addEventListener('play', () => setPlaying(true));
  audio.addEventListener('pause', () => setPlaying(false));
  audio.addEventListener('ended', () => { setPlaying(false); audio.currentTime = 0; });
  audio.addEventListener('loadedmetadata', () => { dur.textContent = fmt(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    if (seeking || !audio.duration) return;
    seek.value = (audio.currentTime / audio.duration) * 100; paint(seek);
    cur.textContent = fmt(audio.currentTime);
  });
  audio.addEventListener('error', () => { status.textContent = 'add your song at assets/music/our-song.mp3 ♡'; });

  seek.addEventListener('input', () => {
    seeking = true; paint(seek);
    if (audio.duration) cur.textContent = fmt((seek.value / 100) * audio.duration);
  });
  seek.addEventListener('change', () => {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    seeking = false;
  });
  vol.addEventListener('input', () => { audio.volume = +vol.value; paint(vol); });

  // Floating hearts around the player (more while the song plays)
  setInterval(() => {
    if (current !== 3 || document.hidden) return;
    const r = player.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const n = audio.paused ? (Math.random() < .35 ? 1 : 0) : 2;
    for (let i = 0; i < n; i++) {
      const side = Math.random() < .5;
      FX.rise(side ? rand(r.left - 30, r.left + 40) : rand(r.right - 40, r.right + 30), rand(r.top + r.height * .3, r.bottom));
    }
  }, 380);
}

/* =========================================================
   PAGE 3 — Gallery + lightbox
   ========================================================= */
function initGallery() {
  const g = $('#gallery');
  const tilts = [-4, 3, -2, 5, -3.5, 2.5, -5, 3.5, -1.5, 4];
  const deco = ['🌸', '', '💗', '', '🧸', '⭐', '', '🎀', '', '✨'];
  g.innerHTML = PHOTOS.map((p, i) => `
    <div class="p-wrap reveal" style="--d:${(6 + (i % 4)).toFixed(1)}s;--dl:${(-i * .7).toFixed(1)}s;--i:${i % 4}">
      <button class="polaroid" type="button" data-i="${i}" style="--r:${tilts[i % tilts.length]}deg" aria-label="Open photo: ${p.cap}">
        <span class="tape" aria-hidden="true"></span>
        <div class="ph photo" data-label="photo ${i + 1}"><img src="${p.src}" alt="${p.cap}" loading="lazy" /></div>
        <p class="cap">${p.cap}</p>
        ${deco[i] ? `<span class="p-sticker" aria-hidden="true">${deco[i]}</span>` : ''}
      </button>
    </div>`).join('');
  $$('img', g).forEach((img) => watchImage(img, markMissing));
  $$('.reveal', g).forEach((el) => revealObserver.observe(el));

  const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCap'), lbPhoto = $('#lbPhoto');
  let at = 0;
  const show = (i) => {
    at = (i + PHOTOS.length) % PHOTOS.length;
    lbPhoto.classList.remove('missing');
    lbPhoto.dataset.label = `photo ${at + 1}`;
    lbImg.onerror = () => lbPhoto.classList.add('missing');
    lbImg.src = PHOTOS[at].src;
    lbImg.alt = PHOTOS[at].cap;
    lbCap.textContent = PHOTOS[at].cap + ' ♡';
  };
  const open = (i) => { show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('#lbClose').focus(); };
  const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };

  g.addEventListener('click', (e) => { const b = e.target.closest('.polaroid'); if (b) open(+b.dataset.i); });
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(at - 1));
  $('#lbNext').addEventListener('click', () => show(at + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
  });
  let sx = 0;
  lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', (e) => {
    const d = e.changedTouches[0].clientX - sx;
    if (d < -50) show(at + 1); else if (d > 50) show(at - 1);
  });
}

/* =========================================================
   PAGE 3 — Final letter + grand finale
   ========================================================= */
function initFinale() {
  const lineObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); lineObs.unobserve(e.target); } });
  }, { threshold: .6, rootMargin: '0px 0px -12% 0px' });
  $$('#finalLetter .line').forEach((l) => lineObs.observe(l));

  const finale = $('#finale'), flyers = $('#flyers');
  let shown = false;
  new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (current !== 3) return;
      if (e.isIntersecting) {
        FX.setMode('finale');
        if (!shown) {
          shown = true;
          finale.classList.add('show');
          const glyphs = ['🧸', '🌸', '💗', '⭐', '☁️', '🎀', '💫', '🌷', '💌', '✨'];
          flyers.innerHTML = Array.from({ length: reduceMotion ? 4 : 12 }, (_, i) =>
            `<span class="flyer" style="--y:${rand(8, 85).toFixed(0)}%;--s:${rand(22, 40).toFixed(0)}px;--d:${rand(14, 24).toFixed(1)}s;--dl:${(-rand(0, 20)).toFixed(1)}s">${glyphs[i % glyphs.length]}</span>`).join('');
          const [x, y] = centerOf($('.tbc'));
          setTimeout(() => FX.burst(x, y, 50, { power: 9, colors: ['#ff9fbe', '#ffd1e0', '#d9c6ff', '#ffe2b8', '#fff'] }), 600);
        }
      } else {
        FX.setMode('night');
      }
    });
  }, { threshold: .35 }).observe(finale);

  $('#replay').addEventListener('click', (e) => {
    $('#song').pause();
    transitionTo(1, ...centerOf(e.currentTarget));
  });
}

/* =========================================================
   Boot
   ========================================================= */
onEnter[2] = () => Letters.enter();
onEnter[1] = () => Letters.leave();
onEnter[3] = () => Letters.leave();

scatterStickers();
splitWords($('#memTitle'));
$$('.sticker-img').forEach((img) => watchImage(img, (i) => i.remove()));
$$('.portrait-frame img').forEach((img) => watchImage(img, markMissing));
$$('.reveal').forEach((el) => revealObserver.observe(el));
initLanding();
initPlayer();
initGallery();
initFinale();
