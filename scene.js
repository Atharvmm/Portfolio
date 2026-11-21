// Two thick walls meeting at the origin, floor in the +X/+Z quadrant.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { canvasTex, lathe, rng, sweep } from './kit.js';
import { CERTS, SKILL_ROWS } from './content.js';
import { FURNITURE, ROOM, WALLS } from './layout.js';
import { zoneNow } from './lighting.js';
import { U } from './env.js';

const rand = rng(11);
const { width: W, depth: D, height: H, wall: T, floor: FT } = ROOM;

function woodTex() {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#b98558';
    g.fillRect(0, 0, w, h);
    const rows = 8;
    for (let i = 0; i < rows; i++) {
      const y = (i / rows) * h;
      const tone = 150 + Math.floor(rand() * 50);
      g.fillStyle = `rgb(${tone}, ${Math.floor(tone * 0.68)}, ${Math.floor(tone * 0.4)})`;
      g.fillRect(0, y + 2, w, h / rows - 4);
      g.strokeStyle = 'rgba(70, 38, 16, 0.55)';
      g.strokeRect(0.5, y + 1, w - 1, h / rows - 3);
      for (let x = 0; x < w; x += 3) {
        const n = rand();
        g.strokeStyle = `rgba(90, 50, 20, ${0.05 + n * 0.12})`;
        g.beginPath();
        g.moveTo(x, y + 4);
        g.bezierCurveTo(x + 20, y + h / rows * n, x + 40, y + 8, x + 70, y + h / rows * 0.6);
        g.stroke();
      }
    }
  }, { repeat: [3, 4], aniso: 16 });
}

function plasterMaps() {
  const color = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#e6d7c4';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2500; i++) {
      g.fillStyle = `rgba(120, 90, 60, ${0.03 + rand() * 0.06})`;
      g.fillRect(rand() * w, rand() * h, 2, 2);
    }
  }, { repeat: [2, 2], aniso: 16 });
  const normal = canvasTex(512, 512, (g, w, h) => {
    const img = g.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const n = rand();
      img.data[i] = 124 + n * 12;
      img.data[i + 1] = 128 + (rand() - 0.5) * 10;
      img.data[i + 2] = 246;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, { srgb: false, repeat: [2, 2], aniso: 8 });
  return { color, normal };
}

function rugTex() {
  return canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = '#c4a07a';
    g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 4) {
      g.strokeStyle = y % 8 === 0 ? 'rgba(90, 55, 30, 0.35)' : 'rgba(255, 236, 210, 0.18)';
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
    g.strokeStyle = '#6b4128';
    g.lineWidth = 28;
    g.strokeRect(18, 18, w - 36, h - 36);
    g.strokeStyle = '#e6d3b4';
    g.lineWidth = 8;
    g.strokeRect(48, 48, w - 96, h - 96);
  }, { aniso: 16 });
}

function clothTex(hex) {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = hex;
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 80; i++) {
      g.strokeStyle = 'rgba(255,255,255,0.04)';
      g.beginPath();
      g.moveTo(0, i * 3);
      g.lineTo(w, i * 3 + 6);
      g.stroke();
    }
  }, { repeat: [2, 2], aniso: 8 });
}

const SANS = 'Nunito, "Trebuchet MS", sans-serif';

function fitFont(g, text, maxWidth, start) {
  let size = start;
  g.font = `700 ${size}px ${SANS}`;
  while (g.measureText(text).width > maxWidth && size > 28) {
    size -= 4;
    g.font = `700 ${size}px ${SANS}`;
  }
  return size;
}

function labelTex(text, bg = '#f6f1e6', fg = '#1a120c') {
  return canvasTex(2048, 1024, (g, w, h) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = fg;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    fitFont(g, text, w - 48, Math.floor(h * 0.62));
    g.fillText(text, w / 2, h / 2 + h * 0.02);
  }, { aniso: 16 });
}

function plaqueTex(text) {
  return canvasTex(2048, 768, (g, w, h) => {
    g.fillStyle = '#f4ead8';
    g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2c2118';
    g.lineWidth = 18;
    g.strokeRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#1a120c';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const words = text.split(' ');
    const lines = text.length > 14 && words.length > 1
      ? [words.slice(0, Math.ceil(words.length / 2)).join(' '), words.slice(Math.ceil(words.length / 2)).join(' ')]
      : [text];
    const longest = lines.reduce((a, b) => (a.length > b.length ? a : b));
    const size = fitFont(g, longest, w - 140, lines.length > 1 ? 300 : 440);
    lines.forEach((line, i) => {
      g.font = `700 ${size}px ${SANS}`;
      g.fillText(line, w / 2, h / 2 + (i - (lines.length - 1) / 2) * size * 1.05);
    });
  }, { aniso: 16 });
}

