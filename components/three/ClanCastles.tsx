"use client";

/**
 * Modular Kenney Castle Kit keeps — CC0 (kenney.nl).
 * Unique stone / slate / banner per clan; planted into terrain footings.
 * @see https://kenney.nl/assets/castle-kit
 */

import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { CLANS, type Clan } from "@/lib/clans";
import { clanToWorld, terrainHeightAt } from "@/lib/mapWorld";

const BASE = "/models/castle";

type PieceName =
  | "tower-square-base"
  | "tower-square-mid"
  | "tower-square-mid-door"
  | "tower-square-mid-windows"
  | "tower-square-top"
  | "tower-square-roof"
  | "tower-square-arch"
  | "tower-hexagon-base"
  | "tower-hexagon-mid"
  | "tower-hexagon-top"
  | "tower-hexagon-roof"
  | "wall"
  | "wall-corner"
  | "wall-doorway"
  | "wall-narrow"
  | "wall-narrow-gate"
  | "gate"
  | "flag-banner-long"
  | "stairs-stone"
  | "bridge-straight";

type ClanColors = { stone: string; slate: string; banner: string };

const colormapCache = new WeakMap<THREE.Texture, THREE.CanvasTexture>();

function getArcColormap(source: THREE.Texture): THREE.CanvasTexture {
  const hit = colormapCache.get(source);
  if (hit) return hit;
  const img = source.image as
    | HTMLImageElement
    | ImageBitmap
    | HTMLCanvasElement
    | undefined;
  const w = (img as HTMLImageElement)?.width || 64;
  const h = (img as HTMLImageElement)?.height || 64;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  if (img) ctx.drawImage(img as CanvasImageSource, 0, 0);
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (b > r + 20 && b > g + 5) {
      px[i] = 160;
      px[i + 1] = 160;
      px[i + 2] = 165;
      continue;
    }
    if (r > 130 && r > g && g > b) {
      px[i] = 180;
      px[i + 1] = 175;
      px[i + 2] = 165;
      continue;
    }
    const avg = (r + g + b) / 3;
    px[i] = Math.round(avg * 0.85 + 30);
    px[i + 1] = Math.round(avg * 0.85 + 28);
    px[i + 2] = Math.round(avg * 0.85 + 24);
  }
  ctx.putImageData(data, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = false;
  tex.needsUpdate = true;
  colormapCache.set(source, tex);
  return tex;
}

function rematerialize(
  root: THREE.Object3D,
  stone: string,
  slate: string,
  banner: string,
) {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    mats.forEach((m, idx) => {
      const src = m as THREE.MeshStandardMaterial;
      if (!src) return;
      const mat = src.clone();
      const name = `${mesh.name} ${src.name ?? ""}`.toLowerCase();
      const isFlag = name.includes("flag") || name.includes("banner");
      const isRoof = name.includes("roof");
      if (isFlag) {
        mat.map = null;
        mat.color = new THREE.Color(banner);
        mat.emissive = new THREE.Color(banner);
        mat.emissiveIntensity = 0.45;
        mat.roughness = 0.55;
        mat.metalness = 0.08;
      } else if (isRoof) {
        mat.map = null;
        mat.color = new THREE.Color(slate);
        mat.roughness = 0.78;
        mat.metalness = 0.14;
      } else {
        if (mat.map) mat.map = getArcColormap(mat.map);
        mat.color = new THREE.Color(stone);
        mat.roughness = 0.9;
        mat.metalness = 0.05;
      }
      mat.needsUpdate = true;
      if (Array.isArray(mesh.material)) mesh.material[idx] = mat;
      else mesh.material = mat;
    });
  });
}

