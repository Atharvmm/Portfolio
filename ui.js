import { BOOKS, CERTS, DRAMA, PHONE, SKILL_COPY, TREES } from './content.js';

const panel = document.getElementById('panel');
const vscode = document.getElementById('vscode');
const phone = document.getElementById('phone');
const ask = document.getElementById('ask');
let fly = () => {};
let term = { tree: 'experience', file: TREES.experience.files[0], lines: ['Type ls, or cd personal. cd and a folder name opens it.'] };

export function bindCamera(flyTo) { fly = flyTo; }

function closeAll() {
  panel.hidden = true;
  vscode.hidden = true;
  phone.hidden = true;
  ask.hidden = true;
}

export function openHot(id) {
  closeAll();
  if (id === 'pc') {
    vscode.hidden = false;
    renderCode();
    fly('desk', 1.6);
    return;
  }
  if (id === 'phone') {
    renderPhone();
    phone.hidden = false;
    fly('bed', 1.6);
    return;
  }
  if (id === 'drama') {
    showPaper(DRAMA.title, DRAMA.lines);
    fly('masks', 1.5);
    return;
  }
  if (BOOKS[id]) {
    showPaper(BOOKS[id].title, BOOKS[id].lines);
    fly('books', 1.5);
    return;
  }
  if (SKILL_COPY[id]) {
    showPaper(SKILL_COPY[id].title, SKILL_COPY[id].lines);
    fly('shelf', 1.5);
    return;
  }
  const cert = CERTS.find((item) => item.id === id);
  if (cert) {
    showPaper(cert.title, [cert.detail, 'The other frames on this wall are the rest of the short courses.']);
    fly('certs', 1.5);
  }
}

function showPaper(title, lines) {
  panel.hidden = false;
  panel.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'panel-head';
  const h = document.createElement('h2');
  h.textContent = title;
  const close = document.createElement('button');
  close.type = 'button';
  close.textContent = 'Back to the room';
  close.addEventListener('click', () => { panel.hidden = true; fly('room', 1.4); });
  head.append(h, close);
  panel.append(head);
  for (const line of lines) {
    const p = document.createElement('p');
    p.textContent = line;
    panel.append(p);
  }
}

function renderCode() {
  const tree = TREES[term.tree];
  vscode.querySelector('[data-tree]').textContent = tree.prompt;
  const list = vscode.querySelector('[data-files]');
  list.innerHTML = '';
  for (const file of tree.files) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = file.name;
    if (file === term.file) button.classList.add('open');
    button.addEventListener('click', () => { term.file = file; renderCode(); });
    list.append(button);
  }
  vscode.querySelector('[data-doc]').textContent = term.file ? term.file.body : tree.intro;
  vscode.querySelector('[data-tab]').textContent = term.file ? term.file.file : 'welcome';
  const log = vscode.querySelector('[data-log]');
  log.textContent = term.lines.join('\n');
  vscode.querySelector('[data-prompt]').textContent = `atharv@room ${tree.prompt} %`;
}

function runCommand(raw) {
  const text = raw.trim();
  const tree = TREES[term.tree];
  term.lines.push(`atharv@room ${tree.prompt} % ${text}`);
  const [cmd, ...rest] = text.split(/\s+/);
  const arg = rest.join(' ').toLowerCase();
  if (!cmd) return;
  if (cmd === 'help') term.lines.push('ls   cd personal   cd experience   cd ..   cd Fulcrum');
  else if (cmd === 'ls') term.lines.push(tree.files.map((file) => file.name).join('   '));
  else if (cmd === 'clear') term.lines = [];
  else if (cmd === 'cd') {
    if (!arg || arg === '~') term.lines.push('cd personal, or cd experience.');
    else if (arg === '..') {
      term.tree = term.tree === 'personal' ? 'experience' : 'experience';
      term.file = TREES[term.tree].files[0];
    } else if (arg === 'personal' || arg === 'projects') {
      term.tree = 'personal';
      term.file = TREES.personal.files[0];
    } else if (arg === 'experience' || arg === 'purplle') {
      term.tree = 'experience';
      term.file = TREES.experience.files[0];
    } else {
      const found = tree.files.find((file) => file.name.toLowerCase() === arg || file.file.startsWith(arg));
      if (found) term.file = found;
      else term.lines.push(`no such folder: ${rest.join(' ')}`);
    }
  } else term.lines.push('try help');
  if (term.lines.length > 8) term.lines = term.lines.slice(-8);
  renderCode();
}

function renderPhone() {
  const grid = phone.querySelector('[data-apps]');
  grid.innerHTML = '';
  for (const app of PHONE) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'app';
    const img = document.createElement('img');
    img.src = app.icon;
    img.alt = '';
    const name = document.createElement('span');
    name.textContent = app.name;
    button.append(img, name);
    button.addEventListener('click', () => confirmLeave(app));
    grid.append(button);
  }
}

function confirmLeave(app) {
  ask.hidden = false;
  ask.querySelector('h3').textContent = app.kind === 'mail' ? 'Write to Atharv?' : `Open ${app.name}?`;
  ask.querySelector('p').textContent = app.kind === 'mail'
    ? 'This leaves the room and opens a mail to atharv.mundhe03@gmail.com.'
    : `This leaves the room and opens ${app.name} in a new tab.`;
  const go = ask.querySelector('[data-go]');
  go.textContent = app.kind === 'mail' ? 'Write the mail' : 'Open';
  go.onclick = () => {
    if (app.kind === 'mail') location.href = app.href;
    else window.open(app.href, '_blank', 'noopener');
    ask.hidden = true;
  };
}

export function mountUi() {
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => {
      button.closest('section, dialog, div.sheet, #vscode, #phone').hidden = true;
      if (button.dataset.close === 'room') fly('room', 1.4);
    });
  });
  const input = vscode.querySelector('input');
  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    runCommand(input.value);
    input.value = '';
  });
  ask.querySelector('[data-stay]').addEventListener('click', () => { ask.hidden = true; });
  addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!ask.hidden) { ask.hidden = true; return; }
    const open = [panel, vscode, phone].some((el) => !el.hidden);
    if (open) { closeAll(); fly('room', 1.3); }
  });
  renderCode();
}