function labelMat(texture) {
  return new THREE.MeshStandardMaterial({
    map: texture,
    emissive: '#ffffff',
    emissiveMap: texture,
    emissiveIntensity: 0.4,
    roughness: 0.82,
    metalness: 0,
  });
}

function editorTex() {
  return canvasTex(2048, 1152, (g, w, h) => {
    g.fillStyle = '#1b1d22';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#252830';
    g.fillRect(0, 0, 460, h);
    g.fillStyle = '#3a3f4b';
    g.fillRect(0, 0, w, 70);
    g.fillStyle = '#f2f4f8';
    g.font = '700 78px ui-monospace, monospace';
    g.fillText('Purplle', 500, 175);
    g.font = '700 46px ui-monospace, monospace';
    ['Fulcrum', 'Martech', 'Pricing', 'Intern'].forEach((line, i) => {
      if (i === 0) { g.fillStyle = '#2f3644'; g.fillRect(16, 100, 428, 78); }
      g.fillStyle = i === 0 ? '#ffffff' : '#c8cdd6';
      g.fillText(line, 40, 155 + i * 88);
    });
    g.fillStyle = '#9cdcfe';
    g.font = '700 42px ui-monospace, monospace';
    g.fillText('experience %', 500, 280);
    g.fillStyle = '#d7dbe3';
    g.font = '600 36px ui-monospace, monospace';
    g.fillText('Warehouse automation', 500, 360);
  }, { aniso: 16 });
}

function paintClock(g, w, h, time) {
  g.fillStyle = '#e4e7ea';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#16191c';
  g.textBaseline = 'middle';
  g.textAlign = 'left';
  g.font = `700 110px ${SANS}`;
  g.fillText(time.ap, 36, h * 0.4);
  g.textAlign = 'center';
  g.font = `700 340px ${SANS}`;
  const hh = String(time.h12).padStart(2, '0');
  const mm = String(time.m).padStart(2, '0');
  g.fillText(`${hh}:${mm}`, w * 0.5, h * 0.4);
  g.font = `700 78px ${SANS}`;
  g.textAlign = 'right';
  g.fillText(time.weekday, w - 28, h * 0.58);
  g.fillText(`${time.day}/${time.month}`, w - 28, h * 0.78);
  g.textAlign = 'left';
  g.font = `700 64px ${SANS}`;
  g.fillText(`${time.abbr}  ${time.city}`, 36, h - 46);
}

function leafTex() {
  return canvasTex(256, 512, (g, w, h) => {
    g.fillStyle = '#2f6b3a';
    g.beginPath();
    g.ellipse(w / 2, h * 0.55, 70, 180, 0, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#1c4024';
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(w / 2, h - 20);
    g.lineTo(w / 2, 40);
    g.stroke();
  }, { aniso: 8 });
}

function noteTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#2c2118';
    g.beginPath();
    g.ellipse(78, 176, 36, 26, -0.4, 0, Math.PI * 2);
    g.fill();
    g.fillRect(108, 48, 14, 130);
    g.fillRect(108, 48, 92, 16);
    g.beginPath();
    g.ellipse(186, 168, 32, 22, -0.3, 0, Math.PI * 2);
    g.fill();
    g.fillRect(200, 70, 12, 100);
  }, { aniso: 8 });
}

