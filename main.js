// Renderer, camera, post-processing, quality tiers, camera flights and the frame loop.
//   ?view=room|desk|shelf|books|certs|bed|masks   ?quality=high|balanced|fast   ?hour=21
//   ?record=1   hides the UI and plays a scripted tour on the page clock
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { createEnvironment, U } from './env.js';
import { buildScene } from './scene.js';
import { bindCamera, mountUi, openHot } from './ui.js';
import { ROOM, vantages } from './layout.js';
import { istNow, sampleLight, tickLighting } from './lighting.js';
import { bindInteraction } from './interact.js';
import { bindAudio } from './audio.js';

const params = new URLSearchParams(location.search);
const RECORD = params.has('record');
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const SMALL = Math.min(innerWidth, innerHeight) < 760;

RectAreaLightUniformsLib.init();

export const VANTAGE = vantages();

const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', preserveDrawingBuffer: RECORD, stencil: false });
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
let pixelRatio = Math.min(devicePixelRatio, 2);
renderer.setPixelRatio(pixelRatio);
renderer.setSize(innerWidth, innerHeight, false);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.05, 80);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = 1.15;
controls.minPolarAngle = 0.78;
controls.enablePan = true;
controls.panSpeed = 0.35;
controls.zoomSpeed = 0.7;

const light = sampleLight(istNow().hour);
const env = createEnvironment(renderer, scene, { preset: light.nearest, scale: 10 });
const world = buildScene();
scene.add(world.group);
const maxAniso = renderer.capabilities.getMaxAnisotropy();
scene.traverse((obj) => {
  if (obj.isPoints || obj.renderOrder < 0) obj.userData.noAO = true;
  const materials = [].concat(obj.material || []);
  for (const material of materials) {
    for (const key of ['map', 'normalMap', 'roughnessMap', 'emissiveMap']) {
      if (material[key]) material[key].anisotropy = maxAniso;
    }
  }
});

class SelectiveGTAO extends GTAOPass {
  overrideVisibility() {
    super.overrideVisibility();
    this.scene.traverse((obj) => { if (obj.userData.noAO) obj.visible = false; });
  }
}
const size = renderer.getDrawingBufferSize(new THREE.Vector2());
const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples: SMALL ? 0 : 2 });
const composer = new EffectComposer(renderer, target);
composer.addPass(new RenderPass(scene, camera));
const gtao = new SelectiveGTAO(scene, camera, size.x, size.y);
gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.4, thickness: 0.5, scale: 0.85, samples: 8 });
gtao.updatePdMaterial({ radius: 4, rings: 2, samples: 8 });
gtao.blendIntensity = 0.7;
composer.addPass(gtao);
const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), 0.08, 0.4, 0.92);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function fitFov(aspect, base = 38, baseAspect = 16 / 9) {
  if (aspect >= baseAspect) return base;
  const h = Math.tan(THREE.MathUtils.degToRad(base) / 2) * baseAspect;
  return Math.min(THREE.MathUtils.radToDeg(2 * Math.atan(h / aspect)), 68);
}

function frameRoom() {
  camera.aspect = innerWidth / innerHeight;
  camera.fov = fitFov(camera.aspect);
  camera.updateProjectionMatrix();
  const portrait = camera.aspect < 0.9;
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const radius = Math.hypot(ROOM.width, ROOM.depth) * 0.62;
  const dist = (radius / Math.sin(Math.min(vFov, hFov) / 2)) * (portrait ? 0.78 : 0.66);
  const look = new THREE.Vector3(ROOM.width * 0.4, portrait ? 1.08 : 0.98, ROOM.depth * 0.36);
  const dir = new THREE.Vector3(portrait ? 0.55 : 0.72, portrait ? 0.48 : 0.38, portrait ? 0.78 : 0.58).normalize();
  const cam = look.clone().addScaledVector(dir, dist);
  VANTAGE.room = { pos: cam.toArray(), tgt: look.toArray() };
  if (!flight) {
    camera.position.copy(cam);
    controls.target.copy(look);
  }
  controls.minDistance = dist * 0.42;
  controls.maxDistance = dist * 1.02;
  const az = Math.atan2(cam.x - look.x, cam.z - look.z);
  controls.minAzimuthAngle = az - 0.9;
  controls.maxAzimuthAngle = az + 0.9;
  controls.minPolarAngle = 0.72;
  controls.maxPolarAngle = portrait ? 1.22 : 1.12;
  controls.update();
}

function resize() {
  pixelRatio = quality === 'high' ? Math.min(devicePixelRatio, 2) : quality === 'balanced' ? Math.min(devicePixelRatio, 1.5) : 1;
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(innerWidth, innerHeight);
  frameRoom();
}
addEventListener('resize', resize);

let flight = null;
const TIERS = ['high', 'balanced', 'fast'];
let quality = TIERS.includes(params.get('quality')) ? params.get('quality') : (SMALL ? 'fast' : 'high');
function setQuality(q) {
  quality = q;
  gtao.enabled = q === 'high';
  const ms = q === 'high' ? 2048 : 1024;
  if (env.sun.shadow.mapSize.x !== ms) {
    env.sun.shadow.mapSize.set(ms, ms);
    env.sun.shadow.map?.dispose();
    env.sun.shadow.map = null;
  }
  resize();
}
setQuality(quality);

