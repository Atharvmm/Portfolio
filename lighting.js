// The selected timezone drives the sky. Ranges and the blend width live here;
// the colours, sun angles and intensities live in env.js PRESETS.
import * as THREE from 'three';
import { PRESETS } from './env.js';

export const LIGHTING = {
  blendHours: 0.5,
  states: [
    { id: 'morning', from: 5.5, to: 11, preset: 'morning' },
    { id: 'afternoon', from: 11, to: 16.5, preset: 'afternoon' },
    { id: 'evening', from: 16.5, to: 19, preset: 'golden' },
    { id: 'night', from: 19, to: 5.5, preset: 'night' },
  ],
};

export const ZONES = [
  { id: 'Asia/Kolkata', city: 'Mumbai' },
  { id: 'UTC', city: 'UTC' },
  { id: 'Europe/London', city: 'London' },
  { id: 'Europe/Paris', city: 'Paris' },
  { id: 'Europe/Berlin', city: 'Berlin' },
  { id: 'Asia/Dubai', city: 'Dubai' },
  { id: 'Asia/Singapore', city: 'Singapore' },
  { id: 'Asia/Tokyo', city: 'Tokyo' },
  { id: 'Australia/Sydney', city: 'Sydney' },
  { id: 'Pacific/Auckland', city: 'Auckland' },
  { id: 'Europe/Moscow', city: 'Moscow' },
  { id: 'Africa/Johannesburg', city: 'Johannesburg' },
  { id: 'America/Sao_Paulo', city: 'Sao Paulo' },
  { id: 'America/New_York', city: 'New York' },
  { id: 'America/Chicago', city: 'Chicago' },
  { id: 'America/Denver', city: 'Denver' },
  { id: 'America/Los_Angeles', city: 'Los Angeles' },
  { id: 'America/Toronto', city: 'Toronto' },
  { id: 'America/Vancouver', city: 'Vancouver' },
];

const STORAGE = 'atharv-room-zone';
const params = new URLSearchParams(location.search);
let zone = localStorage.getItem(STORAGE);
if (!ZONES.some((item) => item.id === zone)) zone = 'Asia/Kolkata';

export function getZone() { return zone; }

export function zoneCity(id = zone) {
  return ZONES.find((item) => item.id === id)?.city || id;
}

export function setZone(id) {
  if (!ZONES.some((item) => item.id === id) || id === zone) return false;
  zone = id;
  localStorage.setItem(STORAGE, id);
  dispatchEvent(new CustomEvent('zone-change'));
  return true;
}

function partsOf(now, timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'short',
  }).formatToParts(now);
  const n = (type) => parts.find((part) => part.type === type)?.value || '';
  return n;
}

// Current local time in the selected zone. ?hour= forces that zone's hour.
export function zoneNow(now = new Date()) {
  const n = partsOf(now, zone);
  const forced = params.get('hour');
  const h = forced !== null && forced !== '' ? ((Number(forced) % 24) + 24) % 24 : Number(n('hour'));
  const m = forced !== null && forced !== '' ? 0 : Number(n('minute'));
  const s = forced !== null && forced !== '' ? 0 : Number(n('second'));
  const ms = forced !== null && forced !== '' ? 0 : now.getMilliseconds();
  const h12 = h % 12 || 12;
  return {
    h, m, s, ms,
    hour: h + m / 60 + s / 3600 + ms / 3600000,
    h12,
    ap: h >= 12 ? 'PM' : 'AM',
    weekday: (n('weekday') || '').toUpperCase(),
    day: n('day'),
    month: n('month'),
    abbr: n('timeZoneName') || 'UTC',
    city: zoneCity(),
    zone,
  };
}

export function istNow(now = new Date()) { return zoneNow(now); }

function mixHex(a, b, k) {
  return '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
}

function mixPreset(aName, bName, k) {
  const a = PRESETS[aName];
  const b = PRESETS[bName];
  const out = {};
  for (const key of Object.keys(a)) {
    out[key] = typeof a[key] === 'number' ? THREE.MathUtils.lerp(a[key], b[key], k) : mixHex(a[key], b[key], k);
  }
  return out;
}

// Hour wrapped so the night block (19:00 to 05:30) is one continuous span.
export function sampleLight(hour = zoneNow().hour) {
  let h = hour;
  if (h < 5.5) h += 24;
  const stops = [
    { at: 5.5, preset: 'morning' },
    { at: 11, preset: 'afternoon' },
    { at: 16.5, preset: 'golden' },
    { at: 19, preset: 'night' },
    { at: 29.5, preset: 'morning' },
  ];
  let i = 0;
  while (stops[i + 1] && h >= stops[i + 1].at) i += 1;
  const a = stops[i];
  const b = stops[i + 1];
  const span = b.at - a.at;
  const u = (h - a.at) / span;
  const edge = LIGHTING.blendHours / span;
  const k = u > 1 - edge ? (u - (1 - edge)) / edge : 0;
  return { nearest: k < 0.5 ? a.preset : b.preset, values: mixPreset(a.preset, b.preset, k) };
}

let lastKey = '';
let primed = false;

export function tickLighting(env, now = new Date(), seconds = null) {
  const goal = sampleLight(zoneNow(now).hour);
  const key = JSON.stringify(goal.values);
  if (!primed) {
    primed = true;
    lastKey = key;
    env.pose(goal.values, 0.01);
    env.current = goal.nearest;
    return goal;
  }
  if (seconds != null || key !== lastKey) {
    lastKey = key;
    env.current = goal.nearest;
    env.pose(goal.values, seconds != null ? seconds : 8);
  }
  return goal;
}