const plaster = plasterMaps();
const mat = {
  wall: new THREE.MeshStandardMaterial({ map: plaster.color, normalMap: plaster.normal, normalScale: new THREE.Vector2(0.35, 0.35), roughness: 0.92, metalness: 0 }),
  floor: new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.72, metalness: 0 }),
  wood: new THREE.MeshStandardMaterial({ color: '#6b4128', roughness: 0.68, metalness: 0.02 }),
  desk: new THREE.MeshStandardMaterial({ color: '#3a2a22', roughness: 0.58, metalness: 0.04 }),
  cloth: new THREE.MeshStandardMaterial({ map: clothTex('#2f4d73'), roughness: 0.92, metalness: 0 }),
  sheet: new THREE.MeshStandardMaterial({ map: clothTex('#f3efe6'), roughness: 0.9, metalness: 0 }),
  rug: new THREE.MeshStandardMaterial({ map: rugTex(), roughness: 0.95, metalness: 0 }),
  metal: new THREE.MeshStandardMaterial({ color: '#c5c9ce', roughness: 0.32, metalness: 0.75 }),
  plant: new THREE.MeshStandardMaterial({ map: leafTex(), roughness: 0.7, metalness: 0, alphaTest: 0.45, side: THREE.DoubleSide }),
  pot: new THREE.MeshStandardMaterial({ color: '#c47a4a', roughness: 0.7, metalness: 0.02 }),
  dark: new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.45, metalness: 0.15 }),
  bezel: new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.4, metalness: 0.3 }),
  screen: new THREE.MeshStandardMaterial({ map: editorTex(), emissive: '#ffffff', emissiveIntensity: 0.22, roughness: 0.42, metalness: 0.04 }),
  shade: new THREE.MeshStandardMaterial({ color: '#f3d7a1', emissive: '#e7b15a', emissiveIntensity: 0.35, roughness: 0.5 }),
  paper: new THREE.MeshStandardMaterial({ color: '#f6efe2', roughness: 0.85, metalness: 0 }),
  gold: new THREE.MeshStandardMaterial({ color: '#d7b56d', roughness: 0.4, metalness: 0.6 }),
};
mat.screen.emissiveMap = mat.screen.map;
const skyMat = new THREE.MeshBasicMaterial({ color: '#7eb6e0' });
const shaftMat = new THREE.MeshBasicMaterial({ color: '#ffe0b0', transparent: true, opacity: 0.12, depthWrite: false });
shaftMat.userData = {};
const glassMat = new THREE.MeshPhysicalMaterial({
  color: '#d5e7f4', roughness: 0.06, metalness: 0, transmission: 0.86, thickness: 0.02, transparent: true, opacity: 1,
});

function add(parent, geo, material, x, y, z, opts = {}) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  if (opts.hot || parent.userData?.hot) mesh.userData.hot = opts.hot || parent.userData.hot;
  parent.add(mesh);
  return mesh;
}

function hot(parent, id, x, y, z) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  g.userData.hot = id;
  g.userData.interactive = true;
  parent.add(g);
  return g;
}

function buildShell(group) {
  add(group, new THREE.BoxGeometry(W + T, FT, D + T), mat.floor, (W - T) / 2, -FT / 2, (D - T) / 2, { cast: false });
  add(group, new THREE.BoxGeometry(W + T, H, T), mat.wall, (W - T) / 2, H / 2, -T / 2);
  add(group, new THREE.BoxGeometry(T, H, D + T), mat.wall, -T / 2, H / 2, (D - T) / 2);
  const skirting = new THREE.Mesh(
    sweep([[0, 0], [0.02, 0], [0.028, 0.09], [0, 0.1]], [[0.012, D - 0.02], [0.012, 0.012], [W - 0.02, 0.012]], { y: 0, side: -1 }),
    mat.wood,
  );
  skirting.castShadow = false;
  skirting.receiveShadow = true;
  group.add(skirting);
}

function buildWindow(group) {
  const { x, y, w, h } = WALLS.back.window;
  const cx = x + w / 2;
  const cy = y + h / 2;
  add(group, new THREE.BoxGeometry(w + 0.08, 0.06, 0.08), mat.wood, cx, y - 0.02, 0.02, { cast: false });
  add(group, new THREE.BoxGeometry(w + 0.08, 0.06, 0.08), mat.wood, cx, y + h + 0.02, 0.02, { cast: false });
  add(group, new THREE.BoxGeometry(0.06, h, 0.08), mat.wood, x - 0.02, cy, 0.02, { cast: false });
  add(group, new THREE.BoxGeometry(0.06, h, 0.08), mat.wood, x + w + 0.02, cy, 0.02, { cast: false });
  add(group, new THREE.BoxGeometry(0.04, h, 0.06), mat.wood, cx, cy, 0.03, { cast: false });
  const sky = add(group, new THREE.PlaneGeometry(w - 0.02, h - 0.02), skyMat, cx, cy, -0.01, { cast: false, receive: false });
  sky.userData.noAO = true;
  const glass = add(group, new THREE.PlaneGeometry(w - 0.08, h - 0.08), glassMat, cx, cy, 0.045, { cast: false, receive: false });
  glass.userData.noAO = true;
  const shaft = add(group, new THREE.BoxGeometry(w * 0.7, 0.02, 1.35), shaftMat, cx + 0.15, 0.012, 0.75, { cast: false, receive: false });
  shaft.userData.noAO = true;
  return { sky, shaft };
}

const SHORT = {
  Cloudflare: 'CF', BigQuery: 'BQ', Postgres: 'Pg', Jenkins: 'Jnk', 'Pub/Sub': 'Pub',
  'Unstruct.': 'Unstr', Sockets: 'Sock', Spring: 'Spr', Cursor: 'Curs',
};

