/** Shared scroll state across hero → world journey (0–1 each section). */
export const heroScroll = {
  progress: 0,
};

export const mapScroll = {
  progress: 0,
  markersVisible: false,
};

/** Clan runway asks the map to boot WebGL before the pin handoff. */
const mapMountListeners = new Set<() => void>();
export const mapMount = {
  requested: false,
  request() {
    if (this.requested) return;
    this.requested = true;
    mapMountListeners.forEach((fn) => fn());
  },
  subscribe(fn: () => void) {
    mapMountListeners.add(fn);
    if (this.requested) fn();
    return () => {
      mapMountListeners.delete(fn);
    };
  },
};

export const MAP_SIZE = 52;
export const MAP_SEGMENTS = 220;
export const MAX_DISPLACEMENT = 6.2;

/** Convert clan percentage coords → world XZ. */
export function clanToWorld(xPercent: number, yPercent: number) {
  const x = (xPercent / 100 - 0.5) * MAP_SIZE;
  const z = (yPercent / 100 - 0.5) * MAP_SIZE;
  return { x, z };
}

/** Cheap value noise for procedural terrain. */
export function valueNoise(x: number, z: number) {
  const s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

export function fbm(x: number, z: number) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 5; i++) {
    v += a * valueNoise(x * f, z * f);
    a *= 0.5;
    f *= 2.05;
  }
  return v;
}

/** Normalized 0–1 height factors for Bicheon-like basin layout. */
export function bicheonHeightNorm(wx: number, wz: number) {
  const nx = wx / MAP_SIZE;
  const nz = wz / MAP_SIZE;
  let n = fbm(nx * 2.8 + 4, nz * 2.8 + 9);
  n = Math.pow(n, 1.2);

  const northMount =
    Math.max(0, 0.62 - (nz + 0.42) * 1.8) *
    (0.7 + fbm(nx * 5, nz * 5) * 0.5);
  const eastMount =
    Math.max(0, nx - 0.22) * 1.1 * (0.55 + fbm(nx * 4 + 2, nz * 4) * 0.5);
  const westMount =
    Math.max(0, -nx - 0.18) * 0.9 * (0.5 + fbm(nx * 4, nz * 3) * 0.4);
  const basin = Math.max(0, 0.38 - Math.hypot(nx - 0.02, nz - 0.02) * 1.35);
  const coast = Math.max(0, -nx * 0.55 + nz * 0.5 - 0.08);
  // River south of Bicheon — keep the keep dry
  const riverPath = Math.abs(nz - 0.42 - Math.sin(nx * 3.2) * 0.08) * 3.2;
  const nearKeep = Math.hypot(wx - 1, wz - 1) < 9.5;
  const river = nearKeep ? 0 : Math.max(0, 1 - riverPath) * 0.55;

  let h =
    n * 0.42 +
    northMount * 0.95 +
    eastMount * 0.75 +
    westMount * 0.55 -
    basin * 0.42 -
    coast * 0.5 -
    river * 0.35;

  // Soft edge falloff so the landmass blends into ocean (less diorama tile)
  const edge = Math.max(Math.abs(nx), Math.abs(nz));
  const rim = Math.max(0, (edge - 0.42) / 0.12);
  h *= 1 - rim * rim;

  // Deep flat bailey pad — kill mountain / rock spikes under the fortress
  const castleDist = Math.hypot(wx - 1, wz - 1);
  if (castleDist < 8.5) {
    h = 0.06;
  } else if (castleDist < 13) {
    const t = (castleDist - 8.5) / 4.5;
    h = Math.min(h, 0.06 + t * 0.28);
  }

  return Math.max(0.02, Math.min(1, h));
}

export function bicheonWorldHeight(wx: number, wz: number) {
  return bicheonHeightNorm(wx, wz) * MAX_DISPLACEMENT * 0.95;
}

/** Live height sampler — props / beacons sit on the same surface as the mesh. */
export const terrainHeightAt = {
  sample: bicheonWorldHeight,
};
