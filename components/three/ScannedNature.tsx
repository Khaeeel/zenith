"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import {
  bicheonWorldHeight,
  terrainHeightAt,
} from "@/lib/mapWorld";
import { useRiverCurve } from "./NatureProps";

function nearClanKeep(x: number, z: number, radius = 18) {
  // Clear rocks / pines from the Zenith fortress bailey + moat + rock extents
  if (Math.hypot(x - 1, z - 1) < radius) return true;
  return false;
}

type RockSrc = {
  url: string;
  count: number;
  scale: [number, number];
};

const ROCK_SOURCES: RockSrc[] = [
  {
    url: "/models/rocks/rock_07/rock_07_1k.gltf",
    count: 28,
    scale: [2.8, 5.5],
  },
  {
    url: "/models/rocks/rock_09/rock_09_1k.gltf",
    count: 32,
    scale: [3.5, 7],
  },
  {
    url: "/models/rocks/rock_moss/rock_moss_set_01_1k.gltf",
    count: 20,
    scale: [1.8, 4.2],
  },
];

function extractMeshes(scene: THREE.Object3D) {
  const out: { geometry: THREE.BufferGeometry; material: THREE.Material }[] =
    [];
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
    out.push({
      geometry: mesh.geometry,
      material: mat as THREE.Material,
    });
  });
  return out;
}

function RockInstances({
  url,
  count,
  scaleRange,
  alongRiver,
}: {
  url: string;
  count: number;
  scaleRange: [number, number];
  alongRiver: boolean;
}) {
  const { scene } = useGLTF(url);
  const curve = useRiverCurve();
  const meshes = useMemo(() => extractMeshes(scene), [scene]);
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);

  const transforms = useMemo(() => {
    const list: {
      x: number;
      y: number;
      z: number;
      s: number;
      rx: number;
      ry: number;
      rz: number;
    }[] = [];
    let guard = 0;
    while (list.length < count && guard++ < count * 12) {
      let x: number;
      let z: number;
      let y: number;
      if (alongRiver && list.length < count * 0.7) {
        const t = (list.length + 0.15) / (count * 0.7);
        const p = curve.getPointAt(Math.min(0.98, t));
        const tan = curve.getTangentAt(Math.min(0.98, t)).normalize();
        const side = new THREE.Vector3(-tan.z, 0, tan.x);
        const off = (Math.random() - 0.5) * 3.4;
        x = p.x + side.x * off;
        z = p.z + side.z * off;
        y = Math.max(p.y - 0.02, bicheonWorldHeight(x, z) - 0.04);
      } else {
        x = (Math.random() - 0.5) * 38;
        z = (Math.random() - 0.5) * 38;
        y = terrainHeightAt.sample(x, z);
      }
      // Hard ban — no rocks inside / under the fortress (account for huge rock scales)
      if (nearClanKeep(x, z, 18)) continue;
      // Soften scale near the clear zone so outliers can't lean into the bailey
      let s =
        scaleRange[0] + Math.random() * (scaleRange[1] - scaleRange[0]);
      const dist = Math.hypot(x - 1, z - 1);
      if (dist < 24) s *= 0.45 + ((dist - 18) / 6) * 0.55;
      list.push({
        x,
        y,
        z,
        s,
        rx: Math.random() * 0.6,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * 0.5,
      });
    }
    return list;
  }, [alongRiver, count, curve, scaleRange]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    refs.current.forEach((inst) => {
      if (!inst) return;
      transforms.forEach((t, i) => {
        e.set(t.rx, t.ry, t.rz);
        q.setFromEuler(e);
        p.set(t.x, t.y, t.z);
        s.set(t.s, t.s * 0.85, t.s * 0.95);
        m.compose(p, q, s);
        inst.setMatrixAt(i, m);
      });
      inst.instanceMatrix.needsUpdate = true;
      inst.computeBoundingSphere();
    });
  }, [transforms, meshes]);

  if (!meshes.length) return null;

  return (
    <group>
      {meshes.map((mesh, mi) => (
        <instancedMesh
          key={mi}
          ref={(el) => {
            refs.current[mi] = el;
          }}
          args={[mesh.geometry, mesh.material, count]}
          frustumCulled
        />
      ))}
    </group>
  );
}

