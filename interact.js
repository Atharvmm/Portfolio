// Hover scale, pointer, and a crisp HTML name. Raycasts only the clickable meshes.
import { BOOKS, CERTS, DRAMA, PHONE, SKILL_COPY } from './content.js';

const NAMES = {
  pc: 'Purplle',
  phone: 'Phone',
  drama: DRAMA.title,
  clock: 'Wall clock',
  ...Object.fromEntries(Object.entries(BOOKS).map(([id, book]) => [id, book.title])),
  ...Object.fromEntries(Object.entries(SKILL_COPY).map(([id, row]) => [id, row.title])),
  ...Object.fromEntries(CERTS.map((cert) => [cert.id, cert.title])),
  ...Object.fromEntries(PHONE.map((app) => [app.name, app.name])),
};

export function bindInteraction({ canvas, camera, root, openHot, raycaster, reduced }) {
  const tip = document.getElementById('tip');
  const hits = [];
  root.traverse((obj) => { if (obj.isMesh && obj.userData.hot) hits.push(obj); });
  const groups = [];
  root.traverse((obj) => { if (obj.userData.interactive) groups.push(obj); });
  let current = null;
  let press = null;
  const pointer = { x: 0, y: 0 };
  const ndc = { x: 0, y: 0 };

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const found = raycaster.intersectObjects(hits, false);
    return found.length ? found[0].object.userData.hot : null;
  }

  function placeTip(event, id) {
    tip.hidden = false;
    tip.textContent = NAMES[id] || id;
    const pad = 14;
    const x = Math.min(event.clientX + pad, innerWidth - tip.offsetWidth - 8);
    const y = Math.min(event.clientY + pad, innerHeight - tip.offsetHeight - 8);
    tip.style.left = `${Math.max(8, x)}px`;
    tip.style.top = `${Math.max(8, y)}px`;
  }

  canvas.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    const id = pick(event);
    canvas.style.cursor = id ? 'pointer' : '';
    if (id) placeTip(event, id);
    else tip.hidden = true;
    current = id;
  });
  canvas.addEventListener('pointerleave', () => { current = null; tip.hidden = true; canvas.style.cursor = ''; });
  canvas.addEventListener('pointerdown', (event) => { press = [event.clientX, event.clientY, pick(event)]; });
  canvas.addEventListener('pointerup', (event) => {
    const id = press && Math.hypot(event.clientX - press[0], event.clientY - press[1]) <= 10 ? pick(event) : null;
    press = null;
    if (event.pointerType === 'touch') current = null;
    if (id) {
      current = null;
      tip.hidden = true;
      openHot(id);
    }
  });

  return {
    update(dt) {
      const k = reduced ? 1 : 1 - Math.exp(-dt * 10);
      for (const group of groups) {
        const goal = group.userData.hot === current || group.userData.hot === press?.[2] ? 1.07 : 1;
        const s = group.scale.x + (goal - group.scale.x) * k;
        group.scale.setScalar(s);
      }
      if (press && current === null) press[2] = null;
    },
  };
}