function shortName(text) {
  if (SHORT[text]) return SHORT[text];
  return text.length > 6 ? text.slice(0, 5) : text;
}

function buildShelves(group) {
  const { x, z, length, y0, y1 } = WALLS.back.shelves;
  const step = (y1 - y0) / (SKILL_ROWS.length - 1);
  const plaqueW = 0.62;
  SKILL_ROWS.forEach((row, index) => {
    const y = y1 - index * step;
    const shelf = hot(group, row.id, x + length / 2, y, z + 0.11);
    add(shelf, new RoundedBoxGeometry(length, 0.03, 0.22, 2, 0.008), mat.wood, 0, 0, 0);
    const plaque = add(shelf, new THREE.PlaneGeometry(plaqueW, 0.2), labelMat(plaqueTex(row.label)), -length / 2 + plaqueW / 2 + 0.04, 0.14, 0.08, { cast: false });
    plaque.userData.hot = row.id;
    const roll = rng(40 + index * 17);
    const usable = length - plaqueW - 0.16;
    const start = -length / 2 + plaqueW + 0.1;
    const base = 0.155;
    const specs = row.items.map((item) => {
      const s = 0.82 + roll() * 0.4;
      return {
        name: shortName(item[0]),
        color: item[1],
        w: base * (0.86 + roll() * 0.32) * s,
        h: base * (0.78 + roll() * 0.38) * s,
        d: base * (0.8 + roll() * 0.28) * s,
        gap: 0.02 + roll() * 0.018,
        lean: (roll() - 0.5) * 0.05,
        stack: roll() < 0.16,
      };
    });
    let total = specs.reduce((sum, spec) => sum + spec.w + spec.gap, 0);
    if (total > usable) {
      const scale = usable / total;
      specs.forEach((spec) => { spec.w *= scale; spec.h *= scale; spec.d *= scale; spec.gap *= scale; spec.stack = false; });
    }
    const dummy = new THREE.Object3D();
    const cubes = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, 0.06), new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.04 }), row.items.length * 2);
    cubes.castShadow = true;
    cubes.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(row.items.length * 2 * 3), 3);
    let cursor = start;
    let count = 0;
    specs.forEach((spec) => {
      const cx = cursor + spec.w / 2;
      cursor += spec.w + spec.gap;
      dummy.position.set(cx, spec.h / 2 + 0.02, 0);
      dummy.rotation.set(0, spec.lean * 0.4, spec.lean);
      dummy.scale.set(spec.w, spec.h, spec.d);
      dummy.updateMatrix();
      cubes.setMatrixAt(count, dummy.matrix);
      cubes.setColorAt(count, new THREE.Color(spec.color));
      count += 1;
      const face = add(shelf, new THREE.PlaneGeometry(spec.w * 0.92, Math.max(0.07, spec.h * 0.72)), labelMat(labelTex(spec.name)), cx, spec.h / 2 + 0.02, spec.d / 2 + 0.004, { cast: false });
      face.userData.hot = row.id;
      if (spec.stack && spec.h < 0.14) {
        const sw = spec.w * 0.62;
        const sh = spec.h * 0.55;
        dummy.position.set(cx, spec.h + sh / 2 + 0.025, 0);
        dummy.rotation.set(0, -spec.lean, spec.lean * 0.5);
        dummy.scale.set(sw, sh, spec.d * 0.7);
        dummy.updateMatrix();
        cubes.setMatrixAt(count, dummy.matrix);
        cubes.setColorAt(count, new THREE.Color(spec.color));
        count += 1;
        const top = add(shelf, new THREE.PlaneGeometry(sw * 0.8, sh * 0.55), labelMat(labelTex(spec.name.slice(0, 3))), cx, spec.h + sh / 2 + 0.025, spec.d * 0.35 + 0.004, { cast: false });
        top.userData.hot = row.id;
      }
    });
    cubes.count = count;
    cubes.instanceColor.needsUpdate = true;
    shelf.add(cubes);
    const hit = add(shelf, new THREE.BoxGeometry(length, 0.36, 0.3), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), 0, 0.1, 0, { cast: false, receive: false });
    hit.userData.hot = row.id;
  });
}

