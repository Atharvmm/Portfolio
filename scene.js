// Atharv's room. Metres, +Y up. Open toward +Z so three walls stay readable.
// A small bedroom: about 4.4 m wide, 3.5 m deep, 2.55 m to the top of the walls.
import * as THREE from 'three';
import { canvasTex, lathe, rng, sweep } from './kit.js';
import { CERTS, SKILL_ROWS } from './content.js';

const W = 4.4;
const D = 3.5;
const H = 2.55;
const T = 0.08;
const HALF_W = W / 2;
const HALF_D = D / 2;

const rand = rng(7);

function plaster() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#e7d8c6';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1800; i++) {
      g.fillStyle = `rgba(90, 60, 40, ${0.03 + rand() * 0.05})`;
      g.fillRect(rand() * w, rand() * h, 2, 2);
    }
  }, { repeat: [2, 2] });
}

function boards() {
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#c48a52';
    g.fillRect(0, 0, w, h);
    const rows = 10;
    for (let i = 0; i < rows; i++) {
      const y = (i / rows) * h;
      const tone = 180 + Math.floor(rand() * 40);
      g.fillStyle = `rgb(${tone}, ${tone - 55}, ${tone - 100})`;
      g.fillRect(0, y + 1, w, h / rows - 3);
      g.strokeStyle = 'rgba(70, 40, 18, 0.45)';
      g.strokeRect(0.5, y + 0.5, w - 1, h / rows - 2);
    }
  }, { repeat: [2, 3] });
}

function rugTex() {
  return canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = '#cbb59a';
    g.fillRect(0, 0, w, h);
    for (let i = 0; i < 4000; i++) {
      g.strokeStyle = `rgba(90, 60, 40, ${0.15 + rand() * 0.25})`;
      g.beginPath();
      g.moveTo(rand() * w, rand() * h);
      g.lineTo(rand() * w, rand() * h);
      g.stroke();
    }
  });
}

function labelTex(text, bg, fg = '#2c2118') {
  return canvasTex(256, 128, (g) => {
    g.fillStyle = bg;
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = fg;
    g.font = '700 36px Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 128, 68);
  });
}

function plaqueTex(text) {
  return canvasTex(512, 80, (g) => {
    g.fillStyle = '#f3e6cf';
    g.fillRect(0, 0, 512, 80);
    g.fillStyle = '#2c2118';
    g.font = '700 40px Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(text, 256, 42);
  });
}

function paperTex(title, lines) {
  return canvasTex(512, 640, (g) => {
    g.fillStyle = '#f6efe2';
    g.fillRect(0, 0, 512, 640);
    g.strokeStyle = '#c4b29a';
    g.strokeRect(18, 18, 476, 604);
    g.fillStyle = '#2c2118';
    g.font = '700 42px Georgia, serif';
    g.textAlign = 'center';
    g.fillText(title, 256, 90);
    g.font = '24px Georgia, serif';
    lines.forEach((line, i) => g.fillText(line, 256, 170 + i * 36));
  });
}

function editorTex() {
  return canvasTex(640, 400, (g, w, h) => {
    g.fillStyle = '#1e1e1e';
    g.fillRect(0, 0, w, h);
    g.fillStyle = '#252526';
    g.fillRect(0, 0, 150, h);
    g.fillStyle = '#cccccc';
    g.font = '22px ui-monospace, monospace';
    ['Fulcrum', 'Martech', 'Pricing', 'Intern'].forEach((name, i) => g.fillText(name, 16, 48 + i * 32));
    g.fillStyle = '#d4d4d4';
    g.fillText('Purplle', 180, 48);
    g.font = '18px ui-monospace, monospace';
    g.fillStyle = '#9cdcfe';
    g.fillText('experience /', 180, 90);
  });
}

