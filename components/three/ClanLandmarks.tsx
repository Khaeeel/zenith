"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { CLANS, type LandmarkType } from "@/lib/clans";
import { clanToWorld, terrainHeightAt } from "@/lib/mapWorld";

function PeakFort() {
  return (
    <group>
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[1.1, 1.4, 2.4, 6]} />
        <meshStandardMaterial color="#6a6e78" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.8, 0]}>
        <coneGeometry args={[1.3, 1.4, 6]} />
        <meshStandardMaterial color="#8a909c" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 3.6, 0]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color="#c9a227" emissive="#d4af37" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function StoneTemple() {
  return (
    <group>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[1.8, 2.0, 0.7, 12]} />
        <meshStandardMaterial color="#7a7e88" roughness={0.9} flatShading />
      </mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(a) * 1.2, 1.2, Math.sin(a) * 1.2]}
          >
            <cylinderGeometry args={[0.18, 0.22, 1.8, 6]} />
            <meshStandardMaterial color="#9aa0aa" roughness={0.85} flatShading />
          </mesh>
        );
      })}
      <mesh castShadow position={[0, 2.3, 0]}>
        <cylinderGeometry args={[1.3, 1.3, 0.35, 12]} />
        <meshStandardMaterial color="#b8a060" roughness={0.7} flatShading />
      </mesh>
    </group>
  );
}

function MountainOutpost() {
  return (
    <group>
      <mesh castShadow position={[0, 0.9, 0]}>
        <boxGeometry args={[2.2, 1.8, 2.2]} />
        <meshStandardMaterial color="#5c6068" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 2.2, 0]}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color="#707680" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 3.1, 0]}>
        <coneGeometry args={[0.9, 0.9, 4]} />
        <meshStandardMaterial color="#3a2020" roughness={0.75} flatShading />
      </mesh>
    </group>
  );
}

function DesertRuins() {
  return (
    <group>
      {[
        [-1.2, 0.8, -0.6],
        [1.0, 1.1, 0.4],
        [0.2, 0.5, 1.2],
        [-0.5, 1.4, 0.8],
      ].map(([x, h, z], i) => (
        <mesh key={i} castShadow position={[x, h / 2, z]}>
          <boxGeometry args={[0.7, h, 0.7]} />
          <meshStandardMaterial color="#c4a574" roughness={0.95} flatShading />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[1.5, 2.2, 24]} />
        <meshStandardMaterial color="#d2b48c" roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Pagoda() {
  return (
    <group>
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[0, i * 1.15, 0]}>
          <mesh castShadow position={[0, 0.4, 0]}>
            <boxGeometry args={[2.2 - i * 0.35, 0.8, 2.2 - i * 0.35]} />
            <meshStandardMaterial color="#8a909a" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <coneGeometry args={[1.5 - i * 0.25, 0.55, 4]} />
            <meshStandardMaterial color="#5a2030" roughness={0.7} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ArenaRuins() {
  return (
    <group>
      <mesh castShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 0.8, 16]} />
        <meshStandardMaterial color="#8a8478" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[1.6, 0.2, 8, 24]} />
        <meshStandardMaterial color="#a09888" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.3, 16]} />
        <meshStandardMaterial color="#6a6558" roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

function Town() {
  return (
    <group>
      {[
        [-1.2, 0.7, 0.3],
        [0.9, 0.9, -0.5],
        [0.1, 0.55, 1.1],
        [-0.4, 1.1, -1.0],
      ].map(([x, h, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh castShadow position={[0, h / 2, 0]}>
            <boxGeometry args={[0.9, h, 0.9]} />
            <meshStandardMaterial color="#c4b090" roughness={0.85} flatShading />
          </mesh>
          <mesh position={[0, h + 0.25, 0]}>
            <coneGeometry args={[0.7, 0.5, 4]} />
            <meshStandardMaterial color="#4a2828" roughness={0.75} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ValleyKeep() {
  return (
    <group>
      <mesh castShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[2.6, 1.4, 2.6]} />
        <meshStandardMaterial color="#6e727c" roughness={0.85} flatShading />
      </mesh>
      {[
        [-1.1, -1.1],
        [1.1, -1.1],
        [-1.1, 1.1],
        [1.1, 1.1],
      ].map(([x, z], i) => (
        <mesh key={i} castShadow position={[x, 1.5, z]}>
          <cylinderGeometry args={[0.3, 0.35, 2.2, 6]} />
          <meshStandardMaterial color="#5a5e68" roughness={0.85} flatShading />
        </mesh>
      ))}
      <mesh position={[0, 2.6, 0]}>
        <coneGeometry args={[0.5, 0.7, 4]} />
        <meshStandardMaterial color="#8b1a1a" roughness={0.7} flatShading />
      </mesh>
      {/* Banner */}
      <mesh position={[0.15, 3.4, 0]}>
        <boxGeometry args={[0.08, 1.4, 0.7]} />
        <meshStandardMaterial color="#a01010" emissive="#600000" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

function SpiritGrove() {
  return (
    <group>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(a) * 1.1, 1.2, Math.sin(a) * 1.1]}
          >
            <coneGeometry args={[0.45, 2.4, 6]} />
            <meshStandardMaterial
              color="#2a8a6a"
              emissive="#1a5a40"
              emissiveIntensity={0.35}
              roughness={0.7}
              flatShading
            />
          </mesh>
        );
      })}
      <pointLight position={[0, 2, 0]} color="#40ffaa" intensity={2} distance={8} />
    </group>
  );
}

function SacredGrove() {
  return (
    <group>
      <mesh castShadow position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.35, 0.5, 3.2, 8]} />
        <meshStandardMaterial color="#6b4423" roughness={0.9} flatShading />
      </mesh>
      <mesh position={[0, 3.4, 0]}>
        <sphereGeometry args={[1.6, 10, 8]} />
        <meshStandardMaterial
          color="#3a9a48"
          emissive="#206030"
          emissiveIntensity={0.25}
          roughness={0.8}
          flatShading
        />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[Math.cos(i) * 0.9, 2.8 + i * 0.2, Math.sin(i) * 0.9]}
        >
          <sphereGeometry args={[0.25, 8, 6]} />
          <meshStandardMaterial
            color="#ff6eb4"
            emissive="#ff4da0"
            emissiveIntensity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

function CliffFort() {
  return (
    <group>
      <mesh castShadow position={[0, 1.0, 0]}>
        <boxGeometry args={[2.8, 2.0, 1.6]} />
        <meshStandardMaterial color="#5a6570" roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[-1.0, 2.4, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 1.8, 6]} />
        <meshStandardMaterial color="#4a5560" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[1.0, 2.2, 0]}>
        <cylinderGeometry args={[0.35, 0.4, 1.5, 6]} />
        <meshStandardMaterial color="#4a5560" roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 0.1, 1.4]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[2.4, 0.3, 1.2]} />
        <meshStandardMaterial color="#3a8aaa" roughness={0.4} metalness={0.3} />
      </mesh>
    </group>
  );
}

