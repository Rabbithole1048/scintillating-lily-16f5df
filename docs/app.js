(() => {
  const room = document.getElementById('room');
  const mapWorld = document.getElementById('map-world');
  const backdropWorld = document.querySelector('.backdrop-world');
  const backdropGrid = document.querySelector('.grid');
  const formBtn = document.getElementById('add');
  const moreBtn = document.getElementById('more');
  const dockActions = document.getElementById('dock-actions');
  const magicMenu = document.getElementById('magic-menu');
  const elementBtn = document.getElementById('elements');
  const lightBtn = document.getElementById('light-effects');
  const phenomenaBtn = document.getElementById('phenomena-effects');
  const frameBtn = document.getElementById('draw-frame');
  const clearObjectsBtn = document.getElementById('clear-forms');
  const clearForcesBtn = document.getElementById('clear-forces');
  const clearFramesBtn = document.getElementById('clear-frames');
  const advancedBtn = document.getElementById('advanced');
  const gameBtn = document.getElementById('game');
  const gameLabel = document.getElementById('game-label');
  const gameScoreEl = document.getElementById('game-score');
  const gamePointsEl = document.getElementById('game-points');
  const gameStonesEl = document.getElementById('game-stones');
  const gameTimeEl = document.getElementById('game-time');
  const gameComboEl = document.getElementById('game-combo');
  const gameTargetColorEl = document.getElementById('game-target-color');
  const gameTargetSwatch = document.getElementById('game-target-swatch');
  const appVersionEl = document.getElementById('app-version');
  const statsToggle = document.getElementById('stats-toggle');
  const statsPanel = document.getElementById('stats-panel');
  const statsClose = document.getElementById('stats-close');
  const roomMusic = document.getElementById('room-music');
  const musicToggle = document.getElementById('music-toggle');
  const musicStatus = document.getElementById('music-status');
  const fastestSpeedEl = document.getElementById('fastest-speed');
  const meanSpeedEl = document.getElementById('mean-speed');
  const kineticIndexEl = document.getElementById('kinetic-index');
  const glassAreaEl = document.getElementById('glass-area');
  const helpToggle = document.getElementById('help-toggle');
  const speedBtn = document.getElementById('speed');
  const speedLabel = document.getElementById('speed-label');
  const hint = document.getElementById('hint');
  const countEl = document.getElementById('count');
  const picker = document.getElementById('picker');
  const pickerTitle = document.getElementById('picker-title');
  const pickerOptions = document.getElementById('picker-options');
  const pickerHint = document.getElementById('picker-hint');
  const pickerClose = document.getElementById('picker-close');
  const formClickSuppression = new WeakMap();

  function updateMusicButton() {
    const playing = !roomMusic.paused;
    musicToggle.setAttribute('aria-pressed', String(playing));
    musicToggle.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    musicToggle.title = playing ? 'Pause music' : 'Play music';
  }

  function playRoomMusic() {
    musicStatus.textContent = '';
    roomMusic.play().then(() => {
      updateMusicButton();
    }).catch((error) => {
      updateMusicButton();
      if (error.name === 'NotAllowedError') {
        musicStatus.textContent = 'Music playback was blocked. Press the music button to try again.';
        return;
      }
      musicStatus.textContent = 'Music could not be played. Check the audio file or browser playback settings.';
      console.error('Unable to play room music.', error);
    });
  }

  roomMusic.addEventListener('play', updateMusicButton);
  roomMusic.addEventListener('pause', updateMusicButton);

  const MIN_SCALE = 0.35;
  const MAX_SCALE = 3.2;
  const MAX_OBJECTS = 2000;
  const DEFAULT_OBJECT_LIMIT = 10;
  const HIGH_DENSITY_THRESHOLD = 800;
  const MAX_COLLISION_PAIRS_PER_FRAME = 16000;
  const WORLD_SCALE = 8;
  const WORLD_TILE_SIZE = 56;
  const GAME_TARGET = 100;
  const APP_VERSION = '1.1.0';
  const INTRO_ARRIVAL_DURATION_MS = 1800;
  const INTRO_GROW_DURATION_MS = 3000;
  const GAME_DURATION_MS = 60_000;
  const GAME_RESPAWN_DELAY_MS = 2_000;
  const GAME_BALL_BASE_INTERVAL_MS = 2_200;
  const GAME_BALL_MAX_INTERVAL_MS = 13_000;
  const GAME_ROCKET_START_SCORE = 10;
  const GAME_ROCKET_BASE_INTERVAL_MS = 9_000;
  const GAME_ROCKET_MIN_INTERVAL_MS = 2_500;
  const MAX_SPLIT_CHILDREN = 4;
  const MAX_FIELDS = 14;
  const MAX_RECURRING_SPAWNERS = 12;
  const RECURRING_SPAWN_INTERVAL = 1800;
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
      { id: 'fire', name: 'Fire', icon: '🔥', color: '#ff704e' },
    ],
    light: [
      { id: 'laser', name: 'Laser', icon: '⌁', color: '#ff405f' },
      { id: 'sunlight', name: 'Sunlight', icon: '☼', color: '#ffd36a' },
      { id: 'magnetlight', name: 'Magnetlight', icon: '✳', color: '#ca78ff' },
    ],
    phenomena: [
      { id: 'wave', name: 'Wave effect', icon: '〰', color: '#58d9ff' },
      { id: 'blackhole', name: 'Black hole', icon: '◉', color: '#bd8bff' },
      { id: 'lightning', name: 'Electricity / lightning', icon: 'ϟ', color: '#fff16b' },
      { id: 'ice', name: 'Ice', icon: '❄', color: '#9ceaff' },
    ],
  };
  const GAME_COLORS = [
    { name: 'Green', hex: '#45f28a' },
    { name: 'Blue', hex: '#43b9ff' },
    { name: 'Pink', hex: '#ff58b7' },
    { name: 'Orange', hex: '#ff9c42' },
    { name: 'Violet', hex: '#b36cff' },
    { name: 'Yellow', hex: '#ffe34f' },
    { name: 'Cyan', hex: '#40f2e2' },
    { name: 'Red', hex: '#ff4e64' },
    { name: 'Lime', hex: '#b7f542' },
    { name: 'Rose', hex: '#ff7892' },
    { name: 'Indigo', hex: '#7187ff' },
  ];

  const objects = [];
  const fields = [];
  const frames = [];
  const recurringSpawners = [];
  const pointerOwner = new Map(); // pointerId -> object
  const fieldPointerOwner = new Map();
  const cameraPointers = new Map();
  let VIEW_W = innerWidth;
  let VIEW_H = innerHeight;
  let W = Math.ceil(VIEW_W * WORLD_SCALE / WORLD_TILE_SIZE) * WORLD_TILE_SIZE;
  let H = Math.ceil(VIEW_H * WORLD_SCALE / WORLD_TILE_SIZE) * WORLD_TILE_SIZE;
  let zTop = 1;
  let collisionCursor = 0;
  let nextObjectId = 0;
  let collisionContacts = new Set();
  let frameCount = 0;
  let lastHeld = null;
  let hintTimer = 0;
  let splits = 0;
  let placementType = null;
  let pickerMode = null;
  let formDrag = null;
  let frameDrawing = false;
  let frameDraw = null;
  let choosingSpawnPoint = false;
  let choosingRecurringSpawn = false;
  let spawnPoint = { x: W / 2, y: H / 2 };
  let spawnPointCustom = false;
  let spawnMarker = null;
  let sizeMode = 'random';
  let colorMode = 'random';
  let simulationSpeed = 1;
  let cameraZoom = Math.min(VIEW_W, VIEW_H) <= 600 ? 0.72 : 1;
  let cameraX = VIEW_W / 2 - W * cameraZoom / 2;
  let cameraY = VIEW_H / 2 - H * cameraZoom / 2;
  let worldOffsetX = 0;
  let worldOffsetY = 0;
  let cameraPinch = null;
  let lastObjectNotice = false;
  let parallaxX = 0;
  let parallaxY = 0;
  let parallaxTargetX = 0;
  let parallaxTargetY = 0;
  let parallaxDepth = 0;
  let parallaxTargetDepth = 0;
  let gameActive = false;
  let gameFinished = false;
  let gameScore = 0;
  let activatedStones = 0;
  const gameStones = new Set();
  const gameRockets = new Set();
  let gameTargetColor = null;
  let gameStoneExpiresAt = 0;
  let gameEndsAt = 0;
  let gameNextStoneAt = 0;
  let gameBallNextSpawnAt = 0;
  let gameRocketNextSpawnAt = 0;
  let gameCombo = 0;
  let splitEnabled = false;
  let unlimitedObjects = false;
  let gameTimeRemaining = GAME_DURATION_MS / 1000;
  let lastDisplayedGameSecond = -1;
  let fastestObjectSpeed = 0;
  let lastStatsUpdate = 0;
  let fieldHitCycle = { x: 0, y: 0, time: 0, index: 0 };

  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap = (value, size) => ((value % size) + size) % size;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) || 1;
  const radius = (o) => ((o.w + o.h) / 4) * o.scale;
  const shapeAt = (tier) => SHAPES[tier % SHAPES.length];
  const zoomLimits = () => Math.min(VIEW_W, VIEW_H) <= 600
    ? { min: 0.5, max: 0.9 }
    : { min: 0.45, max: 2.5 };

  function clampObjectToMap(o) {
    const safeRadius = Math.hypot(o.w, o.h) / 2 * Math.max(o.scale, o.target);
    const x = clamp(o.x, safeRadius, W - safeRadius);
    const y = clamp(o.y, safeRadius, H - safeRadius);
    const moved = x !== o.x || y !== o.y;
    o.x = x;
    o.y = y;
    return moved;
  }

  function worldPoint(clientX, clientY) {
    return {
      x: (clientX - cameraX) / cameraZoom - worldOffsetX,
      y: (clientY - cameraY) / cameraZoom - worldOffsetY,
    };
  }

  function shiftWorld(dx, dy) {
    if (!dx && !dy) return;
    worldOffsetX += dx;
    worldOffsetY += dy;
    room.style.transform = `translate3d(${worldOffsetX}px, ${worldOffsetY}px, 0)`;
  }

  function rebaseCamera() {
    const minX = VIEW_W - W * cameraZoom;
    const minY = VIEW_H - H * cameraZoom;
    const boundedX = clamp(cameraX, minX, 0);
    const boundedY = clamp(cameraY, minY, 0);
    if (boundedX !== cameraX || boundedY !== cameraY) {
      shiftWorld((cameraX - boundedX) / cameraZoom, (cameraY - boundedY) / cameraZoom);
      cameraX = boundedX;
      cameraY = boundedY;
    }
  }

  function updateCamera() {
    rebaseCamera();
    mapWorld.style.width = `${W}px`;
    mapWorld.style.height = `${H}px`;
    room.style.width = `${W}px`;
    room.style.height = `${H}px`;
    room.style.transform = `translate3d(${worldOffsetX}px, ${worldOffsetY}px, 0)`;
    mapWorld.style.transform = `translate3d(${cameraX}px, ${cameraY}px, 0) scale(${cameraZoom})`;
    const gridPeriod = WORLD_TILE_SIZE * cameraZoom;
    backdropGrid.style.backgroundSize = `${gridPeriod}px ${gridPeriod}px, ${gridPeriod}px ${gridPeriod}px`;
    backdropGrid.style.backgroundPosition =
      `0 ${wrap(cameraY + worldOffsetY * cameraZoom, gridPeriod)}px, ${wrap(cameraX + worldOffsetX * cameraZoom, gridPeriod)}px 0`;
    parallaxTargetDepth = clamp((cameraZoom - 1) * 0.045, -0.025, 0.07);
  }

  function updatePanParallax(dx, dy) {
    parallaxTargetX = clamp(parallaxTargetX - dx * 0.035, -22, 22);
    parallaxTargetY = clamp(parallaxTargetY - dy * 0.035, -22, 22);
  }

  function visibleWorldBounds() {
    return {
      left: -cameraX / cameraZoom - worldOffsetX,
      right: (VIEW_W - cameraX) / cameraZoom - worldOffsetX,
      top: -cameraY / cameraZoom - worldOffsetY,
      bottom: (VIEW_H - cameraY) / cameraZoom - worldOffsetY,
    };
  }

  function wrapVisiblePoint(point, bounds, margin) {
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    let moved = false;
    if (point.x < bounds.left - margin || point.x > bounds.right + margin) {
      point.x = bounds.left - margin + wrap(point.x - bounds.left + margin, width + 2 * margin);
      moved = true;
    }
    if (point.y < bounds.top - margin || point.y > bounds.bottom + margin) {
      point.y = bounds.top - margin + wrap(point.y - bounds.top + margin, height + 2 * margin);
      moved = true;
    }
    return moved;
  }

  function beginCameraPinch() {
    const [a, b] = [...cameraPointers.values()];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    cameraPinch = {
      distance: Math.hypot(a.x - b.x, a.y - b.y) || 1,
      zoom: cameraZoom,
      worldX: (midX - cameraX) / cameraZoom - worldOffsetX,
      worldY: (midY - cameraY) / cameraZoom - worldOffsetY,
    };
  }

  function onCameraDown(e) {
    if (cameraPointers.size >= 2) return;
    cameraPointers.set(e.pointerId, { x: e.clientX, y: e.clientY, lastX: e.clientX, lastY: e.clientY });
    room.setPointerCapture(e.pointerId);
    if (cameraPointers.size === 2) {
      cameraPinch = null;
      beginCameraPinch();
      room.classList.add('map-zooming');
    } else {
      room.classList.add('map-panning');
    }
  }

  function onCameraMove(e) {
    const pointer = cameraPointers.get(e.pointerId);
    if (!pointer) return false;
    const pointerDx = e.clientX - pointer.x;
    const pointerDy = e.clientY - pointer.y;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (cameraPointers.size >= 2 && cameraPinch) {
      updatePanParallax(pointerDx / 2, pointerDy / 2);
      const [a, b] = [...cameraPointers.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const limits = zoomLimits();
      cameraZoom = clamp(cameraPinch.zoom * distance / cameraPinch.distance, limits.min, limits.max);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;
      cameraX = midX - (cameraPinch.worldX + worldOffsetX) * cameraZoom;
      cameraY = midY - (cameraPinch.worldY + worldOffsetY) * cameraZoom;
      updateCamera();
    } else {
      const dx = e.clientX - pointer.lastX;
      const dy = e.clientY - pointer.lastY;
      cameraX += dx;
      cameraY += dy;
      updatePanParallax(dx, dy);
      pointer.lastX = e.clientX;
      pointer.lastY = e.clientY;
      updateCamera();
    }
    return true;
  }

  function onCameraUp(e) {
    if (!cameraPointers.has(e.pointerId)) return false;
    cameraPointers.delete(e.pointerId);
    cameraPinch = null;
    if (cameraPointers.size === 1) {
      const remaining = cameraPointers.values().next().value;
      remaining.lastX = remaining.x;
      remaining.lastY = remaining.y;
      room.classList.replace('map-zooming', 'map-panning');
    } else {
      room.classList.remove('map-panning', 'map-zooming');
    }
    return true;
  }

  function zoomAt(factor) {
    const anchor = worldPoint(VIEW_W / 2, VIEW_H / 2);
    const limits = zoomLimits();
    cameraZoom = clamp(cameraZoom * factor, limits.min, limits.max);
    cameraX = VIEW_W / 2 - (anchor.x + worldOffsetX) * cameraZoom;
    cameraY = VIEW_H / 2 - (anchor.y + worldOffsetY) * cameraZoom;
    updateCamera();
  }

  function onMapWheel(e) {
    if (e.target.closest('.obj, .dock, .top, .stats-panel, .game-score, .hint')) return;
    e.preventDefault();
    zoomAt(Math.exp(-e.deltaY * 0.001));
  }
  document.addEventListener('wheel', onMapWheel, { passive: false });

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

  function objectCapacityAvailable(count = 1) {
    return unlimitedObjects || objects.length + count <= DEFAULT_OBJECT_LIMIT;
  }

  function create(x, y, vx, vy, tier = 0, hue = Math.floor(rand(0, 360)), initialScale = 0.05, baseSize = null) {
    if (!objectCapacityAvailable()) return null;
    if (objects.length >= MAX_OBJECTS) {
      const oldest = objects.find((object) => !object.held) ?? objects[0];
      if (oldest) remove(oldest, true, true);
    }
    const formIndex = ((tier % SHAPES.length) + SHAPES.length) % SHAPES.length;
    const shape = shapeAt(formIndex);
    const base = baseSize ?? rand(80, 140) * (Math.min(VIEW_W, VIEW_H) < 600 ? 0.78 : 1);
    const w = base;
    const h = shape === 'capsule' ? base * 0.5 : base;

    const el = document.createElement('div');
    el.className = 'obj';
    el.style.width = w + 'px';
    el.style.height = h + 'px';
    el.style.setProperty('--h', hue);
    el.style.zIndex = zTop++;
    const isDvd = Math.random() < 1 / 900;
    el.classList.toggle('dvd-object', isDvd);
    el.innerHTML = `<div class="wob"><div class="glass ${shape}">${shape === 'pearl' ? '<i class="core"></i>' : ''}${isDvd ? '<span class="dvd-label">DVD</span>' : ''}</div></div>`;
    room.appendChild(el);

    const o = {
      id: nextObjectId++,
      el, wob: el.firstChild, w, h, x, y, vx, vy, tier: formIndex, hue, isDvd,
      rot: rand(-30, 30), vr: rand(-25, 25), spin: rand(-25, 25),
      scale: isDvd ? Math.min(initialScale, 0.65) : initialScale,
      target: isDvd ? 0.65 : initialScale === 0.05 ? getConfiguredScale() : rand(0.85, 1.15),
      pointers: new Map(), held: false, growing: false, grew: false,
      pinched: false, moved: false, timer: 0, lastTap: 0, downT: 0,
      prevV: { x: 0, y: 0 }, off: { x: 0, y: 0 }, samples: [], pinch: null,
      seed: Math.random() * 1000, lastBoop: 0,
      splitAfter: performance.now() + 850,
      gameSplitUsed: false,
      density: 0.75 + (formIndex % 5) * 0.13,
      playerNudgedUntil: 0,
      frame: null, demoOrbit: null, introGrowth: null,
      collisionIndex: 0, collisionRadius: 0, collisionCellX: 0, collisionCellY: 0,
    };

    clampObjectToMap(o);
    el.style.transform = `translate3d(${o.x - w / 2}px, ${o.y - h / 2}px, 0) rotate(${o.rot}deg) scale(${o.scale})`;
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
    clearTimeout(o.timer);
    for (const pointerId of o.pointers.keys()) pointerOwner.delete(pointerId);
    o.pointers.clear();
    for (const stone of gameStones) stone.penalized.delete(o);
    o.held = false;
    if (lastHeld === o) lastHeld = null;
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
    document.body.classList.toggle('dense', objects.length > 120);
    room.classList.toggle('crowded', objects.length > 400);
    document.body.classList.toggle('crowded', objects.length > 400);
    room.classList.toggle('overloaded', objects.length > HIGH_DENSITY_THRESHOLD);
    document.body.classList.toggle('overloaded', objects.length > HIGH_DENSITY_THRESHOLD);
    if (objects.length > 1) lastObjectNotice = false;
  }

  function updateGameStats() {
    document.getElementById('splits').textContent = splits;
    if (objects.length === 1 && splits > 0) {
      showLastObjectNotice();
    }
  }

  function gameMultiplier() {
    return 1 + Math.floor(gameCombo / 3);
  }

  function updateGameScore() {
    gameScoreEl.hidden = !gameActive && !gameFinished;
    gamePointsEl.textContent = gameScore;
    gameStonesEl.textContent = activatedStones;
    gameTimeEl.textContent = `${Math.ceil(gameTimeRemaining)}s`;
    gameComboEl.textContent = `x${gameMultiplier()} (${gameCombo})`;
    gameTargetColorEl.textContent = gameTargetColor ?? '—';
    gameTargetSwatch.style.setProperty('--target-color', gameStones.size
      ? [...gameStones].find((stone) => stone.isTarget)?.color.hex ?? '#fff'
      : '#fff');
    gameBtn.setAttribute('aria-pressed', String(gameActive));
    gameBtn.setAttribute('aria-label', gameActive ? 'Stop game' : gameFinished ? 'Play again' : 'Start game');
    gameLabel.textContent = gameActive ? 'Stop' : gameFinished ? 'Again' : 'Game';
  }

  function updateRoomStats(now = performance.now(), force = false) {
    if (!force && now - lastStatsUpdate < 500) return;
    lastStatsUpdate = now;
    let totalSpeed = 0;
    let kineticIndex = 0;
    let glassArea = 0;
    for (const object of objects) {
      const speed = Math.hypot(object.vx, object.vy);
      fastestObjectSpeed = Math.max(fastestObjectSpeed, speed);
      totalSpeed += speed;
      kineticIndex += 0.5 * radius(object) ** 2 * speed ** 2;
      glassArea += Math.PI * radius(object) ** 2;
    }
    fastestSpeedEl.textContent = `${Math.round(fastestObjectSpeed)} px/s`;
    meanSpeedEl.textContent = `${Math.round(totalSpeed / Math.max(objects.length, 1))} px/s`;
    kineticIndexEl.textContent = Math.round(kineticIndex).toLocaleString();
    glassAreaEl.textContent = `${Math.round(glassArea).toLocaleString()} px²`;
    appVersionEl.textContent = APP_VERSION;
  }

  function recordObjectSpeed(object) {
    fastestObjectSpeed = Math.max(fastestObjectSpeed, Math.hypot(object.vx, object.vy));
  }

  function randomVisiblePoint(margin = Math.min(190, VIEW_H * 0.2)) {
    const left = (margin - cameraX) / cameraZoom - worldOffsetX;
    const right = (VIEW_W - margin - cameraX) / cameraZoom - worldOffsetX;
    const top = (margin - cameraY) / cameraZoom - worldOffsetY;
    const bottom = (VIEW_H - margin - cameraY) / cameraZoom - worldOffsetY;
    return { x: rand(left, Math.max(left, right)), y: rand(top, Math.max(top, bottom)) };
  }

  function clearGameStones() {
    for (const stone of gameStones) stone.el.remove();
    gameStones.clear();
    gameTargetColor = null;
  }

  function clearGameRockets() {
    for (const rocket of gameRockets) rocket.el.remove();
    gameRockets.clear();
  }

  function createGameStone(now = performance.now()) {
    clearGameStones();
    const size = Math.max(36, 50 - Math.max(0, gameScore) * 0.12);
    const targetColor = GAME_COLORS[Math.floor(rand(0, GAME_COLORS.length))];
    gameTargetColor = targetColor.name;
    const decoyCount = gameScore >= 90 ? 3 : gameScore >= 50 ? 2 : 1;
    const decoyColors = GAME_COLORS.filter((color) => color !== targetColor);
    const orbitRadius = decoyCount
      ? Math.max(0, Math.min(size * 2.8, (Math.min(VIEW_W, VIEW_H) / 2 - size - 18) / cameraZoom))
      : 0;
    const clusterMargin = Math.max(20, (orbitRadius + size / 2) * cameraZoom + 12);
    let targetPosition = randomVisiblePoint(clusterMargin);
    let greatestClearance = -1;
    for (let attempt = 0; attempt < 24; attempt++) {
      const candidate = randomVisiblePoint(clusterMargin);
      const clearance = objects.reduce((closest, object) => (
        Math.min(closest, Math.hypot(candidate.x - object.x, candidate.y - object.y) - radius(object))
      ), Infinity);
      if (clearance > greatestClearance) {
        greatestClearance = clearance;
        targetPosition = candidate;
      }
    }
    const visibleFor = Math.max(1800, 6000 - Math.max(0, gameScore) * 30);
    gameStoneExpiresAt = now + visibleFor;
    for (let index = 0; index <= decoyCount; index++) {
      const isTarget = index === 0;
      const color = isTarget ? targetColor : decoyColors[(index - 1) % decoyColors.length];
      const stoneSize = isTarget ? size : size * 0.82;
      const orbitAngle = decoyCount ? -Math.PI / 2 + (index - 1) * TAU / decoyCount : 0;
      const position = isTarget
        ? targetPosition
        : {
          x: targetPosition.x + Math.cos(orbitAngle) * orbitRadius,
          y: targetPosition.y + Math.sin(orbitAngle) * orbitRadius,
        };
      const el = document.createElement('div');
      el.className = `game-stone${isTarget ? ' is-target' : ''}`;
      el.textContent = '◆';
      el.setAttribute('aria-hidden', 'true');
      el.style.setProperty('--stone-size', `${stoneSize}px`);
      el.style.setProperty('--stone-color', color.hex);
      el.style.left = `${position.x}px`;
      el.style.top = `${position.y}px`;
      room.appendChild(el);
      gameStones.add({
        el, x: position.x, y: position.y, radius: stoneSize / 2,
        color, isTarget, penalized: new Set(), orbitAngle, orbitRadius,
      });
    }
    updateGameScore();
  }

  function startGame() {
    gameActive = true;
    gameFinished = false;
    statsPanel.hidden = true;
    statsToggle.setAttribute('aria-expanded', 'false');
    gameScore = 0;
    activatedStones = 0;
    gameCombo = 0;
    gameEndsAt = performance.now() + GAME_DURATION_MS;
    gameTimeRemaining = GAME_DURATION_MS / 1000;
    gameNextStoneAt = 0;
    gameBallNextSpawnAt = performance.now() + 1_500;
    gameRocketNextSpawnAt = 0;
    lastDisplayedGameSecond = -1;
    for (const object of objects) object.playerNudgedUntil = 0;
    clearGameRockets();
    createGameStone(performance.now());
    updateGameScore();
    setHint('60 seconds: nudge a form into the shown color. Hit a different color and lose points.');
  }

  function stopGame(won = false, timedOut = false) {
    gameActive = false;
    gameFinished = true;
    clearGameStones();
    clearGameRockets();
    updateGameScore();
    if (won) setHint('You won! Exactly 100 points!');
    else if (timedOut) setHint(`Time is up! Final score: ${gameScore} points.`);
    else setHint('Game stopped. Press Game to start a new round.');
  }

  function resetGameCombo() {
    gameCombo = 0;
    updateGameScore();
  }

  function updateGameClock(now) {
    if (!gameActive) return;
    if (now >= gameEndsAt) {
      gameTimeRemaining = 0;
      stopGame(false, true);
      return;
    }
    gameTimeRemaining = Math.max(0, (gameEndsAt - now) / 1000);
    const displayedSecond = Math.ceil(gameTimeRemaining);
    if (displayedSecond !== lastDisplayedGameSecond) {
      lastDisplayedGameSecond = displayedSecond;
      updateGameScore();
    }
    if (gameStones.size && now >= gameStoneExpiresAt) {
      clearGameStones();
      resetGameCombo();
      gameNextStoneAt = now + GAME_RESPAWN_DELAY_MS;
      setHint('Target missed — combo reset. Next target in 2 seconds.');
    } else if (!gameStones.size && now >= gameNextStoneAt) {
      createGameStone(now);
      gameNextStoneAt = 0;
    }
  }

  function updateGameCollisions(t) {
    if (!gameActive || !gameStones.size) return;
    for (const object of objects) {
      const touchingStone = [...gameStones].find((stone) => (
        Math.hypot(object.x - stone.x, object.y - stone.y) < radius(object) + stone.radius
      ));
      if (!touchingStone) {
        for (const stone of gameStones) stone.penalized.delete(object);
        continue;
      }
      if (object.held || object.playerNudgedUntil < t || touchingStone.penalized.has(object)) continue;
      touchingStone.penalized.add(object);
      object.playerNudgedUntil = 0;
      if (!touchingStone.isTarget) {
        gameScore -= 2;
        resetGameCombo();
        clearGameStones();
        updateGameScore();
        gameNextStoneAt = t + GAME_RESPAWN_DELAY_MS;
        setHint('Wrong color! 2 points lost and combo reset.');
        return;
      }
      gameCombo++;
      const points = gameMultiplier();
      activatedStones++;
      gameScore = Math.min(GAME_TARGET, gameScore + points);
      gameEndsAt += 2_000;
      gameTimeRemaining = (gameEndsAt - t) / 1000;
      updateGameScore();
      ripple(touchingStone.x, touchingStone.y, touchingStone.radius * 4);
      clearGameStones();
      updateGameScore();
      if (gameScore === GAME_TARGET) {
        stopGame(true);
        return;
      }
      gameNextStoneAt = t + GAME_RESPAWN_DELAY_MS;
      setHint(`Correct color! +${points} point${points === 1 ? '' : 's'} (x${gameMultiplier()} combo).`);
      return;
    }
  }

  function createGameRocket(now) {
    const bounds = visibleWorldBounds();
    const side = Math.floor(rand(0, 4));
    const speed = 620;
    const angle = [
      rand(-0.35, 0.35),
      Math.PI + rand(-0.35, 0.35),
      Math.PI / 2 + rand(-0.35, 0.35),
      -Math.PI / 2 + rand(-0.35, 0.35),
    ][side];
    const x = side === 0 ? bounds.left - 70
      : side === 1 ? bounds.right + 70
        : rand(bounds.left, bounds.right);
    const y = side === 2 ? bounds.top - 70
      : side === 3 ? bounds.bottom + 70
        : rand(bounds.top, bounds.bottom);
    const el = document.createElement('div');
    el.className = 'game-rocket';
    el.textContent = '🚀';
    el.setAttribute('aria-hidden', 'true');
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.transform = `rotate(${angle}rad)`;
    room.appendChild(el);
    gameRockets.add({
      el, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      radius: 118, expiresAt: now + 12_000, affected: new Set(),
    });
  }

  function updateGameHazards(now, dt) {
    if (!gameActive) return;
    const orbitSpeed = 0.75 + gameScore * 0.035;
    for (const stone of gameStones) {
      if (stone.isTarget) continue;
      stone.orbitAngle += orbitSpeed * dt;
      const target = [...gameStones].find((candidate) => candidate.isTarget);
      if (!target) continue;
      stone.x = target.x + Math.cos(stone.orbitAngle) * stone.orbitRadius;
      stone.y = target.y + Math.sin(stone.orbitAngle) * stone.orbitRadius;
      stone.el.style.left = `${stone.x}px`;
      stone.el.style.top = `${stone.y}px`;
    }

    if (objectCapacityAvailable() && now >= gameBallNextSpawnAt) {
      const point = randomVisiblePoint(72);
      const angle = rand(0, TAU);
      create(point.x, point.y, Math.cos(angle) * 90, Math.sin(angle) * 90, 0, rand(0, 360), 0.05, rand(64, 92));
      const ballInterval = Math.min(
        GAME_BALL_MAX_INTERVAL_MS,
        GAME_BALL_BASE_INTERVAL_MS + Math.max(0, gameScore) * 105,
      );
      gameBallNextSpawnAt = now + ballInterval;
    }

    if (gameScore >= GAME_ROCKET_START_SCORE && now >= gameRocketNextSpawnAt) {
      createGameRocket(now);
      gameRocketNextSpawnAt = now + Math.max(
        GAME_ROCKET_MIN_INTERVAL_MS,
        GAME_ROCKET_BASE_INTERVAL_MS - (gameScore - GAME_ROCKET_START_SCORE) * 90,
      );
    }

    const bounds = visibleWorldBounds();
    for (const rocket of gameRockets) {
      const previousX = rocket.x;
      const previousY = rocket.y;
      rocket.x += rocket.vx * dt;
      rocket.y += rocket.vy * dt;
      rocket.el.style.left = `${rocket.x}px`;
      rocket.el.style.top = `${rocket.y}px`;

      const segmentX = rocket.x - previousX;
      const segmentY = rocket.y - previousY;
      const segmentLengthSquared = segmentX * segmentX + segmentY * segmentY;
      for (const object of objects) {
        if (object.held || rocket.affected.has(object)) continue;
        const along = clamp(
          ((object.x - previousX) * segmentX + (object.y - previousY) * segmentY)
            / Math.max(segmentLengthSquared, 1),
          0,
          1,
        );
        const closestX = previousX + segmentX * along;
        const closestY = previousY + segmentY * along;
        const dx = object.x - closestX;
        const dy = object.y - closestY;
        const distance = Math.hypot(dx, dy);
        const influenceRadius = rocket.radius + radius(object);
        if (distance >= influenceRadius) continue;

        rocket.affected.add(object);
        const strength = 1 - distance / influenceRadius;
        const nx = distance > 0 ? dx / distance : -rocket.vy / 620;
        const ny = distance > 0 ? dy / distance : rocket.vx / 620;
        object.vx += rocket.vx * 0.48 + nx * 300 * strength;
        object.vy += rocket.vy * 0.48 + ny * 300 * strength;
        pulse(object, 'boop');
      }

      if (now >= rocket.expiresAt || rocket.x < bounds.left - 120
        || rocket.x > bounds.right + 120 || rocket.y < bounds.top - 120
        || rocket.y > bounds.bottom + 120) {
        rocket.el.remove();
        gameRockets.delete(rocket);
      }
    }
  }

  function showLastObjectNotice() {
    if (lastObjectNotice) return;
    lastObjectNotice = true;
    setHint('One form remains protected. Reaching zero is the hidden challenge.');
  }

  function setHint(message) {
    hint.firstElementChild.textContent = message;
    hint.classList.toggle('hide', document.body.classList.contains('help-hidden'));
  }

  function openPicker(mode) {
    setFrameDrawing(false);
    choosingSpawnPoint = false;
    choosingRecurringSpawn = false;
    room.classList.remove('choosing-spawn');
    room.classList.remove('choosing-recurring-spawn');
    placementType = null;
    pickerOptions.replaceChildren();
    pickerMode = mode;
    pickerTitle.textContent = mode === 'forms' ? 'Choose a form'
      : mode === 'advanced' ? 'Advanced controls'
        : mode === 'phenomena' ? 'Choose an effect' : 'Choose a force';
    pickerHint.textContent = mode === 'forms'
      ? 'Drag a form into the room, or tap to add it.'
      : mode === 'advanced' ? 'Toggle Split or choose a size, color or action.'
        : 'Choose an effect, then place it anywhere in the room.';
    formBtn.setAttribute('aria-expanded', String(mode === 'forms'));

    const choices = mode === 'forms'
      ? FORM_NAMES.map((name, index) => ({ id: String(index), name, icon: '', color: `hsl(${index * 22} 90% 70%)` }))
      : mode === 'advanced'
        ? [
          { id: 'split', name: `Split: ${splitEnabled ? 'On' : 'Off'}`, icon: splitEnabled ? '✓' : '×', color: '#ffb36b' },
          { id: 'unlimited', name: `Unlimited: ${unlimitedObjects ? 'On' : 'Off'}`, icon: '⚠', color: '#ff657a' },
          { id: 'size-1', name: 'Size 1', icon: '1', color: '#89d8ff' },
          { id: 'size-2', name: 'Size 2', icon: '2', color: '#a9a2ff' },
          { id: 'size-3', name: 'Size 3', icon: '3', color: '#eea8ff' },
          { id: 'size-random', name: 'Random sizes', icon: '↗', color: '#9fffd9' },
          { id: 'explode', name: 'Explode random object', icon: '✹', color: '#ff9c72' },
          { id: 'recolor', name: 'Change colors', icon: '◉', color: '#ffd66e' },
            { id: 'spawn-point', name: 'Recurring spawn point', icon: '⟳', color: '#7fffe0' },
            { id: 'clear-spawn-points', name: 'Clear spawn points', icon: '⊗', color: '#ff8caa' },
            { id: 'background-aurora', name: 'Aurora glass', icon: '✧', color: '#70f0ce' },
            { id: 'background-ocean', name: 'Ocean glass', icon: '◌', color: '#61caff' },
            { id: 'background-sunset', name: 'Sunset glass', icon: '☼', color: '#ffad7b' },
          ]
        : EFFECTS[mode];

    for (const choice of choices) {
      const option = document.createElement('button');
      option.className = `picker-option${mode === 'forms' ? ' form-option' : ''}${mode === 'advanced' ? ' advanced-option' : ''}`;
      option.type = 'button';
      option.style.setProperty('--option-color', choice.color);
      option.setAttribute('aria-label', choice.name);
      if (mode === 'advanced' && choice.id === 'split') {
        option.setAttribute('aria-pressed', String(splitEnabled));
        option.classList.toggle('is-active', splitEnabled);
      }
      if (mode === 'advanced' && choice.id === 'unlimited') {
        option.setAttribute('aria-pressed', String(unlimitedObjects));
        option.classList.toggle('is-active', unlimitedObjects);
      }
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
    if (e.button !== 0) return;
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
      if (!cancelled && e.clientX >= 0 && e.clientX <= VIEW_W && e.clientY >= 0 && e.clientY <= VIEW_H) {
        const point = worldPoint(e.clientX, e.clientY);
        spawnForm(drag.index, point.x, point.y, true);
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
    if (!objectCapacityAvailable()) {
      setHint(`Object limit reached (${DEFAULT_OBJECT_LIMIT}). Enable Unlimited in Advanced to keep spawning.`);
      return null;
    }
    const hue = colorMode === 'random' ? Math.floor(rand(0, 360)) : index * 22;
    const o = create(x, y, rand(-90, 90), rand(-90, 90), index, hue);
    if (!o) return null;
    o.target = o.isDvd ? 0.65 : getConfiguredScale();
    if (dropped) o.frame = frameAt(x, y);
    ripple(o.x, o.y, 100);
    return o;
  }

  function applyAdvancedAction(action) {
    if (action === 'split') {
      splitEnabled = !splitEnabled;
      setHint(`Automatic splitting ${splitEnabled ? 'enabled' : 'disabled'}. Without it, objects split only on rare collisions (1:200).`);
      openPicker('advanced');
      return;
    }
    if (action === 'unlimited') {
      unlimitedObjects = !unlimitedObjects;
      setHint(unlimitedObjects
        ? 'Unlimited spawning enabled. The technical limit is 2,000 objects.'
        : `Unlimited spawning disabled. Spawning is capped at ${DEFAULT_OBJECT_LIMIT} objects.`);
      openPicker('advanced');
      return;
    }
    if (action.startsWith('background-')) {
      const preset = action.slice('background-'.length);
      setBackgroundPreset(preset);
      setHint(`Background changed to ${preset}.`);
      return;
    }
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
    if (action === 'spawn-point') {
      if (recurringSpawners.length >= MAX_RECURRING_SPAWNERS) {
        setHint(`The room supports up to ${MAX_RECURRING_SPAWNERS} recurring spawn points.`);
        return;
      }
      closePicker();
      choosingRecurringSpawn = true;
      room.classList.add('choosing-recurring-spawn');
      setHint('Tap the room to add a recurring spawn point. Press Escape to cancel.');
      return;
    }
    if (action === 'clear-spawn-points') {
      clearRecurringSpawnPoints();
      setHint('All recurring spawn points cleared.');
      return;
    }
    if (action === 'explode') explodeRandomObject();
  }

  function setBackgroundPreset(name) {
    for (const scene of document.querySelectorAll('.backdrop-scene')) {
      scene.classList.toggle('scene-active', scene.classList.contains(`scene-${name}`));
    }
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
    const point = worldPoint(e.clientX, e.clientY);
    spawnPoint = {
      x: clamp(point.x, 24, W - 24),
      y: clamp(point.y, 24, H - 24),
    };
    spawnPointCustom = true;
    choosingSpawnPoint = false;
    room.classList.remove('choosing-spawn');
    updateSpawnMarker();
    setHint('Spawn point moved. Tap a form to spawn it there.');
    return true;
  }

  function addRecurringSpawnPoint(x, y) {
    if (recurringSpawners.length >= MAX_RECURRING_SPAWNERS) {
      setHint(`The room supports up to ${MAX_RECURRING_SPAWNERS} recurring spawn points.`);
      return;
    }
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'recurring-spawn-point';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = '<span aria-hidden="true">+</span>';
    const spawner = { x, y, el, paused: false, nextSpawnAt: performance.now() + RECURRING_SPAWN_INTERVAL };
    const update = () => {
      el.classList.toggle('spawn-paused', spawner.paused);
      el.setAttribute('aria-label', `Recurring spawn point ${spawner.paused ? 'paused, activate' : 'active, pause'}`);
      el.title = `${spawner.paused ? 'Paused' : 'Spawning'} — click to ${spawner.paused ? 'resume' : 'pause'}, double-click or press Delete to remove`;
    };
    el.addEventListener('click', () => {
      spawner.paused = !spawner.paused;
      update();
    });
    el.addEventListener('dblclick', () => removeRecurringSpawnPoint(spawner));
    el.addEventListener('keydown', (event) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      event.preventDefault();
      removeRecurringSpawnPoint(spawner);
    });
    room.appendChild(el);
    recurringSpawners.push(spawner);
    update();
    ripple(x, y, 70);
    setHint('Recurring spawn point added. It creates a random form every 1.8 seconds; click it to pause.');
  }

  function removeRecurringSpawnPoint(spawner) {
    const index = recurringSpawners.indexOf(spawner);
    if (index === -1) return;
    recurringSpawners.splice(index, 1);
    spawner.el.remove();
    setHint('Recurring spawn point removed.');
  }

  function clearRecurringSpawnPoints() {
    for (const spawner of recurringSpawners) spawner.el.remove();
    recurringSpawners.length = 0;
  }

  function placeRecurringSpawnPoint(e) {
    if (!choosingRecurringSpawn) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    const point = worldPoint(e.clientX, e.clientY);
    const x = clamp(point.x, 24, W - 24);
    const y = clamp(point.y, 24, H - 24);
    choosingRecurringSpawn = false;
    room.classList.remove('choosing-recurring-spawn');
    addRecurringSpawnPoint(x, y);
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
    clearObjectGlows();
    setHint('All forces cleared.');
  }

  function clearObjectGlows() {
    for (const object of objects) {
      object.el.classList.remove('force-glow');
      object.el.style.removeProperty('--glow-strength');
    }
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
    if (fields.length === 0) clearObjectGlows();
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
    const point = worldPoint(e.clientX, e.clientY);
    const startX = clamp(point.x, 0, W);
    const startY = clamp(point.y, 0, H);
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
    const point = worldPoint(e.clientX, e.clientY);
    updateFramePreview(point.x, point.y);
    return true;
  }

  function finishFrameDraw(e, cancelled = false) {
    if (!frameDraw || frameDraw.pointerId !== e.pointerId) return false;
    const point = worldPoint(e.clientX, e.clientY);
    const x = clamp(point.x, 0, W);
    const y = clamp(point.y, 0, H);
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
    clearRecurringSpawnPoints();
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
    const definition = [...EFFECTS.elements, ...EFFECTS.light, ...EFFECTS.phenomena].find((effect) => effect.id === type);
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
    const point = worldPoint(e.clientX, e.clientY);
    const pointer = {
      field, x: point.x, y: point.y,
      startX: point.x, startY: point.y, lastX: point.x, lastY: point.y,
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
    const point = worldPoint(e.clientX, e.clientY);
    pointer.x = point.x;
    pointer.y = point.y;
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
      const dx = point.x - pointer.lastX;
      const dy = point.y - pointer.lastY;
      if (Math.hypot(point.x - pointer.startX, point.y - pointer.startY) > MOVE_SLOP) field.gestureMoved = true;
      if (field.gestureMoved) {
        field.x = clamp(field.x + dx, 0, W);
        field.y = clamp(field.y + dy, 0, H);
        if (field.type === 'air' || field.type === 'laser') field.angle = Math.atan2(dy, dx);
        updateFieldElement(field);
      }
      pointer.lastX = point.x;
      pointer.lastY = point.y;
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
    if (fields.length === 0) return true;
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
        case 'wave': {
          const waveDistance = ((t * 0.18 + field.phase * 40) % field.radius);
          const waveStrength = Math.max(0, 1 - Math.abs(d - waveDistance) / 42);
          o.vx += nx * 620 * waveStrength * dt;
          o.vy += ny * 620 * waveStrength * dt;
          glow = Math.max(glow, waveStrength);
          break;
        }
        case 'blackhole':
          o.vx -= nx * 520 * strength * dt;
          o.vy -= ny * 520 * strength * dt;
          glow = Math.max(glow, strength);
          break;
        case 'lightning': {
          const flicker = Math.sin(t * 0.027 + field.phase);
          if (flicker > 0.55) {
            const zap = strength * (flicker - 0.55) * 2.3;
            o.vx += (nx - ny * 0.45) * 720 * zap * dt;
            o.vy += (ny + nx * 0.45) * 720 * zap * dt;
            glow = Math.max(glow, zap);
          }
          break;
        }
        case 'ice':
          o.vx *= Math.max(0, 1 - strength * 1.8 * dt);
          o.vy *= Math.max(0, 1 - strength * 1.8 * dt);
          glow = Math.max(glow, strength);
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
    const point = worldPoint(e.clientX, e.clientY);
    const p = { x: point.x, y: point.y, sx: point.x, sy: point.y, t: performance.now() };
    o.pointers.set(e.pointerId, p);
    pointerOwner.set(e.pointerId, o);
    return p;
  }

  function onDown(o, e) {
    e.preventDefault();
    e.stopPropagation();
    dismissHint();
    if (o.pointers.size >= 2) return;
    o.demoOrbit = null;
    if (o.introGrowth) {
      o.introGrowth = null;
      o.target = o.scale;
    }
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

  function promoteGestureToCamera(e) {
    let pointerId;
    let point;
    const objectPointer = pointerOwner.entries().next();
    if (!objectPointer.done) {
      [pointerId] = objectPointer.value;
      const object = pointerOwner.get(pointerId);
      const pointer = object.pointers.get(pointerId);
      point = { x: pointer.x, y: pointer.y };
      object.pointers.delete(pointerId);
      pointerOwner.delete(pointerId);
      object.held = false;
      stopGrow(object);
    } else {
      const fieldPointer = fieldPointerOwner.entries().next();
      if (fieldPointer.done) return false;
      [pointerId] = fieldPointer.value;
      const pointer = fieldPointerOwner.get(pointerId);
      point = { x: pointer.x, y: pointer.y };
      pointer.field.pointers.delete(pointerId);
      pointer.field.el.classList.remove('field-dragging');
      fieldPointerOwner.delete(pointerId);
    }
    const screenX = (point.x + worldOffsetX) * cameraZoom + cameraX;
    const screenY = (point.y + worldOffsetY) * cameraZoom + cameraY;
    cameraPointers.set(pointerId, { x: screenX, y: screenY, lastX: screenX, lastY: screenY });
    room.setPointerCapture(pointerId);
    onCameraDown(e);
    e.preventDefault();
    e.stopImmediatePropagation();
    return true;
  }

  function fieldAtPointer(clientX, clientY) {
    const point = worldPoint(clientX, clientY);
    const overlapping = fields
      .map((field) => ({ field, distance: Math.hypot(field.x - point.x, field.y - point.y) }))
      .filter(({ distance }) => distance <= 30)
      .sort((a, b) => a.distance - b.distance)
      .map(({ field }) => field);
    if (!overlapping.length) return null;

    const now = performance.now();
    const sameSpot = Math.hypot(clientX - fieldHitCycle.x, clientY - fieldHitCycle.y) < 18
      && now - fieldHitCycle.time < 700;
    fieldHitCycle = {
      x: clientX, y: clientY, time: now,
      index: sameSpot ? (fieldHitCycle.index + 1) % overlapping.length : 0,
    };
    return overlapping[fieldHitCycle.index];
  }

  document.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.dock, .top, .stats-panel, .game-score, .hint, .recurring-spawn-point')) return;
    if (cameraPointers.size > 0) {
      e.preventDefault();
      e.stopImmediatePropagation();
      onCameraDown(e);
      return;
    }
    if (pointerOwner.size > 0 || fieldPointerOwner.size > 0) {
      promoteGestureToCamera(e);
      return;
    }
    if (beginFrameDraw(e) || chooseSpawnPoint(e) || placeRecurringSpawnPoint(e)) return;
    if (placementType) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const type = placementType;
      placementType = null;
      room.classList.remove('placing');
      const point = worldPoint(e.clientX, e.clientY);
      placeField(type, point.x, point.y);
      setHint(`${type[0].toUpperCase()}${type.slice(1)} placed. Add another force or keep shaping the room.`);
      return;
    }
    const field = fieldAtPointer(e.clientX, e.clientY);
    if (field) {
      e.preventDefault();
      e.stopImmediatePropagation();
      onFieldDown(field, e);
      return;
    }
    if (e.target.closest('.obj, .field')) return;
    dismissHint();
    onCameraDown(e);
  }, true);

  addEventListener('pointermove', (e) => {
    if (moveFrameDraw(e)) return;
    moveFormDrag(e);
    if (onCameraMove(e)) return;
    if (onFieldMove(e)) return;
    const o = pointerOwner.get(e.pointerId);
    if (!o) return;
    const p = o.pointers.get(e.pointerId);
    const point = worldPoint(e.clientX, e.clientY);
    const now = performance.now();
    const moveDt = Math.max((now - p.t) / 1000, 0.008);
    const moveX = (p.x - point.x) / moveDt;
    const moveY = (p.y - point.y) / moveDt;
    const dragSpeed = Math.hypot(moveX, moveY);
    p.x = point.x;
    p.y = point.y;
    p.t = now;
    if (Math.hypot(p.x - p.sx, p.y - p.sy) > MOVE_SLOP) {
      o.moved = true;
      o.playerNudgedUntil = performance.now() + 8000;
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
    if (clampObjectToMap(o)) o.vx = o.vy = 0;
  });

  function onUp(e) {
    if (finishFrameDraw(e, e.type !== 'pointerup')) return;
    if (finishFormDrag(e, e.type !== 'pointerup')) return;
    if (onCameraUp(e)) return;
    if (onFieldUp(e)) return;
    const o = pointerOwner.get(e.pointerId);
    if (!o) return;
    pointerOwner.delete(e.pointerId);
    o.pointers.delete(e.pointerId);
    clampObjectToMap(o);
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
    recordObjectSpeed(o);
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
  moreBtn.addEventListener('click', () => {
    const isOpen = dockActions.classList.toggle('controls-open');
    document.body.classList.toggle('more-open', isOpen);
    magicMenu.hidden = !isOpen;
    moreBtn.setAttribute('aria-expanded', String(isOpen));
    moreBtn.setAttribute('aria-label', isOpen ? 'Hide more controls' : 'Show more controls');
  });
  elementBtn.addEventListener('click', () => openPicker('elements'));
  lightBtn.addEventListener('click', () => openPicker('light'));
  phenomenaBtn.addEventListener('click', () => openPicker('phenomena'));
  musicToggle.addEventListener('click', () => {
    if (roomMusic.paused) playRoomMusic();
    else roomMusic.pause();
  });
  gameBtn.addEventListener('click', () => {
    if (gameActive) stopGame();
    else startGame();
  });
  statsToggle.addEventListener('click', () => {
    const isOpen = statsPanel.hidden;
    statsPanel.hidden = !isOpen;
    statsToggle.setAttribute('aria-expanded', String(isOpen));
    updateRoomStats(performance.now(), true);
  });
  statsClose.addEventListener('click', () => {
    statsPanel.hidden = true;
    statsToggle.setAttribute('aria-expanded', 'false');
    statsToggle.focus();
  });
  helpToggle.addEventListener('click', () => {
    const hidden = document.body.classList.toggle('help-hidden');
    helpToggle.setAttribute('aria-pressed', String(!hidden));
    helpToggle.setAttribute('aria-label', hidden ? 'Show help text' : 'Hide help text');
    helpToggle.title = hidden ? 'Show help text' : 'Hide help text';
    hint.classList.toggle('hide', hidden);
  });
  advancedBtn.addEventListener('click', () => openPicker('advanced'));
  pickerClose.addEventListener('click', closePicker);
  frameBtn.addEventListener('click', () => {
    closePicker();
    placementType = null;
    choosingSpawnPoint = false;
    choosingRecurringSpawn = false;
    room.classList.remove('choosing-spawn', 'choosing-recurring-spawn');
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
      choosingRecurringSpawn = false;
      room.classList.remove('choosing-spawn');
      room.classList.remove('choosing-recurring-spawn');
      room.classList.remove('placing');
      setFrameDrawing(false);
    }
  });

  addEventListener('resize', () => {
    const oldW = W;
    const oldH = H;
    const centerWorldX = (VIEW_W / 2 - cameraX) / cameraZoom - worldOffsetX;
    const centerWorldY = (VIEW_H / 2 - cameraY) / cameraZoom - worldOffsetY;
    VIEW_W = innerWidth;
    VIEW_H = innerHeight;
    const limits = zoomLimits();
    cameraZoom = clamp(cameraZoom, limits.min, limits.max);
    W = Math.ceil(VIEW_W * WORLD_SCALE / WORLD_TILE_SIZE) * WORLD_TILE_SIZE;
    H = Math.ceil(VIEW_H * WORLD_SCALE / WORLD_TILE_SIZE) * WORLD_TILE_SIZE;
    const worldScaleX = W / oldW;
    const worldScaleY = H / oldH;
    worldOffsetX *= worldScaleX;
    worldOffsetY *= worldScaleY;
    cameraX = VIEW_W / 2 - (centerWorldX * worldScaleX + worldOffsetX) * cameraZoom;
    cameraY = VIEW_H / 2 - (centerWorldY * worldScaleY + worldOffsetY) * cameraZoom;
    spawnPoint.x *= worldScaleX;
    spawnPoint.y *= worldScaleY;
    if (spawnMarker) updateSpawnMarker();
    for (const spawner of recurringSpawners) {
      spawner.x *= worldScaleX;
      spawner.y *= worldScaleY;
      spawner.el.style.left = `${spawner.x}px`;
      spawner.el.style.top = `${spawner.y}px`;
    }
    for (const o of objects) {
      o.x *= worldScaleX;
      o.y *= worldScaleY;
      if (o.demoOrbit) {
        o.demoOrbit.centerX *= worldScaleX;
        o.demoOrbit.centerY *= worldScaleY;
        o.demoOrbit.radius *= Math.sqrt(worldScaleX * worldScaleY);
        if (o.demoOrbit.arrival) {
          o.demoOrbit.arrival.startRadius *= Math.sqrt(worldScaleX * worldScaleY);
        }
      }
    }
    for (const field of fields) {
      field.x *= worldScaleX;
      field.y *= worldScaleY;
      updateFieldElement(field);
    }
    for (const frame of frames) {
      frame.x *= worldScaleX;
      frame.y *= worldScaleY;
      frame.width *= worldScaleX;
      frame.height *= worldScaleY;
      frame.el.style.left = `${frame.x}px`;
      frame.el.style.top = `${frame.y}px`;
      frame.el.style.width = `${frame.width}px`;
      frame.el.style.height = `${frame.height}px`;
    }
    for (const stone of gameStones) {
      stone.x *= worldScaleX;
      stone.y *= worldScaleY;
      stone.el.style.left = `${stone.x}px`;
      stone.el.style.top = `${stone.y}px`;
    }
    if (frameDraw) {
      frameDraw.startX *= worldScaleX;
      frameDraw.startY *= worldScaleY;
    }
    updateCamera();
    if (!spawnPointCustom) {
      const dockTop = document.querySelector('.dock').getBoundingClientRect().top;
      spawnPoint = worldPoint(VIEW_W / 2, Math.max(24, dockTop - 36));
      if (spawnMarker) updateSpawnMarker();
    }
  });

  // ---------- simulation ----------
  let lastT = performance.now();

  function frame(t) {
    frameCount++;
    const dt = Math.min(0.033, (t - lastT) / 1000) * simulationSpeed;
    lastT = t;
    updateGameClock(t);
    updateGameHazards(t, dt);
    const parallaxEase = Math.min(1, dt * (cameraPointers.size ? 8 : 2.8));
    parallaxX += (parallaxTargetX - parallaxX) * parallaxEase;
    parallaxY += (parallaxTargetY - parallaxY) * parallaxEase;
    parallaxDepth += (parallaxTargetDepth - parallaxDepth) * parallaxEase;
    backdropWorld.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0) scale(${1.12 + parallaxDepth})`;
    const visibleBounds = visibleWorldBounds();
    const wrapGap = 12 / cameraZoom;
    const visibleWidth = visibleBounds.right - visibleBounds.left;
    const visibleHeight = visibleBounds.bottom - visibleBounds.top;

    if (!gameActive && wrapVisiblePoint(spawnPoint, visibleBounds, 24) && spawnMarker) updateSpawnMarker();
    for (const field of fields) {
      if (!gameActive && field.pointers.size === 0 && wrapVisiblePoint(field, visibleBounds, field.radius)) {
        updateFieldElement(field);
      }
    }
    for (const spawner of recurringSpawners) {
      if (!gameActive && wrapVisiblePoint(spawner, visibleBounds, 24)) {
        spawner.el.style.left = `${spawner.x}px`;
        spawner.el.style.top = `${spawner.y}px`;
      }
    }
    if (!gameActive) {
      for (const frame of frames) {
        let moved = false;
        if (frame.x + frame.width < visibleBounds.left || frame.x > visibleBounds.right) {
          frame.x = visibleBounds.left - frame.width
            + wrap(frame.x - visibleBounds.left + frame.width, visibleBounds.right - visibleBounds.left + frame.width);
          moved = true;
        }
        if (frame.y + frame.height < visibleBounds.top || frame.y > visibleBounds.bottom) {
          frame.y = visibleBounds.top - frame.height
            + wrap(frame.y - visibleBounds.top + frame.height, visibleBounds.bottom - visibleBounds.top + frame.height);
          moved = true;
        }
        if (moved) {
          frame.el.style.left = `${frame.x}px`;
          frame.el.style.top = `${frame.y}px`;
        }
      }
    }
    for (const spawner of recurringSpawners) {
      if (gameActive || spawner.paused || !objectCapacityAvailable() || t < spawner.nextSpawnAt) continue;
      spawner.nextSpawnAt = t + RECURRING_SPAWN_INTERVAL;
      spawnForm(Math.floor(rand(0, FORM_NAMES.length)), spawner.x, spawner.y);
    }

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];
      const r = radius(o);

      if (o.growing) o.target = Math.min(MAX_SCALE, o.target * (1 + 1.15 * dt));
      if (o.pointers.size < 2) {
        if (o.introGrowth && !o.held) {
          const progress = clamp((t - o.introGrowth.startedAt) / INTRO_GROW_DURATION_MS, 0, 1);
          const easedProgress = 1 - (1 - progress) ** 3;
          o.scale = o.introGrowth.startScale
            + (o.introGrowth.targetScale - o.introGrowth.startScale) * easedProgress;
          if (progress === 1) o.introGrowth = null;
        } else if (!o.introGrowth) {
          o.scale += (o.target - o.scale) * Math.min(1, dt * 10);
        }
      }
      clampObjectToMap(o);

      if (o.held) continue;
      if (o.demoOrbit) {
        const orbit = o.demoOrbit;
        orbit.phase += dt * orbit.speed;
        let currentRadius = orbit.radius;
        let radialSpeed = 0;
        if (orbit.arrival) {
          const progress = clamp((t - orbit.arrival.startedAt) / orbit.arrival.duration, 0, 1);
          const remaining = 1 - progress;
          const easedProgress = 1 - remaining ** 3;
          currentRadius = orbit.arrival.startRadius
            + (orbit.radius - orbit.arrival.startRadius) * easedProgress;
          radialSpeed = (orbit.radius - orbit.arrival.startRadius)
            * 3 * remaining ** 2 / (orbit.arrival.duration / 1000);
          if (progress === 1) orbit.arrival = null;
        }
        for (const other of objects) {
          if (other === o || !other.demoOrbit || other.held) continue;
          const dx = other.x - orbit.centerX;
          const dy = other.y - orbit.centerY;
          const otherRadius = Math.hypot(dx, dy);
          const clearance = radius(o) + radius(other) + 10;
          if (Math.abs(currentRadius - otherRadius) >= clearance || currentRadius * otherRadius === 0) continue;
          const cosAngle = clamp(
            (currentRadius ** 2 + otherRadius ** 2 - clearance ** 2)
              / (2 * currentRadius * otherRadius),
            -1,
            1,
          );
          const minAngle = Math.acos(cosAngle);
          const otherAngle = Math.atan2(dy, dx);
          const angleDelta = wrap(orbit.phase - otherAngle + Math.PI, TAU) - Math.PI;
          if (Math.abs(angleDelta) < minAngle) {
            const direction = Math.sign(angleDelta) || (o.id < other.id ? 1 : -1);
            orbit.phase = otherAngle + direction * minAngle;
          }
        }
        const radialX = Math.cos(orbit.phase);
        const radialY = Math.sin(orbit.phase);
        o.x = orbit.centerX + radialX * currentRadius;
        o.y = orbit.centerY + radialY * currentRadius;
        o.vx = radialX * radialSpeed - radialY * currentRadius * orbit.speed;
        o.vy = radialY * radialSpeed + radialX * currentRadius * orbit.speed;
        o.vr += (o.spin - o.vr) * Math.min(1, dt * 0.8);
        o.rot += o.vr * dt;
        recordObjectSpeed(o);
        continue;
      }
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

      if (o.frame && frames.includes(o.frame)) {
        keepInsideFrame(o, r);
      } else if (gameActive) {
        if (o.x < r) { o.x = r; o.vx = Math.abs(o.vx) * 0.72; }
        else if (o.x > W - r) { o.x = W - r; o.vx = -Math.abs(o.vx) * 0.72; }
        if (o.y < r) { o.y = r; o.vy = Math.abs(o.vy) * 0.72; }
        else if (o.y > H - r) { o.y = H - r; o.vy = -Math.abs(o.vy) * 0.72; }
      } else {
        if (visibleWidth > 2 * (r + wrapGap)) {
          if (o.x < visibleBounds.left - r - wrapGap) o.x += visibleWidth + 2 * (r + wrapGap);
          else if (o.x > visibleBounds.right + r + wrapGap) o.x -= visibleWidth + 2 * (r + wrapGap);
        } else if (o.x < -r - wrapGap) {
          o.x += W + 2 * (r + wrapGap);
        } else if (o.x > W + r + wrapGap) {
          o.x -= W + 2 * (r + wrapGap);
        }
        if (visibleHeight > 2 * (r + wrapGap)) {
          if (o.y < visibleBounds.top - r - wrapGap) o.y += visibleHeight + 2 * (r + wrapGap);
          else if (o.y > visibleBounds.bottom + r + wrapGap) o.y -= visibleHeight + 2 * (r + wrapGap);
        } else if (o.y < -r - wrapGap) {
          o.y += H + 2 * (r + wrapGap);
        } else if (o.y > H + r + wrapGap) {
          o.y -= H + 2 * (r + wrapGap);
        }
      }
      o.vr += (o.spin - o.vr) * Math.min(1, dt * 0.8);
      o.rot += o.vr * dt;
      recordObjectSpeed(o);
    }

    if (objects.length <= HIGH_DENSITY_THRESHOLD || frameCount % 2 === 0) collide(t);
    updateGameCollisions(t);
    updateRoomStats(t);

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];
      o.el.style.transform = `translate3d(${o.x - o.w / 2}px, ${o.y - o.h / 2}px, 0) rotate(${o.rot}deg) scale(${o.scale})`;
    }
    requestAnimationFrame(frame);
  }

  function collide(t) {
    const cellSize = 256;
    const buckets = new Map();
    let maxRadius = 0;

    for (let i = 0; i < objects.length; i++) {
      const o = objects[i];
      o.collisionIndex = i;
      o.collisionRadius = radius(o) * 0.92;
      o.collisionCellX = Math.floor(o.x / cellSize);
      o.collisionCellY = Math.floor(o.y / cellSize);
      const key = `${o.collisionCellX}:${o.collisionCellY}`;
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(o);
      maxRadius = Math.max(maxRadius, o.collisionRadius);
    }

    if (!objects.length) return;
    const currentContacts = new Set();
    const startIndex = collisionCursor % objects.length;
    collisionCursor = (startIndex + Math.max(1, Math.floor(objects.length / 8))) % objects.length;
    const pairBudget = Math.min(
      MAX_COLLISION_PAIRS_PER_FRAME,
      Math.max(4000, Math.floor(MAX_COLLISION_PAIRS_PER_FRAME * 500 / objects.length)),
    );
    let checkedPairs = 0;

    collisionLoop: for (let offset = 0; offset < objects.length; offset++) {
      const a = objects[(startIndex + offset) % objects.length];
      const { collisionIndex: i, collisionRadius: ra, collisionCellX: cellX, collisionCellY: cellY } = a;
      const range = Math.ceil((ra + maxRadius) / cellSize);
      const ia = a.held ? 0 : 1 / (ra * ra * a.density);

      for (let y = cellY - range; y <= cellY + range; y++) {
        for (let x = cellX - range; x <= cellX + range; x++) {
          const nearby = buckets.get(`${x}:${y}`);
          if (!nearby) continue;
          for (const candidate of nearby) {
            if (candidate.collisionIndex <= i) continue;
            if (checkedPairs++ >= pairBudget) break collisionLoop;
            const b = candidate;
            const rb = candidate.collisionRadius;
            const ib = b.held ? 0 : 1 / (rb * rb * b.density);
            if (ia + ib === 0) continue;

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const d = Math.hypot(dx, dy);
            const min = ra + rb;
            if (d >= min || d < 0.001) continue;
            const contactKey = `${Math.min(a.id, b.id)}:${Math.max(a.id, b.id)}`;
            currentContacts.add(contactKey);

            const nx = dx / d;
            const ny = dy / d;
            const overlap = min - d;
            const share = 1 / (ia + ib);

            if (a.playerNudgedUntil > t || b.playerNudgedUntil > t) {
              const inheritedNudge = Math.max(a.playerNudgedUntil, b.playerNudgedUntil) - 500;
              a.playerNudgedUntil = Math.max(a.playerNudgedUntil, inheritedNudge);
              b.playerNudgedUntil = Math.max(b.playerNudgedUntil, inheritedNudge);
            }

            if (!a.held && !b.held && a.tier === b.tier
              && objectCapacityAvailable(MAX_SPLIT_CHILDREN - 2)
              && (!gameActive || (!a.gameSplitUsed && !b.gameSplitUsed))
              && a.splitAfter <= t && b.splitAfter <= t) {
              const shouldSplit = splitEnabled
                || (!collisionContacts.has(contactKey) && Math.random() < 1 / 200);
              if (shouldSplit) {
                collisionContacts = currentContacts;
                split(a, b, t);
                return;
              }
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
    collisionContacts = currentContacts;
  }

  function trySplit(o) {
    if (!splitEnabled || !objectCapacityAvailable(MAX_SPLIT_CHILDREN - 2)) return false;
    if (!objects.includes(o) || o.pointers.size > 0) return false;

    let closest = null;
    let closestDistance = Infinity;
    for (const other of objects) {
      if (other === o || other.held || other.tier !== o.tier
        || (gameActive && (other.gameSplitUsed || o.gameSplitUsed))
        || other.splitAfter > performance.now()) continue;
      const d = Math.hypot(other.x - o.x, other.y - o.y);
      const splitDistance = (radius(o) + radius(other)) * 1.04;
      if (d < splitDistance && d < closestDistance) {
        closest = other;
        closestDistance = d;
      }
    }
    if (!closest) return false;

    return split(o, closest, performance.now());
  }

  function split(a, b, t) {
    if (a === b || !objects.includes(a) || !objects.includes(b) || a.tier !== b.tier) return false;
    if (!objectCapacityAvailable(MAX_SPLIT_CHILDREN - 2)) return false;
    if (gameActive && (a.gameSplitUsed || b.gameSplitUsed)) return false;
    if (gameActive) a.gameSplitUsed = b.gameSplitUsed = true;
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
        if (objects.length <= 400) pulse(child, 'tap');
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
  updateCamera();
  const dockTop = document.querySelector('.dock').getBoundingClientRect().top;
  spawnPoint = worldPoint(VIEW_W / 2, Math.max(24, dockTop - 36));
  const introObjects = [];
  function createIntroOrb(phase, speed, hue, arriving = false, radiusOffset = 0) {
    const orbitCenter = { x: W / 2, y: H / 2 };
    const orbitRadius = Math.max(76, Math.min(VIEW_W, VIEW_H) * 0.18) + radiusOffset;
    const startRadius = Math.min(
      Math.max(VIEW_W, VIEW_H) / (2 * cameraZoom) + 100,
      Math.min(W, H) / 2 - 100,
    );
    const initialRadius = arriving ? startRadius : orbitRadius;
    const object = create(
      orbitCenter.x + Math.cos(phase) * initialRadius,
      orbitCenter.y + Math.sin(phase) * initialRadius,
      -Math.sin(phase) * initialRadius * speed,
      Math.cos(phase) * initialRadius * speed,
      0,
      hue,
      0.34,
      arriving ? 72 : 94,
    );
    if (!object) return null;
    object.target = object.scale;
    object.demoOrbit = {
      centerX: orbitCenter.x, centerY: orbitCenter.y, radius: orbitRadius, phase, speed,
      arrival: arriving
        ? { startRadius, startedAt: performance.now(), duration: INTRO_ARRIVAL_DURATION_MS }
        : null,
    };
    introObjects.push(object);
    return object;
  }

  createIntroOrb(0, 0.65, 132);
  createIntroOrb(Math.PI, 0.72, 218);
  const originalIntroObjects = [...introObjects];
  setTimeout(() => {
    if (gameActive || originalIntroObjects.some((object) => !objects.includes(object))) return;
    const third = createIntroOrb(Math.PI / 2, 0.9, 28, true, 82);
    if (!third) return;
    setTimeout(() => {
      if (gameActive || originalIntroObjects.some((object) => !objects.includes(object))
        || !objects.includes(third)) return;
      if (!createIntroOrb(-Math.PI / 2, 0.78, 310, true, 164)) return;
      setTimeout(() => {
        [132, 218, 28, 310].forEach((hue, index) => {
          const object = introObjects[index];
          if (!objects.includes(object)) return;
          setObjectColor(object, hue);
          object.el.classList.add('intro-glow');
          object.target = 0.64;
          object.introGrowth = {
            startScale: object.scale,
            targetScale: 0.64,
            startedAt: performance.now(),
          };
        });
      }, INTRO_ARRIVAL_DURATION_MS);
    }, 3000);
  }, 3000);

  seedDistantLights();
  updateGameStats();
  updateRoomStats(performance.now(), true);
  requestAnimationFrame(frame);
})();
