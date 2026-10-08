import { useEffect, useRef, useState } from 'react';

export default function ShooterGame() {
  const canvasRef = useRef(null);
  const shellRef = useRef(null);
  const [isFs, setIsFs] = useState(false);

  const toggleFullscreen = () => {
    const el = shellRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    if (!canvas || !shell) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    let W = canvas.width, H = canvas.height;
    const MAP_W = 3400, MAP_H = 2500;

    /* ═══════════════ УТИЛИТЫ ═══════════════ */
    const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
    const rand = (a, b) => a + Math.random() * (b - a);
    const pointInRect = (x, y, r) => x > r.x && x < r.x + r.w && y > r.y && y < r.y + r.h;
    const normAng = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

    /* ═══════════════ КОНСТАНТЫ ═══════════════ */
    const CLASSES = [
      { id: 'assault',    name: 'ШТУРМОВИК',  desc: '+30 HP, +15% скорость',    color: '#e35d5d' },
      { id: 'engineer',   name: 'ИНЖЕНЕР',    desc: 'Турели клавишей F',        color: '#7ee787' },
      { id: 'medic',      name: 'МЕДИК',      desc: '+30 HP, регенерация 3/сек', color: '#55ddff' },
      { id: 'sniper',     name: 'СНАЙПЕР',    desc: '+40% урона, видит врагов',  color: '#c58fff' },
      { id: 'demolition', name: 'ПОДРЫВНИК',  desc: 'Граната (G), +60% AoE',     color: '#ff9c54' },
    ];

    const BIOMES = [
      { id: 'bunker',  name: 'БУНКЕР',        floor: '#0e1219', wall: '#2a3340', wallHi: '#3a4658', accent: '#4fc3f7', fog: '6,10,18' },
      { id: 'lab',     name: 'ЛАБОРАТОРИЯ',   floor: '#0b1520', wall: '#25374a', wallHi: '#375066', accent: '#7ee787', fog: '4,14,22' },
      { id: 'factory', name: 'ЗАВОД',         floor: '#16110c', wall: '#3a2f24', wallHi: '#4d3f30', accent: '#ff9c54', fog: '20,12,6' },
      { id: 'city',    name: 'НОЧНОЙ ГОРОД',  floor: '#080b12', wall: '#222834', wallHi: '#333a48', accent: '#c58fff', fog: '6,8,16' },
    ];

    const WEAPONS = [
      { name: 'ПИСТОЛЕТ', tag: 'БАЛАНС', damage: 32, cd: 0.20, speed: 950, spread: 0.02, count: 1,
        color: '#ffd166', mag: 15, reload: 1.1, stats: { dmg: 0.55, rate: 0.55, mag: 0.55 } },
      { name: 'ДРОБОВИК', tag: 'БЛИЖНИЙ БОЙ', damage: 15, cd: 0.68, speed: 800, spread: 0.30, count: 9,
        color: '#ff9c54', mag: 7, reload: 1.9, kickback: 220, stats: { dmg: 0.9, rate: 0.3, mag: 0.35 } },
      { name: 'АВТОМАТ', tag: 'АВТООГОНЬ', damage: 14, cd: 0.075, speed: 1080, spread: 0.09, count: 1,
        color: '#7ee787', mag: 40, reload: 1.9, kickback: 45, auto: true, stats: { dmg: 0.35, rate: 0.95, mag: 0.85 } },
      { name: 'СНАЙПЕРКА', tag: 'ПРОБИВАЕТ', damage: 140, cd: 1.05, speed: 2000, spread: 0.004, count: 1,
        color: '#c58fff', mag: 6, reload: 2.2, pierce: 4, stats: { dmg: 1.0, rate: 0.15, mag: 0.3 } },
      { name: 'КАТАНА', tag: 'МЕЛЕ / ОТРАЖЕНИЕ', damage: 90, cd: 0.35, color: '#ff5577', mag: Infinity, reload: 0,
        melee: true, range: 95, arc: Math.PI * 0.75,
        dashDist: 220, dashCd: 1.2, dashTime: 0.18, dashDamage: 60,
        parryWindow: 0.35, parryCd: 0.9, reflectRange: 130, reflectArc: Math.PI * 0.9,
        stats: { dmg: 0.95, rate: 0.5, mag: 1.0 } },
    ];

    const DIFFICULTIES = [
      { name: 'ЛЕГКО',    color: '#57d97e', hp: 0.7, dmg: 0.7, speed: 0.9, spawn: 1.4, max: 10, desc: 'Прогулка' },
      { name: 'НОРМАЛЬНО', color: '#e8c34a', hp: 1.0, dmg: 1.0, speed: 1.0, spawn: 1.0, max: 15, desc: 'Как задумано' },
      { name: 'СЛОЖНО',   color: '#e35d5d', hp: 1.35, dmg: 1.3, speed: 1.15, spawn: 0.7, max: 20, desc: 'Для маньяков' },
    ];

    const ENEMY_TYPES = {
      grunt: { hp: 60, speed: 130, r: 14, bodyColor: '#e35d5d', gunColor: '#ffb3b3', bulletColor: '#ff5c5c', bulletRadius: 3.6,
        damage: 8, cd: [0.7, 1.3], bulletSpeed: 480, spread: 0.07, preferredDist: 300, keepDist: 200, retreatDist: 380,
        aimSkill: 0.55, shootRange: 660, scoreValue: 1 },
      rusher: { hp: 40, speed: 230, r: 12, bodyColor: '#ff8844', gunColor: '#ffccaa', bulletColor: '#ffaa44', bulletRadius: 3.0,
        damage: 6, cd: [0.35, 0.7], bulletSpeed: 640, spread: 0.16, preferredDist: 170, keepDist: 90, retreatDist: 260,
        aimSkill: 0.4, shootRange: 480, scoreValue: 1 },
      sniper: { hp: 90, speed: 90, r: 15, bodyColor: '#a97fff', gunColor: '#d5bcff', bulletColor: '#c58fff', bulletRadius: 4.8,
        damage: 26, cd: [1.6, 2.4], bulletSpeed: 980, spread: 0.012, preferredDist: 520, keepDist: 380, retreatDist: 680,
        aimSkill: 0.92, shootRange: 900, scoreValue: 2 },
      shield: { hp: 130, speed: 105, r: 16, bodyColor: '#5a7a99', gunColor: '#a8c0d8', bulletColor: '#88a8cc', bulletRadius: 4,
        damage: 10, cd: [1.0, 1.6], bulletSpeed: 520, spread: 0.06, preferredDist: 240, keepDist: 140, retreatDist: 320,
        aimSkill: 0.5, shootRange: 520, scoreValue: 3, shield: true, shieldArc: Math.PI * 0.9, shieldReduction: 0.85 },
      bomber: { hp: 70, speed: 100, r: 15, bodyColor: '#c9782a', gunColor: '#ffb060', bulletColor: '#ff8833', bulletRadius: 4,
        damage: 0, cd: [1.5, 2.2], bulletSpeed: 0, spread: 0, preferredDist: 340, keepDist: 220, retreatDist: 400,
        aimSkill: 0.6, shootRange: 500, scoreValue: 2, bomber: true, grenadeDamage: 22 },
      flyer: { hp: 55, speed: 175, r: 12, bodyColor: '#5de0d0', gunColor: '#b0fff5', bulletColor: '#5de0d0', bulletRadius: 3.5,
        damage: 9, cd: [0.5, 0.9], bulletSpeed: 700, spread: 0.05, preferredDist: 260, keepDist: 140, retreatDist: 380,
        aimSkill: 0.7, shootRange: 620, scoreValue: 2, flyer: true },
      kamikaze: { hp: 45, speed: 260, r: 13, bodyColor: '#ff3355', gunColor: '#ffaa99', bulletColor: '#ff3355', bulletRadius: 4,
        damage: 0, cd: [99, 99], bulletSpeed: 0, spread: 0, preferredDist: 0, keepDist: 0, retreatDist: 0,
        aimSkill: 0, shootRange: 0, scoreValue: 2, kamikaze: true, explodeDamage: 32, explodeRadius: 110 },
      healer: { hp: 75, speed: 140, r: 14, bodyColor: '#6ee06e', gunColor: '#b8ffb8', bulletColor: '#6ee06e', bulletRadius: 3,
        damage: 4, cd: [1.8, 2.4], bulletSpeed: 400, spread: 0.1, preferredDist: 420, keepDist: 320, retreatDist: 520,
        aimSkill: 0.5, shootRange: 480, scoreValue: 3, healer: true, healAmount: 20, healCd: 3, healRange: 260 },
    };

    const BOSS_TYPE = {
      hp: 900, speed: 75, r: 34, bodyColor: '#ff4477', gunColor: '#ffb0c0', bulletColor: '#ff4477', bulletRadius: 6,
      damage: 22, cd: [1.2, 1.8], bulletSpeed: 560, spread: 0.05, preferredDist: 340, keepDist: 200, retreatDist: 460,
      aimSkill: 0.7, shootRange: 900, scoreValue: 20, boss: true,
    };

    const POWERUPS = {
      firerate: { name: 'СКОРОСТРЕЛЬНОСТЬ', color: '#ff5566', rgb: '255,85,102', duration: 12, icon: 'firerate' },
      damage:   { name: 'УСИЛЕНИЕ УРОНА',   color: '#ffaa33', rgb: '255,170,51', duration: 12, icon: 'damage' },
      reload:   { name: 'БЫСТРАЯ ПЕРЕЗАРЯДКА', color: '#55ddff', rgb: '85,221,255', duration: 14, icon: 'reload' },
      infinite: { name: 'БЕСКОНЕЧНЫЕ ПАТРОНЫ', color: '#88ff88', rgb: '136,255,136', duration: 10, icon: 'infinite' },
      health:   { name: 'АПТЕЧКА',          color: '#ff3355', rgb: '255,51,85',  duration: 0,  icon: 'health', heal: 45 },
      nuke:     { name: 'ЯДЕРНАЯ БОМБА',    color: '#ff0044', rgb: '255,0,68',   duration: 0,  icon: 'nuke', rare: true },
    };

    /* ═══════════════ СОСТОЯНИЕ ═══════════════ */
    let walls, staticCanvas;
    let player, enemies, bullets, particles, decals, damageNumbers, powerupsOnMap;
    let barrels, parts, drone, turrets, grenades;
    let cam, shake, state, score, enemyIdCounter;
    let powerupSpawnTimer, nukeEffect, screenFlash;
    let menuParticles;
    let hitStop = 0, chromaPulse = 0;
    let wave, waveState, waveTimer, spawnTimer, spawnedInWave, bossWave, nextBossWave;
    let biomeIdx = 0;
    let gameTime = 0;
    const menu = { weapon: 0, diff: 1, cls: 0, biome: 0 };
    const menuButtons = { weapons: [], classes: [], difficulties: [], biomes: [], start: null };
    let gameOverButtons = { retry: null, menu: null };
    const mouse = { x: W / 2, y: H / 2, down: false, rdown: false };
    const keys = {};

    /* ═══════════════ SPATIAL HASH ═══════════════ */
    const SH_CELL = 180;
    let shCols, shRows;
    let shEnemies;
    function rebuildSpatialHash() {
      shCols = Math.ceil(MAP_W / SH_CELL);
      shRows = Math.ceil(MAP_H / SH_CELL);
      shEnemies = new Array(shCols * shRows);
      for (let i = 0; i < shEnemies.length; i++) shEnemies[i] = [];
      for (const e of enemies) {
        const cx = Math.floor(e.x / SH_CELL);
        const cy = Math.floor(e.y / SH_CELL);
        if (cx >= 0 && cy >= 0 && cx < shCols && cy < shRows) shEnemies[cy * shCols + cx].push(e);
      }
    }
    function enemiesNear(x, y) {
      const cx = Math.floor(x / SH_CELL);
      const cy = Math.floor(y / SH_CELL);
      const out = [];
      for (let oy = -1; oy <= 1; oy++) for (let ox = -1; ox <= 1; ox++) {
        const nx = cx + ox, ny = cy + oy;
        if (nx < 0 || ny < 0 || nx >= shCols || ny >= shRows) continue;
        const cell = shEnemies[ny * shCols + nx];
        for (let i = 0; i < cell.length; i++) out.push(cell[i]);
      }
      return out;
    }

    /* ═══════════════ FLOW FIELD + WORKER ═══════════════ */
    const GRID = 40;
    let gridCols = 1, gridRows = 1;
    let gridBlocked, flowDist, flowQueue;
    let lastFlowCell = -1, flowTimer = 0;
    let worker = null, workerReady = false, workerUrl = null;

    const WORKER_SRC = `
      let gridBlocked, gridCols, gridRows, GRID, flowDist, flowQueue;
      self.onmessage = (e) => {
        const d = e.data;
        if (d.type === 'init') {
          gridBlocked = new Uint8Array(d.gridBlocked);
          gridCols = d.gridCols; gridRows = d.gridRows; GRID = d.GRID;
          flowDist = new Int16Array(gridCols * gridRows);
          flowQueue = new Int32Array(gridCols * gridRows);
          self.postMessage({ type: 'ready' });
        } else if (d.type === 'compute') {
          const tx = d.px, ty = d.py;
          const gx = Math.floor(tx / GRID), gy = Math.floor(ty / GRID);
          if (gx < 0 || gy < 0 || gx >= gridCols || gy >= gridRows) return;
          flowDist.fill(-1);
          let start = gy * gridCols + gx;
          if (gridBlocked[start]) {
            let found = -1;
            for (let r = 1; r <= 3 && found < 0; r++) {
              for (let oy = -r; oy <= r && found < 0; oy++) {
                for (let ox = -r; ox <= r && found < 0; ox++) {
                  if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue;
                  const nx = gx + ox, ny = gy + oy;
                  if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
                  const ni = ny * gridCols + nx;
                  if (!gridBlocked[ni]) { found = ni; break; }
                }
              }
            }
            if (found < 0) { self.postMessage({ type: 'result', flowDist: new Int16Array(gridCols*gridRows).buffer, cell: d.cell }, [new Int16Array(gridCols*gridRows).buffer]); return; }
            start = found;
          }
          let head = 0, tail = 0;
          flowDist[start] = 0; flowQueue[tail++] = start;
          while (head < tail) {
            const idx = flowQueue[head++]; const dd = flowDist[idx];
            const x = idx % gridCols; const y = (idx / gridCols) | 0;
            if (x > 0) { const ni = idx - 1; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd+1; flowQueue[tail++] = ni; } }
            if (x < gridCols-1) { const ni = idx + 1; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd+1; flowQueue[tail++] = ni; } }
            if (y > 0) { const ni = idx - gridCols; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd+1; flowQueue[tail++] = ni; } }
            if (y < gridRows-1) { const ni = idx + gridCols; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd+1; flowQueue[tail++] = ni; } }
          }
          const copy = new Int16Array(flowDist);
          self.postMessage({ type: 'result', flowDist: copy.buffer, cell: d.cell }, [copy.buffer]);
        }
      };
    `;

    function initWorker() {
      try {
        workerUrl = URL.createObjectURL(new Blob([WORKER_SRC], { type: 'application/javascript' }));
        worker = new Worker(workerUrl);
        worker.onmessage = (e) => {
          const d = e.data;
          if (d.type === 'ready') workerReady = true;
          else if (d.type === 'result') {
            flowDist = new Int16Array(d.flowDist);
            lastFlowCell = d.cell;
          }
        };
      } catch (err) { worker = null; workerReady = false; }
    }

    function buildGrid() {
      gridCols = Math.ceil(MAP_W / GRID);
      gridRows = Math.ceil(MAP_H / GRID);
      gridBlocked = new Uint8Array(gridCols * gridRows);
      for (let gy = 0; gy < gridRows; gy++) for (let gx = 0; gx < gridCols; gx++) {
        const cx = gx * GRID + GRID / 2, cy = gy * GRID + GRID / 2;
        if (cx > MAP_W || cy > MAP_H || circleHitsWall(cx, cy, 18)) gridBlocked[gy * gridCols + gx] = 1;
      }
      if (worker) worker.postMessage({ type: 'init', gridBlocked: gridBlocked, gridCols, gridRows, GRID });
      else { flowDist = new Int16Array(gridCols * gridRows); flowQueue = new Int32Array(gridCols * gridRows); }
    }

    function inlineBFS(tx, ty) {
      if (!flowDist) { flowDist = new Int16Array(gridCols * gridRows); flowQueue = new Int32Array(gridCols * gridRows); }
      const gx = Math.floor(tx / GRID), gy = Math.floor(ty / GRID);
      if (gx < 0 || gy < 0 || gx >= gridCols || gy >= gridRows) return;
      flowDist.fill(-1);
      let start = gy * gridCols + gx;
      if (gridBlocked[start]) {
        let found = -1;
        for (let r = 1; r <= 3 && found < 0; r++) for (let oy = -r; oy <= r && found < 0; oy++) for (let ox = -r; ox <= r && found < 0; ox++) {
          if (Math.abs(ox) !== r && Math.abs(oy) !== r) continue;
          const nx = gx + ox, ny = gy + oy;
          if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
          const ni = ny * gridCols + nx;
          if (!gridBlocked[ni]) { found = ni; break; }
        }
        if (found < 0) return;
        start = found;
      }
      let head = 0, tail = 0;
      flowDist[start] = 0; flowQueue[tail++] = start;
      while (head < tail) {
        const idx = flowQueue[head++]; const dd = flowDist[idx];
        const x = idx % gridCols; const y = (idx / gridCols) | 0;
        if (x > 0) { const ni = idx - 1; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd + 1; flowQueue[tail++] = ni; } }
        if (x < gridCols - 1) { const ni = idx + 1; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd + 1; flowQueue[tail++] = ni; } }
        if (y > 0) { const ni = idx - gridCols; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd + 1; flowQueue[tail++] = ni; } }
        if (y < gridRows - 1) { const ni = idx + gridCols; if (!gridBlocked[ni] && flowDist[ni] === -1) { flowDist[ni] = dd + 1; flowQueue[tail++] = ni; } }
      }
    }

    const flowDir = { x: 0, y: 0, ok: false };
    function getFlowDir(x, y) {
      const gx = Math.floor(x / GRID), gy = Math.floor(y / GRID);
      if (gx < 0 || gy < 0 || gx >= gridCols || gy >= gridRows) { flowDir.ok = false; return flowDir; }
      const idx = gy * gridCols + gx;
      if (!flowDist) { flowDir.ok = false; return flowDir; }
      const d = flowDist[idx];
      if (d < 0) { flowDir.ok = false; return flowDir; }
      let best = d, bx = 0, by = 0;
      for (let k = 0; k < 8; k++) {
        const dx = [0, 0, -1, 1, -1, -1, 1, 1][k];
        const dy = [-1, 1, 0, 0, -1, 1, -1, 1][k];
        const nx = gx + dx, ny = gy + dy;
        if (nx < 0 || ny < 0 || nx >= gridCols || ny >= gridRows) continue;
        const ni = ny * gridCols + nx;
        if (gridBlocked[ni]) continue;
        const nd = flowDist[ni];
        if (nd >= 0 && nd < best) { best = nd; bx = dx; by = dy; }
      }
      if (bx === 0 && by === 0) { flowDir.ok = false; return flowDir; }
      const l = (bx * bx + by * by === 1) ? 1 : Math.SQRT2;
      flowDir.x = bx / l; flowDir.y = by / l; flowDir.ok = true;
      return flowDir;
    }

    /* ═══════════════ КОЛЛИЗИИ ═══════════════ */
    function circleHitsWall(x, y, rad) {
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (x + rad < w.x || x - rad > w.x + w.w || y + rad < w.y || y - rad > w.y + w.h) continue;
        const cx = clamp(x, w.x, w.x + w.w), cy = clamp(y, w.y, w.y + w.h);
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy < rad * rad) return true;
      }
      return false;
    }
    function resolveWalls(e) {
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (e.x + e.r < w.x || e.x - e.r > w.x + w.w || e.y + e.r < w.y || e.y - e.r > w.y + w.h) continue;
        const cx = clamp(e.x, w.x, w.x + w.w), cy = clamp(e.y, w.y, w.y + w.h);
        const dx = e.x - cx, dy = e.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0.0001) {
          if (d2 < e.r * e.r) { const d = Math.sqrt(d2), p = e.r - d; e.x += dx / d * p; e.y += dy / d * p; }
        } else {
          const l = e.x - w.x, r = w.x + w.w - e.x, t = e.y - w.y, b = w.y + w.h - e.y;
          const m = Math.min(l, r, t, b);
          if (m === l) e.x = w.x - e.r;
          else if (m === r) e.x = w.x + w.w + e.r;
          else if (m === t) e.y = w.y - e.r;
          else e.y = w.y + w.h + e.r;
        }
      }
    }
    function segRect(x1, y1, x2, y2, r) {
      const dx = x2 - x1, dy = y2 - y1;
      let t0 = 0, t1 = 1;
      const p = [-dx, dx, -dy, dy];
      const q = [x1 - r.x, r.x + r.w - x1, y1 - r.y, r.y + r.h - y1];
      for (let i = 0; i < 4; i++) {
        if (p[i] === 0) { if (q[i] < 0) return false; }
        else {
          const t = q[i] / p[i];
          if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
          else { if (t < t0) return false; if (t < t1) t1 = t; }
        }
      }
      return true;
    }
    function hasLOS(x1, y1, x2, y2) {
      for (let i = 0; i < walls.length; i++) {
        const w = walls[i];
        if (Math.max(x1, x2) < w.x || Math.min(x1, x2) > w.x + w.w) continue;
        if (Math.max(y1, y2) < w.y || Math.min(y1, y2) > w.y + w.h) continue;
        if (segRect(x1, y1, x2, y2, w)) return false;
      }
      return true;
    }

    /* ═══════════════ ЧАСТИЦЫ / ДЕКАЛИ ═══════════════ */
    function addParticles(x, y, color, count, spread) {
      spread = spread || 180;
      if (particles.length > 450) count = Math.min(count, 3);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2, s = rand(30, spread);
        particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rand(0.25, 0.7), maxLife: 0.7, color, size: rand(1.5, 3.8) });
      }
      if (particles.length > 550) particles.splice(0, particles.length - 550);
    }
    function addDecal(x, y, r, color, kind) {
      const circles = [];
      const n = 2 + ((Math.random() * 3) | 0);
      for (let i = 0; i < n; i++) circles.push({ dx: rand(-r * 0.5, r * 0.5), dy: rand(-r * 0.5, r * 0.5), r: rand(r * 0.35, r * 0.9) });
      decals.push({ x, y, circles, color, kind: kind || 'blood', life: kind === 'hole' ? 40 : 18, maxLife: kind === 'hole' ? 40 : 18 });
      if (decals.length > 100) decals.shift();
    }
    function addDamageNumber(x, y, amount, color, big) {
      if (damageNumbers.length > 30) damageNumbers.shift();
      damageNumbers.push({ x, y, vx: rand(-30, 30), vy: -70, text: Math.round(amount).toString(), color, life: 0.9, maxLife: 0.9, size: big ? 24 : 14 });
    }
    function hexToRgbArr(hex) {
      const h = hex.replace('#', '');
      const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }
    function hexToRgb(hex) { const a = hexToRgbArr(hex); return a[0] + ',' + a[1] + ',' + a[2]; }

    /* ═══════════════ ГЕНЕРАЦИЯ КАРТЫ ═══════════════ */
    function generateMap() {
      walls = [];
      const b = 30;
      walls.push({ x: 0, y: 0, w: MAP_W, h: b }, { x: 0, y: MAP_H - b, w: MAP_W, h: b }, { x: 0, y: 0, w: b, h: MAP_H }, { x: MAP_W - b, y: 0, w: b, h: MAP_H });
      const cellW = 340, cellH = 340;
      const cols = Math.floor(MAP_W / cellW), rows = Math.floor(MAP_H / cellH);
      const pcx = Math.floor(MAP_W / 2 / cellW), pcy = Math.floor(MAP_H / 2 / cellH);
      for (let cy = 0; cy < rows; cy++) for (let cx = 0; cx < cols; cx++) {
        if (Math.abs(cx - pcx) <= 1 && Math.abs(cy - pcy) <= 1) continue;
        if (Math.random() < 0.35) continue;
        const x0 = cx * cellW + 40, y0 = cy * cellH + 40, cw = cellW - 80, ch = cellH - 80;
        const type = Math.floor(Math.random() * 8);
        switch (type) {
          case 0: walls.push({ x: x0 + rand(0, cw - 100), y: y0 + rand(0, ch - 100), w: rand(80, 110), h: rand(80, 110) }); break;
          case 1: walls.push({ x: x0, y: y0 + ch / 2 - rand(15, 25), w: cw, h: rand(30, 50) }); break;
          case 2: walls.push({ x: x0 + cw / 2 - rand(15, 25), y: y0, w: rand(30, 50), h: ch }); break;
          case 3: walls.push({ x: x0, y: y0, w: cw * 0.7, h: 30 }, { x: x0, y: y0, w: 30, h: ch * 0.7 }); break;
          case 4: walls.push({ x: x0, y: y0, w: 44, h: 44 }, { x: x0 + cw - 44, y: y0, w: 44, h: 44 }, { x: x0, y: y0 + ch - 44, w: 44, h: 44 }, { x: x0 + cw - 44, y: y0 + ch - 44, w: 44, h: 44 }); break;
          case 5: walls.push({ x: x0, y: y0 + ch * 0.2, w: cw * 0.6, h: 30 }, { x: x0 + cw * 0.4, y: y0 + ch * 0.8 - 30, w: cw * 0.6, h: 30 }); break;
          case 6: walls.push({ x: x0 + cw / 2 - 65, y: y0 + ch / 2 - 65, w: 130, h: 130 }); break;
          case 7: walls.push({ x: x0, y: y0, w: cw, h: 30 }, { x: x0, y: y0 + ch - 30, w: cw, h: 30 }); break;
        }
      }
    }

    function placeBarrels() {
      barrels = [];
      for (let i = 0; i < 14; i++) {
        const x = rand(150, MAP_W - 150), y = rand(150, MAP_H - 150);
        if (circleHitsWall(x, y, 26)) continue;
        if (Math.hypot(x - MAP_W / 2, y - MAP_H / 2) < 220) continue;
        barrels.push({ x, y, r: 16, hp: 30, exploded: false, wobble: 0 });
      }
    }

    /* ═══════════════ ЗАПЕЧЁННАЯ КАРТА ═══════════════ */
    function bakeStaticMap() {
      staticCanvas = document.createElement('canvas');
      staticCanvas.width = MAP_W;
      staticCanvas.height = MAP_H;
      const sc = staticCanvas.getContext('2d');
      const bio = BIOMES[biomeIdx];

      sc.fillStyle = bio.floor;
      sc.fillRect(0, 0, MAP_W, MAP_H);
      const vg = sc.createRadialGradient(MAP_W / 2, MAP_H / 2, Math.min(MAP_W, MAP_H) * 0.15, MAP_W / 2, MAP_H / 2, Math.max(MAP_W, MAP_H) * 0.7);
      vg.addColorStop(0, `rgba(${bio.fog},0.0)`);
      vg.addColorStop(1, `rgba(0,0,0,0.55)`);
      sc.fillStyle = vg;
      sc.fillRect(0, 0, MAP_W, MAP_H);

      const imgData = sc.getImageData(0, 0, MAP_W, MAP_H);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() * 22 - 11) | 0;
        data[i] = clamp(data[i] + n, 0, 255);
        data[i + 1] = clamp(data[i + 1] + n, 0, 255);
        data[i + 2] = clamp(data[i + 2] + n, 0, 255);
      }
      sc.putImageData(imgData, 0, 0);

      sc.globalAlpha = 0.22;
      for (let i = 0; i < 70; i++) {
        const x = Math.random() * MAP_W, y = Math.random() * MAP_H, r = rand(40, 160);
        const g = sc.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, Math.random() < 0.7 ? 'rgba(0,0,0,0.5)' : `rgba(${hexToRgb(bio.accent)},0.15)`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        sc.fillStyle = g;
        sc.beginPath(); sc.arc(x, y, r, 0, Math.PI * 2); sc.fill();
      }
      sc.globalAlpha = 1;

      sc.strokeStyle = 'rgba(0,0,0,0.18)';
      sc.lineWidth = 1;
      const tile = 128;
      sc.beginPath();
      for (let x = 0; x < MAP_W; x += tile) { sc.moveTo(x + 0.5, 0); sc.lineTo(x + 0.5, MAP_H); }
      for (let y = 0; y < MAP_H; y += tile) { sc.moveTo(0, y + 0.5); sc.lineTo(MAP_W, y + 0.5); }
      sc.stroke();

      for (const w of walls) drawBiomeWall(sc, w, bio);
    }

    function drawBiomeWall(sc, w, bio) {
      const x = w.x, y = w.y, ww = w.w, wh = w.h;
      sc.fillStyle = 'rgba(0,0,0,0.45)'; sc.fillRect(x + 6, y + 8, ww, wh);
      const sh = sc.createLinearGradient(x, y + wh, x, y + wh + 14);
      sh.addColorStop(0, 'rgba(0,0,0,0.35)'); sh.addColorStop(1, 'rgba(0,0,0,0)');
      sc.fillStyle = sh; sc.fillRect(x, y + wh, ww, 14);
      sc.fillStyle = bio.wall; sc.fillRect(x, y, ww, wh);
      const bh = 18, bw = 42;
      sc.save();
      sc.beginPath(); sc.rect(x, y, ww, wh); sc.clip();
      const base = hexToRgbArr(bio.wall);
      for (let ry = 0; ry < Math.ceil(wh / bh); ry++) {
        const off = ry % 2 === 0 ? 0 : bw / 2;
        const by = y + ry * bh;
        for (let rx = -1; rx < Math.ceil(ww / bw) + 1; rx++) {
          const bx = x + rx * bw + off;
          const v = 0.85 + Math.random() * 0.3;
          sc.fillStyle = `rgb(${(base[0] * v) | 0},${(base[1] * v) | 0},${(base[2] * v) | 0})`;
          sc.fillRect(bx + 1, by + 1, bw - 2, bh - 2);
          sc.fillStyle = 'rgba(255,255,255,0.05)'; sc.fillRect(bx + 1, by + 1, bw - 2, 2);
          sc.fillStyle = 'rgba(0,0,0,0.28)'; sc.fillRect(bx + 1, by + bh - 3, bw - 2, 2);
        }
      }
      const ao = sc.createLinearGradient(x, y, x, y + wh);
      ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(0.85, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,0.35)');
      sc.fillStyle = ao; sc.fillRect(x, y, ww, wh);
      sc.restore();
      sc.fillStyle = 'rgba(255,255,255,0.10)'; sc.fillRect(x, y, ww, 3);
      sc.fillStyle = 'rgba(255,255,255,0.05)'; sc.fillRect(x, y + 3, ww, 2);
      sc.strokeStyle = 'rgba(0,0,0,0.55)'; sc.lineWidth = 2;
      sc.strokeRect(x + 1, y + 1, ww - 2, wh - 2);
    }

    /* ═══════════════ ГЛОУ КЭШ ═══════════════ */
    const glowCache = {};
    function getGlow(color, radius) {
      const key = color + '|' + radius;
      let c = glowCache[key];
      if (c) return c;
      const size = Math.max(8, radius * 6);
      c = document.createElement('canvas');
      c.width = c.height = size;
      const cx = c.getContext('2d');
      const [r, g, b] = hexToRgbArr(color);
      const grad = cx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, `rgba(${r},${g},${b},0.85)`);
      grad.addColorStop(0.25, `rgba(${r},${g},${b},0.45)`);
      grad.addColorStop(0.6, `rgba(${r},${g},${b},0.12)`);
      grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
      cx.fillStyle = grad;
      cx.fillRect(0, 0, size, size);
      glowCache[key] = c;
      return c;
    }

    /* ═══════════════ ВРАГИ ═══════════════ */
    function makeEnemy(x, y, typeName, isBoss) {
      const t = isBoss ? BOSS_TYPE : ENEMY_TYPES[typeName];
      const diff = DIFFICULTIES[menu.diff];
      const bossMult = isBoss ? 1 + Math.floor(wave / 15) * 0.35 : 1;
      const slot = (++enemyIdCounter) * (Math.PI * 2 / 3.7) + rand(-0.35, 0.35);
      return {
        id: enemyIdCounter, x, y, r: t.r,
        hp: t.hp * diff.hp * bossMult, maxHp: t.hp * diff.hp * bossMult,
        typeName: isBoss ? 'boss' : typeName, type: t,
        speed: t.speed * diff.speed * rand(0.9, 1.1),
        angle: 0, cd: rand(t.cd[0], t.cd[1]) * 0.5,
        strafe: Math.random() < 0.5 ? 1 : -1, strafeTimer: rand(0.8, 2.0),
        hitFlash: 0, slotAngle: slot, dmgMult: diff.dmg,
        isBoss: !!isBoss, phase: 1,
        healTimer: rand(0, 2), trailTimer: 0,
        bossAttackTimer: 0, dashCd: 3,
      };
    }

    function pickEnemyType() {
      const t = wave;
      const r = Math.random();
      if (t < 2) return 'grunt';
      if (t < 4) return r < 0.7 ? 'grunt' : 'rusher';
      if (t < 7) return r < 0.5 ? 'grunt' : r < 0.8 ? 'rusher' : 'sniper';
      if (t < 12) return r < 0.35 ? 'grunt' : r < 0.6 ? 'rusher' : r < 0.78 ? 'sniper' : r < 0.9 ? 'shield' : 'bomber';
      return r < 0.25 ? 'grunt' : r < 0.42 ? 'rusher' : r < 0.56 ? 'sniper' : r < 0.68 ? 'shield' : r < 0.78 ? 'bomber' : r < 0.88 ? 'flyer' : r < 0.95 ? 'kamikaze' : 'healer';
    }

    function spawnEnemy() {
      for (let i = 0; i < 300; i++) {
        const x = rand(80, MAP_W - 80), y = rand(80, MAP_H - 80);
        if (Math.hypot(x - player.x, y - player.y) < 620) continue;
        if (circleHitsWall(x, y, 28)) continue;
        enemies.push(makeEnemy(x, y, pickEnemyType()));
        return true;
      }
      return false;
    }

    function spawnBoss() {
      for (let i = 0; i < 400; i++) {
        const x = rand(200, MAP_W - 200), y = rand(200, MAP_H - 200);
        if (Math.hypot(x - player.x, y - player.y) < 900) continue;
        if (circleHitsWall(x, y, 40)) continue;
        enemies.push(makeEnemy(x, y, 'boss', true));
        return true;
      }
      return false;
    }

    function spawnParts(x, y) {
      if (Math.random() > 0.35) return;
      parts.push({ x, y, r: 8, t: 0, life: 20 });
    }

    function shootEnemy(e) {
      const t = e.type;
      const a = e.angle + rand(-t.spread, t.spread);
      bullets.push({ x: e.x + Math.cos(a) * 18, y: e.y + Math.sin(a) * 18, vx: Math.cos(a) * t.bulletSpeed, vy: Math.sin(a) * t.bulletSpeed, dmg: t.damage * e.dmgMult, friendly: false, life: 3, color: t.bulletColor, radius: t.bulletRadius, pierce: 0 });
    }

    function throwGrenade(e) {
      const dx = player.x - e.x, dy = player.y - e.y;
      const d = Math.hypot(dx, dy);
      grenades.push({ x: e.x, y: e.y, vx: dx / d * 300, vy: dy / d * 300, life: 1.5, dmg: e.type.grenadeDamage * e.dmgMult, radius: 130, friendly: false, t: 0 });
    }

    function damageEnemy(e, dmg, fromX, fromY, isExplosion) {
      let finalDmg = dmg;
      if (e.type.shield && !isExplosion && fromX !== undefined) {
        const toAttacker = Math.atan2(fromY - e.y, fromX - e.x);
        const facing = e.angle;
        const diff = Math.abs(normAng(toAttacker - (facing + Math.PI)));
        if (diff < e.type.shieldArc / 2) finalDmg *= (1 - e.type.shieldReduction);
      }
      e.hp -= finalDmg;
      e.hitFlash = 1;
      addDamageNumber(e.x, e.y - e.r - 4, finalDmg, '#ffffff', finalDmg > 60);
    }

    function updateEnemy(e, dt) {
      const t = e.type;
      const dx = player.x - e.x, dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;
      const los = hasLOS(e.x, e.y, player.x, player.y);

      e.hitFlash = Math.max(0, e.hitFlash - dt * 4);
      e.strafeTimer -= dt;
      if (e.strafeTimer <= 0) { e.strafe *= -1; e.strafeTimer = rand(0.7, 2.2); }

      if (e.isBoss) {
        const hpR = e.hp / e.maxHp;
        const newPhase = hpR > 0.6 ? 1 : hpR > 0.3 ? 2 : 3;
        if (newPhase !== e.phase) {
          e.phase = newPhase;
          addParticles(e.x, e.y, '#ff4477', 30, 400);
          screenFlash = { color: '255,80,80', alpha: 0.4, decay: 2 };
          shake = 18;
        }
      }

      if (t.healer) {
        e.healTimer -= dt;
        if (e.healTimer <= 0) {
          e.healTimer = t.healCd;
          for (const other of enemies) {
            if (other === e || other.hp >= other.maxHp) continue;
            if (Math.hypot(other.x - e.x, other.y - e.y) < t.healRange) {
              other.hp = Math.min(other.maxHp, other.hp + t.healAmount);
              addParticles(other.x, other.y, '#6ee06e', 8, 120);
            }
          }
        }
      }

      if (t.kamikaze && dist < e.r + player.r + 4) {
        explode(e.x, e.y, t.explodeRadius, t.explodeDamage * e.dmgMult, 'enemy', e);
        e.hp = 0;
        return;
      }

      const hpR = e.hp / e.maxHp;
      if (hpR < 0.5 && hpR > 0 && !e.isBoss) {
        e.trailTimer -= dt;
        if (e.trailTimer <= 0) {
          e.trailTimer = 0.35;
          addDecal(e.x + rand(-4, 4), e.y + rand(-4, 4), 6, 'rgba(140,20,20,0.5)', 'blood');
        }
      }

      let mx = 0, my = 0;
      const lowHp = hpR < 0.35;

      if (t.kamikaze) {
        mx = dx / dist; my = dy / dist;
      } else if (los && dist < 780) {
        if (lowHp && dist < t.retreatDist * 1.4) {
          mx = -dx / dist + (-dy / dist) * e.strafe * 0.6;
          my = -dy / dist + (dx / dist) * e.strafe * 0.6;
        } else if (dist < t.keepDist) {
          mx = -dx / dist; my = -dy / dist;
        } else {
          const sx = player.x + Math.cos(e.slotAngle) * t.preferredDist;
          const sy = player.y + Math.sin(e.slotAngle) * t.preferredDist;
          const sdx = sx - e.x, sdy = sy - e.y;
          const sd = Math.hypot(sdx, sdy) || 1;
          if (sd < 55) { mx = -dy / dist * e.strafe; my = dx / dist * e.strafe; }
          else if (!hasLOS(e.x, e.y, sx, sy)) { mx = dx / dist; my = dy / dist; }
          else { mx = sdx / sd; my = sdy / sd; }
        }
      } else {
        const f = getFlowDir(e.x, e.y);
        if (f.ok) { mx = f.x; my = f.y; }
        else { mx = dx / dist; my = dy / dist; }
      }

      if (!t.flyer) {
        for (let i = 0; i < bullets.length; i++) {
          const b = bullets[i];
          if (!b.friendly) continue;
          const bdx = e.x - b.x, bdy = e.y - b.y;
          if (bdx * bdx + bdy * bdy > 130 * 130) continue;
          const bs = Math.hypot(b.vx, b.vy) || 1;
          const bnx = b.vx / bs, bny = b.vy / bs;
          const dot = bdx * bnx + bdy * bny;
          if (dot < 0 || dot > 260) continue;
          const pX = bdx - dot * bnx, pY = bdy - dot * bny;
          const pd = Math.hypot(pX, pY);
          if (pd < e.r + 22) {
            const side = (pX * bny - pY * bnx) > 0 ? 1 : -1;
            mx += -bny * side * 1.6; my += bnx * side * 1.6;
          }
        }
      }

      const ml = Math.hypot(mx, my);
      if (ml > 0.001) { mx /= ml; my /= ml; }

      if (!t.flyer) {
        const la = e.r + 6;
        if (circleHitsWall(e.x + mx * la, e.y + my * la, e.r)) {
          const slides = [{ x: mx, y: 0 }, { x: 0, y: my }, { x: mx, y: my * 0.5 }, { x: mx * 0.5, y: my }];
          let found = false;
          for (const s of slides) {
            const l = Math.hypot(s.x, s.y) || 1;
            if (!circleHitsWall(e.x + (s.x / l) * la, e.y + (s.y / l) * la, e.r)) { mx = s.x / l; my = s.y / l; found = true; break; }
          }
          if (!found) { const a = Math.atan2(my, mx) + Math.PI / 2; mx = Math.cos(a); my = Math.sin(a); }
        }
      }

      const spd = e.isBoss ? e.speed * (e.phase === 3 ? 1.5 : e.phase === 2 ? 1.2 : 1) : e.speed;
      e.x += mx * spd * dt;
      e.y += my * spd * dt;
      if (!t.flyer) resolveWalls(e);

      const predX = player.x + player.vx * (dist / (t.bulletSpeed || 1)) * t.aimSkill;
      const predY = player.y + player.vy * (dist / (t.bulletSpeed || 1)) * t.aimSkill;
      e.angle = Math.atan2(predY - e.y, predX - e.x);

      e.cd -= dt;

      if (t.kamikaze) return;
      if (t.bomber) {
        if (los && dist < t.shootRange && e.cd <= 0) { e.cd = rand(t.cd[0], t.cd[1]); throwGrenade(e); }
        return;
      }
      if (e.isBoss) {
        if (los && dist < t.shootRange && e.cd <= 0) {
          e.cd = rand(t.cd[0], t.cd[1]) / (e.phase === 3 ? 1.6 : e.phase === 2 ? 1.2 : 1);
          const shots = e.phase === 1 ? 3 : e.phase === 2 ? 5 : 7;
          const baseAng = e.angle;
          for (let i = 0; i < shots; i++) {
            const a = baseAng + (i - (shots - 1) / 2) * 0.15 + rand(-0.03, 0.03);
            bullets.push({ x: e.x + Math.cos(a) * 30, y: e.y + Math.sin(a) * 30, vx: Math.cos(a) * t.bulletSpeed, vy: Math.sin(a) * t.bulletSpeed, dmg: t.damage * e.dmgMult, friendly: false, life: 4, color: t.bulletColor, radius: t.bulletRadius, pierce: 0 });
          }
          if (e.phase >= 2 && Math.random() < 0.3) {
            for (let k = 0; k < 2; k++) {
              const ang = rand(0, Math.PI * 2);
              const d = rand(150, 280);
              const mx2 = e.x + Math.cos(ang) * d, my2 = e.y + Math.sin(ang) * d;
              if (!circleHitsWall(mx2, my2, 16)) enemies.push(makeEnemy(mx2, my2, Math.random() < 0.5 ? 'grunt' : 'rusher'));
            }
          }
        }
        return;
      }
      if (los && dist < t.shootRange && e.cd <= 0) {
        e.cd = rand(t.cd[0], t.cd[1]);
        shootEnemy(e);
      }
    }

    /* ═══════════════ ВЗРЫВЫ ═══════════════ */
    function explode(x, y, radius, dmg, source, ignoreEntity) {
      addParticles(x, y, '#ffcc44', 24, 420);
      addParticles(x, y, '#ff8844', 16, 380);
      addParticles(x, y, '#ffffff', 10, 320);
      addDecal(x, y, radius * 0.4, 'rgba(20,10,5,0.7)', 'scorch');
      screenFlash = { color: '255,200,120', alpha: 0.35, decay: 3 };
      shake = Math.max(shake, 14);
      const aoeMult = player.classId === 'demolition' && source === 'player' ? 1.6 : 1;
      for (const e of enemies) {
        if (e === ignoreEntity) continue;
        if (Math.hypot(e.x - x, e.y - y) < radius + e.r) damageEnemy(e, dmg * aoeMult, x, y, true);
      }
      if (source !== 'player' && Math.hypot(player.x - x, player.y - y) < radius + player.r) {
        player.hp -= dmg * 0.6;
        shake = Math.max(shake, 16);
        screenFlash = { color: '255,80,80', alpha: 0.4, decay: 3 };
      }
      for (const b of barrels) {
        if (b.exploded) continue;
        if (Math.hypot(b.x - x, b.y - y) < radius * 1.2) {
          b.exploded = true;
          setTimeout(() => explode(b.x, b.y, 140, 60, 'barrel'), 80);
        }
      }
    }

    /* ═══════════════ ИГРОК ═══════════════ */
    function shootPlayer() {
      const w = WEAPONS[menu.weapon];
      const dmgMult = (player.buffs.damage > 0 ? 1.7 : 1) * (player.classId === 'sniper' ? 1.4 : 1);
      if (w.melee) {
        player.swingTime = 0.18;
        const hits = enemiesNear(player.x, player.y);
        for (const e of hits) {
          const dx = e.x - player.x, dy = e.y - player.y;
          const d = Math.hypot(dx, dy);
          if (d > w.range + e.r) continue;
          const a = Math.atan2(dy, dx);
          if (Math.abs(normAng(a - player.angle)) < w.arc / 2) {
            damageEnemy(e, w.damage * dmgMult, player.x, player.y, false);
            addParticles(e.x, e.y, '#ff5577', 8, 200);
          }
        }
        addParticles(player.x + Math.cos(player.angle) * 40, player.y + Math.sin(player.angle) * 40, '#ff5577', 10, 220);
        shake = Math.max(shake, 6);
        return;
      }
      const a0 = player.angle;
      for (let i = 0; i < w.count; i++) {
        const a = a0 + rand(-w.spread, w.spread);
        bullets.push({ x: player.x + Math.cos(a) * 20, y: player.y + Math.sin(a) * 20, vx: Math.cos(a) * w.speed, vy: Math.sin(a) * w.speed, dmg: w.damage * dmgMult, friendly: true, life: 2, color: w.color, radius: w.count > 1 ? 2.6 : 3.4, pierce: w.pierce || 0, hitIds: w.pierce ? [] : null });
      }
      addParticles(player.x + Math.cos(a0) * 22, player.y + Math.sin(a0) * 22, w.color, w.count > 1 ? 10 : 4, 140);
      shake = Math.max(shake, w.count > 1 ? 9 : w.damage >= 100 ? 12 : 3);
      chromaPulse = 1;
      if (w.kickback) { player.x -= Math.cos(a0) * w.kickback * 0.01; player.y -= Math.sin(a0) * w.kickback * 0.01; resolveWalls(player); }
      if (player.classId === 'sniper' && w.damage >= 100) hitStop = 0.05;
    }

    function startReload() {
      const w = WEAPONS[menu.weapon];
      if (w.melee) return;
      if (player.buffs.infinite > 0) return;
      if (player.ammo >= w.mag) return;
      player.reloading = w.reload * (player.buffs.reload > 0 ? 0.35 : 1);
    }

    function tryDash() {
      const w = WEAPONS[menu.weapon];
      if (!w.melee) return;
      if (player.dashCd > 0 || player.dashing) return;
      player.dashing = w.dashTime;
      player.dashCd = w.dashCd;
      player.dashVx = Math.cos(player.angle) * (w.dashDist / w.dashTime);
      player.dashVy = Math.sin(player.angle) * (w.dashDist / w.dashTime);
      player.dashHitSet = new Set();
      player.invuln = w.dashTime;
      addParticles(player.x, player.y, '#ff5577', 15, 260);
    }

    function tryParry() {
      const w = WEAPONS[menu.weapon];
      if (!w.melee) return;
      if (player.parryCd > 0) return;
      player.parrying = w.parryWindow;
      player.parryCd = w.parryCd;
    }

    function throwPlayerGrenade() {
      if (player.classId !== 'demolition') return;
      if (player.grenadeCd > 0 || player.grenadesLeft <= 0) return;
      player.grenadeCd = 0.8;
      player.grenadesLeft--;
      const a = player.angle;
      grenades.push({ x: player.x + Math.cos(a) * 20, y: player.y + Math.sin(a) * 20, vx: Math.cos(a) * 420, vy: Math.sin(a) * 420, life: 1.2, dmg: 40, radius: 150, friendly: true, t: 0 });
    }

    function placeTurret() {
      if (player.classId !== 'engineer') return;
      if (player.turretCd > 0 || turrets.length >= 3) return;
      player.turretCd = 4;
      const a = player.angle;
      const tx = player.x + Math.cos(a) * 40;
      const ty = player.y + Math.sin(a) * 40;
      if (circleHitsWall(tx, ty, 14)) return;
      turrets.push({ x: tx, y: ty, angle: a, cd: 0, hp: 80, maxHp: 80, target: null });
    }

    /* ═══════════════ ПУЛИ ═══════════════ */
    function updateBullets(dt) {
      const w0 = WEAPONS[menu.weapon];
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.life -= dt;
        if (b.life <= 0) { bullets.splice(i, 1); continue; }
        const speed = Math.hypot(b.vx, b.vy);
        const steps = Math.max(1, Math.ceil((speed * dt) / 10));
        let dead = false;
        for (let s = 0; s < steps && !dead; s++) {
          b.x += (b.vx * dt) / steps;
          b.y += (b.vy * dt) / steps;
          if (b.x < 0 || b.y < 0 || b.x > MAP_W || b.y > MAP_H) { dead = true; break; }

          // ── Katana LMB swing deflection ──
          if (!b.friendly && player.swingTime > 0 && w0.melee) {
            const dx = b.x - player.x, dy = b.y - player.y;
            const d = Math.hypot(dx, dy);
            if (d < w0.range + 12) {
              const a = Math.atan2(dy, dx);
              if (Math.abs(normAng(a - player.angle)) < w0.arc / 2) {
                b.friendly = true;
                b.vx = -b.vx * 1.15;
                b.vy = -b.vy * 1.15;
                b.color = '#ff5577';
                b.dmg *= 1.25;
                b.hitIds = [];
                addParticles(b.x, b.y, '#ff5577', 8, 240);
                chromaPulse = 0.5;
                continue;
              }
            }
          }

          // ── Katana RMB parry deflection ──
          if (!b.friendly && player.parrying > 0 && w0.melee) {
            const dx = b.x - player.x, dy = b.y - player.y;
            const d = Math.hypot(dx, dy);
            if (d < w0.reflectRange) {
              const a = Math.atan2(dy, dx);
              if (Math.abs(normAng(a - player.angle)) < w0.reflectArc / 2) {
                b.friendly = true;
                b.vx = -b.vx * 1.3;
                b.vy = -b.vy * 1.3;
                b.color = '#ff5577';
                b.dmg *= 1.5;
                b.hitIds = [];
                addParticles(b.x, b.y, '#ff5577', 10, 260);
                chromaPulse = 0.7;
                continue;
              }
            }
          }

          for (let wi = 0; wi < walls.length; wi++) {
            const w = walls[wi];
            if (b.x < w.x || b.x > w.x + w.w || b.y < w.y || b.y > w.y + w.h) continue;
            addParticles(b.x, b.y, b.color, 3, 100);
            addDecal(b.x, b.y, 4, 'rgba(0,0,0,0.7)', 'hole');
            dead = true; break;
          }
          if (dead) break;

          for (const br of barrels) {
            if (br.exploded) continue;
            if (Math.hypot(b.x - br.x, b.y - br.y) < br.r + b.radius) {
              br.hp -= b.dmg;
              if (br.hp <= 0) { br.exploded = true; explode(br.x, br.y, 150, 70, 'barrel'); }
              dead = true; break;
            }
          }
          if (dead) break;

          if (b.friendly) {
            const candidates = enemiesNear(b.x, b.y);
            for (let ei = 0; ei < candidates.length; ei++) {
              const e = candidates[ei];
              if (b.hitIds && b.hitIds.indexOf(e.id) >= 0) continue;
              const edx = e.x - b.x, edy = e.y - b.y;
              if (edx * edx + edy * edy < e.r * e.r) {
                damageEnemy(e, b.dmg, b.x - b.vx * 0.01, b.y - b.vy * 0.01, false);
                if (b.hitIds) b.hitIds.push(e.id);
                addParticles(b.x, b.y, '#ff7b7b', 6, 200);
                if (b.pierce > 0) { b.pierce--; b.dmg *= 0.75; }
                else { dead = true; break; }
              }
            }
          } else {
            if (Math.hypot(player.x - b.x, player.y - b.y) < player.r) {
              if (player.invuln > 0) { dead = true; continue; }
              player.hp -= b.dmg;
              addParticles(b.x, b.y, '#ffd166', 6, 200);
              shake = 8;
              screenFlash = { color: '255,60,60', alpha: 0.25, decay: 3 };
              dead = true;
            }
          }
        }
        if (dead) bullets.splice(i, 1);
      }
    }

    /* ═══════════════ ГРАНАТЫ ═══════════════ */
    function updateGrenades(dt) {
      for (let i = grenades.length - 1; i >= 0; i--) {
        const g = grenades[i];
        g.life -= dt; g.t += dt;
        g.x += g.vx * dt; g.y += g.vy * dt;
        g.vx *= 0.94; g.vy *= 0.94;
        if (circleHitsWall(g.x, g.y, 6) || g.life <= 0) {
          explode(g.x, g.y, g.radius, g.dmg, g.friendly ? 'player' : 'enemy');
          grenades.splice(i, 1);
        }
      }
    }

    /* ═══════════════ БАФФЫ ═══════════════ */
    function makePowerup(x, y, type) { return { x, y, r: 16, type, def: POWERUPS[type], t: Math.random() * Math.PI * 2, life: 40 }; }
    function spawnRandomPowerup() {
      for (let i = 0; i < 200; i++) {
        const x = rand(120, MAP_W - 120), y = rand(120, MAP_H - 120);
        if (circleHitsWall(x, y, 40)) continue;
        if (Math.hypot(x - player.x, y - player.y) < 260) continue;
        const r = Math.random();
        let type;
        if (r < 0.02) type = 'nuke';
        else if (r < 0.22) type = 'firerate';
        else if (r < 0.42) type = 'damage';
        else if (r < 0.60) type = 'reload';
        else if (r < 0.78) type = 'infinite';
        else type = 'health';
        powerupsOnMap.push(makePowerup(x, y, type));
        return;
      }
    }
    function tryDropPowerup(x, y) {
      if (Math.random() > 0.24) return;
      const r = Math.random();
      let type;
      if (r < 0.03) type = 'nuke';
      else if (r < 0.20) type = 'firerate';
      else if (r < 0.38) type = 'damage';
      else if (r < 0.55) type = 'reload';
      else if (r < 0.75) type = 'infinite';
      else type = 'health';
      powerupsOnMap.push(makePowerup(x, y, type));
    }
    function applyPowerup(p) {
      const def = p.def;
      if (p.type === 'nuke') { detonateNuke(); return; }
      if (p.type === 'health') {
        player.hp = Math.min(player.maxHp, player.hp + def.heal);
        addParticles(player.x, player.y, def.color, 22, 320);
        screenFlash = { color: def.rgb, alpha: 0.35, decay: 2.5 };
        shake = Math.max(shake, 5);
        return;
      }
      player.buffs[p.type] = def.duration;
      addParticles(player.x, player.y, def.color, 24, 340);
      screenFlash = { color: def.rgb, alpha: 0.45, decay: 2.5 };
      shake = Math.max(shake, 10);
    }
    function updatePowerups(dt) {
      for (let i = powerupsOnMap.length - 1; i >= 0; i--) {
        const p = powerupsOnMap[i];
        p.t += dt; p.life -= dt;
        if (p.life <= 0) { powerupsOnMap.splice(i, 1); continue; }
        const dx = p.x - player.x, dy = p.y - player.y;
        if (dx * dx + dy * dy < (player.r + p.r + 8) ** 2) { applyPowerup(p); powerupsOnMap.splice(i, 1); }
      }
      powerupSpawnTimer -= dt;
      if (powerupSpawnTimer <= 0 && powerupsOnMap.length < 7) { spawnRandomPowerup(); powerupSpawnTimer = rand(6, 11); }
    }

    function detonateNuke() {
      nukeEffect = { x: player.x, y: player.y, r: 0, maxR: Math.max(MAP_W, MAP_H) * 1.15, speed: 2600, hit: new Set() };
      screenFlash = { color: '255,255,255', alpha: 1, decay: 1.4 };
      shake = 40;
      addParticles(player.x, player.y, '#ffffff', 60, 550);
      addParticles(player.x, player.y, '#ffdd44', 40, 480);
    }

    /* ═══════════════ ЧАСТИ / ДРОН / ТУРЕЛИ ═══════════════ */
    function updateParts(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.t += dt; p.life -= dt;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const dx = p.x - player.x, dy = p.y - player.y;
        if (dx * dx + dy * dy < (player.r + p.r + 10) ** 2) {
          player.parts++;
          addParticles(p.x, p.y, '#55ddff', 10, 180);
          if (player.parts >= 5) {
            player.parts -= 5;
            if (drone) { drone.hp = Math.min(drone.maxHp, drone.hp + 40); }
            else { drone = { x: player.x, y: player.y, angle: 0, cd: 0, hp: 60, maxHp: 60 }; }
          }
          parts.splice(i, 1);
        }
      }
    }
    function updateDrone(dt) {
      if (!drone) return;
      const target = { x: player.x + Math.cos(player.angle + Math.PI) * 45, y: player.y + Math.sin(player.angle + Math.PI) * 45 };
      const dx = target.x - drone.x, dy = target.y - drone.y;
      drone.x += dx * 5 * dt; drone.y += dy * 5 * dt;
      let nearest = null, nd = 500;
      for (const e of enemies) {
        const d = Math.hypot(e.x - drone.x, e.y - drone.y);
        if (d < nd) { nd = d; nearest = e; }
      }
      if (nearest) {
        drone.angle = Math.atan2(nearest.y - drone.y, nearest.x - drone.x);
        drone.cd -= dt;
        if (drone.cd <= 0 && hasLOS(drone.x, drone.y, nearest.x, nearest.y)) {
          drone.cd = 0.35;
          const a = drone.angle + rand(-0.05, 0.05);
          bullets.push({ x: drone.x + Math.cos(a) * 12, y: drone.y + Math.sin(a) * 12, vx: Math.cos(a) * 900, vy: Math.sin(a) * 900, dmg: 12, friendly: true, life: 1.5, color: '#55ddff', radius: 2.5, pierce: 0, hitIds: null });
        }
      }
    }
    function updateTurrets(dt) {
      for (let i = turrets.length - 1; i >= 0; i--) {
        const t = turrets[i];
        if (t.hp <= 0) { addParticles(t.x, t.y, '#7ee787', 16, 260); turrets.splice(i, 1); continue; }
        let nearest = null, nd = 340;
        for (const e of enemies) {
          const d = Math.hypot(e.x - t.x, e.y - t.y);
          if (d < nd) { nd = d; nearest = e; }
        }
        if (nearest) {
          t.angle = Math.atan2(nearest.y - t.y, nearest.x - t.x);
          t.cd -= dt;
          if (t.cd <= 0 && hasLOS(t.x, t.y, nearest.x, nearest.y)) {
            t.cd = 0.24;
            const a = t.angle + rand(-0.06, 0.06);
            bullets.push({ x: t.x + Math.cos(a) * 14, y: t.y + Math.sin(a) * 14, vx: Math.cos(a) * 950, vy: Math.sin(a) * 950, dmg: 15, friendly: true, life: 1.5, color: '#7ee787', radius: 2.5, pierce: 0, hitIds: null });
          }
        }
      }
    }

    /* ═══════════════ ВОЛНЫ / БОССЫ ═══════════════ */
    function enemiesForWave(w) { return 4 + Math.floor(w * 1.6); }

    function startWave() {
      wave++;
      const isBoss = wave === nextBossWave;
      if (isBoss) {
        spawnBoss();
        const extra = 2 + Math.floor(wave / 5);
        for (let i = 0; i < extra; i++) spawnEnemy();
        nextBossWave += 10 + Math.floor(Math.random() * 6); // 10..15 waves
        screenFlash = { color: '255,80,80', alpha: 0.5, decay: 1.5 };
        shake = 22;
        waveState = 'fighting';
        spawnedInWave = 9999;
      } else {
        waveState = 'spawning';
        spawnedInWave = 0;
      }
      waveTimer = 0;
      spawnTimer = 0;
    }

    /* ═══════════════ ОБНОВЛЕНИЕ ═══════════════ */
    function update(dt) {
      if (hitStop > 0) { hitStop -= dt; dt *= 0.08; }
      if (chromaPulse > 0) chromaPulse = Math.max(0, chromaPulse - dt * 3.5);

      if (state !== 'play') {
        for (let i = particles.length - 1; i >= 0; i--) { const p = particles[i]; p.life -= dt; if (p.life <= 0) particles.splice(i, 1); }
        updateMenuParticles(dt);
        shake = Math.max(0, shake - dt * 30);
        if (screenFlash) { screenFlash.alpha -= dt * screenFlash.decay; if (screenFlash.alpha <= 0) screenFlash = null; }
        return;
      }

      gameTime += dt;
      shake = Math.max(0, shake - dt * 35);
      for (const k in player.buffs) if (player.buffs[k] > 0) player.buffs[k] = Math.max(0, player.buffs[k] - dt);
      if (player.dashCd > 0) player.dashCd -= dt;
      if (player.parryCd > 0) player.parryCd -= dt;
      if (player.invuln > 0) player.invuln -= dt;
      if (player.swingTime > 0) player.swingTime -= dt;
      if (player.parrying > 0) player.parrying -= dt;
      if (player.grenadeCd > 0) player.grenadeCd -= dt;
      if (player.turretCd > 0) player.turretCd -= dt;

      if (player.dashing > 0) {
        player.dashing -= dt;
        player.x += player.dashVx * dt;
        player.y += player.dashVy * dt;
        resolveWalls(player);
        for (const e of enemies) {
          if (player.dashHitSet.has(e.id)) continue;
          if (Math.hypot(e.x - player.x, e.y - player.y) < e.r + player.r + 20) {
            player.dashHitSet.add(e.id);
            damageEnemy(e, 60, player.x, player.y, false);
            addParticles(e.x, e.y, '#ff5577', 8, 220);
          }
        }
        addParticles(player.x, player.y, '#ff5577', 4, 100);
      } else {
        let ix = 0, iy = 0;
        if (keys['KeyW'] || keys['ArrowUp']) iy -= 1;
        if (keys['KeyS'] || keys['ArrowDown']) iy += 1;
        if (keys['KeyA'] || keys['ArrowLeft']) ix -= 1;
        if (keys['KeyD'] || keys['ArrowRight']) ix += 1;
        const len = Math.hypot(ix, iy);
        if (len > 0) {
          ix /= len; iy /= len;
          player.x += ix * player.speed * dt;
          player.y += iy * player.speed * dt;
          resolveWalls(player);
        }
        player.vx = ix * player.speed;
        player.vy = iy * player.speed;
      }

      const wmx = mouse.x + cam.x, wmy = mouse.y + cam.y;
      player.angle = Math.atan2(wmy - player.y, wmx - player.x);

      if (player.reloading > 0) {
        player.reloading -= dt;
        if (player.reloading <= 0) { player.reloading = 0; player.ammo = WEAPONS[menu.weapon].mag; }
      }

      player.cd -= dt;
      const w = WEAPONS[menu.weapon];
      const fireMult = player.buffs.firerate > 0 ? 0.5 : 1;
      const infinite = player.buffs.infinite > 0;

      if (!w.melee && !infinite && player.reloading <= 0 && player.ammo <= 0) startReload();
      if (mouse.down && player.cd <= 0 && player.reloading <= 0 && (w.melee || infinite || player.ammo > 0)) {
        player.cd = w.cd * fireMult;
        if (!w.melee && !infinite) player.ammo--;
        shootPlayer();
      }
      if (mouse.rdown && w.melee && player.parrying <= 0) tryParry();

      if (player.classId === 'medic') player.hp = Math.min(player.maxHp, player.hp + 3 * dt);

      flowTimer -= dt;
      const pCellX = Math.floor(player.x / GRID), pCellY = Math.floor(player.y / GRID);
      const pCell = pCellY * gridCols + pCellX;
      if (pCell !== lastFlowCell || flowTimer <= 0) {
        if (worker && workerReady) worker.postMessage({ type: 'compute', px: player.x, py: player.y, cell: pCell });
        else inlineBFS(player.x, player.y);
        lastFlowCell = pCell;
        flowTimer = 0.5;
      }

      rebuildSpatialHash();
      for (let i = 0; i < enemies.length; i++) updateEnemy(enemies[i], dt);

      for (let i = 0; i < enemies.length; i++) for (let j = i + 1; j < enemies.length; j++) {
        const a = enemies[i], b = enemies[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        const min = a.r + b.r;
        if (d2 < min * min && d2 > 0.0001) {
          const d = Math.sqrt(d2), push = (min - d) / 2;
          a.x -= (dx / d) * push; a.y -= (dy / d) * push;
          b.x += (dx / d) * push; b.y += (dy / d) * push;
        }
      }

      for (const e of enemies) {
        if (e.type.flyer) continue;
        const dx = player.x - e.x, dy = player.y - e.y;
        const d2 = dx * dx + dy * dy;
        const min = player.r + e.r;
        if (d2 < min * min && d2 > 0.0001) {
          const d = Math.sqrt(d2), push = min - d;
          player.x += (dx / d) * push; player.y += (dy / d) * push;
          resolveWalls(player);
        }
      }

      updateBullets(dt);
      updateGrenades(dt);
      updatePowerups(dt);
      updateParts(dt);
      updateDrone(dt);
      updateTurrets(dt);

      if (nukeEffect) {
        nukeEffect.r += nukeEffect.speed * dt;
        for (const e of enemies) {
          if (nukeEffect.hit.has(e.id)) continue;
          if (Math.hypot(e.x - nukeEffect.x, e.y - nukeEffect.y) <= nukeEffect.r) {
            nukeEffect.hit.add(e.id);
            e.hp = 0;
            addParticles(e.x, e.y, '#ffffff', 16, 400);
            addDecal(e.x, e.y, 22, 'rgba(20,10,5,0.7)', 'scorch');
          }
        }
        if (nukeEffect.r >= nukeEffect.maxR) nukeEffect = null;
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        if (enemies[i].hp <= 0) {
          const e = enemies[i];
          addParticles(e.x, e.y, e.type.bodyColor, e.isBoss ? 40 : 16, e.isBoss ? 500 : 280);
          addDecal(e.x, e.y, e.isBoss ? 40 : 16, 'rgba(120,20,20,0.5)', 'blood');
          spawnParts(e.x, e.y);
          tryDropPowerup(e.x, e.y);
          if (e.isBoss) { screenFlash = { color: '255,180,80', alpha: 0.6, decay: 1.2 }; shake = 30; }
          enemies.splice(i, 1);
          score += e.type.scoreValue || 1;
          shake = Math.max(shake, 5);
        }
      }

      /* ── wave logic ── */
      const diff = DIFFICULTIES[menu.diff];
      if (waveState === 'idle') {
        waveTimer -= dt;
        if (waveTimer <= 0) startWave();
      } else if (waveState === 'spawning') {
        const total = enemiesForWave(wave);
        spawnTimer -= dt;
        if (spawnedInWave < total && spawnTimer <= 0 && enemies.length < diff.max) {
          if (spawnEnemy()) spawnedInWave++;
          spawnTimer = 0.35 * diff.spawn;
        }
        if (spawnedInWave >= total) waveState = 'fighting';
      } else if (waveState === 'fighting') {
        if (enemies.length === 0) {
          waveState = 'idle';
          waveTimer = 3.5;
          score += 5;
          if (wave % 5 === 0) spawnRandomPowerup();
        }
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.94; p.vy *= 0.94;
      }
      for (let i = decals.length - 1; i >= 0; i--) { decals[i].life -= dt; if (decals[i].life <= 0) decals.splice(i, 1); }
      for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const d = damageNumbers[i];
        d.life -= dt;
        if (d.life <= 0) { damageNumbers.splice(i, 1); continue; }
        d.x += d.vx * dt; d.y += d.vy * dt; d.vy += 180 * dt;
      }
      if (screenFlash) { screenFlash.alpha -= dt * screenFlash.decay; if (screenFlash.alpha <= 0) screenFlash = null; }

      cam.x = clamp(player.x - W / 2, 0, Math.max(0, MAP_W - W));
      cam.y = clamp(player.y - H / 2, 0, Math.max(0, MAP_H - H));

      if (player.hp <= 0) {
        player.hp = 0;
        state = 'over';
        addParticles(player.x, player.y, '#ffd166', 30, 340);
        screenFlash = { color: '255,60,60', alpha: 0.6, decay: 1.6 };
        shake = 22;
      }
    }

    /* ═══════════════ ОТРИСОВКА ═══════════════ */
    function drawFighter(x, y, r, angle, bodyColor, gunColor, flash) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.beginPath(); ctx.arc(2, 3, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = flash > 0 ? '#ffffff' : bodyColor; ctx.fill();
      ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.stroke();
      ctx.fillStyle = gunColor; ctx.fillRect(r - 3, -4.5, 18, 9);
      ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(r - 3, -4.5, 18, 3);
      ctx.restore();
    }

    function drawPowerupIcon(type, x, y, s, color) {
      ctx.save(); ctx.translate(x, y);
      ctx.strokeStyle = color; ctx.fillStyle = color;
      ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      switch (type) {
        case 'firerate':
          ctx.beginPath(); ctx.moveTo(s*0.18,-s*0.9); ctx.lineTo(-s*0.38,s*0.05); ctx.lineTo(-s*0.05,s*0.05);
          ctx.lineTo(-s*0.18,s*0.9); ctx.lineTo(s*0.42,-s*0.1); ctx.lineTo(s*0.06,-s*0.1); ctx.closePath(); ctx.fill(); break;
        case 'damage':
          ctx.beginPath();
          for (let i = 0; i < 12; i++) { const a = -Math.PI/2 + i*Math.PI/6; const r = i%2===0 ? s*0.98 : s*0.4; const px = Math.cos(a)*r, py = Math.sin(a)*r; if (i===0) ctx.moveTo(px,py); else ctx.lineTo(px,py); }
          ctx.closePath(); ctx.fill(); break;
        case 'reload': {
          ctx.beginPath(); ctx.arc(0,0,s*0.72,-Math.PI*0.72,Math.PI*0.72); ctx.stroke();
          const ax=Math.cos(-Math.PI*0.72)*s*0.72, ay=Math.sin(-Math.PI*0.72)*s*0.72;
          ctx.beginPath(); ctx.moveTo(ax+s*0.3,ay-s*0.05); ctx.lineTo(ax-s*0.05,ay-s*0.4); ctx.lineTo(ax-s*0.1,ay+s*0.15); ctx.closePath(); ctx.fill(); break;
        }
        case 'infinite':
          ctx.beginPath(); ctx.arc(-s*0.4,0,s*0.42,0,Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.arc(s*0.4,0,s*0.42,0,Math.PI*2); ctx.stroke(); break;
        case 'health':
          ctx.beginPath();
          ctx.moveTo(-s*0.15, -s*0.7); ctx.lineTo(s*0.15, -s*0.7); ctx.lineTo(s*0.15, -s*0.15);
          ctx.lineTo(s*0.7, -s*0.15); ctx.lineTo(s*0.7, s*0.15); ctx.lineTo(s*0.15, s*0.15);
          ctx.lineTo(s*0.15, s*0.7); ctx.lineTo(-s*0.15, s*0.7); ctx.lineTo(-s*0.15, s*0.15);
          ctx.lineTo(-s*0.7, s*0.15); ctx.lineTo(-s*0.7, -s*0.15); ctx.lineTo(-s*0.15, -s*0.15);
          ctx.closePath(); ctx.fill(); break;
        case 'nuke':
          for (let i = 0; i < 3; i++) {
            const a0 = -Math.PI/2 + i*Math.PI*2/3 - Math.PI/6;
            const a1 = a0+Math.PI/3;
            ctx.beginPath(); ctx.arc(0,0,s*0.95,a0,a1); ctx.arc(0,0,s*0.35,a1,a0,true); ctx.closePath(); ctx.fill();
          }
          ctx.beginPath(); ctx.arc(0,0,s*0.22,0,Math.PI*2); ctx.fill(); break;
      }
      ctx.restore();
    }

    function renderGame() {
      ctx.fillStyle = '#06080c';
      ctx.fillRect(0, 0, W, H);
      const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
      const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
      ctx.save();
      ctx.translate(-cam.x + sx, -cam.y + sy);

      {
        const px = cam.x - sx, py = cam.y - sy;
        const ssx = Math.max(0, Math.floor(px) - 10), ssy = Math.max(0, Math.floor(py) - 10);
        const sex = Math.min(MAP_W, Math.ceil(px + W) + 10), sey = Math.min(MAP_H, Math.ceil(py + H) + 10);
        const sw = sex - ssx, sh = sey - ssy;
        if (sw > 0 && sh > 0) ctx.drawImage(staticCanvas, ssx, ssy, sw, sh, ssx, ssy, sw, sh);
      }

      for (const d of decals) {
        const a = clamp(d.life / d.maxLife, 0, 1) * (d.kind === 'hole' ? 0.9 : 0.75);
        ctx.globalAlpha = a;
        ctx.fillStyle = d.color;
        for (const c of d.circles) { ctx.beginPath(); ctx.arc(d.x + c.dx, d.y + c.dy, c.r, 0, Math.PI * 2); ctx.fill(); }
      }
      ctx.globalAlpha = 1;

      for (const br of barrels) {
        if (br.exploded) continue;
        ctx.save(); ctx.translate(br.x, br.y);
        ctx.beginPath(); ctx.arc(0, 0, br.r, 0, Math.PI * 2);
        ctx.fillStyle = '#c9782a'; ctx.fill();
        ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, br.r * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffb060'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 12px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, 0);
        ctx.restore();
      }

      for (const p of parts) {
        const bob = Math.sin(p.t * 4) * 3;
        const glow = getGlow('#55ddff', 14);
        ctx.globalAlpha = 0.6;
        ctx.drawImage(glow, p.x - glow.width / 2, p.y + bob - glow.height / 2);
        ctx.globalAlpha = 1;
        ctx.beginPath(); ctx.arc(p.x, p.y + bob, p.r, 0, Math.PI * 2);
        ctx.fillStyle = '#0a1418'; ctx.fill();
        ctx.strokeStyle = '#55ddff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#55ddff';
        ctx.beginPath(); ctx.arc(p.x, p.y + bob, p.r * 0.4, 0, Math.PI * 2); ctx.fill();
      }

      for (const p of powerupsOnMap) {
        if (p.x + 60 < cam.x || p.x - 60 > cam.x + W) continue;
        if (p.y + 60 < cam.y || p.y - 60 > cam.y + H) continue;
        const bob = Math.sin(p.t * 3) * 4;
        const pulse = 0.7 + Math.sin(p.t * 5) * 0.3;
        const glow = getGlow(p.def.color, 28);
        ctx.globalAlpha = 0.55 * pulse;
        ctx.drawImage(glow, p.x - glow.width / 2, p.y + bob - glow.height / 2);
        ctx.globalAlpha = 1;
        ctx.save(); ctx.translate(p.x, p.y + bob); ctx.rotate(p.t * 1.4);
        ctx.strokeStyle = p.def.color; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(0, 0, p.r + 4, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
        ctx.beginPath(); ctx.arc(p.x, p.y + bob, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10,14,20,0.92)'; ctx.fill();
        ctx.strokeStyle = p.def.color; ctx.lineWidth = 2.5; ctx.stroke();
        drawPowerupIcon(p.def.icon, p.x, p.y + bob, 10, p.def.color);
      }

      for (const t of turrets) {
        ctx.save(); ctx.translate(t.x, t.y); ctx.rotate(t.angle);
        ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#0a1a10'; ctx.fill();
        ctx.strokeStyle = '#7ee787'; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = '#7ee787'; ctx.fillRect(10, -3, 16, 6);
        ctx.restore();
        if (t.hp < t.maxHp) {
          ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(t.x - 18, t.y - 24, 36, 4);
          ctx.fillStyle = '#7ee787'; ctx.fillRect(t.x - 17, t.y - 23, 34 * (t.hp / t.maxHp), 2);
        }
      }

      for (const p of particles) {
        const a = clamp(p.life / p.maxLife, 0, 1);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const g of grenades) {
        ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.t * 12);
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fillStyle = g.friendly ? '#7ee787' : '#ff8844'; ctx.fill();
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      }

      for (const b of bullets) {
        if (b.x + 30 < cam.x || b.x - 30 > cam.x + W) continue;
        if (b.y + 30 < cam.y || b.y - 30 > cam.y + H) continue;
        const glow = getGlow(b.color, Math.ceil(b.radius) + 2);
        ctx.globalAlpha = 0.85;
        ctx.drawImage(glow, b.x - glow.width / 2, b.y - glow.height / 2);
        ctx.globalAlpha = 1;
        ctx.fillStyle = b.color;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.beginPath(); ctx.arc(b.x, b.y, b.radius * 0.4, 0, Math.PI * 2); ctx.fill();
      }

      for (const e of enemies) {
        if (e.x + 60 < cam.x || e.x - 60 > cam.x + W) continue;
        if (e.y + 60 < cam.y || e.y - 60 > cam.y + H) continue;
        if (e.isBoss) {
          const glow = getGlow('#ff4477', 60);
          ctx.globalAlpha = 0.4 + Math.sin(performance.now() / 200) * 0.15;
          ctx.drawImage(glow, e.x - glow.width / 2, e.y - glow.height / 2);
          ctx.globalAlpha = 1;
        }
        drawFighter(e.x, e.y, e.r, e.angle, e.type.bodyColor, e.type.gunColor, e.hitFlash);
        if (e.type.shield) {
          ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.angle);
          ctx.strokeStyle = 'rgba(160,200,240,0.85)'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(0, 0, e.r + 8, e.type.shieldArc / 2 * -1, e.type.shieldArc / 2); ctx.stroke();
          ctx.restore();
        }
        if (e.type.flyer) {
          ctx.strokeStyle = 'rgba(93,224,208,0.6)'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(e.x, e.y + e.r + 10, e.r * 0.6, 0, Math.PI * 2); ctx.stroke();
        }
        if (e.hp < e.maxHp && !e.isBoss) {
          const bw = 36;
          ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(e.x - bw / 2, e.y - 28, bw, 5);
          ctx.fillStyle = e.type.bodyColor; ctx.fillRect(e.x - bw / 2 + 1, e.y - 27, (bw - 2) * (e.hp / e.maxHp), 3);
        }
      }

      if (state === 'play' || state === 'over') {
        if (player.dashing > 0) {
          ctx.globalAlpha = 0.4;
          const glow = getGlow('#ff5577', 30);
          ctx.drawImage(glow, player.x - glow.width / 2, player.y - glow.height / 2);
          ctx.globalAlpha = 1;
        }
        drawFighter(player.x, player.y, player.r, player.angle, '#4fc3f7', '#bfe9ff', 0);

        if (player.swingTime > 0 && WEAPONS[menu.weapon].melee) {
          const w = WEAPONS[menu.weapon];
          const t = 1 - player.swingTime / 0.18;
          ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
          ctx.globalAlpha = 1 - t;
          ctx.strokeStyle = '#ff5577'; ctx.lineWidth = 6;
          ctx.beginPath(); ctx.arc(0, 0, w.range * 0.85, -w.arc / 2, w.arc / 2); ctx.stroke();
          ctx.restore();
        }
        if (player.parrying > 0 && WEAPONS[menu.weapon].melee) {
          const w = WEAPONS[menu.weapon];
          ctx.save(); ctx.translate(player.x, player.y); ctx.rotate(player.angle);
          ctx.globalAlpha = 0.75;
          ctx.strokeStyle = '#ff5577'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(0, 0, w.reflectRange * 0.7, -w.reflectArc / 2, w.reflectArc / 2); ctx.stroke();
          ctx.restore(); ctx.globalAlpha = 1;
        }

        if (WEAPONS[menu.weapon].melee) {
          const w = WEAPONS[menu.weapon];
          ctx.save();
          ctx.translate(player.x - 30, player.y + 30);
          const dashR = player.dashCd > 0 ? 1 - player.dashCd / w.dashCd : 1;
          const parryR = player.parryCd > 0 ? 1 - player.parryCd / w.parryCd : 1;
          ctx.strokeStyle = dashR >= 1 ? '#55ff88' : '#666'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(-10, 0, 6, -Math.PI / 2, -Math.PI / 2 + dashR * Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = parryR >= 1 ? '#ff5577' : '#666';
          ctx.beginPath(); ctx.arc(10, 0, 6, -Math.PI / 2, -Math.PI / 2 + parryR * Math.PI * 2); ctx.stroke();
          ctx.restore();
        }

        ctx.save();
        ctx.globalAlpha = 0.14;
        ctx.strokeStyle = WEAPONS[menu.weapon].color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(player.x + Math.cos(player.angle) * 340, player.y + Math.sin(player.angle) * 340);
        ctx.stroke();
        ctx.restore();

        if (drone) {
          ctx.save(); ctx.translate(drone.x, drone.y); ctx.rotate(drone.angle);
          ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fillStyle = '#0a1420'; ctx.fill();
          ctx.strokeStyle = '#55ddff'; ctx.lineWidth = 2; ctx.stroke();
          ctx.fillStyle = '#55ddff'; ctx.fillRect(6, -2, 10, 4);
          ctx.restore();
          const glow = getGlow('#55ddff', 14);
          ctx.globalAlpha = 0.5;
          ctx.drawImage(glow, drone.x - glow.width / 2, drone.y - glow.height / 2);
          ctx.globalAlpha = 1;
        }

        if (nukeEffect) {
          const { x, y, r } = nukeEffect;
          const alpha = Math.max(0, 1 - r / nukeEffect.maxR);
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = `rgba(255,220,120,${alpha * 0.9})`; ctx.lineWidth = 10;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.lineWidth = 3.5;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
          ctx.restore();
        }
      }

      for (const d of damageNumbers) {
        const a = clamp(d.life / d.maxLife, 0, 1);
        ctx.globalAlpha = a;
        ctx.font = `bold ${d.size}px system-ui, sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.85)';
        ctx.strokeText(d.text, d.x, d.y);
        ctx.fillStyle = d.color; ctx.fillText(d.text, d.x, d.y);
      }
      ctx.globalAlpha = 1;

      const darkness = ctx.createRadialGradient(player.x, player.y, 60, player.x, player.y, 520);
      darkness.addColorStop(0, 'rgba(0,0,0,0)');
      darkness.addColorStop(0.5, 'rgba(0,0,0,0.35)');
      darkness.addColorStop(1, 'rgba(0,0,0,0.92)');
      ctx.fillStyle = darkness;
      ctx.fillRect(cam.x - 40, cam.y - 40, W + 80, H + 80);

      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (chromaPulse > 0.05) {
        const glow = getGlow(WEAPONS[menu.weapon].color, 60);
        ctx.globalAlpha = 0.5 * chromaPulse;
        ctx.drawImage(glow, player.x + Math.cos(player.angle) * 30 - glow.width / 2, player.y + Math.sin(player.angle) * 30 - glow.height / 2);
      }
      for (const b of bullets) {
        if (!b.friendly) continue;
        const glow = getGlow(b.color, 22);
        ctx.globalAlpha = 0.35;
        ctx.drawImage(glow, b.x - glow.width / 2, b.y - glow.height / 2);
      }
      for (const br of barrels) {
        if (br.exploded) continue;
        const glow = getGlow('#ff9c54', 30);
        ctx.globalAlpha = 0.15;
        ctx.drawImage(glow, br.x - glow.width / 2, br.y - glow.height / 2);
      }
      ctx.restore();
      ctx.globalAlpha = 1;

      ctx.restore();

      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.98);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,0,0.65)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      if (chromaPulse > 0.1) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = chromaPulse * 0.15;
        const grd1 = ctx.createLinearGradient(0, 0, 0, H);
        grd1.addColorStop(0, 'rgba(255,0,80,0)');
        grd1.addColorStop(0.15, 'rgba(255,0,80,1)');
        grd1.addColorStop(0.85, 'rgba(0,80,255,1)');
        grd1.addColorStop(1, 'rgba(0,80,255,0)');
        ctx.fillStyle = grd1;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      if (screenFlash) {
        ctx.fillStyle = `rgba(${screenFlash.color},${clamp(screenFlash.alpha, 0, 1)})`;
        ctx.fillRect(0, 0, W, H);
      }

      drawHUD();
      drawMinimap();
      drawCrosshair();
      if (state === 'over') drawGameOver();
    }

    function drawHUD() {
      ctx.fillStyle = 'rgba(10,13,18,.78)';
      ctx.fillRect(14, 14, 280, 68);
      ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
      ctx.strokeRect(14.5, 14.5, 279, 67);
      const hpc = player.hp / player.maxHp;
      ctx.fillStyle = 'rgba(255,255,255,.10)'; ctx.fillRect(28, 30, 252, 16);
      ctx.fillStyle = hpc > 0.55 ? '#57d97e' : hpc > 0.25 ? '#e8c34a' : '#e35d5d';
      ctx.fillRect(28, 30, 252 * Math.max(0, hpc), 16);
      ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.strokeRect(28.5, 30.5, 251, 15);
      ctx.font = 'bold 12px system-ui, sans-serif'; ctx.fillStyle = '#0b0e13';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('HP ' + Math.ceil(player.hp), 34, 39);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '12px system-ui, sans-serif';
      ctx.fillText('ОЧКИ: ' + score, 28, 62);
      ctx.fillStyle = 'rgba(255,255,255,.45)';
      ctx.fillText('Волна: ' + wave, 300, 30);
      ctx.fillStyle = DIFFICULTIES[menu.diff].color;
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText(DIFFICULTIES[menu.diff].name, 300, 52);

      if (waveState === 'idle' && waveTimer > 0) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.fillText('ВОЛНА ' + (wave + 1) + ' ЧЕРЕЗ ' + Math.ceil(waveTimer), W / 2, 60);
      }

      const boss = enemies.find((e) => e.isBoss);
      if (boss) {
        const bw = 600, bh = 18;
        const bx = W / 2 - bw / 2, by = 90;
        ctx.fillStyle = 'rgba(0,0,0,.7)'; ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = '#ff4477'; ctx.fillRect(bx + 1, by + 1, (bw - 2) * Math.max(0, boss.hp / boss.maxHp), bh - 2);
        ctx.strokeStyle = '#ff4477'; ctx.lineWidth = 2; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, bh - 1);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('БОСС · ФАЗА ' + boss.phase, W / 2, by + bh / 2);
      }

      const w = WEAPONS[menu.weapon];
      const infinite = player.buffs.infinite > 0;
      const panelW = 300, panelH = 78;
      const px = W / 2 - panelW / 2, py = H - panelH - 14;
      ctx.fillStyle = 'rgba(10,13,18,.82)';
      ctx.fillRect(px, py, panelW, panelH);
      ctx.strokeStyle = w.color; ctx.lineWidth = 2;
      ctx.strokeRect(px + 0.5, py + 0.5, panelW - 1, panelH - 1);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillStyle = w.color; ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(w.name, px + panelW / 2, py + 8);
      if (w.melee) {
        ctx.fillStyle = '#fff'; ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.fillText('∞ / ∞', px + panelW / 2, py + 30);
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = 'bold 10px system-ui, sans-serif';
        ctx.fillText('SHIFT — рывок  •  ПКМ — парирование', px + panelW / 2, py + 58);
      } else if (infinite) {
        ctx.fillStyle = '#88ff88'; ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.fillText('∞', px + panelW / 2, py + 28);
        ctx.fillStyle = 'rgba(136,255,136,.7)'; ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('БЕСКОНЕЧНО', px + panelW / 2, py + 60);
      } else {
        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 26px system-ui, sans-serif';
        ctx.fillText(player.ammo + ' / ' + w.mag, px + panelW / 2, py + 28);
        if (player.reloading > 0) {
          const rp = 1 - player.reloading / (w.reload * (player.buffs.reload > 0 ? 0.35 : 1));
          ctx.fillStyle = 'rgba(255,255,255,.15)'; ctx.fillRect(px + 30, py + 62, panelW - 60, 6);
          ctx.fillStyle = w.color; ctx.fillRect(px + 30, py + 62, (panelW - 60) * rp, 6);
        }
      }

      const cls = CLASSES[menu.cls];
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillStyle = cls.color;
      ctx.fillText(cls.name, 20, H - 40);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '10px system-ui, sans-serif';
      if (player.classId === 'engineer') ctx.fillText('F — поставить турель (' + turrets.length + '/3)', 20, H - 24);
      else if (player.classId === 'demolition') ctx.fillText('G — граната (' + player.grenadesLeft + ')', 20, H - 24);
      else if (player.classId === 'medic') ctx.fillText('+3 HP/сек', 20, H - 24);
      else if (player.classId === 'sniper') ctx.fillText('+40% урона', 20, H - 24);
      else if (player.classId === 'assault') ctx.fillText('+30 HP · +15% скорость', 20, H - 24);

      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom';
      if (player.parts > 0) {
        ctx.fillStyle = '#55ddff'; ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('ДЕТАЛИ: ' + player.parts + '/5', W - 20, H - 24);
      }
      if (drone) {
        ctx.fillStyle = '#55ddff'; ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.fillText('ДРОН: ' + Math.ceil(drone.hp) + ' HP', W - 20, H - 40);
      }

      const buffs = ['firerate', 'damage', 'reload', 'infinite'];
      const active = buffs.filter((k) => player.buffs[k] > 0);
      if (active.length > 0) {
        const bs = 52, bg = 8;
        const tw = active.length * bs + (active.length - 1) * bg;
        const bx0 = W / 2 - tw / 2, by0 = py - 68;
        for (let i = 0; i < active.length; i++) {
          const k = active[i], def = POWERUPS[k];
          const bx = bx0 + i * (bs + bg);
          ctx.fillStyle = 'rgba(10,14,20,.85)'; ctx.fillRect(bx, by0, bs, bs);
          ctx.strokeStyle = def.color; ctx.lineWidth = 2; ctx.strokeRect(bx + 1, by0 + 1, bs - 2, bs - 2);
          drawPowerupIcon(def.icon, bx + bs / 2, by0 + 20, 10, def.color);
          const frac = player.buffs[k] / def.duration;
          ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.fillRect(bx + 6, by0 + bs - 12, bs - 12, 5);
          ctx.fillStyle = def.color; ctx.fillRect(bx + 6, by0 + bs - 12, (bs - 12) * frac, 5);
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = 'bold 10px system-ui, sans-serif';
          ctx.fillText(player.buffs[k].toFixed(1), bx + bs / 2, by0 + bs - 22);
        }
      }

      if (player.hp / player.maxHp < 0.35 && state === 'play') {
        const pulse = 0.18 + Math.sin(performance.now() / 160) * 0.1;
        const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.75);
        g.addColorStop(0, 'rgba(255,0,0,0)');
        g.addColorStop(1, 'rgba(255,0,0,' + pulse.toFixed(3) + ')');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      }
    }

    function drawMinimap() {
      const mw = 210, mh = 160;
      const mx = W - mw - 20, my = 20;
      ctx.fillStyle = 'rgba(10,13,18,.78)'; ctx.fillRect(mx, my, mw, mh);
      ctx.strokeStyle = 'rgba(255,255,255,.15)'; ctx.lineWidth = 1;
      ctx.strokeRect(mx + 0.5, my + 0.5, mw - 1, mh - 1);
      const scale = Math.min(mw / MAP_W, mh / MAP_H) * 0.92;
      const ox = mx + (mw - MAP_W * scale) / 2;
      const oy = my + (mh - MAP_H * scale) / 2;
      ctx.fillStyle = 'rgba(255,255,255,.14)';
      for (const w of walls) ctx.fillRect(ox + w.x * scale, oy + w.y * scale, Math.max(1, w.w * scale), Math.max(1, w.h * scale));
      for (const p of powerupsOnMap) {
        ctx.fillStyle = p.def.color;
        ctx.beginPath(); ctx.arc(ox + p.x * scale, oy + p.y * scale, 2.6, 0, Math.PI * 2); ctx.fill();
      }
      for (const e of enemies) {
        const dist = Math.hypot(e.x - player.x, e.y - player.y);
        const visible = player.classId === 'sniper' || dist < 900;
        if (!visible) continue;
        ctx.fillStyle = e.isBoss ? '#ff4477' : e.type.bodyColor;
        ctx.beginPath(); ctx.arc(ox + e.x * scale, oy + e.y * scale, e.isBoss ? 4 : 2, 0, Math.PI * 2); ctx.fill();
      }
      for (const br of barrels) {
        if (br.exploded) continue;
        ctx.fillStyle = '#ff9c54';
        ctx.beginPath(); ctx.arc(ox + br.x * scale, oy + br.y * scale, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#4fc3f7';
      ctx.beginPath(); ctx.arc(ox + player.x * scale, oy + player.y * scale, 3.6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.35)';
      ctx.strokeRect(ox + cam.x * scale, oy + cam.y * scale, W * scale, H * scale);
    }

    function drawCrosshair() {
      const x = mouse.x, y = mouse.y;
      const col = WEAPONS[menu.weapon].color;
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x - 15, y); ctx.lineTo(x - 5, y);
      ctx.moveTo(x + 5, y); ctx.lineTo(x + 15, y);
      ctx.moveTo(x, y - 15); ctx.lineTo(x, y - 5);
      ctx.moveTo(x, y + 5); ctx.lineTo(x, y + 15);
      ctx.stroke();
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    function drawGameOver() {
      ctx.fillStyle = 'rgba(5,7,10,.82)';
      ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.save();
      ctx.shadowBlur = 30; ctx.shadowColor = '#e35d5d';
      ctx.fillStyle = '#e35d5d'; ctx.font = 'bold 62px system-ui, sans-serif';
      ctx.fillText('ТЫ ПОГИБ', W / 2, H / 2 - 140);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '14px system-ui, sans-serif';
      ctx.fillText('СЛОЖНОСТЬ: ' + DIFFICULTIES[menu.diff].name + '  •  КЛАСС: ' + CLASSES[menu.cls].name, W / 2, H / 2 - 90);
      ctx.fillText('БИОМ: ' + BIOMES[menu.biome].name + '  •  ОРУЖИЕ: ' + WEAPONS[menu.weapon].name, W / 2, H / 2 - 66);
      ctx.fillStyle = '#ffffff'; ctx.font = 'bold 42px system-ui, sans-serif';
      ctx.fillText('ОЧКИ: ' + score, W / 2, H / 2 - 10);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = 'bold 20px system-ui, sans-serif';
      ctx.fillText('ВОЛН ПРОЙДЕНО: ' + Math.max(0, wave - 1), W / 2, H / 2 + 40);
      ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.font = '16px system-ui, sans-serif';
      ctx.fillText('Продержался: ' + gameTime.toFixed(1) + ' сек', W / 2, H / 2 + 72);

      const bW = 260, bH = 60, gap = 24;
      const bx1 = W / 2 - bW - gap / 2, bx2 = W / 2 + gap / 2;
      const by = H / 2 + 130;
      const hov1 = pointInRect(mouse.x, mouse.y, { x: bx1, y: by, w: bW, h: bH });
      const hov2 = pointInRect(mouse.x, mouse.y, { x: bx2, y: by, w: bW, h: bH });
      ctx.fillStyle = hov1 ? 'rgba(79,195,247,.2)' : 'rgba(79,195,247,.08)';
      ctx.fillRect(bx1, by, bW, bH);
      ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 2; ctx.strokeRect(bx1 + 0.5, by + 0.5, bW - 1, bH - 1);
      ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 18px system-ui, sans-serif';
      ctx.fillText('ЗАНОВО (R)', bx1 + bW / 2, by + bH / 2);
      ctx.fillStyle = hov2 ? 'rgba(255,255,255,.15)' : 'rgba(255,255,255,.05)';
      ctx.fillRect(bx2, by, bW, bH);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.strokeRect(bx2 + 0.5, by + 0.5, bW - 1, bH - 1);
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      ctx.fillText('В МЕНЮ (M)', bx2 + bW / 2, by + bH / 2);
      gameOverButtons.retry = { x: bx1, y: by, w: bW, h: bH };
      gameOverButtons.menu = { x: bx2, y: by, w: bW, h: bH };
    }

    /* ═══════════════ МЕНЮ ═══════════════ */
    function initMenuParticles() {
      menuParticles = [];
      for (let i = 0; i < 60; i++) {
        menuParticles.push({ x: Math.random() * W, y: Math.random() * H, r: rand(0.6, 2.2), vx: rand(-12, 12), vy: rand(-22, -6), alpha: rand(0.15, 0.55), color: Math.random() < 0.5 ? '#4fc3f7' : '#c58fff' });
      }
    }
    function updateMenuParticles(dt) {
      if (!menuParticles) return;
      for (const p of menuParticles) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      }
    }

    function layoutMenu() {
      const cx = W / 2;
      const wW = 190, wH = 210, wGap = 14;
      const wTotal = 5 * wW + 4 * wGap;
      const wStart = cx - wTotal / 2;
      const wY = 165;
      menuButtons.weapons = [];
      for (let i = 0; i < 5; i++) menuButtons.weapons.push({ x: wStart + i * (wW + wGap), y: wY, w: wW, h: wH });
      const cW = 190, cH = 60, cGap = 14;
      const cTotal = 5 * cW + 4 * cGap;
      const cStart = cx - cTotal / 2;
      const cY = wY + wH + 30;
      menuButtons.classes = [];
      for (let i = 0; i < 5; i++) menuButtons.classes.push({ x: cStart + i * (cW + cGap), y: cY, w: cW, h: cH });
      const dW = 220, dH = 58, dGap = 18;
      const dTotal = 3 * dW + 2 * dGap;
      const dStart = cx - dTotal / 2;
      const dY = cY + cH + 26;
      menuButtons.difficulties = [];
      for (let i = 0; i < 3; i++) menuButtons.difficulties.push({ x: dStart + i * (dW + dGap), y: dY, w: dW, h: dH });
      const bW = 190, bH = 54, bGap = 14;
      const bTotal = 4 * bW + 3 * bGap;
      const bStart = cx - bTotal / 2;
      const bY = dY + dH + 22;
      menuButtons.biomes = [];
      for (let i = 0; i < 4; i++) menuButtons.biomes.push({ x: bStart + i * (bW + bGap), y: bY, w: bW, h: bH });
      const sW = 340, sH = 66;
      menuButtons.start = { x: cx - sW / 2, y: bY + bH + 20, w: sW, h: sH };
    }

    function drawMenu() {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#0c111c'); g.addColorStop(0.5, '#0a0e16'); g.addColorStop(1, '#050710');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const t = performance.now() / 1000;
      const gs = 60, off = (t * 14) % gs;
      ctx.strokeStyle = 'rgba(79,195,247,.055)'; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = -off; x < W + gs; x += gs) { ctx.moveTo(x, 0); ctx.lineTo(x, H); }
      for (let y = -off; y < H + gs; y += gs) { ctx.moveTo(0, y); ctx.lineTo(W, y); }
      ctx.stroke();
      if (menuParticles) for (const p of menuParticles) { ctx.globalAlpha = p.alpha; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;

      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.save(); ctx.shadowBlur = 40; ctx.shadowColor = '#4fc3f7';
      ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 62px system-ui, sans-serif';
      ctx.fillText('АРЕНА', W / 2, 62);
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillText('T O P - D O W N   S H O O T E R   ·   v 2.1', W / 2, 108);

      const hx = mouse.x, hy = mouse.y;

      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('ОРУЖИЕ', menuButtons.weapons[0].x, menuButtons.weapons[0].y - 8);
      for (let i = 0; i < 5; i++) {
        const r = menuButtons.weapons[i], w = WEAPONS[i];
        const sel = menu.weapon === i, hov = pointInRect(hx, hy, r);
        ctx.fillStyle = sel ? 'rgba(79,195,247,.08)' : hov ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.02)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        if (sel) {
          ctx.save(); ctx.shadowBlur = 20; ctx.shadowColor = w.color;
          ctx.strokeStyle = w.color; ctx.lineWidth = 2.5; ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
          ctx.restore();
        } else {
          ctx.strokeStyle = hov ? 'rgba(255,255,255,.22)' : 'rgba(255,255,255,.08)'; ctx.lineWidth = 1.5;
          ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        }
        ctx.save(); ctx.translate(r.x + r.w / 2, r.y + 45);
        ctx.fillStyle = sel ? w.color : 'rgba(255,255,255,.7)';
        if (w.melee) {
          ctx.rotate(-0.3);
          ctx.fillRect(-50, -2, 100, 4);
          ctx.fillRect(-60, -6, 14, 12);
        } else {
          ctx.fillRect(-40, -5, 70, 10);
          ctx.fillRect(-42, -3, 6, 16);
          ctx.fillRect(20, -8, 12, 16);
          ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-40, 0, 70, 5);
        }
        ctx.restore();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = sel ? w.color : '#fff'; ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(w.name, r.x + r.w / 2, r.y + 92);
        ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = 'bold 9px system-ui, sans-serif';
        ctx.fillText(w.tag, r.x + r.w / 2, r.y + 110);
        const statY = r.y + 132;
        const statLabels = [['УРОН', w.stats.dmg], ['ТЕМП', w.stats.rate], ['МАГ', w.stats.mag]];
        for (let s = 0; s < 3; s++) {
          const sy = statY + s * 18;
          ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = '8px system-ui, sans-serif';
          ctx.fillText(statLabels[s][0], r.x + 12, sy);
          const barX = r.x + 58, barW = r.w - 70, barH = 5;
          ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(barX, sy - barH / 2, barW, barH);
          ctx.fillStyle = sel ? w.color : 'rgba(255,255,255,.4)';
          ctx.fillRect(barX, sy - barH / 2, barW * statLabels[s][1], barH);
        }
      }

      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('КЛАСС', menuButtons.classes[0].x, menuButtons.classes[0].y - 8);
      for (let i = 0; i < 5; i++) {
        const r = menuButtons.classes[i], c = CLASSES[i];
        const sel = menu.cls === i, hov = pointInRect(hx, hy, r);
        ctx.fillStyle = sel ? `rgba(${hexToRgb(c.color)},0.18)` : hov ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.02)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = sel ? c.color : hov ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.08)';
        ctx.lineWidth = sel ? 2.5 : 1.5;
        ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = sel ? c.color : '#fff'; ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(c.name, r.x + r.w / 2, r.y + 20);
        ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(c.desc, r.x + r.w / 2, r.y + 42);
      }

      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('СЛОЖНОСТЬ', menuButtons.difficulties[0].x, menuButtons.difficulties[0].y - 8);
      for (let i = 0; i < 3; i++) {
        const r = menuButtons.difficulties[i], d = DIFFICULTIES[i];
        const sel = menu.diff === i, hov = pointInRect(hx, hy, r);
        ctx.fillStyle = sel ? `rgba(${hexToRgb(d.color)},0.18)` : hov ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.02)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = sel ? d.color : hov ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)';
        ctx.lineWidth = sel ? 2.5 : 1.5;
        ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = sel ? d.color : '#fff'; ctx.font = 'bold 18px system-ui, sans-serif';
        ctx.fillText(d.name, r.x + r.w / 2, r.y + 18);
        ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = '10px system-ui, sans-serif';
        ctx.fillText(d.desc, r.x + r.w / 2, r.y + 40);
      }

      ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillText('БИОМ', menuButtons.biomes[0].x, menuButtons.biomes[0].y - 8);
      for (let i = 0; i < 4; i++) {
        const r = menuButtons.biomes[i], b = BIOMES[i];
        const sel = menu.biome === i, hov = pointInRect(hx, hy, r);
        ctx.fillStyle = sel ? `rgba(${hexToRgb(b.accent)},0.18)` : hov ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.02)';
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeStyle = sel ? b.accent : hov ? 'rgba(255,255,255,.25)' : 'rgba(255,255,255,.1)';
        ctx.lineWidth = sel ? 2.5 : 1.5;
        ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
        ctx.fillStyle = b.wall; ctx.fillRect(r.x + 8, r.y + 8, 32, r.h - 16);
        ctx.fillStyle = b.accent; ctx.fillRect(r.x + 10, r.y + 10, 4, r.h - 20);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = sel ? b.accent : '#fff'; ctx.font = 'bold 12px system-ui, sans-serif';
        ctx.fillText(b.name, r.x + 52, r.y + r.h / 2);
      }

      const br = menuButtons.start;
      const bhov = pointInRect(hx, hy, br);
      const pulse = 0.6 + Math.sin(t * 3) * 0.4;
      ctx.save(); ctx.shadowBlur = bhov ? 40 : 25;
      ctx.shadowColor = `rgba(79,195,247,${0.6 + pulse * 0.4})`;
      ctx.fillStyle = bhov ? 'rgba(79,195,247,.28)' : 'rgba(79,195,247,.15)';
      ctx.fillRect(br.x, br.y, br.w, br.h);
      ctx.restore();
      ctx.strokeStyle = '#4fc3f7'; ctx.lineWidth = 3;
      ctx.strokeRect(br.x + 1.5, br.y + 1.5, br.w - 3, br.h - 3);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#4fc3f7'; ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('НАЧАТЬ ИГРУ', br.x + br.w / 2, br.y + br.h / 2);
    }

    /* ═══════════════ УПРАВЛЕНИЕ ═══════════════ */
    function handleMenuClick(x, y) {
      for (let i = 0; i < 5; i++) if (pointInRect(x, y, menuButtons.weapons[i])) { menu.weapon = i; return; }
      for (let i = 0; i < 5; i++) if (pointInRect(x, y, menuButtons.classes[i])) { menu.cls = i; return; }
      for (let i = 0; i < 3; i++) if (pointInRect(x, y, menuButtons.difficulties[i])) { menu.diff = i; return; }
      for (let i = 0; i < 4; i++) if (pointInRect(x, y, menuButtons.biomes[i])) { menu.biome = i; return; }
      if (pointInRect(x, y, menuButtons.start)) startGame();
    }

    function updateCursor() {
      if (state === 'play') { canvas.style.cursor = 'crosshair'; return; }
      let over = false;
      if (state === 'menu') {
        for (const r of menuButtons.weapons) if (pointInRect(mouse.x, mouse.y, r)) over = true;
        for (const r of menuButtons.classes) if (pointInRect(mouse.x, mouse.y, r)) over = true;
        for (const r of menuButtons.difficulties) if (pointInRect(mouse.x, mouse.y, r)) over = true;
        for (const r of menuButtons.biomes) if (pointInRect(mouse.x, mouse.y, r)) over = true;
        if (pointInRect(mouse.x, mouse.y, menuButtons.start)) over = true;
      } else if (state === 'over') {
        if (gameOverButtons.retry && pointInRect(mouse.x, mouse.y, gameOverButtons.retry)) over = true;
        if (gameOverButtons.menu && pointInRect(mouse.x, mouse.y, gameOverButtons.menu)) over = true;
      }
      canvas.style.cursor = over ? 'pointer' : 'default';
    }

    function onKeyDown(e) {
      keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
      if (state === 'over') { if (e.code === 'KeyR') { startGame(); return; } if (e.code === 'KeyM') { toMenu(); return; } }
      if (state !== 'play') return;
      if (e.code === 'KeyR') startReload();
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') tryDash();
      if (e.code === 'KeyF') placeTurret();
      if (e.code === 'KeyG') throwPlayerGrenade();
    }
    function onKeyUp(e) { keys[e.code] = false; }
    function mousePos(e) {
      const rect = canvas.getBoundingClientRect();
      return { x: (e.clientX - rect.left) * (W / rect.width), y: (e.clientY - rect.top) * (H / rect.height) };
    }
    function onMouseMove(e) { const p = mousePos(e); mouse.x = p.x; mouse.y = p.y; updateCursor(); }
    function onMouseDown(e) {
      const p = mousePos(e); mouse.x = p.x; mouse.y = p.y;
      if (state === 'menu') { handleMenuClick(p.x, p.y); return; }
      if (state === 'over') {
        if (gameOverButtons.retry && pointInRect(p.x, p.y, gameOverButtons.retry)) { startGame(); return; }
        if (gameOverButtons.menu && pointInRect(p.x, p.y, gameOverButtons.menu)) { toMenu(); return; }
        return;
      }
      if (e.button === 0) mouse.down = true;
      if (e.button === 2) mouse.rdown = true;
    }
    function onMouseUp(e) {
      if (e.button === 0) mouse.down = false;
      if (e.button === 2) mouse.rdown = false;
    }
    function onContextMenu(e) { e.preventDefault(); }
    function onWheel(e) { e.preventDefault(); }
    function onTouchStart(e) {
      e.preventDefault();
      const t = e.touches[0]; const rect = canvas.getBoundingClientRect();
      const px = (t.clientX - rect.left) * (W / rect.width), py = (t.clientY - rect.top) * (H / rect.height);
      mouse.x = px; mouse.y = py;
      if (state === 'menu') { handleMenuClick(px, py); return; }
      if (state === 'over') {
        if (gameOverButtons.retry && pointInRect(px, py, gameOverButtons.retry)) startGame();
        else if (gameOverButtons.menu && pointInRect(px, py, gameOverButtons.menu)) toMenu();
        return;
      }
      mouse.down = true;
    }
    function onTouchMove(e) {
      e.preventDefault();
      const t = e.touches[0]; const rect = canvas.getBoundingClientRect();
      mouse.x = (t.clientX - rect.left) * (W / rect.width);
      mouse.y = (t.clientY - rect.top) * (H / rect.height);
    }
    function onTouchEnd(e) { e.preventDefault(); mouse.down = false; }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    /* ═══════════════ FULLSCREEN / RESIZE ═══════════════ */
    function resizeCanvas(newW, newH) {
      canvas.width = newW;
      canvas.height = newH;
      W = newW;
      H = newH;
      layoutMenu();
      updateCursor();
    }

    function computeFsSize() {
      const ar = 1100 / 780;
      let w = window.innerWidth;
      let h = window.innerHeight;
      if (w / h > ar) w = h * ar;
      else h = w / ar;
      const maxW = 2200;
      if (w > maxW) { const s = maxW / w; w *= s; h *= s; }
      return { w: Math.max(480, Math.round(w)), h: Math.max(340, Math.round(h)) };
    }

    function onFsChange() {
      const fs = !!document.fullscreenElement;
      setIsFs(fs);
      if (fs) {
        const { w, h } = computeFsSize();
        resizeCanvas(w, h);
      } else {
        resizeCanvas(1100, 780);
      }
    }

    function onWinResize() {
      if (document.fullscreenElement) {
        const { w, h } = computeFsSize();
        resizeCanvas(w, h);
      }
    }

    document.addEventListener('fullscreenchange', onFsChange);
    window.addEventListener('resize', onWinResize);

    /* ═══════════════ СТАРТ / СБРОС ═══════════════ */
    function startGame() {
      biomeIdx = menu.biome;
      generateMap();
      buildGrid();
      bakeStaticMap();
      placeBarrels();

      const w = WEAPONS[menu.weapon];
      const cls = CLASSES[menu.cls];

      let hp = 100, speed = 255;
      if (cls.id === 'assault') { hp = 130; speed = 293; }
      else if (cls.id === 'medic') { hp = 130; }

      player = {
        x: MAP_W / 2, y: MAP_H / 2, r: 14,
        hp, maxHp: hp,
        speed, angle: 0, cd: 0,
        vx: 0, vy: 0,
        ammo: w.melee ? Infinity : w.mag,
        reloading: 0,
        buffs: { firerate: 0, damage: 0, reload: 0, infinite: 0 },
        classId: cls.id,
        parts: 0,
        grenadesLeft: cls.id === 'demolition' ? 3 : 0,
        grenadeCd: 0,
        turretCd: 0,
        dashing: 0, dashCd: 0, dashVx: 0, dashVy: 0, dashHitSet: new Set(),
        parrying: 0, parryCd: 0,
        invuln: 0, swingTime: 0,
      };
      enemies = [];
      bullets = [];
      particles = [];
      decals = [];
      damageNumbers = [];
      powerupsOnMap = [];
      parts = [];
      turrets = [];
      grenades = [];
      drone = null;
      nukeEffect = null;
      screenFlash = null;
      hitStop = 0;
      chromaPulse = 0;
      shake = 0;
      score = 0;
      gameTime = 0;
      enemyIdCounter = 0;
      powerupSpawnTimer = 4;
      lastFlowCell = -1;
      flowTimer = 0;
      wave = 0;
      waveState = 'idle';
      waveTimer = 2;
      nextBossWave = 10;
      spawnedInWave = 0;
      spawnTimer = 0;
      state = 'play';
      mouse.down = false;
      rebuildSpatialHash();
      cam = { x: 0, y: 0 };
      cam.x = clamp(player.x - W / 2, 0, Math.max(0, MAP_W - W));
      cam.y = clamp(player.y - H / 2, 0, Math.max(0, MAP_H - H));
      updateCursor();
    }

    function toMenu() {
      state = 'menu';
      mouse.down = false; mouse.rdown = false;
      nukeEffect = null;
      screenFlash = null;
      updateCursor();
    }

    /* ═══════════════ ИНИЦИАЛИЗАЦИЯ ═══════════════ */
    initWorker();

    walls = [];
    gridCols = 1; gridRows = 1;
    gridBlocked = new Uint8Array(1);
    flowDist = new Int16Array(1);
    flowQueue = new Int32Array(1);
    shCols = 1; shRows = 1; shEnemies = [];

    player = { x: 0, y: 0, r: 14, hp: 100, maxHp: 100, speed: 255, angle: 0, cd: 0, vx: 0, vy: 0, ammo: 15, reloading: 0, buffs: { firerate: 0, damage: 0, reload: 0, infinite: 0 }, classId: 'assault', parts: 0, grenadesLeft: 0, grenadeCd: 0, turretCd: 0, dashing: 0, dashCd: 0, dashVx: 0, dashVy: 0, dashHitSet: new Set(), parrying: 0, parryCd: 0, invuln: 0, swingTime: 0 };
    enemies = []; bullets = []; particles = []; decals = []; damageNumbers = []; powerupsOnMap = [];
    barrels = []; parts = []; turrets = []; grenades = []; drone = null;
    cam = { x: 0, y: 0 };
    score = 0; gameTime = 0; enemyIdCounter = 0; powerupSpawnTimer = 0;
    wave = 0; waveState = 'idle'; waveTimer = 0; nextBossWave = 10; spawnedInWave = 0; spawnTimer = 0;
    state = 'menu';

    staticCanvas = document.createElement('canvas');
    staticCanvas.width = 8; staticCanvas.height = 8;

    layoutMenu();
    initMenuParticles();

    /* ═══════════════ ЦИКЛ ═══════════════ */
    let lastTime = performance.now();
    let rafId = 0;
    function loop(t) {
      const dt = Math.min((t - lastTime) / 1000, 0.05);
      lastTime = t;
      update(dt);
      if (state === 'menu') drawMenu();
      else renderGame();
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    /* ═══════════════ CLEANUP ═══════════════ */
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('fullscreenchange', onFsChange);
      window.removeEventListener('resize', onWinResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      if (worker) worker.terminate();
      if (workerUrl) URL.revokeObjectURL(workerUrl);
    };
  }, []);

  return (
    <div ref={shellRef} className="shooter-shell">
      <div className="shooter-canvas-wrap">
        <canvas
          ref={canvasRef}
          width={1100}
          height={780}
          className="shooter-canvas"
          aria-label="Мини-игра: арена"
        />
        <button
          className="fs-btn"
          onClick={toggleFullscreen}
          title={isFs ? 'Выйти из полноэкранного режима' : 'На весь экран'}
          aria-label={isFs ? 'Выйти из полного экрана' : 'Открыть на весь экран'}
        >
          {isFs ? '✕' : '⛶'}
        </button>
      </div>
      <style jsx>{`
        .shooter-shell {
          display: flex;
          justify-content: center;
          width: 100%;
          padding: 8px 0 24px;
          position: relative;
        }
        .shooter-canvas-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .shooter-canvas {
          background: #0d1016;
          border-radius: 12px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.9), 0 0 0 1px rgba(255, 255, 255, 0.05);
          max-width: 100%;
          height: auto;
          display: block;
          touch-action: none;
        }
        .fs-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 20;
          width: 38px;
          height: 38px;
          background: rgba(10, 14, 20, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #eaeaea;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.18s ease;
          backdrop-filter: blur(6px);
          font-family: ui-monospace, monospace;
        }
        .fs-btn:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
          transform: scale(1.05);
        }
        .shooter-shell:fullscreen {
          width: 100vw;
          height: 100vh;
          padding: 0;
          background: #000;
          align-items: center;
          justify-content: center;
        }
        .shooter-shell:fullscreen .shooter-canvas-wrap {
          width: 100vw;
          height: 100vh;
          align-items: center;
          justify-content: center;
        }
        .shooter-shell:fullscreen .shooter-canvas {
          max-width: 100vw;
          max-height: 100vh;
          border-radius: 0;
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
