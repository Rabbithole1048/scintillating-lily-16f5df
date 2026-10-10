(() => {
  const room = document.getElementById('room');
  const addBtn = document.getElementById('add');
  const hint = document.getElementById('hint');
  const countEl = document.getElementById('count');

  const MIN_SCALE = 0.35;
  const MAX_SCALE = 3.2;
  const MAX_OBJECTS = 36;
  const LONG_PRESS_MS = 380;
  const TAP_MS = 280;
  const DOUBLE_TAP_MS = 340;
  const MOVE_SLOP = 10;
  const SHAPES = ['orb', 'ring', 'capsule', 'squircle', 'blob', 'drop', 'pearl'];

  const objects = [];
  const pointerOwner = new Map(); // pointerId -> object
  let W = innerWidth;
  let H = innerHeight;
  let zTop = 1;
  let lastHeld = null;
  let hintTimer = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
  const radius = (o) => ((o.w + o.h) / 4) * o.scale;

  function create(x, y, vx, vy, shape) {
    shape = shape || SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const base = rand(80, 140) * (Math.min(W, H) < 600 ? 0.78 : 1);
    const w = base;
    const h = shape === 'capsule' ? base * 0.5 : base;

    const el = document.createElement('div');
    el.className = 'obj';
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.setProperty('--h', Math.floor(rand(0, 360)));
    el.style.zIndex = zTop++;
    el.innerHTML = `<div class="wob"><div class="glass ${shape}">${shape === 'pearl' ? '<i class="core"></i>' : ''}</div></div>`;
    room.appendChild(el);

    const o = {
      el, wob: el.firstChild, w, h, x, y, vx, vy,
      rot: rand(-30, 30), vr: rand(-25, 25), spin: rand(-25, 25),
      scale: 0.05, target: rand(0.85, 1.15),
      pointers: new Map(), held: false, growing: false, grew: false,
      pinched: false, moved: false, timer: 0, lastTap: 0, downT: 0,
      prevV: { x: 0, y: 0 }, off: { x: 0, y: 0 }, samples: [], pinch: null,
      seed: Math.random() * 1000, lastBoop: 0,
    };

    el.addEventListener('pointerdown', (e) => onDown(o, e));
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      o.target = clamp(o.target * (e.deltaY < 0 ? 1.08 : 0.93), MIN_SCALE, MAX_SCALE);
    }, { passive: false });

    objects.push(o);
    if (objects.length > MAX_OBJECTS) {
      const oldest = objects.find((x) => !x.held && x !== o);
      if (oldest) remove(oldest);
    }
    updateCount();
    return o;
  }

  function remove(o) {
    const i = objects.indexOf(o);
    if (i === -1) return;
    objects.splice(i, 1);
    o.el.classList.add('bye');
    o.el.style.pointerEvents = 'none';
    setTimeout(() => o.el.remove(), 450);
    updateCount();
  }

  function updateCount() {
    countEl.textContent = objects.length;
  }

  function pulse(o, cls) {
    o.wob.classList.remove('tap', 'shrink', 'boop');
    void o.wob.offsetWidth;
    o.wob.classList.add(cls);
  }

  function ripple(x, y, size) {
    const r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    r.style.setProperty('--s', size + 'px');
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 700);
  }

  function dismissHint() {
    if (hintTimer) return;
    hintTimer = setTimeout(() => hint.classList.add('hide'), 2500);
  }

  // ---------- gestures ----------
  function beginDrag(o, p) {
    o.held = true;
    o.off = { x: o.x - p.x, y: o.y - p.y };
    o.samples = [{ x: p.x, y: p.y, t: performance.now() }];
  }

  function beginPinch(o) {
    const [a, b] = [...o.pointers.values()];
    o.pinch = { d: dist(a, b), s: o.target, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, ox: o.x, oy: o.y };
    o.pinched = true;
    stopGrow(o);
  }

  function stopGrow(o) {
    clearTimeout(o.timer);
    o.growing = false;
    o.el.classList.remove('growing');
  }

  function addPointer(o, e) {
    const p = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY };
    o.pointers.set(e.pointerId, p);
    pointerOwner.set(e.pointerId, o);
    return p;
  }

  function onDown(o, e) {
    e.preventDefault();
    e.stopPropagation();
    dismissHint();
    if (o.pointers.size >= 2) return;
    const p = addPointer(o, e);
    o.el.style.zIndex = zTop++;
    lastHeld = o;

    if (o.pointers.size === 1) {
      o.prevV = { x: o.vx, y: o.vy };
      o.pinched = o.grew = o.moved = false;
      o.downT = performance.now();
      beginDrag(o, p);
      clearTimeout(o.timer);
      o.timer = setTimeout(() => {
        if (o.pointers.size === 1 && !o.moved) {
          o.growing = o.grew = true;
          o.el.classList.add('growing');
          navigator.vibrate?.(8);
        }
      }, LONG_PRESS_MS);
    } else {
      beginPinch(o);
    }
  }

  // A second finger on empty space still pinches the object you are holding.
  room.addEventListener('pointerdown', (e) => {
    if (e.target !== room) return;
    dismissHint();
    if (lastHeld && lastHeld.pointers.size === 1 && objects.includes(lastHeld)) {
      addPointer(lastHeld, e);
      beginPinch(lastHeld);
    }
  });

  addEventListener('pointermove', (e) => {
    const o = pointerOwner.get(e.pointerId);
    if (!o) return;
    const p = o.pointers.get(e.pointerId);
    p.x = e.clientX;
    p.y = e.clientY;
    if (Math.hypot(p.x - p.sx, p.y - p.sy) > MOVE_SLOP) {
      o.moved = true;
      if (!o.growing) clearTimeout(o.timer);
    }

    if (o.pointers.size >= 2) {
      const [a, b] = [...o.pointers.values()];
      o.target = clamp(o.pinch.s * (dist(a, b) / o.pinch.d), MIN_SCALE, MAX_SCALE);
      o.scale = o.target;
      o.x = o.pinch.ox + ((a.x + b.x) / 2 - o.pinch.mx);
      o.y = o.pinch.oy + ((a.y + b.y) / 2 - o.pinch.my);
      o.vx = o.vy = 0;
    } else {
      const now = performance.now();
      o.x = p.x + o.off.x;
      o.y = p.y + o.off.y;
      o.samples.push({ x: p.x, y: p.y, t: now });
      while (o.samples.length > 2 && now - o.samples[0].t > 100) o.samples.shift();
      const s0 = o.samples[0];
      const dt = (now - s0.t) / 1000;
      if (dt > 0.008) {
        o.vx = (p.x - s0.x) / dt;
        o.vy = (p.y - s0.y) / dt;
      }
    }
  });

  function onUp(e) {
    const o = pointerOwner.get(e.pointerId);
    if (!o) return;
    pointerOwner.delete(e.pointerId);
    o.pointers.delete(e.pointerId);

    if (o.pointers.size === 1) {
      beginDrag(o, [...o.pointers.values()][0]);
      return;
    }
    if (o.pointers.size > 0) return;

    o.held = false;
    const wasGrowing = o.grew;
    stopGrow(o);
    const now = performance.now();
    const isTap = !o.moved && !o.pinched && !wasGrowing && now - o.downT < TAP_MS;

    if (isTap) {
      o.vx = o.prevV.x * 0.5;
      o.vy = o.prevV.y * 0.5;
      if (now - o.lastTap < DOUBLE_TAP_MS) {
        o.target = Math.max(MIN_SCALE, o.target * 0.62);
        o.lastTap = 0;
        pulse(o, 'shrink');
        ripple(o.x, o.y, radius(o) * 2.4);
        navigator.vibrate?.([6, 40, 6]);
      } else {
        o.lastTap = now;
        pulse(o, 'tap');
      }
      return;
    }

    o.lastTap = 0;
    const last = o.samples[o.samples.length - 1];
    if (!last || now - last.t > 90) {
      o.vx = o.vy = 0;
    } else {
      o.vx = clamp(o.vx, -2200, 2200);
      o.vy = clamp(o.vy, -2200, 2200);
      o.vr = clamp(o.vx * 0.12, -360, 360);
    }
    if (wasGrowing) ripple(o.x, o.y, radius(o) * 2.2);
  }
  addEventListener('pointerup', onUp);
  addEventListener('pointercancel', onUp);

  addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('dblclick', (e) => e.preventDefault());

  addBtn.addEventListener('click', () => {
    const b = addBtn.getBoundingClientRect();
    const o = create(b.left + b.width / 2, b.top - 10, rand(-320, 320), rand(-900, -600));
    o.target = rand(0.9, 1.2);
    ripple(b.left + b.width / 2, b.top + b.height / 2, 110);
    dismissHint();
  });

  addEventListener('resize', () => {
    W = innerWidth;
    H = innerHeight;
  });

  // ---------- simulation ----------
  let lastT = performance.now();

  function frame(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000);
    lastT = t;

    for (const o of objects) {
      if (o.growing) o.target = Math.min(MAX_SCALE, o.target * (1 + 1.15 * dt));
      if (o.pointers.size < 2) o.scale += (o.target - o.scale) * Math.min(1, dt * 10);

      if (o.held) continue;

      // gentle wandering current
      const n = t * 0.0004 + o.seed;
      o.vx += Math.sin(n) * 34 * dt;
      o.vy += Math.cos(n * 1.7) * 34 * dt;

      // flings decay to a calm cruising speed; still objects drift off again
      const cruise = 75 / Math.sqrt(o.scale);
      const sp = Math.hypot(o.vx, o.vy);
      if (sp > cruise) {
        const k = Math.exp(-1.1 * dt);
        o.vx *= k;
        o.vy *= k;
      } else if (sp < cruise * 0.6) {
        if (sp < 1) {
          const a = Math.random() * Math.PI * 2;
          o.vx = Math.cos(a) * 5;
          o.vy = Math.sin(a) * 5;
        } else {
          o.vx *= 1 + 1.2 * dt;
          o.vy *= 1 + 1.2 * dt;
        }
      }

      o.x += o.vx * dt;
      o.y += o.vy * dt;

      const rx = Math.min(radius(o), W / 2);
      const ry = Math.min(radius(o), H / 2);
      if (o.x < rx) { o.x = rx; o.vx = Math.abs(o.vx) * 0.85; o.vr += o.vy * 0.05; }
      if (o.x > W - rx) { o.x = W - rx; o.vx = -Math.abs(o.vx) * 0.85; o.vr -= o.vy * 0.05; }
      if (o.y < ry) { o.y = ry; o.vy = Math.abs(o.vy) * 0.85; o.vr -= o.vx * 0.05; }
      if (o.y > H - ry) { o.y = H - ry; o.vy = -Math.abs(o.vy) * 0.85; o.vr += o.vx * 0.05; }

      o.vr += (o.spin - o.vr) * Math.min(1, dt * 0.8);
      o.rot += o.vr * dt;
    }

    collide(t);

    for (const o of objects) {
      o.el.style.transform =
        `translate3d(${o.x - o.w / 2}px, ${o.y - o.h / 2}px, 0) rotate(${o.rot}deg) scale(${o.scale})`;
    }
    requestAnimationFrame(frame);
  }

  function collide(t) {
    for (let i = 0; i < objects.length; i++) {
      const a = objects[i];
      const ra = radius(a) * 0.92;
      const ia = a.held ? 0 : 1 / (ra * ra);
      for (let j = i + 1; j < objects.length; j++) {
        const b = objects[j];
        const rb = radius(b) * 0.92;
        const ib = b.held ? 0 : 1 / (rb * rb);
        if (ia + ib === 0) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        const min = ra + rb;
        if (d >= min || d < 0.001) continue;

        const nx = dx / d;
        const ny = dy / d;
        const overlap = min - d;
        const share = 1 / (ia + ib);
        a.x -= nx * overlap * ia * share;
        a.y -= ny * overlap * ia * share;
        b.x += nx * overlap * ib * share;
        b.y += ny * overlap * ib * share;

        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (rv >= 0) continue;
        const jImp = (-(1 + 0.9) * rv) * share;
        a.vx -= jImp * ia * nx;
        a.vy -= jImp * ia * ny;
        b.vx += jImp * ib * nx;
        b.vy += jImp * ib * ny;

        if (-rv > 220) {
          for (const o of [a, b]) {
            if (!o.held && t - o.lastBoop > 250) {
              o.lastBoop = t;
              pulse(o, 'boop');
            }
          }
        }
      }
    }
  }

  // ---------- first fill of the room ----------
  const startCount = W < 600 ? 7 : 11;
  SHAPES.concat(SHAPES).slice(0, startCount).forEach((shape) => {
    const a = Math.random() * Math.PI * 2;
    const s = rand(50, 110);
    create(rand(90, W - 90), rand(110, H - 200), Math.cos(a) * s, Math.sin(a) * s, shape);
  });

  requestAnimationFrame(frame);
})();