function Piece({
  name,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  colors,
}: {
  name: PieceName;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  colors: ClanColors;
}) {
  const { scene } = useGLTF(`${BASE}/${name}.glb`);
  const cloned = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Group;
    rematerialize(c, colors.stone, colors.slate, colors.banner);
    return c;
  }, [scene, colors.stone, colors.slate, colors.banner]);

  return (
    <primitive
      object={cloned}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function SquareTower({
  x,
  z,
  floors = 1,
  door = false,
  windows = false,
  colors,
}: {
  x: number;
  z: number;
  floors?: number;
  door?: boolean;
  windows?: boolean;
  colors: ClanColors;
}) {
  const mid = door
    ? "tower-square-mid-door"
    : windows
      ? "tower-square-mid-windows"
      : "tower-square-mid";
  return (
    <group position={[x, 0, z]}>
      <Piece name="tower-square-base" colors={colors} />
      {Array.from({ length: floors }).map((_, i) => (
        <Piece
          key={i}
          name={i === 0 ? (mid as PieceName) : "tower-square-mid"}
          position={[0, 1 + i, 0]}
          colors={colors}
        />
      ))}
      <Piece name="tower-square-top" position={[0, 1 + floors, 0]} colors={colors} />
      <Piece name="tower-square-roof" position={[0, 2 + floors, 0]} colors={colors} />
    </group>
  );
}

function HexTower({
  x,
  z,
  tall = false,
  colors,
}: {
  x: number;
  z: number;
  tall?: boolean;
  colors: ClanColors;
}) {
  return (
    <group position={[x, 0, z]}>
      <Piece name="tower-hexagon-base" colors={colors} />
      <Piece name="tower-hexagon-mid" position={[0, 1, 0]} colors={colors} />
      {tall && (
        <Piece name="tower-hexagon-mid" position={[0, 2, 0]} colors={colors} />
      )}
      <Piece
        name="tower-hexagon-top"
        position={[0, tall ? 3 : 2, 0]}
        colors={colors}
      />
      <Piece
        name="tower-hexagon-roof"
        position={[0, tall ? 4 : 3, 0]}
        colors={colors}
      />
    </group>
  );
}

function KeepLayout({
  clanId,
  colors,
}: {
  clanId: string;
  colors: ClanColors;
}): ReactNode {
  switch (clanId) {
    case "luna":
      return (
        <group>
          <HexTower x={0} z={0} tall colors={colors} />
          <SquareTower x={-1.6} z={-1.2} floors={0} colors={colors} />
          <SquareTower x={1.6} z={-1.2} floors={0} colors={colors} />
          <Piece
            name="flag-banner-long"
            position={[0, 4.2, 0.2]}
            scale={0.4}
            colors={colors}
          />
        </group>
      );
    case "tgo":
      return (
        <group>
          <SquareTower x={-1.5} z={-1.5} floors={1} colors={colors} />
          <SquareTower x={1.5} z={-1.5} floors={1} colors={colors} />
          <SquareTower x={-1.5} z={1.5} floors={1} colors={colors} />
          <SquareTower x={1.5} z={1.5} floors={1} door colors={colors} />
          <Piece name="wall" position={[0, 0, -0.5]} colors={colors} />
          <Piece name="gate" position={[0, 0, 2.2]} colors={colors} />
        </group>
      );
    case "xeno":
      return (
        <group>
          <SquareTower x={0} z={0} floors={2} windows colors={colors} />
          <SquareTower x={1.8} z={0.6} floors={0} colors={colors} />
          <Piece
            name="stairs-stone"
            position={[-1.4, 0, 0.8]}
            rotation={[0, 0.4, 0]}
            colors={colors}
          />
          <Piece
            name="flag-banner-long"
            position={[0, 4.5, 0]}
            scale={0.4}
            colors={colors}
          />
        </group>
      );
    case "brawlers":
      return (
        <group>
          <HexTower x={-1.5} z={0} colors={colors} />
          <HexTower x={1.5} z={0} colors={colors} />
          <Piece name="wall-doorway" colors={colors} />
          <Piece
            name="flag-banner-long"
            position={[-1.5, 3.5, 0]}
            scale={0.4}
            colors={colors}
          />
          <Piece
            name="flag-banner-long"
            position={[1.5, 3.5, 0]}
            scale={0.4}
            colors={colors}
          />
        </group>
      );
    case "levelbuild":
      return (
        <group>
          <SquareTower x={0} z={0} floors={3} windows colors={colors} />
          <HexTower x={1.7} z={1.1} colors={colors} />
          <Piece name="wall-corner" position={[-1.4, 0, 1.2]} colors={colors} />
        </group>
      );
    case "hofeless":
      return (
        <group>
          <SquareTower x={-1.6} z={-1.6} floors={0} colors={colors} />
          <SquareTower x={1.6} z={-1.6} floors={0} colors={colors} />
          <SquareTower x={-1.6} z={1.6} floors={0} colors={colors} />
          <SquareTower x={1.6} z={1.6} floors={0} colors={colors} />
          <Piece name="wall-narrow" position={[0, 0, -1.6]} colors={colors} />
          <Piece name="wall-narrow-gate" position={[0, 0, 1.6]} colors={colors} />
        </group>
      );
    case "nova":
      return (
        <group>
          <HexTower x={0} z={0} tall colors={colors} />
          <Piece name="tower-square-arch" position={[0, 0, 1.5]} colors={colors} />
          <Piece
            name="flag-banner-long"
            position={[0, 4.3, 0]}
            scale={0.4}
            colors={colors}
          />
        </group>
      );
    case "mwantedph":
      return (
        <group>
          <SquareTower x={-1.3} z={0.3} floors={1} door colors={colors} />
          <SquareTower x={1.3} z={0.3} floors={1} colors={colors} />
          <Piece name="gate" position={[0, 0, 1.1]} colors={colors} />
          <Piece name="bridge-straight" position={[0, 0, 2.4]} colors={colors} />
          <SquareTower x={0} z={-1.5} floors={1} windows colors={colors} />
        </group>
      );
    case "nocturnus":
      return (
        <group>
          <HexTower x={0} z={0.8} tall colors={colors} />
          <HexTower x={-1.5} z={-0.9} colors={colors} />
          <HexTower x={1.5} z={-0.9} colors={colors} />
          <Piece
            name="flag-banner-long"
            position={[0, 4.4, 0.8]}
            scale={0.4}
            colors={colors}
          />
        </group>
      );
    case "celestial":
      return (
        <group>
          <SquareTower x={0} z={0} floors={1} windows colors={colors} />
          <Piece
            name="tower-hexagon-roof"
            position={[0, 3.2, 0]}
            scale={0.85}
            colors={colors}
          />
          <SquareTower x={-1.7} z={1.2} floors={0} colors={colors} />
          <SquareTower x={1.7} z={1.2} floors={0} colors={colors} />
        </group>
      );
    case "zenith-x":
      return (
        <group>
          <Piece name="tower-square-arch" colors={colors} />
          <SquareTower x={0} z={0} floors={1} colors={colors} />
          <HexTower x={-1.9} z={-0.8} colors={colors} />
          <Piece
            name="wall-narrow"
            position={[1.5, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            colors={colors}
          />
        </group>
      );
    case "sza":
    default:
      return (
        <group>
          <HexTower x={0} z={-0.4} tall colors={colors} />
          <Piece name="wall" position={[-1.4, 0, 1.2]} colors={colors} />
          <Piece name="wall" position={[1.4, 0, 1.2]} colors={colors} />
          <Piece name="gate" position={[0, 0, 1.5]} colors={colors} />
          <Piece
            name="flag-banner-long"
            position={[0, 4.5, -0.4]}
            scale={0.4}
            colors={colors}
          />
        </group>
      );
  }
}

const PALETTE: Record<
  string,
  ClanColors & { pad: string; torch: string }
> = {
  luna: {
    stone: "#c5d0e8",
    slate: "#2a3a58",
    banner: "#6a90ff",
    pad: "#5a6070",
    torch: "#a0c0ff",
  },
  tgo: {
    stone: "#d8c4a0",
    slate: "#4a3020",
    banner: "#d4af37",
    pad: "#6a5840",
    torch: "#ffc060",
  },
  xeno: {
    stone: "#a8c0c8",
    slate: "#1a3840",
    banner: "#20d0c0",
    pad: "#4a6060",
    torch: "#40ffe0",
  },
  brawlers: {
    stone: "#e0b888",
    slate: "#5a2818",
    banner: "#ff5020",
    pad: "#7a5840",
    torch: "#ff7030",
  },
  levelbuild: {
    stone: "#c8b898",
    slate: "#3a5030",
    banner: "#70c040",
    pad: "#5a6048",
    torch: "#90e050",
  },
  hofeless: {
    stone: "#a09890",
    slate: "#2a2018",
    banner: "#c0a070",
    pad: "#504840",
    torch: "#e0b070",
  },
  nova: {
    stone: "#e8d0b0",
    slate: "#603010",
    banner: "#ffb020",
    pad: "#705840",
    torch: "#ffd040",
  },
  mwantedph: {
    stone: "#b09070",
    slate: "#401810",
    banner: "#e01020",
    pad: "#584838",
    torch: "#ff4040",
  },
  nocturnus: {
    stone: "#687088",
    slate: "#101820",
    banner: "#8050ff",
    pad: "#383848",
    torch: "#a070ff",
  },
  celestial: {
    stone: "#e8e0d0",
    slate: "#504030",
    banner: "#f0d060",
    pad: "#686058",
    torch: "#ffe080",
  },
  "zenith-x": {
    stone: "#788898",
    slate: "#182028",
    banner: "#40a0ff",
    pad: "#405058",
    torch: "#60c0ff",
  },
  sza: {
    stone: "#90a8c0",
    slate: "#183040",
    banner: "#2080ff",
    pad: "#486070",
    torch: "#40a0ff",
  },
};

function plantHeight(x: number, z: number) {
  let h = terrainHeightAt.sample(x, z);
  for (const [dx, dz] of [
    [1.2, 0],
    [-1.2, 0],
    [0, 1.2],
    [0, -1.2],
    [0.9, 0.9],
    [-0.9, 0.9],
  ] as const) {
    h = Math.max(h, terrainHeightAt.sample(x + dx, z + dz));
  }
  // Bury footing into the rock so keeps never hover
  return h - 0.85;
}

function ClanKeep({ clan }: { clan: Clan }) {
  const ref = useRef<THREE.Group>(null);
  const { x, z } = clanToWorld(clan.x, clan.y);
  const palette = PALETTE[clan.id] ?? {
    stone: "#7a7570",
    slate: "#2a2620",
    banner: "#b01010",
    pad: "#524c42",
    torch: "#ffb060",
  };
  const colors: ClanColors = {
    stone: palette.stone,
    slate: palette.slate,
    banner: palette.banner,
  };

  useFrame(() => {
    if (ref.current) ref.current.position.y = plantHeight(x, z);
  });

  return (
    <group ref={ref} position={[x, 0, z]} scale={1.85}>
      <mesh castShadow receiveShadow position={[0, -0.55, 0]}>
        <cylinderGeometry args={[2.5, 3.2, 1.6, 8]} />
        <meshStandardMaterial
          color={palette.pad}
          roughness={0.96}
          flatShading
        />
      </mesh>
      <mesh
        receiveShadow
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[2.35, 20]} />
        <meshStandardMaterial color={palette.pad} roughness={0.95} />
      </mesh>
      <group position={[0, 0.12, 0]}>
        <KeepLayout clanId={clan.id} colors={colors} />
      </group>
      <pointLight
        position={[0, 4.5, 0]}
        color={palette.torch}
        intensity={2.2}
        distance={10}
        decay={2}
      />
    </group>
  );
}

const PRELOAD: PieceName[] = [
  "tower-square-base",
  "tower-square-mid",
  "tower-square-mid-door",
  "tower-square-mid-windows",
  "tower-square-top",
  "tower-square-roof",
  "tower-square-arch",
  "tower-hexagon-base",
  "tower-hexagon-mid",
  "tower-hexagon-top",
  "tower-hexagon-roof",
  "wall",
  "wall-corner",
  "wall-doorway",
  "wall-narrow",
  "wall-narrow-gate",
  "gate",
  "flag-banner-long",
  "stairs-stone",
  "bridge-straight",
];

PRELOAD.forEach((n) => useGLTF.preload(`${BASE}/${n}.glb`));

export default function ClanCastles() {
  return (
    <group>
      {CLANS.map((clan) => (
        <ClanKeep key={clan.id} clan={clan} />
      ))}
    </group>
  );
}