/** Poly Haven CC0 photogrammetry rocks (matches your rock / river refs). */
export function ScannedRockField() {
  return (
    <group>
      {ROCK_SOURCES.map((src, i) => (
        <RockInstances
          key={src.url}
          url={src.url}
          count={src.count}
          scaleRange={src.scale}
          alongRiver={i < 2}
        />
      ))}
    </group>
  );
}

ROCK_SOURCES.forEach((s) => useGLTF.preload(s.url));

/** Pine canopy using real Poly Haven pine twig albedo + alpha. */
export function PhotorealPineBillboards({ count = 360 }: { count?: number }) {
  const a = useRef<THREE.InstancedMesh>(null);
  const b = useRef<THREE.InstancedMesh>(null);
  const diff = useLoader(THREE.TextureLoader, "/models/pine_twig_diff.jpg");
  const alpha = useLoader(THREE.TextureLoader, "/models/pine_twig_alpha.jpg");

  const material = useMemo(() => {
    diff.colorSpace = THREE.SRGBColorSpace;
    diff.wrapS = diff.wrapT = THREE.ClampToEdgeWrapping;
    alpha.wrapS = alpha.wrapT = THREE.ClampToEdgeWrapping;
    return new THREE.MeshStandardMaterial({
      map: diff,
      alphaMap: alpha,
      transparent: true,
      alphaTest: 0.4,
      depthWrite: true,
      roughness: 0.82,
      metalness: 0,
      side: THREE.DoubleSide,
    });
  }, [alpha, diff]);

  const transforms = useMemo(() => {
    const regions = [
      { cx: -10, cz: 8, spread: 5 },
      { cx: -4, cz: 12, spread: 4.5 },
      { cx: 4, cz: 13, spread: 5 },
      { cx: 10, cz: 8, spread: 4 },
      { cx: -14, cz: 2, spread: 3.5 },
      { cx: 14, cz: 4, spread: 3.5 },
      { cx: -2, cz: -8, spread: 3.5 },
      { cx: 8, cz: -4, spread: 3.5 },
      { cx: -8, cz: 14, spread: 4 },
    ];
    const list: { x: number; z: number; s: number; rot: number }[] = [];
    for (let i = 0; i < count * 1.5 && list.length < count; i++) {
      const r = regions[i % regions.length];
      const ang = Math.random() * Math.PI * 2;
      const d = Math.random() * r.spread;
      const x = r.cx + Math.cos(ang) * d;
      const z = r.cz + Math.sin(ang) * d;
      if (nearClanKeep(x, z, 16)) continue;
      list.push({
        x,
        z,
        s: 2.2 + Math.random() * 3.4,
        rot: Math.random() * Math.PI,
      });
    }
    let guard = 0;
    while (list.length < count && guard++ < count * 8) {
      const x = -10 + Math.random() * 20;
      const z = 0 + Math.random() * 14;
      if (nearClanKeep(x, z, 16)) continue;
      list.push({
        x,
        z,
        s: 2 + Math.random() * 2.5,
        rot: Math.random() * Math.PI,
      });
    }
    return list;
  }, [count]);

  useLayoutEffect(() => {
    if (!a.current || !b.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    transforms.forEach((t, i) => {
      const y = terrainHeightAt.sample(t.x, t.z);
      e.set(0, t.rot, 0);
      q.setFromEuler(e);
      p.set(t.x, y + t.s * 0.48, t.z);
      s.set(t.s * 0.55, t.s, 1);
      m.compose(p, q, s);
      a.current!.setMatrixAt(i, m);
      e.set(0, t.rot + Math.PI / 2, 0);
      q.setFromEuler(e);
      m.compose(p, q, s);
      b.current!.setMatrixAt(i, m);
    });
    a.current.instanceMatrix.needsUpdate = true;
    b.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <group>
      <instancedMesh
        ref={a}
        args={[undefined, undefined, count]}
        material={material}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
      <instancedMesh
        ref={b}
        args={[undefined, undefined, count]}
        material={material}
      >
        <planeGeometry args={[1, 1]} />
      </instancedMesh>
    </group>
  );
}