const mat = {
  wall: new THREE.MeshStandardMaterial({ map: plaster(), roughness: 0.92, metalness: 0 }),
  floor: new THREE.MeshStandardMaterial({ map: boards(), roughness: 0.78, metalness: 0 }),
  wood: new THREE.MeshStandardMaterial({ color: '#6b4128', roughness: 0.72 }),
  desk: new THREE.MeshStandardMaterial({ color: '#3a2a22', roughness: 0.62 }),
  cloth: new THREE.MeshStandardMaterial({ color: '#2f4d73', roughness: 0.9 }),
  sheet: new THREE.MeshStandardMaterial({ color: '#f3efe6', roughness: 0.95 }),
  rug: new THREE.MeshStandardMaterial({ map: rugTex(), roughness: 1 }),
  metal: new THREE.MeshStandardMaterial({ color: '#d9dde2', roughness: 0.35, metalness: 0.6 }),
  plant: new THREE.MeshStandardMaterial({ color: '#3f6b3a', roughness: 0.8 }),
  pot: new THREE.MeshStandardMaterial({ color: '#c47a4a', roughness: 0.7 }),
  glass: new THREE.MeshStandardMaterial({ color: '#d7e7f5', roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22 }),
  dark: new THREE.MeshStandardMaterial({ color: '#1c1c1c', roughness: 0.5, metalness: 0.1 }),
  screen: new THREE.MeshStandardMaterial({ map: editorTex(), emissive: '#8fb4d6', emissiveIntensity: 0.08, roughness: 0.45 }),
  shade: new THREE.MeshStandardMaterial({ color: '#f3d7a1', emissive: '#e7b15a', emissiveIntensity: 0.6, roughness: 0.45 }),
};

function add(group, geo, material, x, y, z, opts = {}) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (opts.rot) mesh.rotation.set(opts.rot[0], opts.rot[1], opts.rot[2]);
  mesh.castShadow = opts.cast !== false;
  mesh.receiveShadow = opts.receive !== false;
  if (opts.hot) mesh.userData.hot = opts.hot;
  group.add(mesh);
  return mesh;
}

function buildWalls(group) {
  const wallH = H;
  add(group, new THREE.BoxGeometry(W + 0.2, 0.08, D + 0.2), mat.floor, 0, -0.04, 0, { cast: false });
  add(group, new THREE.BoxGeometry(T, wallH, D), mat.wall, -HALF_W - T / 2, wallH / 2, 0);
  add(group, new THREE.BoxGeometry(T, wallH, D), mat.wall, HALF_W + T / 2, wallH / 2, 0);

  const win = { x0: 0.95, x1: 1.85, y0: 1.02, y1: 2.08 };
  const z = -HALF_D - T / 2;
  const leftW = win.x0 - (-HALF_W);
  add(group, new THREE.BoxGeometry(leftW, wallH, T), mat.wall, -HALF_W + leftW / 2, wallH / 2, z);
  const rightW = HALF_W - win.x1;
  add(group, new THREE.BoxGeometry(rightW, wallH, T), mat.wall, win.x1 + rightW / 2, wallH / 2, z);
  const winW = win.x1 - win.x0;
  add(group, new THREE.BoxGeometry(winW, win.y0, T), mat.wall, (win.x0 + win.x1) / 2, win.y0 / 2, z);
  add(group, new THREE.BoxGeometry(winW, wallH - win.y1, T), mat.wall, (win.x0 + win.x1) / 2, win.y1 + (wallH - win.y1) / 2, z);
  add(group, new THREE.BoxGeometry(winW + 0.08, 0.05, 0.14), mat.wood, (win.x0 + win.x1) / 2, win.y0, -HALF_D + 0.04, { cast: false });
  add(group, new THREE.PlaneGeometry(winW - 0.04, win.y1 - win.y0 - 0.04), new THREE.MeshBasicMaterial({ color: '#6aafdf' }), (win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, -HALF_D - T - 0.01, { cast: false, receive: false });
  add(group, new THREE.PlaneGeometry(winW - 0.08, win.y1 - win.y0 - 0.08), mat.glass, (win.x0 + win.x1) / 2, (win.y0 + win.y1) / 2, -HALF_D + 0.01, { cast: false, receive: false });

  const path = [[-HALF_W + 0.01, HALF_D - 0.02], [-HALF_W + 0.01, -HALF_D + 0.01], [HALF_W - 0.01, -HALF_D + 0.01], [HALF_W - 0.01, HALF_D - 0.02]];
  const trim = new THREE.Mesh(sweep([[0, 0], [0.018, 0], [0.024, 0.08], [0, 0.09]], path, { y: 0, side: -1 }), mat.wood);
  trim.castShadow = false;
  trim.receiveShadow = true;
  group.add(trim);
}

function buildShelves(group) {
  SKILL_ROWS.forEach((row, index) => {
    const y = 0.42 + (SKILL_ROWS.length - 1 - index) * 0.28;
    const shelf = add(group, new THREE.BoxGeometry(2.55, 0.028, 0.22), mat.wood, -0.55, y, -HALF_D + 0.16, { cast: true });
    shelf.userData.hot = row.id;
    const plaque = add(group, new THREE.PlaneGeometry(0.62, 0.1), new THREE.MeshStandardMaterial({ map: plaqueTex(row.label), roughness: 0.8 }), -1.22, y + 0.055, -HALF_D + 0.3, { cast: false });
    plaque.userData.hot = row.id;
    const gap = Math.min(0.2, 2.05 / Math.max(row.items.length - 1, 1));
    row.items.forEach((item, i) => {
      const x = -0.35 + (i - (row.items.length - 1) / 2) * gap;
      const cube = add(group, new THREE.BoxGeometry(0.12, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: item[1], roughness: 0.55 }), x, y + 0.075, -HALF_D + 0.16, { hot: row.id });
      const face = add(group, new THREE.PlaneGeometry(0.1, 0.05), new THREE.MeshStandardMaterial({ map: labelTex(item[0], '#fff8ee'), roughness: 0.7 }), x, y + 0.075, -HALF_D + 0.225, { cast: false, hot: row.id });
      face.position.z = cube.position.z + 0.062;
    });
  });
}