function buildDesk(group) {
  const d = FURNITURE.desk;
  const desk = add(group, new RoundedBoxGeometry(d.w, 0.045, d.d, 2, 0.01), mat.desk, d.x + d.w / 2, d.top, d.z);
  for (const [sx, sz] of [[0.06, 0.08], [d.w - 0.06, 0.08], [0.06, d.d - 0.08], [d.w - 0.06, d.d - 0.08]]) {
    add(group, new THREE.BoxGeometry(0.05, d.top - 0.02, 0.05), mat.desk, d.x + sx, (d.top - 0.02) / 2, d.z - d.d / 2 + sz);
  }
  const pc = hot(group, 'pc', d.x + 0.05, d.top, d.z);
  add(pc, new RoundedBoxGeometry(0.04, 0.44, 0.5, 2, 0.012), mat.bezel, 0.02, 0.36, 0);
  const screen = add(pc, new THREE.PlaneGeometry(0.44, 0.34), mat.screen, 0.046, 0.36, 0, { rot: [0, Math.PI / 2, 0], cast: false });
  screen.userData.hot = 'pc';
  add(pc, new THREE.BoxGeometry(0.06, 0.08, 0.18), mat.dark, 0.03, 0.08, 0);
  const hit = add(pc, new THREE.BoxGeometry(0.18, 0.58, 0.78), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), 0.06, 0.32, 0, { cast: false, receive: false });
  hit.userData.hot = 'pc';
  add(group, new RoundedBoxGeometry(0.28, 0.016, 0.1, 2, 0.004), mat.dark, d.x + 0.36, d.top + 0.012, d.z, { cast: false });
  add(group, new RoundedBoxGeometry(0.05, 0.012, 0.08, 2, 0.003), mat.dark, d.x + 0.42, d.top + 0.01, d.z - 0.16, { cast: false });

  const lamp = hot(group, 'pc', d.x + 0.46, d.top, d.z + 0.18);
  add(lamp, lathe([[0.04, 0], [0.045, 0.08], [0.02, 0.22], [0.09, 0.26], [0.11, 0.34], [0.04, 0.36]], 20), mat.shade, 0, 0, 0, { cast: false });
  const spot = new THREE.SpotLight('#ffd2a4', 0, 3.2, 0.9, 1, 2);
  spot.position.set(d.x + 0.46, d.top + 0.38, d.z + 0.18);
  spot.target.position.set(d.x + 0.3, d.top + 0.02, d.z);
  spot.castShadow = false;
  group.add(spot, spot.target);
  buildChair(group, d);
  void desk;
  return { spot };
}

function buildChair(group, d) {
  const chair = new THREE.Group();
  chair.position.set(d.x + d.w + 0.42, 0, d.z + 0.06);
  chair.rotation.y = Math.PI / 2 + 0.18;
  group.add(chair);
  const fabric = new THREE.MeshStandardMaterial({ color: '#8d939e', roughness: 0.88, metalness: 0 });
  const plastic = new THREE.MeshStandardMaterial({ color: '#b5bac2', roughness: 0.42, metalness: 0.06 });
  const black = new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.5, metalness: 0.25 });
  const meshMap = canvasTex(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.strokeStyle = '#8e959e';
    g.lineWidth = 3;
    for (let y = 2; y < h; y += 7) {
      g.beginPath();
      g.moveTo(0, y);
      g.lineTo(w, y);
      g.stroke();
    }
  }, { aniso: 8 });
  const meshMat = new THREE.MeshStandardMaterial({ map: meshMap, color: '#9aa1aa', transparent: true, opacity: 0.92, roughness: 0.62, side: THREE.DoubleSide });
  add(chair, new RoundedBoxGeometry(0.5, 0.09, 0.48, 3, 0.035), fabric, 0, 0.48, -0.02);
  const back = new THREE.Group();
  back.position.set(0, 0.5, 0.2);
  back.rotation.x = -0.16;
  chair.add(back);
  add(back, new RoundedBoxGeometry(0.48, 0.56, 0.035, 3, 0.016), plastic, 0, 0.28, 0);
  add(back, new THREE.PlaneGeometry(0.38, 0.44), meshMat, 0, 0.3, 0.02, { cast: false });
  for (const side of [-1, 1]) {
    add(chair, new RoundedBoxGeometry(0.045, 0.2, 0.045, 2, 0.01), plastic, side * 0.27, 0.58, 0.04);
    add(chair, new RoundedBoxGeometry(0.055, 0.04, 0.32, 3, 0.014), plastic, side * 0.27, 0.68, -0.02);
  }
  add(chair, new THREE.CylinderGeometry(0.028, 0.034, 0.24, 16), black, 0, 0.3, 0);
  add(chair, new THREE.CylinderGeometry(0.06, 0.06, 0.028, 16), plastic, 0, 0.18, 0);
  for (let i = 0; i < 5; i++) {
    const leg = new THREE.Group();
    leg.rotation.y = (i / 5) * Math.PI * 2;
    chair.add(leg);
    add(leg, new RoundedBoxGeometry(0.24, 0.028, 0.05, 2, 0.008), plastic, 0.1, 0.08, 0);
    add(leg, new THREE.CylinderGeometry(0.03, 0.03, 0.028, 14), black, 0.21, 0.045, 0, { rot: [Math.PI / 2, 0, 0] });
    add(leg, new THREE.CylinderGeometry(0.016, 0.016, 0.03, 10), plastic, 0.21, 0.045, 0, { rot: [Math.PI / 2, 0, 0], cast: false });
  }
}

