"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MAP_SIZE, bicheonWorldHeight } from "@/lib/mapWorld";
import { useBicheonTerrain } from "./useMapHeight";

export default function Terrain() {
  const geometry = useBicheonTerrain();

  return (
    <mesh geometry={geometry} receiveShadow castShadow>
      <meshStandardMaterial
        vertexColors
        roughness={0.82}
        metalness={0.04}
        flatShading={false}
      />
    </mesh>
  );
}

export function CoastalWater() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.position.y =
      0.28 + Math.sin(clock.getElapsedTime() * 0.7) * 0.035;
  });
  return (
    <group>
      {/* Soft ocean skirt so the realm doesn't read as a floating tile */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.15, 0]}
        receiveShadow
      >
        <planeGeometry args={[MAP_SIZE * 2.4, MAP_SIZE * 2.4]} />
        <meshStandardMaterial
          color="#6a9eb8"
          transparent
          opacity={0.55}
          roughness={0.35}
          metalness={0.15}
          depthWrite={false}
        />
      </mesh>
      <mesh
        ref={ref}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-MAP_SIZE * 0.32, 0.28, MAP_SIZE * 0.34]}
        receiveShadow
      >
        <circleGeometry args={[MAP_SIZE * 0.3, 72]} />
        <meshStandardMaterial
          color="#2a9aaa"
          transparent
          opacity={0.82}
          roughness={0.12}
          metalness={0.35}
          emissive="#0a4050"
          emissiveIntensity={0.22}
        />
      </mesh>
    </group>
  );
}

export function WindingRiver() {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const geo = useMemo(() => {
    const anchors = [
      [-14, 10],
      [-7, 5],
      [-1, 2],
      [4, -1],
      [9, -4],
      [13, 1],
      [16, 7],
    ] as const;
    const pts = anchors.map(([x, z]) => {
      const y = Math.max(0.35, bicheonWorldHeight(x, z) - 0.15);
      return new THREE.Vector3(x, y, z);
    });
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 100, 0.58, 12, false);
  }, []);

  useFrame(({ clock }) => {
    if (!mat.current) return;
    mat.current.emissiveIntensity =
      0.25 + Math.sin(clock.getElapsedTime() * 1.4) * 0.08;
  });

  return (
    <mesh geometry={geo}>
      <meshStandardMaterial
        ref={mat}
        color="#3eb8c8"
        emissive="#1a7080"
        emissiveIntensity={0.3}
        roughness={0.18}
        metalness={0.25}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}
