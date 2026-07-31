"use client";

import { useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Clan } from "@/lib/clans";
import { clanToWorld, mapScroll, terrainHeightAt } from "@/lib/mapWorld";

export type BeaconScreen = {
  id: string;
  name: string;
  tagline: string;
  x: number;
  y: number;
  visible: boolean;
  hovered: boolean;
};

/** Mutable screen projections updated each frame for DOM overlays. */
export const beaconScreens: Record<string, BeaconScreen> = {};

type ClanBeaconProps = {
  clan: Clan;
  index: number;
  onHoverChange?: (id: string | null) => void;
};

export default function ClanBeacon({
  clan,
  index,
  onHoverChange,
}: ClanBeaconProps) {
  const group = useRef<THREE.Group>(null);
  const beam = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const scaleTarget = useRef(new THREE.Vector3(0, 0, 0));
  const worldPos = useRef(new THREE.Vector3());
  const projected = useRef(new THREE.Vector3());
  const [hovered, setHovered] = useState(false);
  const { x, z } = clanToWorld(clan.x, clan.y);
  const groundY = terrainHeightAt.sample(x, z);
  const { camera, size } = useThree();

  useFrame(({ clock }) => {
    if (!group.current) return;
    // Keep beacon glued to terrain as heightmap loads
    group.current.position.y = terrainHeightAt.sample(x, z) + 0.15;
    const visible = mapScroll.markersVisible;
    const target = visible ? 1 : 0;
    scaleTarget.current.set(target, target, target);
    group.current.scale.lerp(scaleTarget.current, 0.06 + index * 0.002);

    const t = clock.getElapsedTime() + index * 0.4;
    if (beam.current) {
      const mat = beam.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (hovered ? 0.55 : 0.28) + Math.sin(t * 2) * 0.08;
      beam.current.scale.y = 1 + Math.sin(t * 1.5) * 0.08;
    }
    if (ring.current) {
      ring.current.rotation.z = t * 0.6;
      ring.current.scale.setScalar(1 + Math.sin(t * 2.2) * 0.12);
    }

    // Project label just above the node
    worldPos.current.set(x, group.current.position.y + 2.6, z);
    projected.current.copy(worldPos.current).project(camera);
    const sx = (projected.current.x * 0.5 + 0.5) * size.width;
    const sy = (-projected.current.y * 0.5 + 0.5) * size.height;
    const inFront = projected.current.z < 1;

    beaconScreens[clan.id] = {
      id: clan.id,
      name: clan.name,
      tagline: clan.tagline,
      x: sx,
      y: sy,
      visible: visible && inFront && group.current.scale.x > 0.2,
      hovered,
    };
  });

  return (
    <group ref={group} position={[x, groundY + 0.15, z]} scale={0}>
      {/* MIR4-style location node */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <circleGeometry args={[0.45, 32]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <ringGeometry args={[0.4, 0.55, 32]} />
        <meshBasicMaterial
          color="#f0d060"
          transparent
          opacity={0.75}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      <mesh
        ref={beam}
        position={[0, 2.2, 0]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHoverChange?.(clan.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          onHoverChange?.(null);
          document.body.style.cursor = "auto";
        }}
      >
        <cylinderGeometry args={[0.06, 0.2, 4.2, 12]} />
        <meshBasicMaterial
          color="#f0d060"
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[0, 0.28, 0]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color="#f0d060"
          emissive="#d4af37"
          emissiveIntensity={hovered ? 2.5 : 1.2}
          roughness={0.25}
        />
      </mesh>

      <pointLight
        color="#d4af37"
        intensity={hovered ? 2.5 : 1.1}
        distance={6}
        position={[0, 1.2, 0]}
      />
    </group>
  );
}