function buildBooks(group) {
  const d = FURNITURE.desk;
  const x = d.x + 0.2;
  const z = d.z - d.d / 2 + 0.18;
  const school = hot(group, 'book-school', x, d.top + 0.035, z);
  add(school, new RoundedBoxGeometry(0.22, 0.06, 0.3, 2, 0.008), new THREE.MeshStandardMaterial({ color: '#8e3d5c', roughness: 0.65 }), 0, 0, 0, { rot: [0, 0.4, 0] });
  add(school, new THREE.PlaneGeometry(0.18, 0.24), labelMat(labelTex('School')), 0, 0.034, 0, { rot: [-Math.PI / 2, 0, 0.4], cast: false });
  const degree = hot(group, 'book-degree', x + 0.01, d.top + 0.1, z + 0.01);
  add(degree, new RoundedBoxGeometry(0.2, 0.055, 0.28, 2, 0.008), new THREE.MeshStandardMaterial({ color: '#3d5a80', roughness: 0.65 }), 0, 0, 0, { rot: [0, 0.25, 0] });
  add(degree, new THREE.PlaneGeometry(0.16, 0.22), labelMat(labelTex('B.Tech')), 0, 0.032, 0, { rot: [-Math.PI / 2, 0, 0.25], cast: false });
}

function buildCerts(group) {
  const { z0, yTop, colGap, rowGap, fw, fh } = WALLS.left.certs;
  CERTS.forEach((cert, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const z = z0 + col * (fw + colGap);
    const y = yTop - row * (fh + rowGap);
    const frame = hot(group, cert.id, 0.028, y, z);
    add(frame, new RoundedBoxGeometry(0.04, fh, fw, 2, 0.01), mat.wood, 0, 0, 0);
    add(frame, new THREE.PlaneGeometry(fw - 0.04, fh - 0.04), new THREE.MeshStandardMaterial({ color: '#f7f1e6', roughness: 0.9 }), 0.022, 0, 0, { rot: [0, Math.PI / 2, 0], cast: false });
    const face = add(frame, new THREE.PlaneGeometry(fw - 0.07, fh - 0.07), labelMat(plaqueTex(cert.title)), 0.028, 0, 0, { rot: [0, Math.PI / 2, 0], cast: false });
    face.userData.hot = cert.id;
  });
}

function buildBed(group) {
  const b = FURNITURE.bed;
  add(group, new RoundedBoxGeometry(b.w, 0.28, b.d, 2, 0.02), mat.wood, b.x, 0.16, b.z);
  add(group, new RoundedBoxGeometry(b.w, 0.42, 0.06, 2, 0.012), mat.wood, b.x, 0.42, b.z - b.d / 2 + 0.02);
  add(group, new RoundedBoxGeometry(b.w - 0.08, 0.16, b.d - 0.08, 2, 0.03), mat.cloth, b.x, 0.36, b.z);
  add(group, new RoundedBoxGeometry(b.w - 0.16, 0.08, b.d * 0.62, 2, 0.02), mat.cloth, b.x, 0.44, b.z + 0.15);
  add(group, new RoundedBoxGeometry(0.42, 0.1, 0.28, 2, 0.03), mat.sheet, b.x - 0.15, 0.5, b.z - b.d * 0.32);
  add(group, new RoundedBoxGeometry(0.42, 0.1, 0.28, 2, 0.03), mat.sheet, b.x + 0.2, 0.48, b.z - b.d * 0.28);
  const phone = hot(group, 'phone', b.x + 0.15, 0.5, b.z + 0.15);
  add(phone, new RoundedBoxGeometry(0.16, 0.012, 0.078, 2, 0.004), mat.dark, 0, 0, 0, { rot: [0, 0.5, 0] });
  add(phone, new THREE.PlaneGeometry(0.14, 0.062), new THREE.MeshStandardMaterial({ color: '#dfe7ea', emissive: '#9bb0b8', emissiveIntensity: 0.2, roughness: 0.3, metalness: 0.1 }), 0, 0.008, 0, { rot: [-Math.PI / 2, 0, 0.5], cast: false });
  const hit = add(phone, new THREE.BoxGeometry(0.28, 0.06, 0.2), new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }), 0, 0.02, 0, { cast: false, receive: false });
  hit.userData.hot = 'phone';
}