function buildDesk(group) {
  const x = -HALF_W + 0.38;
  add(group, new THREE.BoxGeometry(0.62, 0.04, 1.45), mat.desk, x, 0.74, -0.15);
  for (const [dz, dx] of [[-0.62, -0.22], [-0.62, 0.22], [0.62, -0.22], [0.62, 0.22]]) {
    add(group, new THREE.BoxGeometry(0.05, 0.72, 0.05), mat.desk, x + dx, 0.36, -0.15 + dz);
  }
  const screen = add(group, new THREE.BoxGeometry(0.03, 0.4, 0.66), mat.screen, x + 0.02, 1.08, -0.45, { hot: 'pc' });
  add(group, new THREE.BoxGeometry(0.08, 0.28, 0.08), mat.dark, x + 0.02, 0.88, -0.45, { hot: 'pc' });
  add(group, new THREE.BoxGeometry(0.22, 0.02, 0.36), mat.dark, x + 0.18, 0.77, 0.02, { hot: 'pc' });
  add(group, new THREE.BoxGeometry(0.08, 0.02, 0.12), mat.dark, x + 0.22, 0.77, 0.12, { hot: 'pc' });
  screen.userData.hot = 'pc';

  const shade = add(group, lathe([[0.02, 0], [0.02, 0.08], [0.09, 0.1], [0.11, 0.2], [0.04, 0.22]], 16), mat.shade, x - 0.16, 0.78, -0.78, { cast: false });
  shade.userData.hot = 'pc';
  const light = new THREE.PointLight('#ffd2a4', 2.2, 2.4, 2);
  light.position.set(x - 0.16, 1.05, -0.78);
  group.add(light);

  const seat = add(group, new THREE.BoxGeometry(0.46, 0.06, 0.46), mat.sheet, x + 0.72, 0.5, -0.35);
  add(group, new THREE.BoxGeometry(0.42, 0.42, 0.05), mat.sheet, x + 0.52, 0.78, -0.35);
  add(group, new THREE.CylinderGeometry(0.04, 0.05, 0.42, 12), mat.metal, x + 0.72, 0.26, -0.35);
  add(group, new THREE.CylinderGeometry(0.22, 0.22, 0.02, 16), mat.metal, x + 0.72, 0.05, -0.35, { cast: false });
  void seat;
}

