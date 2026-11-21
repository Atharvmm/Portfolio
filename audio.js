// Lo-fi on the desk speaker. Playback waits for a user gesture. Notes are a small pool.
import * as THREE from 'three';

export const MUSIC = {
  src: 'public/audio/lofi.mp3',
  volume: 0.32,
  storageKey: 'atharv-room-music',
};

export function bindAudio({ scene, speaker, noteTexture, reduced }) {
  const audio = new Audio(MUSIC.src);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = MUSIC.volume;
  const button = document.getElementById('music');
  let want = localStorage.getItem(MUSIC.storageKey) === 'on';
  let playing = false;
  const pool = [];
  const notes = new THREE.Group();
  notes.name = 'notes';
  scene.add(notes);
  const mat = new THREE.SpriteMaterial({ map: noteTexture, transparent: true, depthWrite: false });
  for (let i = 0; i < 10; i++) {
    const sprite = new THREE.Sprite(mat.clone());
    sprite.visible = false;
    sprite.userData.noAO = true;
    sprite.scale.setScalar(0.08);
    notes.add(sprite);
    pool.push({ sprite, life: 0, age: 0 });
  }

  function paint() {
    button.setAttribute('aria-pressed', String(want));
    button.setAttribute('aria-label', want ? 'Pause the lo-fi' : 'Play the lo-fi');
  }
  function start() {
    if (!want || playing) return;
    audio.play().then(() => { playing = true; }).catch(() => { playing = false; });
  }
  function stop() {
    audio.pause();
    playing = false;
  }
  button.addEventListener('click', () => {
    want = !want;
    localStorage.setItem(MUSIC.storageKey, want ? 'on' : 'off');
    paint();
    if (want) start();
    else stop();
  });
  addEventListener('pointerdown', () => { if (want) start(); });
  paint();

  let spawn = 0;
  const origin = new THREE.Vector3();
  return {
    update(dt) {
      if (playing && !reduced) {
        spawn += dt;
        if (spawn > 0.55) {
          spawn = 0;
          const slot = pool.find((item) => item.life <= 0);
          if (slot && speaker) {
            speaker.getWorldPosition(origin);
            slot.sprite.visible = true;
            slot.sprite.position.copy(origin);
            slot.sprite.userData.drift = (Math.random() - 0.5) * 0.25;
            slot.life = 2.4;
            slot.age = 0;
          }
        }
      }
      for (const slot of pool) {
        if (slot.life <= 0) continue;
        slot.age += dt;
        slot.life -= dt;
        slot.sprite.position.y += dt * 0.22;
        slot.sprite.position.x += slot.sprite.userData.drift * dt;
        const k = Math.max(slot.life / 2.4, 0);
        slot.sprite.material.opacity = k;
        slot.sprite.scale.setScalar(0.07 + (1 - k) * 0.06);
        if (slot.life <= 0) slot.sprite.visible = false;
      }
    },
  };
}