const perf = { sum: 0, n: 0, since: 0 };
function watchFrameTime(dt, now) {
  if (RECORD || params.has('quality')) return;
  perf.sum += Math.min(dt, 0.5);
  perf.n += 1;
  if (now - perf.since > 1.2 && perf.n >= 8) {
    if (perf.sum / perf.n > 1 / 45 && quality !== 'fast') setQuality(TIERS[TIERS.indexOf(quality) + 1]);
    perf.sum = 0;
    perf.n = 0;
    perf.since = now;
  }
}

function flyTo(name, secs = 1.6) {
  const v = VANTAGE[name];
  if (!v) return;
  const p0 = camera.position.clone();
  const t0 = controls.target.clone();
  const p1 = new THREE.Vector3(...v.pos);
  const t1 = new THREE.Vector3(...v.tgt);
  const mid = p0.clone().lerp(p1, 0.5);
  mid.y = Math.max(mid.y, Math.max(p0.y, p1.y) + 0.15);
  flight = { p0, t0, p1, t1, mid, start: performance.now() / 1000, secs: REDUCED ? 0.001 : secs };
  controls.enabled = false;
}
function stepFlight(now) {
  if (!flight) return;
  const k = Math.min((now - flight.start) / flight.secs, 1);
  const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const a = flight.p0.clone().lerp(flight.mid, e);
  const b = flight.mid.clone().lerp(flight.p1, e);
  camera.position.copy(a.lerp(b, e));
  controls.target.copy(flight.t0).lerp(flight.t1, e);
  camera.lookAt(controls.target);
  if (k >= 1) { flight = null; controls.enabled = !RECORD; controls.update(); }
}

function clampView() {
  if (flight) return;
  controls.target.x = THREE.MathUtils.clamp(controls.target.x, 0.5, ROOM.width - 0.45);
  controls.target.y = THREE.MathUtils.clamp(controls.target.y, 0.65, 1.5);
  controls.target.z = THREE.MathUtils.clamp(controls.target.z, 0.35, ROOM.depth - 0.2);
  camera.position.x = Math.max(camera.position.x, 0.28);
  camera.position.y = Math.max(camera.position.y, 0.5);
  camera.position.z = Math.max(camera.position.z, 0.28);
}

const requested = params.get('view');
if (requested && VANTAGE[requested]) {
  camera.position.set(...VANTAGE[requested].pos);
  controls.target.set(...VANTAGE[requested].tgt);
  controls.update();
}

addEventListener('keydown', (event) => {
  const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
  if (typing) return;
  const i = ['1', '2', '3', '4', '5', '6', '7'].indexOf(event.key);
  if (i >= 0) flyTo(Object.keys(VANTAGE)[i]);
});

const raycaster = new THREE.Raycaster();
const hover = bindInteraction({ canvas, camera, root: world.group, openHot, raycaster, reduced: REDUCED });
const music = bindAudio({ scene, speaker: world.speaker, noteTexture: world.noteTex, reduced: REDUCED });
bindCamera(flyTo);
mountUi();
tickLighting(env);
addEventListener('zone-change', () => tickLighting(env, new Date(), 1.5));

if (RECORD) {
  controls.enabled = false;
  document.getElementById('music').style.display = 'none';
  const TOUR = [[0.5, 'room'], [5, 'desk'], [10, 'shelf'], [15, 'bed']];
  let next = 0;
  window.__recordFrame = (t) => {
    while (next < TOUR.length && t >= TOUR[next][0]) flyTo(TOUR[next++][1], 3.6);
  };
}

const disposables = [];
scene.traverse((obj) => {
  if (obj.geometry) disposables.push(obj.geometry);
  const materials = [].concat(obj.material || []);
  for (const material of materials) disposables.push(material);
});
addEventListener('pagehide', () => {
  for (const item of disposables) item.dispose?.();
  composer.dispose();
  renderer.dispose();
});

window.__app = { scene, camera, controls, renderer, env, flyTo, setQuality, VANTAGE, U };

let loopOn = true;
let last = performance.now() / 1000;
let frames = 0;
function frame() {
  if (document.hidden) { loopOn = false; return; }
  const now = performance.now() / 1000;
  const dt = Math.min(now - last, 0.05);
  last = now;
  U.uTime.value = now;
  stepFlight(now);
  if (!flight && controls.enabled) controls.update();
  clampView();
  env.update(camera, controls.target);
  if (frames % 60 === 0) tickLighting(env);
  world.update();
  hover.update(dt);
  music.update(dt);
  const night = U.uNight.value;
  bloom.strength = 0.05 + 0.22 * night;
  bloom.threshold = 0.92 - 0.08 * night;
  composer.render();
  watchFrameTime(dt, now);
  if (++frames === 3) { document.getElementById('loader').classList.add('done'); window.__ready = true; }
  requestAnimationFrame(frame);
}
addEventListener('visibilitychange', () => {
  if (!document.hidden && !loopOn) {
    loopOn = true;
    last = performance.now() / 1000;
    requestAnimationFrame(frame);
  }
});
requestAnimationFrame(frame);