function maskShape() {
  const s = new THREE.Shape();
  s.moveTo(0, 0.15);
  s.bezierCurveTo(0.13, 0.17, 0.155, 0.06, 0.145, -0.01);
  s.bezierCurveTo(0.14, -0.1, 0.07, -0.155, 0, -0.145);
  s.bezierCurveTo(-0.07, -0.155, -0.14, -0.1, -0.145, -0.01);
  s.bezierCurveTo(-0.155, 0.06, -0.13, 0.17, 0, 0.15);
  const eye = (ex) => {
    const path = new THREE.Path();
    path.absellipse(ex, 0.035, 0.032, 0.022, 0, Math.PI * 2, true);
    return path;
  };
  s.holes.push(eye(-0.05), eye(0.05));
  return s;
}

function buildMasks(group) {
  const m = WALLS.left.masks;
  const root = hot(group, 'drama', 0.05, m.y, m.z);
  root.rotation.y = Math.PI / 2;
  root.scale.setScalar(1.45);
  const geo = new THREE.ExtrudeGeometry(maskShape(), {
    depth: 0.04, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.008, bevelSegments: 2, curveSegments: 12,
  });
  geo.translate(0, 0, -0.02);
  const positions = geo.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);
    positions.setZ(i, positions.getZ(i) + (0.09 - x * x * 1.4 - (y - 0.02) * (y - 0.02) * 0.6));
  }
  geo.computeVertexNormals();
  const ceramic = (color) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.28, metalness: 0.02, clearcoat: 0.55, clearcoatRoughness: 0.28 });
  const place = (color, x, y, z, smile) => {
    const mask = new THREE.Group();
    mask.position.set(x, y, z);
    mask.rotation.z = smile ? 0.08 : -0.12;
    root.add(mask);
    const shell = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#1a120c', roughness: 0.6 }));
    shell.scale.set(1.08, 1.08, 0.7);
    shell.castShadow = true;
    mask.add(shell);
    const face = new THREE.Mesh(geo, ceramic(color));
    face.castShadow = true;
    face.userData.hot = 'drama';
    mask.add(face);
    const curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-0.055, -0.045, 0.07),
      new THREE.Vector3(0, smile ? -0.09 : 0.005, 0.08),
      new THREE.Vector3(0.055, -0.045, 0.07),
    );
    const mouth = new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.012, 8, false), mat.dark);
    mouth.userData.hot = 'drama';
    mask.add(mouth);
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.009, 8, 14, Math.PI), mat.dark);
      eye.position.set(side * 0.05, 0.045, 0.1);
      eye.rotation.set(smile ? 0.4 : 2.2, 0, side * 0.15);
      eye.userData.hot = 'drama';
      mask.add(eye);
      add(mask, new RoundedBoxGeometry(0.045, 0.012, 0.01, 1, 0.003), mat.dark, side * 0.05, 0.085, 0.1, { rot: [0, 0, side * (smile ? -0.35 : 0.4)], cast: false });
    }
  };
  place('#e25d68', -0.07, 0.02, 0.02, true);
  place('#e2b23a', 0.08, -0.02, -0.015, false);
  add(root, new THREE.CylinderGeometry(0.004, 0.004, 0.16, 6), mat.dark, 0.02, 0.24, 0, { cast: false });
  add(root, new THREE.SphereGeometry(0.014, 10, 8), mat.metal, 0.02, 0.32, -0.01, { cast: false });
  const shadow = canvasTex(256, 128, (g, w, h) => {
    const grd = g.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, w / 2);
    grd.addColorStop(0, 'rgba(0,0,0,0.35)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, w, h);
  }, { aniso: 4 });
  const blob = add(root, new THREE.PlaneGeometry(0.42, 0.28), new THREE.MeshBasicMaterial({ map: shadow, transparent: true, depthWrite: false }), 0, 0, -0.01, { cast: false, receive: false });
  blob.userData.noAO = true;
}

