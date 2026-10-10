(() => {
  const room = document.getElementById('room');
  const backdropWorld = document.querySelector('.backdrop-world');
  const formBtn = document.getElementById('add');
  const elementBtn = document.getElementById('elements');
  const lightBtn = document.getElementById('light-effects');
  const frameBtn = document.getElementById('draw-frame');
  const clearObjectsBtn = document.getElementById('clear-forms');
  const clearForcesBtn = document.getElementById('clear-forces');
  const clearFramesBtn = document.getElementById('clear-frames');
  const advancedBtn = document.getElementById('advanced');
  const speedBtn = document.getElementById('speed');
  const speedLabel = document.getElementById('speed-label');
  const hint = document.getElementById('hint');
  const countEl = document.getElementById('count');
  const splitsEl = document.getElementById('splits');
  const picker = document.getElementById('picker');
  const pickerTitle = document.getElementById('picker-title');
  const pickerOptions = document.getElementById('picker-options');
  const pickerHint = document.getElementById('picker-hint');
  const pickerClose = document.getElementById('picker-close');
  const formClickSuppression = new WeakMap();

  const MIN_SCALE = 0.35;
  const MAX_SCALE = 3.2;
  const MAX_OBJECTS = 1000;
  const MAX_SPLIT_CHILDREN = 4;
  const SPLIT_OBJECT_DELTA = MAX_SPLIT_CHILDREN - 2;
  const MAX_FIELDS = 14;
  const MIN_FIELD_RADIUS = 70;
  const MAX_FIELD_RADIUS = 760;
  const LONG_PRESS_MS = 380;
  const TAP_MS = 280;
  const DOUBLE_TAP_MS = 340;
  const MOVE_SLOP = 10;
  const TAU = Math.PI * 2;
  const SHAPES = [
    'orb', 'ring', 'capsule', 'squircle', 'blob', 'drop', 'pearl', 'diamond',
    'triangle', 'hexagon', 'star', 'moon', 'flower', 'shield', 'cone', 'cross',
  ];
  const FORM_NAMES = [
    'Orb', 'Ring', 'Capsule', 'Squircle', 'Blob', 'Drop', 'Pearl', 'Diamond',
    'Triangle', 'Hexagon', 'Star', 'Moon', 'Flower', 'Shield', 'Cone', 'Cross',
  ];
  const EFFECTS = {
    elements: [
      { id: 'sand', name: 'Sand', icon: '⠿', color: '#e5b36e' },
      { id: 'water', name: 'Water', icon: '◉', color: '#55c9f4' },
      { id: 'air', name: 'Air', icon: '≋', color: '#d8e7ff' },
      { id: 'fire', name: 'Fire', icon: '♨', color: '#ff704e' },
    ],
    light: [
      { id: 'laser', name: 'Laser', icon: '⌁', color: '#ff405f' },
      { id: 'sunlight', name: 'Sunlight', icon: '☼', color: '#ffd36a' },
      { id: 'magnetlight', name: 'Magnetlight', icon: '✳', color: '#ca78ff' },
    ],
  };

  const objects = [];
  const fields = [];
  const frames = [];
  const pointerOwner = new Map(); // pointerId -> object
  const fieldPointerOwner = new Map();
  let W = innerWidth;
  let H = innerHeight;
  let zTop = 1;
  let lastHeld = null;
  let hintTimer = 0;
  let splits = 0;
  let placementType = null;
  let pickerMode = null;
  let formDrag = null;
  let frameDrawing = false;
  let frameDraw = null;
  let choosingSpawnPoint = false;
  let spawnPoint = { x: innerWidth / 2, y: innerHeight / 2 };
  let spawnMarker = null;
  let sizeMode = 'random';
  let colorMode = 'random';
  let simulationSpeed = 1;
  let lastObjectNotice = false;
  let parallaxX = 0;
  let parallaxY = 0;
  let parallaxTargetX = 0;
  let parallaxTargetY = 0;
  let parallaxDepth = 0;
  let parallaxTargetDepth = 0;

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
  const radius = (o) => ((o.w + o.h) / 4) * o.scale;
  const shapeAt = (tier) => SHAPES[tier % SHAPES.length];

  function seedDistantLights() {
    const layer = document.querySelector('.distant-lights');
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 52; i++) {
      const light = document.createElement('i');
      light.className = 'distant-light';
      light.style.left = `${rand(2, 98)}%`;
      light.style.top = `${rand(2, 98)}%`;
      light.style.setProperty('--light-size', `${rand(1, 2.5)}px`);
      light.style.setProperty('--light-alpha', rand(0.22, 0.8).toFixed(2));
      light.style.setProperty('--twinkle-time', `${rand(3, 9).toFixed(1)}s`);
      light.style.setProperty('--twinkle-delay', `${rand(-9, 0).toFixed(1)}s`);
      fragment.appendChild(light);
    }
    layer.appendChild(fragment);
  }

  function create(x, y, vx, vy, tier = 0, hue = Math.floor(rand(0, 360)), initialScale = 0.05, baseSize = null) {
    if (objects.length >= MAX_OBJECTS) return null;
    const formIndex = ((tier % SHAPES.length) + SHAPES.length) % SHAPES.length;
    const shape = shapeAt(formIndex);
    const base = baseSize ?? rand(80, 140) * (Math.min(W, H) < 600 ? 0.78 : 1);
    const w = base;
    const h = shape === 'capsule' ? base * 0.5 : base;

    const el = document.createElement('div');
    el.className = 'obj';
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.setProperty('--h', hue);
    el.style.zIndex = zTop++;
    el.innerHTML = `<div class="wob"><div class="glass ${shape}">${shape === 'pearl' ? '<i class="core"></i>' : ''}</div></div>`;
    room.appendChild(el);

    const o = {
      el, wob: el.firstChild, w, h, x, y, vx, vy, tier: formIndex, hue,
      rot: rand(-30, 30), vr: rand(-25, 25), spin: rand(-25, 25),
      scale: initialScale, target: initialScale === 0.05 ? getConfiguredScale() : rand(0.85, 1.15),
      pointers: new Map(), held: false, growing: false, grew: false,
      pinched: false, moved: false, timer: 0, lastTap: 0, downT: 0,
      prevV: { x: 0, y: 0 }, off: { x: 0, y: 0 }, samples: [], pinch: null,
      seed: Math.random() * 1000, lastBoop: 0,
      splitAfter: performance.now() + 850,
      density: 0.75 + (formIndex % 5) * 0.13,
      frame: null,
    };

    el.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) rotate(${o.rot}deg) scale(${o.scale})`;
    el.addEventListener('pointerdown', (e) => onDown(o, e));
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      o.target = clamp(o.target * (e.deltaY < 0 ? 1.08 : 0.93), MIN_SCALE, MAX_SCALE);
    }, { passive: false });

    objects.push(o);
    updateCount();
    return o;
  }

  function getConfiguredScale() {
    if (sizeMode === 'random') return [0.75, 1.15, 1.65][Math.floor(rand(0, 3))];
    return [0.75, 1.15, 1.65][sizeMode - 1];
  }

  function setObjectColor(object, hue) {
    object.hue = hue;
    object.el.style.setProperty('--h', hue);
  }

  function remove(o, allowEmpty = false, immediate = false) {
    const i = objects.indexOf(o);
    if (i === -1 || (!allowEmpty && objects.length <= 1)) return false;
    objects.splice(i, 1);
    if (immediate) {
      o.el.remove();
    } else {
      o.el.classList.add('bye');
      o.el.style.pointerEvents = 'none';
      setTimeout(() => o.el.remove(), 450);
    }
    updateCount();
    return true;
  }

  function updateCount() {
    countEl.textContent = objects.length;
    room.classList.toggle('dense', objects.length > 120);
    if (objects.length > 1) lastObjectNotice = false;
  }

  function updateGameStats() {
    splitsEl.textContent = splits;
    if (objects.length === 1 && splits > 0) {
      showLastObjectNotice();
    }
  }

  function showLastObjectNotice() {
    if (lastObjectNotice) return;
    lastObjectNotice = true;
    setHint('One form remains protected. Reaching zero is the hidden challenge.');
  }

  function setHint(message) {
    hint.classList.remove('hide');
    hint.firstElementChild.textContent = message;
  }

  function openPicker(mode) {
    setFrameDrawing(false);
    choosingSpawnPoint = false;
    room.classList.remove('choosing-spawn');
    placementType = null;
    pickerOptions.replaceChildren();
    pickerMode = mode;
    pickerTitle.textContent = mode === 'forms' ? 'Choose a form'
      : mode === 'advanced' ? 'Advanced controls' : 'Choose a force';
    pickerHint.textContent = mode === 'forms'
      ? 'Drag a form into the room, or tap to add it.'
      : mode === 'advanced' ? 'Choose a size, color or action.'
        : 'Choose a force, then place it anywhere in the room.';
    formBtn.setAttribute('aria-expanded', String(mode === 'forms'));

    const choices = mode === 'forms'
      ? FORM_NAMES.map((name, index) => ({ id: String(index), name, icon: '', color: `hsl(${index * 22} 90% 70%)` }))
      : mode === 'advanced'
        ? [
          { id: 'size-1', name: 'Size 1', icon: '1', color: '#89d8ff' },
          { id: 'size-2', name: 'Size 2', icon: '2', color: '#a9a2ff' },
          { id: 'size-3', name: 'Size 3', icon: '3', color: '#eea8ff' },
          { id: 'size-random', name: 'Random sizes', icon: '↗', color: '#9fffd9' },
          { id: 'explode', name: 'Explode random object', icon: '✹', color: '#ff9c72' },
          { id: 'recolor', name: 'Change colors', icon: '◉', color: '#ffd66e' },
        ]
        : EFFECTS[mode];

    for (const choice of choices) {
      const option = document.createElement('button');
      option.className = `picker-option${mode === 'forms' ? ' form-option' : ''}${mode === 'advanced' ? ' advanced-option' : ''}`;
      option.type = 'button';
      option.style.setProperty('--option-color', choice.color);
      option.setAttribute('aria-label', choice.name);
      if (mode === 'forms') {
        const sample = document.createElement('span');
        sample.className = `form-sample glass ${SHAPES[Number(choice.id)]}`;
        option.appendChild(sample);
      } else {
        const icon = document.createElement('span');
        icon.className = 'effect-icon';
        icon.textContent = choice.icon;
        option.appendChild(icon);
      }
      const label = document.createElement('span');
      label.textContent = choice.name;
      option.appendChild(label);
      if (mode === 'forms') {
        option.addEventListener('pointerdown', (e) => beginFormDrag(option, Number(choice.id), e));
      }
      option.addEventListener('click', () => {
        if (mode === 'advanced') {
          applyAdvancedAction(choice.id);
          return;
        }
        if (mode === 'forms') {
          if (formClickSuppression.has(option)) {
            clearTimeout(formClickSuppression.get(option));
            formClickSuppression.delete(option);
            return;
          }
          if (objects.length >= MAX_OBJECTS) {
            setHint(`Room is full — split matching forms before adding more (max ${MAX_OBJECTS}).`);
            return;
          }
          const index = Number(choice.id);
          spawnForm(index, spawnPoint.x, spawnPoint.y);
          return;
        }

        placementType = choice.id;
        closePicker();
        room.classList.add('placing');
        setHint(`Tap an open spot to place ${choice.name}.`);
      });
      pickerOptions.appendChild(option);
    }
    if (mode === 'forms') {
      const spawnAction = document.createElement('button');
      spawnAction.className = 'picker-action';
      spawnAction.type = 'button';
      spawnAction.textContent = '⌖  Set spawn point';
      spawnAction.addEventListener('click', () => {
        choosingSpawnPoint = true;
        room.classList.add('choosing-spawn');
        setHint('Click or tap anywhere in the room to set the spawn point.');
      });
      pickerOptions.appendChild(spawnAction);
    }
    picker.hidden = false;
  }

  function closePicker() {
    picker.hidden = true;
    pickerMode = null;
    formBtn.setAttribute('aria-expanded', 'false');
    cancelFormDrag();
  }

  function beginFormDrag(option, index, e) {
    if (e.button !== 0 || objects.length >= MAX_OBJECTS) return;
    clearTimeout(formClickSuppression.get(option));
    formClickSuppression.delete(option);
    formDrag = {
      pointerId: e.pointerId,
      index,
      option,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      preview: null,
    };
    option.setPointerCapture(e.pointerId);
  }

  function moveFormDrag(e) {
    if (!formDrag || formDrag.pointerId !== e.pointerId) return;
    if (!formDrag.moved && Math.hypot(e.clientX - formDrag.startX, e.clientY - formDrag.startY) > MOVE_SLOP) {
      formDrag.moved = true;
      formDrag.preview = document.createElement('div');
      formDrag.preview.className = `form-drag-preview glass ${SHAPES[formDrag.index]}`;
      formDrag.preview.style.setProperty('--h', formDrag.index * 22);
      document.body.appendChild(formDrag.preview);
      formDrag.option.classList.add('form-drag-source');
    }
    if (formDrag.preview) {
      formDrag.preview.style.left = `${e.clientX}px`;
      formDrag.preview.style.top = `${e.clientY}px`;
    }
    if (formDrag.moved) e.preventDefault();
  }

  function finishFormDrag(e, cancelled = false) {
    if (!formDrag || formDrag.pointerId !== e.pointerId) return false;
    const drag = formDrag;
    formDrag = null;
    drag.option.classList.remove('form-drag-source');
    drag.preview?.remove();
    if (drag.moved) {
      const timeout = setTimeout(() => formClickSuppression.delete(drag.option), 500);
      formClickSuppression.set(drag.option, timeout);
      if (!cancelled && e.clientX >= 0 && e.clientX <= W && e.clientY >= 0 && e.clientY <= H) {
        spawnForm(drag.index, e.clientX, e.clientY, true);
      }
    }
    return true;
  }

  function cancelFormDrag() {
    if (!formDrag) return;
    formDrag.option.classList.remove('form-drag-source');
    formDrag.preview?.remove();
    formDrag = null;
  }

  function spawnForm(index, x, y, dropped = false) {
    if (objects.length >= MAX_OBJECTS) {
      setHint(`Room is full — split matching forms before adding more (max ${MAX_OBJECTS}).`);
      return null;
    }
    const hue = colorMode === 'random' ? Math.floor(rand(0, 360)) : index * 22;
    const o = create(x, y, rand(-90, 90), rand(-90, 90), index, hue);
    if (!o) return null;
    o.target = getConfiguredScale();
    if (dropped) o.frame = frameAt(x, y);
    ripple(o.x, o.y, 100);
    return o;
  }

  function applyAdvancedAction(action) {
    if (action.startsWith('size-')) {
      sizeMode = action === 'size-random' ? 'random' : Number(action.slice(-1));
      for (const object of objects) {
        object.target = getConfiguredScale();
        object.scale = object.target;
      }
      setHint(`Object size set to ${action === 'size-random' ? 'random' : action.slice(-1)}.`);
      return;
    }
    if (action === 'recolor') {
      colorMode = 'random';
      for (const object of objects) setObjectColor(object, Math.floor(rand(0, 360)));
      setHint('Object colors changed.');
      return;
    }
    if (action === 'explode') explodeRandomObject();
  }

  function explodeRandomObject() {
    if (objects.length === 0) {
      setHint('Add an object before triggering an explosion.');
      return;
    }
    const object = objects[Math.floor(Math.random() * objects.length)];
    const removed = objects.length > 1;
    const blastRadius = 260;
    object.el.classList.add('obj-exploding');
    for (const other of objects) {
      if (other === object) continue;
      const dx = other.x - object.x;
      const dy = other.y - object.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance < blastRadius) {
        const force = (1 - distance / blastRadius) * 620;
        other.vx += (dx / distance) * force;
        other.vy += (dy / distance) * force;
      }
    }
    if (removed) remove(object);
    setTimeout(() => object.el.classList.remove('obj-exploding'), 500);
    ripple(object.x, object.y, blastRadius);
    setHint(removed ? 'A random object exploded and pushed nearby objects away.' : 'The last object is protected, but its blast still pushed nearby objects.');
  }

  function updateSpawnMarker() {
    if (!spawnMarker) {
      spawnMarker = document.createElement('div');
      spawnMarker.className = 'spawn-marker';
      spawnMarker.setAttribute('aria-hidden', 'true');
      room.appendChild(spawnMarker);
    }
    spawnMarker.style.left = `${spawnPoint.x}px`;
    spawnMarker.style.top = `${spawnPoint.y}px`;
  }

  function chooseSpawnPoint(e) {
    if (!choosingSpawnPoint) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    const bounds = room.getBoundingClientRect();
    spawnPoint = {
      x: clamp(e.clientX - bounds.left, 24, bounds.width - 24),
      y: clamp(e.clientY - bounds.top, 24, bounds.height - 24),
    };
    choosingSpawnPoint = false;
    room.classList.remove('choosing-spawn');
    updateSpawnMarker();
    setHint('Spawn point moved. Tap a form to spawn it there.');
    return true;
  }

  function frameAt(x, y) {
    return frames.find((frame) => (
      x >= frame.x && x <= frame.x + frame.width
      && y >= frame.y && y <= frame.y + frame.height
    )) ?? null;
  }

  function assignFrameAfterDrag(object) {
    object.frame = frameAt(object.x, object.y);
  }

  function clearForces() {
    for (const field of fields) field.el.remove();
    fields.length = 0;
    fieldPointerOwner.clear();
    setHint('All forces cleared.');
  }

  function clearFrames() {
    setFrameDrawing(false);
    for (const frame of frames) frame.el.remove();
    frames.length = 0;
    for (const object of objects) object.frame = null;
    setHint('All frames cleared.');
  }

  function removeField(field) {
    const index = fields.indexOf(field);
    if (index === -1) return;
    fields.splice(index, 1);
    field.el.remove();
    for (const [pointerId, pointer] of fieldPointerOwner) {
      if (pointer.field === field) fieldPointerOwner.delete(pointerId);
    }
    setHint(`${field.name} removed.`);
  }

  function setFrameDrawing(active) {
    frameDrawing = active;
    frameBtn.setAttribute('aria-pressed', String(active));
    room.classList.toggle('drawing-frame', active);
    if (!active && frameDraw) {
      frameDraw.preview.remove();
      frameDraw = null;
    }
  }

  function updateFramePreview(x, y) {
    if (!frameDraw) return;
    const left = Math.min(frameDraw.startX, x);
    const top = Math.min(frameDraw.startY, y);
    frameDraw.preview.style.left = `${left}px`;
    frameDraw.preview.style.top = `${top}px`;
    frameDraw.preview.style.width = `${Math.abs(x - frameDraw.startX)}px`;
    frameDraw.preview.style.height = `${Math.abs(y - frameDraw.startY)}px`;
  }

  function beginFrameDraw(e) {
    if (!frameDrawing || e.button !== 0) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    const bounds = room.getBoundingClientRect();
    const startX = clamp(e.clientX - bounds.left, 0, bounds.width);
    const startY = clamp(e.clientY - bounds.top, 0, bounds.height);
    const preview = document.createElement('div');
    preview.className = 'boundary-frame frame-preview';
    room.appendChild(preview);
    frameDraw = { pointerId: e.pointerId, startX, startY, preview };
    room.setPointerCapture(e.pointerId);
    updateFramePreview(startX, startY);
    return true;
  }

  function moveFrameDraw(e) {
    if (!frameDraw || frameDraw.pointerId !== e.pointerId) return false;
    updateFramePreview(e.clientX, e.clientY);
    return true;
  }

  function finishFrameDraw(e, cancelled = false) {
    if (!frameDraw || frameDraw.pointerId !== e.pointerId) return false;
    const bounds = room.getBoundingClientRect();
    const x = clamp(e.clientX - bounds.left, 0, bounds.width);
    const y = clamp(e.clientY - bounds.top, 0, bounds.height);
    const left = Math.min(frameDraw.startX, x);
    const top = Math.min(frameDraw.startY, y);
    const width = Math.abs(x - frameDraw.startX);
    const height = Math.abs(y - frameDraw.startY);
    frameDraw.preview.remove();
    frameDraw = null;
    if (!cancelled && width >= 60 && height >= 60) {
      const el = document.createElement('div');
      el.className = 'boundary-frame';
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      room.appendChild(el);
      const frame = { el, x: left, y: top, width, height };
      frames.push(frame);
      for (const object of objects) {
        if (frameAt(object.x, object.y) === frame) object.frame = frame;
      }
      setHint('Frame drawn. Forms that enter it stay inside.');
    }
    setFrameDrawing(false);
    return true;
  }

  function clearForms() {
    for (const object of objects) {
      clearTimeout(object.timer);
      object.el.remove();
    }
    objects.length = 0;
    pointerOwner.clear();
    lastHeld = null;
    lastObjectNotice = false;
    updateCount();
    updateGameStats();
    setHint('All forms cleared. Choose Forms+ to add new ones.');
  }

  function keepInsideFrame(o, r) {
    const frame = frames.find((candidate) => candidate === o.frame);
    if (!frame) return;

    const minX = frame.x + r;
    const maxX = frame.x + frame.width - r;
    const minY = frame.y + r;
    const maxY = frame.y + frame.height - r;
    if (minX > maxX) {
      o.x = frame.x + frame.width / 2;
      o.vx = 0;
    } else if (o.x < minX) {
      o.x = minX;
      o.vx = Math.abs(o.vx) * 0.85;
    } else if (o.x > maxX) {
      o.x = maxX;
      o.vx = -Math.abs(o.vx) * 0.85;
    }
    if (minY > maxY) {
      o.y = frame.y + frame.height / 2;
      o.vy = 0;
    } else if (o.y < minY) {
      o.y = minY;
      o.vy = Math.abs(o.vy) * 0.85;
    } else if (o.y > maxY) {
      o.y = maxY;
      o.vy = -Math.abs(o.vy) * 0.85;
    }
  }

  function placeField(type, x, y) {
    const definition = [...EFFECTS.elements, ...EFFECTS.light].find((effect) => effect.id === type);
    if (!definition) return;
    if (fields.length >= MAX_FIELDS) {
      const oldest = fields.shift();
      oldest.el.remove();
    }

    const el = document.createElement('div');
    el.className = `field field-${type}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.setProperty('--field-color', definition.color);
    el.setAttribute('aria-label', `${definition.name} force`);
    const icon = document.createElement('span');
    icon.textContent = definition.icon;
    el.appendChild(icon);
    room.appendChild(el);

    const field = {
      type, name: definition.name, x, y, radius: type === 'laser' ? 210 : 190,
      angle: rand(-Math.PI, Math.PI), phase: rand(0, TAU), el, pinned: false,
      pointers: new Map(), pinch: null, gestureMoved: false, gesturePinched: false,
    };
    fields.push(field);
    el.setAttribute('role', 'button');
    el.tabIndex = 0;
    el.addEventListener('pointerdown', (e) => onFieldDown(field, e));
    el.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
      removeField(field);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeField(field);
        return;
      }
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      toggleFieldPinned(field);
    });
    updateFieldElement(field);
    ripple(x, y, 90);
  }

  function updateFieldElement(field) {
    field.el.style.left = `${field.x}px`;
    field.el.style.top = `${field.y}px`;
    field.el.classList.toggle('field-pinned', field.pinned);
    field.el.setAttribute('aria-label', `${field.name} force, ${field.pinned ? 'fixed, select to release' : 'movable, select to fix'}`);
    field.el.setAttribute('aria-pressed', String(field.pinned));
    field.el.title = `${field.name} — ${field.pinned ? 'fixed (click to release)' : 'movable (drag, pinch to resize, double-click or press Delete to remove)'}`;
    field.el.style.setProperty('--force-scale', field.radius / 190);
    field.el.style.setProperty('--force-radius', `${field.radius}px`);
    if (field.type === 'laser') field.el.style.setProperty('--beam-angle', `${field.angle}rad`);
  }

  function toggleFieldPinned(field) {
    field.pinned = !field.pinned;
    updateFieldElement(field);
    setHint(`${field.name} ${field.pinned ? 'fixed. Select it again to release and move.' : 'released. Drag to move it, or select to fix it again.'}`);
  }

  function onFieldDown(field, e) {
    e.preventDefault();
    e.stopPropagation();
    if (field.pointers.size >= 2) return;
    if (field.pinned) {
      toggleFieldPinned(field);
      return;
    }
    const pointer = {
      field, x: e.clientX, y: e.clientY,
      startX: e.clientX, startY: e.clientY, lastX: e.clientX, lastY: e.clientY,
    };
    field.pointers.set(e.pointerId, pointer);
    fieldPointerOwner.set(e.pointerId, pointer);
    if (field.pointers.size === 1) {
      field.gestureMoved = false;
      field.gesturePinched = false;
    } else {
      const [a, b] = [...field.pointers.values()];
      field.pinch = {
        distance: dist(a, b), radius: field.radius, x: field.x, y: field.y,
        centerX: (a.x + b.x) / 2, centerY: (a.y + b.y) / 2,
      };
      field.gesturePinched = true;
    }
    field.el.setPointerCapture(e.pointerId);
    field.el.classList.add('field-dragging');
  }

  function onFieldMove(e) {
    const pointer = fieldPointerOwner.get(e.pointerId);
    if (!pointer) return false;
    const { field } = pointer;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (field.pointers.size >= 2) {
      const [a, b] = [...field.pointers.values()];
      const centerX = (a.x + b.x) / 2;
      const centerY = (a.y + b.y) / 2;
      field.radius = clamp(field.pinch.radius * dist(a, b) / field.pinch.distance, MIN_FIELD_RADIUS, MAX_FIELD_RADIUS);
      field.x = clamp(field.pinch.x + centerX - field.pinch.centerX, 0, W);
      field.y = clamp(field.pinch.y + centerY - field.pinch.centerY, 0, H);
      field.gestureMoved = true;
      field.gesturePinched = true;
      updateFieldElement(field);
    } else {
      const dx = e.clientX - pointer.lastX;
      const dy = e.clientY - pointer.lastY;
      if (Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY) > MOVE_SLOP) field.gestureMoved = true;
      if (field.gestureMoved) {
        field.x = clamp(field.x + dx, 0, W);
        field.y = clamp(field.y + dy, 0, H);
        if (field.type === 'air' || field.type === 'laser') field.angle = Math.atan2(dy, dx);
        updateFieldElement(field);
      }
      pointer.lastX = e.clientX;
      pointer.lastY = e.clientY;
    }
    return true;
  }

  function onFieldUp(e) {
    const pointer = fieldPointerOwner.get(e.pointerId);
    if (!pointer) return false;
    const { field } = pointer;
    fieldPointerOwner.delete(e.pointerId);
    field.pointers.delete(e.pointerId);
    field.el.classList.remove('field-dragging');
    if (field.pointers.size > 0) {
      const remaining = field.pointers.values().next().value;
      remaining.startX = remaining.lastX = remaining.x;
      remaining.startY = remaining.lastY = remaining.y;
      return true;
    }
    field.el.classList.remove('field-dragging');
    if (!field.gestureMoved && !field.gesturePinched) {
      toggleFieldPinned(field);
    } else if (field.gesturePinched) {
      setHint(`${field.name} influence size: ${Math.round(field.radius)}. Double-click or press Delete to remove.`);
    } else {
      setHint(`${field.name} moved. Select it to fix it in place.`);
    }
    return true;
  }

  function updateFieldPositions() {
    for (const field of fields) {
      if (field.type === 'laser') {
        field.el.style.setProperty('--beam-angle', `${field.angle}rad`);
      }
    }
  }

  function applyFields(o, dt, t) {
    let glow = 0;
    for (const field of fields) {
      const dx = o.x - field.x;
      const dy = o.y - field.y;
      const d = Math.hypot(dx, dy) || 1;
      const reach = field.radius + radius(o);
      if (d > reach) continue;

      const strength = 1 - d / reach;
      const nx = dx / d;
      const ny = dy / d;
      switch (field.type) {
        case 'sand':
        case 'fire':
          glow = Math.max(glow, strength);
          break;
        case 'water':
          o.vx += -ny * 190 * strength * dt;
          o.vy += nx * 190 * strength * dt - 34 * strength * dt;
          break;
        case 'air':
          o.vx += Math.cos(field.angle) * 300 * strength * dt;
          o.vy += Math.sin(field.angle) * 300 * strength * dt;
          break;
        case 'laser': {
          const along = dx * Math.cos(field.angle) + dy * Math.sin(field.angle);
          const across = Math.abs(-dx * Math.sin(field.angle) + dy * Math.cos(field.angle));
          if (along > 0 && along < field.radius && across < radius(o) + 7) {
            glow = Math.max(glow, 1 - across / (radius(o) + 7));
          }
          break;
        }
        case 'sunlight':
        case 'magnetlight':
          o.vx -= nx * 220 * strength * dt;
          o.vy -= ny * 220 * strength * dt;
          o.vr += Math.sin(t * 0.002 + field.phase) * 32 * strength * dt;
          break;
      }
    }
    o.el.classList.toggle('force-glow', glow > 0);
    if (glow > 0) o.el.style.setProperty('--glow-strength', glow);
    return true;
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
    const p = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() };
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
    if (beginFrameDraw(e)) return;
    if (chooseSpawnPoint(e)) return;
    if (!placementType) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const type = placementType;
    placementType = null;
    room.classList.remove('placing');
    placeField(type, e.clientX, e.clientY);
    setHint(`${type[0].toUpperCase()}${type.slice(1)} placed. Add another force or keep shaping the room.`);
  }, true);

  room.addEventListener('pointerdown', (e) => {
    if (e.target !== room) return;
    dismissHint();
    if (lastHeld && lastHeld.pointers.size === 1 && objects.includes(lastHeld)) {
      addPointer(lastHeld, e);
      beginPinch(lastHeld);
    }
  });

  addEventListener('pointermove', (e) => {
    if (moveFrameDraw(e)) return;
    moveFormDrag(e);
    if (onFieldMove(e)) return;
    const o = pointerOwner.get(e.pointerId);
    if (!o) return;
    const p = o.pointers.get(e.pointerId);
    const now = performance.now();
    const moveDt = Math.max((now - p.t) / 1000, 0.008);
    const moveX = (p.x - e.clientX) / moveDt;
    const moveY = (p.y - e.clientY) / moveDt;
    const dragSpeed = Math.hypot(moveX, moveY);
    parallaxTargetX = clamp(moveX * 0.2, -100, 100);
    parallaxTargetY = clamp(moveY * 0.2, -100, 100);
    parallaxTargetDepth = Math.min(0.06, dragSpeed / 18000);
    p.x = e.clientX;
    p.y = e.clientY;
    p.t = now;
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
    if (finishFrameDraw(e, e.type !== 'pointerup')) return;
    if (finishFormDrag(e, e.type !== 'pointerup')) return;
    if (onFieldUp(e)) return;
    const o = pointerOwner.get(e.pointerId);
    if (!o) return;
    pointerOwner.delete(e.pointerId);
    o.pointers.delete(e.pointerId);
    if (o.pointers.size === 0) {
      parallaxTargetX = 0;
      parallaxTargetY = 0;
      parallaxTargetDepth = 0;
    }

    if (o.pointers.size === 1) {
      beginDrag(o, [...o.pointers.values()][0]);
      return;
    }
    if (o.pointers.size > 0) return;

    o.held = false;
    const wasGrowing = o.grew;
    stopGrow(o);
    const now = performance.now();
    if (o.moved) assignFrameAfterDrag(o);
    if (o.moved && trySplit(o)) return;
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

  formBtn.addEventListener('click', () => {
    if (pickerMode === 'forms' && !picker.hidden) {
      closePicker();
    } else {
      openPicker('forms');
    }
  });
  elementBtn.addEventListener('click', () => openPicker('elements'));
  lightBtn.addEventListener('click', () => openPicker('light'));
  advancedBtn.addEventListener('click', () => openPicker('advanced'));
  pickerClose.addEventListener('click', closePicker);
  frameBtn.addEventListener('click', () => {
    closePicker();
    placementType = null;
    room.classList.remove('placing');
    setFrameDrawing(!frameDrawing);
    if (frameDrawing) setHint('Drag across the room to draw a frame.');
  });
  clearObjectsBtn.addEventListener('click', clearForms);
  clearForcesBtn.addEventListener('click', clearForces);
  clearFramesBtn.addEventListener('click', clearFrames);
  speedBtn.addEventListener('click', () => {
    simulationSpeed = simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 4 : 1;
    speedLabel.textContent = `${simulationSpeed}×`;
    speedBtn.setAttribute('aria-label', `Simulation speed ${simulationSpeed} times`);
    speedBtn.setAttribute('aria-pressed', String(simulationSpeed > 1));
  });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePicker();
      placementType = null;
      choosingSpawnPoint = false;
      room.classList.remove('choosing-spawn');
      room.classList.remove('placing');
      setFrameDrawing(false);
    }
  });

  addEventListener('resize', () => {
    const oldW = W;
    const oldH = H;
    W = innerWidth;
    H = innerHeight;
    spawnPoint.x = clamp(spawnPoint.x * W / oldW, 24, W - 24);
    spawnPoint.y = clamp(spawnPoint.y * H / oldH, 24, H - 24);
    if (spawnMarker) updateSpawnMarker();
    for (const o of objects) {
      o.x = clamp(o.x * W / oldW, radius(o), W - radius(o));
      o.y = clamp(o.y * H / oldH, radius(o), H - radius(o));
    }
    for (const field of fields) {
      field.x = clamp(field.x * W / oldW, 0, W);
      field.y = clamp(field.y * H / oldH, 0, H);
      updateFieldElement(field);
    }
    for (const frame of frames) {
      frame.x *= W / oldW;
      frame.y *= H / oldH;
      frame.width *= W / oldW;
      frame.height *= H / oldH;
      frame.el.style.left = `${frame.x}px`;
      frame.el.style.top = `${frame.y}px`;
      frame.el.style.width = `${frame.width}px`;
      frame.el.style.height = `${frame.height}px`;
    }
  });

  // ---------- simulation ----------
  let lastT = performance.now();

  function frame(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000) * simulationSpeed;
    lastT = t;
    const parallaxEase = Math.min(1, dt * (pointerOwner.size ? 12 : 2.8));
    parallaxX += (parallaxTargetX - parallaxX) * parallaxEase;
    parallaxY += (parallaxTargetY - parallaxY) * parallaxEase;
    parallaxDepth += (parallaxTargetDepth - parallaxDepth) * parallaxEase;
    backdropWorld.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(${1.08 + parallaxDepth})`;

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];
      const r = radius(o);

      if (o.growing) o.target = Math.min(MAX_SCALE, o.target * (1 + 1.15 * dt));
      if (o.pointers.size < 2) o.scale += (o.target - o.scale) * Math.min(1, dt * 10);

      if (o.held) continue;
      if (!applyFields(o, dt, t)) continue;

      const n = t * 0.0004 + o.seed;
      o.vx += Math.sin(n) * 34 * dt;
      o.vy += Math.cos(n * 1.7) * 34 * dt;

      const cruise = 75 / Math.sqrt(o.scale);
      const sp = Math.hypot(o.vx, o.vy);
      if (sp > cruise) {
        const k = Math.exp(-1.1 * dt);
        o.vx *= k;
        o.vy *= k;
      } else if (sp < cruise * 0.6) {
        if (sp < 1) {
          const a = Math.random() * TAU;
          o.vx = Math.cos(a) * 5;
          o.vy = Math.sin(a) * 5;
        } else {
          o.vx *= 1 + 1.2 * dt;
          o.vy *= 1 + 1.2 * dt;
        }
      }

      o.x += o.vx * dt;
      o.y += o.vy * dt;

      const rx = Math.min(r, W / 2);
      const ry = Math.min(r, H / 2);
      if (o.x < rx) { o.x = rx; o.vx = Math.abs(o.vx) * 0.85; o.vr += o.vy * 0.05; }
      if (o.x > W - rx) { o.x = W - rx; o.vx = -Math.abs(o.vx) * 0.85; o.vr -= o.vy * 0.05; }
      if (o.y < ry) { o.y = ry; o.vy = Math.abs(o.vy) * 0.85; o.vr -= o.vx * 0.05; }
      if (o.y > H - ry) { o.y = H - ry; o.vy = -Math.abs(o.vy) * 0.85; o.vr += o.vx * 0.05; }

      keepInsideFrame(o, r);
      o.vr += (o.spin - o.vr) * Math.min(1, dt * 0.8);
      o.rot += o.vr * dt;
    }

    collide(t);

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];
      o.el.style.transform = `translate3d(${o.x - o.w / 2}px, ${o.y - o.h / 2}px, 0) rotate(${o.rot}deg) scale(${o.scale})`;
    }
    requestAnimationFrame(frame);
  }

  function collide(t) {
    const cellSize = 128;
    const buckets = new Map();
    const entries = [];
    let maxRadius = 0;

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];
      const cellX = Math.floor(o.x / cellSize);
      const cellY = Math.floor(o.y / cellSize);
      const entry = { o, i, radius: radius(o) * 0.92, cellX, cellY };
      const key = `${cellX}:${cellY}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(entry);
      entries.push(entry);
      maxRadius = Math.max(maxRadius, entry.radius);
    }

    for (const current of entries) {
      const { o: a, i, radius: ra, cellX, cellY } = current;
      const range = Math.ceil((ra + maxRadius) / cellSize);
      const ia = a.held ? 0 : 1 / (ra * ra * a.density);

      for (let y = cellY - range; y <= cellY + range; y++) {
        for (let x = cellX - range; x <= cellX + range; x++) {
          const nearby = buckets.get(`${x}:${y}`);
          if (!nearby) continue;
          for (const candidate of nearby) {
            if (candidate.i <= i) continue;
            const b = candidate.o;
            const rb = candidate.radius;
            const ib = b.held ? 0 : 1 / (rb * rb * b.density);
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

            if (!a.held && !b.held && a.tier === b.tier
              && a.splitAfter <= t && b.splitAfter <= t
              && objects.length + SPLIT_OBJECT_DELTA <= MAX_OBJECTS) {
              split(a, b, t);
              return;
            }

            a.x -= nx * overlap * ia * share;
            a.y -= ny * overlap * ia * share;
            b.x += nx * overlap * ib * share;
            b.y += ny * overlap * ib * share;

            const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
            if (rv >= 0) continue;

            const restitution = 0.7 + ((a.tier + b.tier) % 5) * 0.04;
            const jImp = (-(1 + restitution) * rv) * share;
            a.vx -= jImp * ia * nx;
            a.vy -= jImp * ia * ny;
            b.vx += jImp * ib * nx;
            b.vy += jImp * ib * ny;

            if (-rv > 220) {
              for (const collided of [a, b]) {
                if (!collided.held && t - collided.lastBoop > 250) {
                  collided.lastBoop = t;
                  pulse(collided, 'boop');
                }
              }
            }
          }
        }
      }
    }
  }

  function trySplit(o) {
    if (!objects.includes(o) || o.pointers.size > 0) return false;
    if (objects.length + SPLIT_OBJECT_DELTA > MAX_OBJECTS) return false;

    let closest = null;
    let closestDistance = Infinity;
    for (const other of objects) {
      if (other === o || other.held || other.tier !== o.tier || other.splitAfter > performance.now()) continue;
      const d = Math.hypot(other.x - o.x, other.y - o.y);
      const splitDistance = (radius(o) + radius(other)) * 1.04;
      if (d < splitDistance && d < closestDistance) {
        closest = other;
        closestDistance = d;
      }
    }
    if (!closest) return false;

    split(o, closest, performance.now());
    return true;
  }

  function split(a, b, t) {
    if (a === b || !objects.includes(a) || !objects.includes(b)
      || a.tier !== b.tier || objects.length + SPLIT_OBJECT_DELTA > MAX_OBJECTS) return false;
    const x = (a.x + b.x) / 2;
    const y = (a.y + b.y) / 2;
    const vx = (a.vx + b.vx) / 2;
    const vy = (a.vy + b.vy) / 2;
    const hue = (a.hue + b.hue) / 2;
    const childSize = Math.min(a.w * a.scale, b.w * b.scale) * 0.58 / 1.15;

    remove(a, true, true);
    remove(b, true, true);
    const spread = childSize * 0.62;
    const childXLimit = Math.min(childSize / 2, W / 2);
    const childYLimit = Math.min(childSize / 2, H / 2);
    const directions = [
      { x: -1, y: 0 }, { x: 1, y: 0 },
      { x: 0, y: -1 }, { x: 0, y: 1 },
    ];
    const children = directions.map((direction) => {
      const child = create(
        clamp(x + direction.x * spread, childXLimit, W - childXLimit),
        clamp(y + direction.y * spread, childYLimit, H - childYLimit),
        vx + direction.x * 120,
        vy + direction.y * 120,
        a.tier,
        hue,
        0.05,
        childSize,
      );
      if (child) {
        child.target = getConfiguredScale();
        child.frame = a.frame;
        child.lastBoop = t;
        pulse(child, 'tap');
      }
      return child;
    }).filter(Boolean);
    if (children.length !== MAX_SPLIT_CHILDREN) {
      throw new Error(`Expected ${MAX_SPLIT_CHILDREN} split forms, created ${children.length}.`);
    }

    splits++;
    updateGameStats();
    ripple(x, y, childSize * 2.8);
    navigator.vibrate?.([10, 35, 16]);
    return true;
  }

  // ---------- first fill of the room ----------
  const startCount = W < 600 ? 7 : 11;
  const columns = W < 600 ? 3 : Math.max(3, Math.floor(Math.sqrt(startCount * W / H)));
  const rows = Math.ceil(startCount / columns);
  const marginX = Math.min(130, W * 0.12);
  const top = Math.min(145, H * 0.18);
  const bottom = Math.max(top + 100, H - Math.min(185, H * 0.2));
  const cellWidth = (W - marginX * 2) / columns;
  const cellHeight = (bottom - top) / rows;
  Array.from({ length: startCount }, (_, index) => index % SHAPES.length).forEach((tier, index) => {
    const a = Math.random() * TAU;
    const s = rand(50, 110);
    const column = index % columns;
    const row = Math.floor(index / columns);
    const jitterX = Math.min(22, cellWidth * 0.12);
    const jitterY = Math.min(22, cellHeight * 0.12);
    const x = marginX + (column + 0.5) * cellWidth + rand(-jitterX, jitterX);
    const y = top + (row + 0.5) * cellHeight + rand(-jitterY, jitterY);
    create(x, y, Math.cos(a) * s, Math.sin(a) * s, tier, undefined, 0.9);
  });

  seedDistantLights();
  updateGameStats();
  requestAnimationFrame(frame);
})();
