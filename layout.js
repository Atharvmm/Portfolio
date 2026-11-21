// Room dimensions and where each wall-mounted thing is allowed to sit.
// Metres, +Y up. The inner corner is the origin. The back wall runs along +X,
// the left wall along +Z, and the room opens toward +X/+Z.

export const ROOM = {
  width: 4.4,
  depth: 3.5,
  height: 2.55,
  wall: 0.12,
  floor: 0.08,
  margin: 0.22,
};

// Back wall (inner face z = 0): shelves on the left, window on the right above the bed.
// Left wall (inner face x = 0): a tight certificate grid, then the clock, then the masks.
export const WALLS = {
  back: {
    shelves: { x: 0.22, z: 0.02, length: 2.35, y0: 0.58, y1: 2.32 },
    window: { x: 2.82, y: 1.38, w: 1.22, h: 0.82 },
  },
  left: {
    certs: { z0: 0.46, yTop: 2.18, colGap: 0.05, rowGap: 0.045, fw: 0.267, fh: 0.232 },
    clock: { z: 2.42, y: 1.82, w: 0.62, h: 0.28 },
    masks: { z: 3.08, y: 1.22 },
  },
};

export const FURNITURE = {
  desk: { x: 0.32, z: 1.08, w: 0.62, d: 1.22, top: 0.74 },
  bed: { x: 3.72, z: 1.12, w: 1.16, d: 1.96 },
  rug: { x: 2.15, z: 2.45, r: 0.68 },
  plant: { x: 2.58, z: 0.55 },
};

export function vantages() {
  const { width: W, depth: D } = ROOM;
  return {
    room: { pos: [W * 0.82, 2.05, D * 1.02], tgt: [W * 0.42, 1.0, D * 0.36] },
    desk: { pos: [1.7, 1.45, 1.7], tgt: [0.55, 0.95, 1.08] },
    shelf: { pos: [1.7, 1.7, 2.15], tgt: [1.2, 1.45, 0.15] },
    books: { pos: [1.45, 1.28, 0.7], tgt: [0.55, 0.86, 0.62] },
    certs: { pos: [1.55, 1.7, 1.15], tgt: [0.05, 1.85, 0.7] },
    bed: { pos: [2.7, 1.55, 2.55], tgt: [3.55, 0.5, 1.15] },
    masks: { pos: [1.35, 1.45, 2.55], tgt: [0.05, 1.22, 3.08] },
  };
}
