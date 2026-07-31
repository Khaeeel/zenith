"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CLANS } from "@/lib/clans";
import { clanToWorld, terrainHeightAt, MAP_SIZE, mapScroll } from "@/lib/mapWorld";

/** Dense MIR4-style tree clusters (layered canopy, not single cones). */
export function ForestClusters() {
  const trunk = useRef<THREE.InstancedMesh>(null);
  const canopyLo = useRef<THREE.InstancedMesh>(null);
  const canopyHi = useRef<THREE.InstancedMesh>(null);
  const count = 280;

  const transforms = useMemo(() => {
    const regions = [
      { cx: -7, cz: 3, spread: 7.5 },
      { cx: 1, cz: 11, spread: 7 },
      { cx: 7, cz: 9, spread: 5.5 },
      { cx: -3, cz: -5, spread: 4.5 },
      { cx: 5, cz: 5, spread: 5 },
      { cx: -10, cz: 8, spread: 4.5 },
      { cx: 10, cz: 6, spread: 4 },
    ];
    const list: { x: number; z: number; s: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r = regions[i % regions.length];
      const a = Math.random() * Math.PI * 2;
      const d = Math.random() * r.spread;
      list.push({
        x: r.cx + Math.cos(a) * d,
        z: r.cz + Math.sin(a) * d,
        s: 0.5 + Math.random() * 0.85,
      });
    }
    return list;
  }, []);

  useLayoutEffect(() => {
    if (!trunk.current || !canopyLo.current || !canopyHi.current) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const p = new THREE.Vector3();
    const s = new THREE.Vector3();
    transforms.forEach((t, i) => {
      const y = terrainHeightAt.sample(t.x, t.z);
      p.set(t.x, y + t.s * 0.55, t.z);
      s.set(t.s * 0.28, t.s * 1.15, t.s * 0.28);
      m.compose(p, q, s);
      trunk.current!.setMatrixAt(i, m);
      p.set(t.x, y + t.s * 1.35, t.z);
      s.set(t.s * 1.05, t.s * 0.85, t.s * 1.05);
      m.compose(p, q, s);
      canopyLo.current!.setMatrixAt(i, m);
      p.set(t.x + 0.12, y + t.s * 1.85, t.z - 0.08);
      s.set(t.s * 0.72, t.s * 0.7, t.s * 0.72);
      m.compose(p, q, s);
      canopyHi.current!.setMatrixAt(i, m);
    });
    trunk.current.instanceMatrix.needsUpdate = true;
    canopyLo.current.instanceMatrix.needsUpdate = true;
    canopyHi.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <group>
      <instancedMesh ref={trunk} args={[undefined, undefined, count]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1, 8]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={canopyLo} args={[undefined, undefined, count]} castShadow>
        <sphereGeometry args={[0.78, 14, 12]} />
        <meshStandardMaterial color="#2f8a3e" roughness={0.7} />
      </instancedMesh>
      <instancedMesh ref={canopyHi} args={[undefined, undefined, count]} castShadow>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color="#4aaa52" roughness={0.65} />
      </instancedMesh>
    </group>
  );
}

/** Pink blossom trees — Ginkgo / Peach valley feel. */
export function BlossomTrees() {
  const spots = useMemo(
    () => [
      { x: 2, z: 14 },
      { x: -2, z: 13 },
      { x: 5, z: 12 },
      { x: -6, z: 10 },
      { x: 0, z: 11 },
      { x: 8, z: 13 },
    ],
    [],
  );
  return (
    <group>
      {spots.map((s, i) => (
        <BlossomTree key={i} x={s.x} z={s.z} />
      ))}
    </group>
  );
}

function BlossomTree({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (ref.current) ref.current.position.y = terrainHeightAt.sample(x, z);
  });
  return (
    <group ref={ref} position={[x, 0, z]}>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.16, 2.4, 8]} />
        <meshStandardMaterial color="#5a3a22" roughness={0.92} />
      </mesh>
      {[
        [0, 2.7, 0, 0.95],
        [0.45, 2.4, 0.2, 0.55],
        [-0.4, 2.5, -0.25, 0.5],
        [0.15, 3.15, -0.15, 0.45],
        [-0.2, 2.2, 0.4, 0.4],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} castShadow position={[px, py, pz]}>
          <sphereGeometry args={[r, 14, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? "#f0a8c8" : "#e888b0"}
            roughness={0.72}
            envMapIntensity={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Layered rock ridges — sit on terrain peaks, softer than toy cones. */
export function MountainRanges() {
  const peaks = useMemo(
    () => [
      { x: -16, z: -15, h: 4.2, r: 4.2, tint: "#7a6a62" },
      { x: -10, z: -17, h: 3.6, r: 3.4, tint: "#6e7682" },
      { x: -4, z: -18, h: 3.4, r: 3.0, tint: "#788088" },
      { x: 3, z: -17, h: 3.9, r: 3.6, tint: "#6a727c" },
      { x: 12, z: -14, h: 3.2, r: 2.9, tint: "#8a7a5a" },
      { x: 18, z: -6, h: 3.5, r: 3.3, tint: "#9a8460" },
      { x: 19, z: 2, h: 2.9, r: 2.6, tint: "#7a828e" },
      { x: -18, z: -2, h: 2.8, r: 2.7, tint: "#8a6050" },
      { x: -17, z: 6, h: 2.4, r: 2.3, tint: "#6a7580" },
      { x: -14, z: -10, h: 2.7, r: 2.5, tint: "#8a5548" },
    ],
    [],
  );

  return (
    <group>
      {peaks.map((p, i) => {
        const baseY = terrainHeightAt.sample(p.x, p.z) * 0.35;
        return (
          <group key={i} position={[p.x, baseY, p.z]}>
            <mesh
              castShadow
              position={[0, p.h * 0.35, 0]}
              scale={[1.35, 0.72, 1.2]}
              rotation={[0.1, i * 0.4, 0.05]}
            >
              <icosahedronGeometry args={[p.r * 0.85, 1]} />
              <meshStandardMaterial color={p.tint} roughness={0.94} />
            </mesh>
            <mesh
              castShadow
              position={[p.r * 0.35, p.h * 0.55, -p.r * 0.2]}
              scale={[1, 0.8, 1]}
            >
              <icosahedronGeometry args={[p.r * 0.45, 1]} />
              <meshStandardMaterial color="#5c6470" roughness={0.92} />
            </mesh>
            <mesh position={[0, p.h * 0.85, 0]} scale={[1, 0.55, 1]}>
              <icosahedronGeometry args={[p.r * 0.32, 1]} />
              <meshStandardMaterial color="#eef2f8" roughness={0.75} />
            </mesh>
            {i % 3 === 0 && (
              <mesh
                position={[0, p.h * 0.32, p.r * 0.5]}
                rotation={[0.4, 0, 0]}
              >
                <circleGeometry args={[0.72, 24]} />
                <meshBasicMaterial color="#080a0e" side={THREE.DoubleSide} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}

export { default as BicheonCastle } from "./BicheonCastle";

/** Landmark at each clan — temples, caves, ruins, towns, keeps. */
export function ClanTerritoryStructures() {
  return (
    <group>
      {CLANS.map((clan) => (
        <ClanStructure key={clan.id} clan={clan} />
      ))}
    </group>
  );
}

function ClanStructure({
  clan,
}: {
  clan: (typeof CLANS)[number];
}) {
  const ref = useRef<THREE.Group>(null);
  const { x, z } = clanToWorld(clan.x, clan.y);

  useFrame(() => {
    if (ref.current) ref.current.position.y = terrainHeightAt.sample(x, z);
  });

  return (
    <group ref={ref} position={[x, 0, z]} scale={0.5}>
      <StructureByType type={clan.landmark} />
    </group>
  );
}

function StructureByType({
  type,
}: {
  type: (typeof CLANS)[number]["landmark"];
}) {
  switch (type) {
    case "peak_fort":
      return (
        <group>
          <mesh castShadow position={[0, 1.4, 0]}>
            <cylinderGeometry args={[1.2, 1.6, 2.8, 6]} />
            <meshStandardMaterial color="#7a828e" roughness={0.85} />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <coneGeometry args={[1.4, 1.5, 6]} />
            <meshStandardMaterial color="#c8d0dc" roughness={0.7} />
          </mesh>
          <mesh position={[0.7, 1.0, 1.2]} rotation={[0.3, 0, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshBasicMaterial color="#0a0c10" side={THREE.DoubleSide} />
          </mesh>
        </group>
      );
    case "stone_temple":
      return (
        <group>
          <mesh castShadow position={[0, 0.4, 0]}>
            <cylinderGeometry args={[2.2, 2.5, 0.8, 16]} />
            <meshStandardMaterial color="#9aa2ae" roughness={0.85} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <mesh
                key={i}
                castShadow
                position={[Math.cos(a) * 1.5, 1.4, Math.sin(a) * 1.5]}
              >
                <cylinderGeometry args={[0.2, 0.24, 2.2, 6]} />
                <meshStandardMaterial color="#b0b6c0" roughness={0.8} />
              </mesh>
            );
          })}
          <mesh castShadow position={[0, 2.7, 0]}>
            <cylinderGeometry args={[1.6, 1.6, 0.4, 16]} />
            <meshStandardMaterial color="#c4a860" roughness={0.65} />
          </mesh>
        </group>
      );
    case "mountain_outpost":
      return (
        <group>
          <mesh castShadow position={[0, 1.1, 0]}>
            <boxGeometry args={[2.4, 2.2, 2.4]} />
            <meshStandardMaterial color="#8a929e" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[0, 2.6, 0]}>
            <boxGeometry args={[1.4, 1.4, 1.4]} />
            <meshStandardMaterial color="#9aa2ae" roughness={0.8} />
          </mesh>
          <mesh position={[0, 3.6, 0]}>
            <coneGeometry args={[1.0, 1.0, 4]} />
            <meshStandardMaterial color="#4a2020" roughness={0.7} />
          </mesh>
        </group>
      );
    case "desert_ruins":
      return (
        <group>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
            <circleGeometry args={[2.4, 24]} />
            <meshStandardMaterial color="#d4bc7a" roughness={1} />
          </mesh>
          {[
            [-1.3, 1.2, -0.5],
            [1.1, 1.6, 0.6],
            [0.2, 0.9, 1.4],
            [-0.6, 1.8, 0.9],
            [0.8, 0.7, -1.2],
          ].map(([x, h, z], i) => (
            <mesh key={i} castShadow position={[x, h / 2, z]}>
              <boxGeometry args={[0.85, h, 0.85]} />
              <meshStandardMaterial color="#c9a86a" roughness={0.9} />
            </mesh>
          ))}
        </group>
      );
    case "pagoda":
      return (
        <group>
          {[0, 1, 2, 3].map((tier) => (
            <group key={tier} position={[0, tier * 1.35, 0]}>
              <mesh castShadow position={[0, 0.5, 0]}>
                <boxGeometry args={[2.5 - tier * 0.42, 1.0, 2.5 - tier * 0.42]} />
                <meshStandardMaterial color="#e4ddd2" roughness={0.78} />
              </mesh>
              <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
                <coneGeometry args={[1.85 - tier * 0.3, 0.7, 4]} />
                <meshStandardMaterial color="#7a2848" roughness={0.58} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "arena_ruins":
      return (
        <group>
          <mesh castShadow position={[0, 0.5, 0]}>
            <cylinderGeometry args={[2.4, 2.7, 1.0, 20]} />
            <meshStandardMaterial color="#9a9488" roughness={0.88} />
          </mesh>
          <mesh position={[0, 1.1, 0]}>
            <torusGeometry args={[1.8, 0.22, 8, 28]} />
            <meshStandardMaterial color="#b0a898" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[1.1, 1.1, 0.35, 20]} />
            <meshStandardMaterial color="#6a6558" roughness={0.9} />
          </mesh>
        </group>
      );
    case "town":
      return (
        <group>
          {[
            [-1.3, 0.9, 0.4],
            [1.0, 1.1, -0.6],
            [0.2, 0.7, 1.2],
            [-0.5, 1.2, -1.1],
            [1.3, 0.8, 0.9],
          ].map(([x, h, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh castShadow position={[0, h / 2, 0]}>
                <boxGeometry args={[1.0, h, 1.0]} />
                <meshStandardMaterial color="#d2c4a0" roughness={0.85} />
              </mesh>
              <mesh position={[0, h + 0.28, 0]}>
                <coneGeometry args={[0.75, 0.55, 4]} />
                <meshStandardMaterial color="#5a3030" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      );
    case "valley_keep":
      return (
        <group>
          <mesh castShadow position={[0, 0.85, 0]}>
            <boxGeometry args={[3.0, 1.7, 3.0]} />
            <meshStandardMaterial color="#8a929e" roughness={0.82} />
          </mesh>
          {[
            [-1.2, -1.2],
            [1.2, -1.2],
            [-1.2, 1.2],
            [1.2, 1.2],
          ].map(([x, z], i) => (
            <group key={i} position={[x, 0, z]}>
              <mesh castShadow position={[0, 1.7, 0]}>
                <cylinderGeometry args={[0.35, 0.42, 2.6, 7]} />
                <meshStandardMaterial color="#7a828e" roughness={0.8} />
              </mesh>
              <mesh position={[0, 3.2, 0]}>
                <coneGeometry args={[0.5, 0.75, 4]} />
                <meshStandardMaterial color="#9a2020" roughness={0.65} />
              </mesh>
            </group>
          ))}
          <mesh position={[0.2, 3.6, 0]}>
            <boxGeometry args={[0.1, 1.6, 0.8]} />
            <meshStandardMaterial
              color="#c01010"
              emissive="#500000"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      );
    case "spirit_grove":
      return (
        <group>
          {Array.from({ length: 6 }).map((_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <mesh
                key={i}
                castShadow
                position={[Math.cos(a) * 1.3, 1.4, Math.sin(a) * 1.3]}
              >
                <coneGeometry args={[0.55, 2.8, 7]} />
                <meshStandardMaterial
                  color="#2a9a78"
                  emissive="#1a6050"
                  emissiveIntensity={0.4}
                  roughness={0.65}
                />
              </mesh>
            );
          })}
          <pointLight position={[0, 2.2, 0]} color="#40ffc0" intensity={2.2} distance={9} />
        </group>
      );
    case "sacred_grove":
      return (
        <group>
          <mesh castShadow position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.4, 0.55, 3.6, 8]} />
            <meshStandardMaterial color="#6b4423" roughness={0.9} />
          </mesh>
          <mesh position={[0, 3.8, 0]}>
            <sphereGeometry args={[1.8, 12, 10]} />
            <meshStandardMaterial
              color="#4aaa55"
              emissive="#206030"
              emissiveIntensity={0.2}
              roughness={0.75}
            />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos(i * 1.7) * 1.0,
                3.2 + (i % 2) * 0.4,
                Math.sin(i * 1.7) * 1.0,
              ]}
            >
              <sphereGeometry args={[0.28, 8, 6]} />
              <meshStandardMaterial
                color="#ff7ab8"
                emissive="#ff4da0"
                emissiveIntensity={0.55}
              />
            </mesh>
          ))}
        </group>
      );
    case "cliff_fort":
      return (
        <group>
          <mesh castShadow position={[0, 1.2, 0]}>
            <boxGeometry args={[3.2, 2.4, 1.8]} />
            <meshStandardMaterial color="#6a7580" roughness={0.88} />
          </mesh>
          <mesh castShadow position={[-1.1, 2.8, 0]}>
            <cylinderGeometry args={[0.42, 0.48, 2.0, 7]} />
            <meshStandardMaterial color="#5a6570" roughness={0.85} />
          </mesh>
          <mesh castShadow position={[1.1, 2.6, 0]}>
            <cylinderGeometry args={[0.38, 0.44, 1.7, 7]} />
            <meshStandardMaterial color="#5a6570" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.2, 1.5]} rotation={[0.35, 0, 0]}>
            <boxGeometry args={[2.6, 0.35, 1.4]} />
            <meshStandardMaterial
              color="#3a9aaa"
              roughness={0.35}
              metalness={0.25}
            />
          </mesh>
        </group>
      );
    case "valley_shrine":
      return (
        <group>
          <mesh castShadow position={[0, 0.6, 0]}>
            <boxGeometry args={[2.0, 1.2, 2.0]} />
            <meshStandardMaterial color="#9aa2ae" roughness={0.82} />
          </mesh>
          <mesh castShadow position={[0, 1.7, 0]}>
            <cylinderGeometry args={[0.28, 0.35, 1.6, 8]} />
            <meshStandardMaterial color="#b0b6c0" roughness={0.75} />
          </mesh>
          <mesh position={[0, 2.75, 0]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color="#d4af37"
              emissive="#d4af37"
              emissiveIntensity={0.85}
              metalness={0.7}
              roughness={0.25}
            />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

export function SoftClouds() {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        x: (i - 2.5) * 8,
        y: 16 + (i % 3) * 2.4,
        z: -16 + (i % 4) * 5.5,
        s: 2.0 + (i % 3) * 0.55,
      })),
    [],
  );
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.position.x = Math.sin(clock.getElapsedTime() * 0.04) * 4;
    const p = mapScroll.progress;
    group.current.visible = p < 0.5;
    const fade = 1 - THREE.MathUtils.smoothstep(p, 0.12, 0.38);
    group.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (m?.opacity !== undefined) m.opacity = 0.12 * fade;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <mesh key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          <sphereGeometry args={[1.15, 10, 8]} />
          <meshStandardMaterial
            color="#2a2430"
            transparent
            opacity={0.12}
            depthWrite={false}
            roughness={1}
          />
        </mesh>
      ))}
    </group>
  );
}

export function DustMotes() {
  const points = useRef<THREE.Points>(null);
  const count = 160;
  const positions = useMemo(() => {
    const a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      a[i * 3] = (Math.random() - 0.5) * MAP_SIZE;
      a[i * 3 + 1] = 2 + Math.random() * 10;
      a[i * 3 + 2] = (Math.random() - 0.5) * MAP_SIZE;
    }
    return a;
  }, []);
  useFrame((_, d) => {
    if (!points.current) return;
    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += d * 0.12;
      if (arr[i * 3 + 1] > 12) arr[i * 3 + 1] = 2;
    }
    attr.needsUpdate = true;
  });
  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#fff4d0"
        transparent
        opacity={0.35}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