function buildBooks(group) {
  const x = -HALF_W + 0.42;
  const z = 0.42;
  const yaw = 0.12;
  add(group, new THREE.BoxGeometry(0.26, 0.05, 0.34), new THREE.MeshStandardMaterial({ color: '#8e3d5c', roughness: 0.7 }), x, 0.79, z, { rot: [0, yaw, 0], hot: 'book-school' });
  add(group, new THREE.PlaneGeometry(0.22, 0.28), new THREE.MeshStandardMaterial({ map: labelTex('School', '#f6efe2'), roughness: 0.85 }), x, 0.818, z, { rot: [-Math.PI / 2, 0, -yaw], hot: 'book-school', cast: false });
  add(group, new THREE.BoxGeometry(0.24, 0.045, 0.32), new THREE.MeshStandardMaterial({ color: '#3d5a80', roughness: 0.7 }), x + 0.01, 0.86, z - 0.01, { rot: [0, -0.08, 0], hot: 'book-degree' });
  add(group, new THREE.PlaneGeometry(0.2, 0.26), new THREE.MeshStandardMaterial({ map: labelTex('B.Tech', '#f6efe2'), roughness: 0.85 }), x + 0.01, 0.886, z - 0.01, { rot: [-Math.PI / 2, 0, 0.08], hot: 'book-degree', cast: false });
}

function buildCerts(group) {
  CERTS.forEach((cert, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const y = 1.95 - row * 0.48;
    const z = -1.35 + col * 0.48;
    const x = -HALF_W + 0.03;
    add(group, new THREE.BoxGeometry(0.03, 0.36, 0.42), mat.wood, x, y, z, { hot: cert.id });
    add(group, new THREE.PlaneGeometry(0.34, 0.28), new THREE.MeshStandardMaterial({ map: paperTex(cert.title, []), roughness: 0.85 }), x + 0.02, y, z, { rot: [0, Math.PI / 2, 0], hot: cert.id, cast: false });
  });
}

function buildBed(group) {
  add(group, new THREE.BoxGeometry(1.15, 0.28, 2.05), mat.wood, 1.15, 0.2, 0.35);
  add(group, new THREE.BoxGeometry(1.08, 0.14, 1.95), mat.cloth, 1.15, 0.4, 0.35);
  add(group, new THREE.BoxGeometry(0.42, 0.12, 0.28), mat.sheet, 1.15, 0.5, -0.45);
  const phone = add(group, new THREE.BoxGeometry(0.09, 0.014, 0.18), mat.dark, 1.22, 0.5, 0.42, { rot: [0, 0.35, 0], hot: 'phone' });
  const glass = add(group, new THREE.PlaneGeometry(0.074, 0.15), new THREE.MeshStandardMaterial({ color: '#dfe7ea', roughness: 0.3, metalness: 0.1, emissive: '#9bb0b8', emissiveIntensity: 0.15 }), 0, 0.009, 0, { rot: [-Math.PI / 2, 0, 0], cast: false, hot: 'phone' });
  phone.add(glass);
}

function buildMasks(group) {
  const tex = new THREE.TextureLoader().load('icons/masks.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  add(group, new THREE.BoxGeometry(0.04, 0.46, 0.62), mat.wood, HALF_W - 0.02, 1.6, -0.15, { hot: 'drama' });
  add(group, new THREE.PlaneGeometry(0.52, 0.36), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), HALF_W - 0.045, 1.6, -0.15, { rot: [0, -Math.PI / 2, 0], hot: 'drama', cast: false });
}

function buildPlant(group) {
  add(group, lathe([[0.12, 0], [0.14, 0.08], [0.16, 0.16], [0.12, 0.28], [0.14, 0.3]], 16), mat.pot, 1.45, 0, -1.4);
  add(group, new THREE.SphereGeometry(0.22, 12, 10), mat.plant, 1.45, 0.48, -1.4);
  add(group, new THREE.SphereGeometry(0.16, 12, 10), mat.plant, 1.28, 0.58, -1.28);
  add(group, new THREE.SphereGeometry(0.14, 12, 10), mat.plant, 1.6, 0.6, -1.5);
}

function buildRug(group) {
  const rug = add(group, new THREE.CircleGeometry(0.85, 40), mat.rug, 0.05, 0.012, 0.15, { rot: [-Math.PI / 2, 0, 0], cast: false });
  rug.receiveShadow = true;
}

export function buildScene() {
  const group = new THREE.Group();
  group.name = 'room';
  buildWalls(group);
  buildRug(group);
  buildShelves(group);
  buildDesk(group);
  buildBooks(group);
  buildCerts(group);
  buildBed(group);
  buildMasks(group);
  buildPlant(group);
  return { group, update() {} };
}