function ValleyShrine() {
  return (
    <group>
      <mesh castShadow position={[0, 0.5, 0]}>
        <boxGeometry args={[1.8, 1.0, 1.8]} />
        <meshStandardMaterial color="#7a8088" roughness={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 1.4, 8]} />
        <meshStandardMaterial color="#9aa0a8" roughness={0.8} flatShading />
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <octahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial
          color="#d4af37"
          emissive="#d4af37"
          emissiveIntensity={0.8}
          metalness={0.7}
          roughness={0.25}
        />
      </mesh>
    </group>
  );
}

function LandmarkMesh({ type }: { type: LandmarkType }) {
  switch (type) {
    case "peak_fort":
      return <PeakFort />;
    case "stone_temple":
      return <StoneTemple />;
    case "mountain_outpost":
      return <MountainOutpost />;
    case "desert_ruins":
      return <DesertRuins />;
    case "pagoda":
      return <Pagoda />;
    case "arena_ruins":
      return <ArenaRuins />;
    case "town":
      return <Town />;
    case "valley_keep":
      return <ValleyKeep />;
    case "spirit_grove":
      return <SpiritGrove />;
    case "sacred_grove":
      return <SacredGrove />;
    case "cliff_fort":
      return <CliffFort />;
    case "valley_shrine":
      return <ValleyShrine />;
    default:
      return null;
  }
}

function ClanLandmark({
  clanId,
  landmark,
  xPct,
  yPct,
}: {
  clanId: string;
  landmark: LandmarkType;
  xPct: number;
  yPct: number;
}) {
  const group = useRef<THREE.Group>(null);
  const { x, z } = clanToWorld(xPct, yPct);

  useFrame(() => {
    if (!group.current) return;
    group.current.position.y = terrainHeightAt.sample(x, z);
  });

  return (
    <group ref={group} position={[x, 0, z]}>
      <LandmarkMesh type={landmark} />
    </group>
  );
}

/** Unique structure at each clan territory — castles, caves, temples, groves. */
export default function ClanLandmarks() {
  return (
    <group>
      {CLANS.map((clan) => (
        <ClanLandmark
          key={clan.id}
          clanId={clan.id}
          landmark={clan.landmark}
          xPct={clan.x}
          yPct={clan.y}
        />
      ))}
    </group>
  );
}