function buildClock(group) {
  const c = WALLS.left.clock;
  const root = hot(group, 'clock', 0.03, c.y, c.z);
  root.rotation.y = Math.PI / 2;
  const body = new THREE.MeshStandardMaterial({ color: '#f7f7f5', roughness: 0.45, metalness: 0.02 });
  add(root, new RoundedBoxGeometry(c.w, c.h, 0.045, 4, 0.02), body, 0, 0, 0);
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16;
  tex.generateMipmaps = true;
  const face = add(root, new THREE.PlaneGeometry(c.w - 0.06, c.h - 0.05), labelMat(tex), 0, 0, 0.026, { cast: false });
  face.userData.hot = 'clock';
  let key = '';
  return {
    paint() {
      const time = zoneNow();
      const next = `${time.h}:${time.m}:${time.ap}:${time.weekday}:${time.day}:${time.abbr}:${time.city}`;
      if (next === key) return;
      key = next;
      paintClock(ctx, canvas.width, canvas.height, time);
      tex.needsUpdate = true;
    },
  };
}

function buildPlant(group) {
  const p = FURNITURE.plant;
  add(group, lathe([[0.12, 0], [0.15, 0.08], [0.16, 0.18], [0.11, 0.28], [0.14, 0.32]], 18), mat.pot, p.x, 0, p.z);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const leaf = add(group, new THREE.PlaneGeometry(0.16, 0.36), mat.plant, p.x + Math.cos(a) * 0.08, 0.48 + (i % 3) * 0.06, p.z + Math.sin(a) * 0.08, { cast: false });
    leaf.rotation.y = a;
    leaf.rotation.z = 0.4;
    leaf.lookAt(p.x, 0.2, p.z);
  }
}

function buildSpeaker(group) {
  const d = FURNITURE.desk;
  const bed = FURNITURE.bed;
  const g = new THREE.Group();
  const sx = d.x + 0.22;
  const sz = d.z + d.d / 2 - 0.14;
  g.position.set(sx, d.top + 0.075, sz);
  g.rotation.y = Math.atan2(bed.x - sx, bed.z - sz);
  g.name = 'speaker';
  group.add(g);
  add(g, new RoundedBoxGeometry(0.28, 0.14, 0.16, 3, 0.012), mat.wood, 0, 0, 0);
  const grille = canvasTex(256, 128, (ctx, w, h) => {
    ctx.fillStyle = '#6d6248';
    ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 3) {
      ctx.strokeStyle = 'rgba(30, 24, 16, 0.45)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  }, { aniso: 8 });
  add(g, new THREE.PlaneGeometry(0.22, 0.1), new THREE.MeshStandardMaterial({ map: grille, roughness: 0.85 }), 0, 0, 0.081, { cast: false });
  for (let i = 0; i < 3; i++) add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.015, 10), mat.gold, -0.06 + i * 0.045, 0.06, 0.04, { rot: [Math.PI / 2, 0, 0], cast: false });
  return g;
}

function buildRug(group) {
  const r = FURNITURE.rug;
  add(group, new THREE.CircleGeometry(r.r, 48), mat.rug, r.x, 0.012, r.z, { rot: [-Math.PI / 2, 0, 0.2], cast: false });
}

const daySky = new THREE.Color('#7eb6e0');
const nightSky = new THREE.Color('#1a2744');
const scratch = new THREE.Color();

export function buildScene() {
  const group = new THREE.Group();
  group.name = 'room';
  buildShell(group);
  const win = buildWindow(group);
  buildRug(group);
  buildShelves(group);
  const desk = buildDesk(group);
  buildBooks(group);
  buildCerts(group);
  buildBed(group);
  buildMasks(group);
  buildPlant(group);
  const clock = buildClock(group);
  const speaker = buildSpeaker(group);

  const strip = new THREE.RectAreaLight('#ffd8a8', 0, 1.8, 0.06);
  strip.position.set(1.35, 2.35, 0.18);
  strip.lookAt(1.35, 1.3, 0.5);
  group.add(strip);
  const wash = new THREE.SpotLight('#d7e2f5', 0, 8, 1.15, 1, 2);
  wash.position.set(2.1, 2.15, 2.3);
  wash.target.position.set(0.4, 1.35, 1.4);
  wash.castShadow = false;
  group.add(wash, wash.target);

  return {
    group,
    speaker,
    noteTex: noteTex(),
    update() {
      const night = U.uNight.value;
      desk.spot.intensity = 2.4 * night;
      strip.intensity = 5 * night;
      wash.intensity = 10 * night;
      mat.screen.emissiveIntensity = 0.16 + 0.18 * night;
      mat.shade.emissiveIntensity = 0.1 + 0.22 * night;
      scratch.copy(daySky).lerp(nightSky, night);
      win.sky.material.color.copy(scratch);
      win.shaft.material.opacity = 0.14 * (1 - night);
      clock.paint();
    },
  };
}
